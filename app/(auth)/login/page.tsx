"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Eye, EyeOff, LogIn, Bell, BellOff } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import { getToken } from "@/lib/cookies";
import { de } from "date-fns/locale";
import { set } from "date-fns";
import { useFirebase } from "@/hooks/use-firebase";

const loginSchema = z.object({
  phone: z.string().min(10, {
    message: "يرجى إدخال رقم هاتف صحيح",
  }),
  password: z.string().min(6, {
    message: "كلمة المرور يجب أن تكون أكثر من 6 أحرف",
  }),
});

export default function LoginPage() {
  const [phone, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {}
  ); const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const { fcmToken, isSupported, requestNotificationPermission } = useFirebase();

  const isValidPhone = (phone: string) => {
    return phone.length >= 8 && /^\+?\d+$/.test(phone);
  };
  // بيانات الدخول المؤقتة
  const demoCredentials = {
    phone: " +12025550191", // رقم الهاتف التجريبي
    password: "password",
  };

  // التحقق من وجود توكن عند تحميل الصفحة
  useEffect(() => {
    const token = getToken();
    if (token || isAuthenticated) {
      console.log("Login page: Token found, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]); const validateForm = (data: { phone: string; password: string }) => {
    try {
      loginSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      // عدم رمي الاستثناء للخارج لمنع إعادة تحميل الصفحة
      if (error instanceof z.ZodError) {
        const formattedErrors: { phone?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "phone") {
            formattedErrors.phone = err.message;
          }
          if (err.path[0] === "password") {
            formattedErrors.password = err.message;
          }
        });
        setErrors(formattedErrors);

        // عرض رسالة خطأ للمستخدم
        toast({
          title: "خطأ في البيانات المدخلة",
          description: "يرجى التحقق من البيانات المدخلة وإصلاح الأخطاء",
          variant: "destructive",
        });
      }
      return false;
    }
  }; const handleSubmit = async (e: React.FormEvent) => {
    // منع السلوك الافتراضي للنموذج (إعادة تحميل الصفحة)
    e.preventDefault();
    e.stopPropagation();

    // تخزين البيانات المدخلة
    const formData = { phone, password };

    if (!validateForm(formData)) {
      // منع إعادة تحميل الصفحة عند وجود أخطاء في التحقق
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting login form with:", {
        phone,
        password: "********",
      });

      // استخدام المتغير المحلي ليتم الاحتفاظ به حتى إذا تم إعادة تحميل المكون
      const response = await login(phone, password);
      console.log("Login response:", response);

      // التأكد من أن المكون لا يزال موجوداً قبل استخدام setState
      if (response.success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة إدارة Sawa Stay",
        });

        // تأخير قصير قبل التوجيه للتأكد من حفظ التوكن في الكوكيز
        // Check if we can use the Navigator API
        if (typeof window !== 'undefined' && window.navigator) {
          // Use requestAnimationFrame to ensure the toast is visible before navigation
          requestAnimationFrame(() => {
            window.location.href = "/dashboard";
          });
        } else {
          router.push("/dashboard");
        }

      } else {
        // التعامل مع أخطاء الاستجابة بشكل صحيح
        toast({
          title: "فشل تسجيل الدخول",
          description: response.message || "بيانات الدخول غير صحيحة",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login submission error:", error);

      // منع إعادة تحميل الصفحة عند حدوث خطأ
      e.preventDefault();

      // الحصول على رسالة الخطأ من الاستجابة إذا كانت متاحة
      let errorMessage = "حدث خطأ أثناء محاولة تسجيل الدخول";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // إذا كان الخطأ من Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      toast({
        title: "فشل تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });

      // التأكد من تحديث حالة التحميل
      setIsLoading(false);
    }
  };
  const fillDemoCredentials = () => {
    setPhoneNumber(demoCredentials.phone);
    setPassword(demoCredentials.password);
  };
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="animate-float mb-8">
        <Card className="w-[350px] shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Sawa Stay"
                width={120}
                height={120}
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات الدخول للوصول إلى لوحة الإدارة
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="phone-input-container">
                  <PhoneInput
                    defaultCountry="ae"
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      height: "40px",
                      fontSize: "0.875rem",
                      borderRadius: "0.375rem",
                    }}
                    value={phone}
                    onChange={(phone) => {
                      setPhoneNumber(phone);

                      // Validate phone number
                      const isValid = isValidPhone(phone);
                      if (!isValid && phone.length > 4) {
                        setPhoneError("رقم الهاتف غير صحيح");
                      } else {
                        setPhoneError(null);
                      }
                    }}
                    inputProps={{
                      placeholder: "أدخل رقم الهاتف",
                      required: true,
                      name: "phone_display",
                    }}
                  />
                  {phoneError && (
                    <p className="text-sm text-destructive mt-1">
                      {phoneError}
                    </p>
                  )}
                  {errors.phone && !phoneError && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={errors.password ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>              {/* Notification permission section */}
              {isSupported && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {fcmToken ? (
                        <Bell className="h-4 w-4 text-blue-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm font-medium">
                        {fcmToken ? "الإشعارات مفعلة" : "تفعيل الإشعارات"}
                      </span>
                    </div>
                    {!fcmToken && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={requestNotificationPermission}
                      >
                        تفعيل
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fcmToken
                      ? "ستصلك إشعارات عن الحجوزات والتحديثات المهمة"
                      : "اسمح بالإشعارات لتلقي تحديثات فورية عن الحجوزات"
                    }
                  </p>
                </div>
              )}
              {/* 
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  بيانات الدخول المؤقتة:
                </p>
                <div className="text-xs bg-muted p-2 rounded-md text-left mb-2 font-mono">
                  <div>
                    رقم الهاتف :{" "}
                    <span
                      // dir="ltr"
                      style={{ unicodeBidi: "plaintext" }}
                    >
                      {demoCredentials.phone}
                    </span>
                  </div>
                  <div>كلمة المرور: {demoCredentials.password}</div>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="w-full text-xs"
                  onClick={fillDemoCredentials}
                >
                  استخدام بيانات الدخول المؤقتة
                </Button>
              </div>
              */}
              {/* <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div> */}
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="button"
                onClick

                ={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>جاري الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={16} />
                    <span>تسجيل الدخول</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
