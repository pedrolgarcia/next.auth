import { createContext, ReactNode, useState } from 'react'
import { useRouter } from 'next/router'
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

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const { permissions, roles } = response.data

      setUser({
        email,
        permissions,
        roles,
      })

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
