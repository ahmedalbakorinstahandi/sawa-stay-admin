"use client"

import Cookies from "js-cookie"

// تعيين كوكي
export const setCookie = (name: string, value: string, days = 7) => {
  try {
    Cookies.set(name, value, {
      expires: days,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    console.log(`Cookie ${name} set successfully:`, value.substring(0, 10) + "...")
  } catch (error) {
    console.error("Error setting cookie:", error)
  }
}

// الحصول على قيمة كوكي
export const getCookie = (name: string): string | null => {
  try {
    const value = Cookies.get(name)
    console.log(`Cookie ${name} retrieved:`, value ? value.substring(0, 10) + "..." : "null")
    return value || null
  } catch (error) {
    console.error("Error getting cookie:", error)
    return null
  }
}

// حذف كوكي
export const removeCookie = (name: string) => {
  try {
    Cookies.remove(name, { path: "/" })
    console.log(`Cookie ${name} removed successfully`)
  } catch (error) {
    console.error("Error removing cookie:", error)
  }
}

// تخزين التوكن في localStorage كنسخة احتياطية
export const setLocalStorageToken = (token: string) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
      console.log("Token stored in localStorage")
    }
  } catch (error) {
    console.error("Error storing token in localStorage:", error)
  }
}

// الحصول على التوكن من localStorage
export const getLocalStorageToken = (): string | null => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      return token
    }
    return null
  } catch (error) {
    console.error("Error getting token from localStorage:", error)
    return null
  }
}

// حذف التوكن من localStorage
export const removeLocalStorageToken = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      console.log("Token removed from localStorage")
    }
  } catch (error) {
    console.error("Error removing token from localStorage:", error)
  }
}

// الحصول على التوكن من الكوكيز أو localStorage
export const getToken = (): string | null => {
  const cookieToken = getCookie("token")
  if (cookieToken) return cookieToken

  return getLocalStorageToken()
}

// تخزين التوكن في الكوكيز و localStorage
export const setToken = (token: string, days = 7) => {
  setCookie("token", token, days)
  setLocalStorageToken(token)
}

// حذف التوكن من الكوكيز و localStorage
export const removeToken = () => {
  removeCookie("token")
  removeLocalStorageToken()
}
