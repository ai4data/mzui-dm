import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  username: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with false authentication state - force login
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication on mount
    const authStatus = localStorage.getItem("isAuthenticated")
    const userData = localStorage.getItem("user")
    
    console.log("AuthContext: Checking auth status", { authStatus, userData })
    
    // For demo purposes, clear authentication only on first app load
    // Check if this is the first load by looking for a session flag
    const hasSessionStarted = sessionStorage.getItem("sessionStarted")
    
    if (process.env.NODE_ENV === 'development' && !hasSessionStarted) {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
      sessionStorage.setItem("sessionStarted", "true")
      console.log("AuthContext: Cleared auth state for demo (first load only)")
      setIsLoading(false)
      return
    }
    
    if (authStatus === "true" && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setIsAuthenticated(true)
        setUser(parsedUser)
        console.log("AuthContext: User is authenticated", parsedUser)
      } catch (error) {
        console.error("AuthContext: Error parsing user data", error)
        // Clear invalid data
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("user")
      }
    } else {
      console.log("AuthContext: User is not authenticated")
    }
    
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log("AuthContext: Logging in user", userData)
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    console.log("AuthContext: Logging out user")
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}