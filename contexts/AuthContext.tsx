import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { destroyCookie, parseCookies, setCookie } from 'nookies'

import { api } from '../services/apiClient'

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

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  destroyCookie(undefined, '@next.auth:token')
  destroyCookie(undefined, '@next.auth:refreshToken')

  delete api.defaults.headers.common['Authorization']

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User)

  const isAuthenticated = !!user.email

  useEffect(() => {
    const { '@next.auth:token': token } = parseCookies()

    if (token) {
      api
        .get('/me')
        .then((response) => {
          if (response?.data) {
            const { email, permissions, roles } = response.data
            setUser({ email, permissions, roles })
          }
        })
        .catch((err) => {})
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

      Router.push('/dashboard')
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
