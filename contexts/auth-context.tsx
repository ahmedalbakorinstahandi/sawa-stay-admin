"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getToken, setToken, removeToken } from "@/lib/cookies"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  phone: string
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

// إنشاء ��يمة افتراضية للسياق لتجنب الخطأ
const defaultContextValue: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // التحقق من وجود توكن عند تحميل الصفحة
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = getToken()
        console.log("Initial token check:", storedToken ? "Token exists" : "No token")

        if (storedToken) {
          setTokenState(storedToken)
          await fetchUserProfile(storedToken)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log("Fetching user profile with token:", authToken)

      // محاولة جلب بيانات المستخدم من الباك اند
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.data.success) {
        setUser(response.data.data)
        setIsLoading(false)
        return true
      } else {
        // إذا فشل جلب بيانات المستخدم، قم بتسجيل الخروج
        console.error("Failed to fetch user profile:", response.data.message)
     //   await logout()
        return false
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
  //    await logout()
      setIsLoading(false)
      return false
    }
  }

  const login = async (phone: string, password: string) => {
    setIsLoading(true)

    try {
      console.log("Attempting login with:", { phone, password: "********" })

      // استدعاء API تسجيل الدخول الحقيقي
      const response = await api.post("/auth/login", {
        phone: phone,
        password,
        role: "admin",
      })

      console.log("Login API response:", response.data)

      if (response.data.success) {
        const authToken = response.data.access_token
        console.log("Login successful, token:", authToken)

        // تخزين التوكن في الكوكيز و localStorage
        setToken(authToken)
        setTokenState(authToken)

        // تعيين بيانات المستخدم إذا كانت متوفرة في الاستجابة
        if (response.data.data) {
          setUser(response.data.data)
        } else {
          // إذا لم تكن بيانات المستخدم متوفرة، حاول جلبها
          await fetchUserProfile(authToken)
        }

        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return {
          success: false,
          message: response.data.message || "فشل تسجيل الدخول",
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setIsLoading(false)
      return {
        success: false,
        message: error.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول",
      }
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out...")

      if (token) {
        // محاولة تسجيل الخروج من الباك اند
        try {
          await api.post(
            "/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        } catch (error) {
          console.error("Error during logout API call:", error)
          // نستمر في عملية تسجيل الخروج حتى لو فشل الاتصال بالباك اند
        }
      }

      // حذف التوكن وبيانات المستخدم
      removeToken()
      setTokenState(null)
      setUser(null)

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // حتى لو فشلت عملية تسجيل الخروج، نقوم بحذف البيانات المحلية
      removeToken()
      setTokenState(null)
      setUser(null)
    }
  }

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
