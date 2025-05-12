import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("Middleware running for path:", request.nextUrl.pathname)

  // الحصول على التوكن من الكوكيز
  const token = request.cookies.get("token")?.value
  console.log("Token from cookies:", token ? "exists" : "not found")

  // التحقق مما إذا كان المستخدم يحاول الوصول إلى صفحات لوحة التحكم
  const isDashboardPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/users") ||
    request.nextUrl.pathname.startsWith("/listings") ||
    request.nextUrl.pathname.startsWith("/bookings") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/notifications") ||
    request.nextUrl.pathname.startsWith("/housetypes")

  // التحقق مما إذا كان المستخدم يحاول الوصول إلى صفحة تسجيل الدخول
  const isLoginPage = request.nextUrl.pathname === "/login"

  // إذا كان المستخدم يحاول الوصول إلى صفحات لوحة التحكم ولكن ليس لديه توكن
  if (isDashboardPage && !token) {
    console.log("Redirecting to login page - no token for dashboard access")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // إذا كان المستخدم يحاول الوصول إلى صفحة تسجيل الدخول ولديه توكن
  if (isLoginPage && token) {
    console.log("Redirecting to dashboard - token exists on login page")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // إذا كان المستخدم يحاول الوصول إلى الصفحة الرئيسية
  if (request.nextUrl.pathname === "/") {
    if (token) {
      console.log("Redirecting to dashboard from home - token exists")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      console.log("Redirecting to login from home - no token")
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  console.log("Middleware allowing request to proceed")
  return NextResponse.next()
}

// تحديد المسارات التي سيتم تطبيق الـ middleware عليها
export const config = {
  matcher: [
    /*
     * تطبيق الـ middleware على:
     * - الصفحة الرئيسية
     * - صفحة تسجيل الدخول
     * - جميع صفحات لوحة التحكم
     */
    "/",
    "/login",
    "/dashboard/:path*",
    "/users/:path*",
    "/listings/:path*",
    "/bookings/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/housetypes/:path*",
  ],
}
