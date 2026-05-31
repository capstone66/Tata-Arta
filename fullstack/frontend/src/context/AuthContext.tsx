import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as api from "@/services/api"

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api
        .getProfile()
        .then((userData) => setUser(userData))
        .catch(() => {
          setToken(null)
          localStorage.removeItem("auth_token")
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password)
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem("auth_token", res.token)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(email, password, name)
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem("auth_token", res.token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
