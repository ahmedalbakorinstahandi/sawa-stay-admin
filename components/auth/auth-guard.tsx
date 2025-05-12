"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getToken } from "@/lib/cookies";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // التحقق من وجود توكن في الكوكيز أو localStorage
      const token = getToken();

      if (!token && !isAuthenticated) {
        console.log("AuthGuard: No token found, redirecting to login");
        router.push("/login");
      } else {
        console.log("AuthGuard: Token found, allowing access");
        setIsCheckingAuth(false);
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading, isAuthenticated, router]);

  // عرض شاشة تحميل أثناء التحقق من المصادقة
  // if (isLoading || isCheckingAuth) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
  //         <p className="text-lg font-medium">جاري التحميل...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // إذا كان المستخدم مصادق عليه، عرض المحتوى
  return <>{children}</>;
}
