import { createContext, ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { parseCookies, setCookie } from 'nookies'

import { api } from '../services/api'

type User = {
  email: string
  permissions: string[]
  roles: string[]
}

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  user: User
  isAuthenticated: boolean
}

export const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()

  const [user, setUser] = useState<User>({} as User)

  const isAuthenticated = !!user.email

  useEffect(() => {
    const { '@next.auth:token': token } = parseCookies()

    if (token) {
      api.get('/me').then((response) => {
        if (response?.data) {
          const { email, permissions, roles } = response.data
          setUser({ email, permissions, roles })
        }
      })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { token, refreshToken, permissions, roles } = response?.data

      // sessionStorage - ao fechar o app (navegador) ele morre
      // localStorage - é permanente mas não temos acesso no server side
      // cookies

      setCookie(undefined, '@next.auth:token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      setCookie(undefined, '@next.auth:refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      setUser({
        email,
        permissions,
        roles,
      })

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      router.push('/dashboard')
    } catch (error) {
      alert(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
