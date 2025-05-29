"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { api } from "@/lib/api";
import Link from "next/link";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { isValidPhone } from "@/lib/phone-validation";

const resetPasswordSchema = z
  .object({
    phone: z.string().min(10, {
      message: "يرجى إدخال رقم هاتف صحيح",
    }),
    password: z.string().min(6, {
      message: "كلمة المرور يجب أن تكون أكثر من 6 أحرف",
    }),
    password_confirmation: z.string().min(6, {
      message: "تأكيد كلمة المرور يجب أن يكون أكثر من 6 أحرف",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["password_confirmation"],
  });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [phone, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    password_confirmation?: string;
  }>({});
  
  const isValidPhone = (phone: string) => {
    return phone.length >= 8 && /^\+?\d+$/.test(phone);
  };
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhoneNumber(phoneParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({
        phone,
        password,
        password_confirmation,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: {
          phone?: string;
          password?: string;
          password_confirmation?: string;
        } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "phone") {
            formattedErrors.phone = err.message;
          }
          if (err.path[0] === "password") {
            formattedErrors.password = err.message;
          }
          if (err.path[0] === "password_confirmation") {
            formattedErrors.password_confirmation = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        phone,
        password,
        password_confirmation,
      });

      if (response.data.success) {
        toast({
          title: "تم إعادة تعيين كلمة المرور بنجاح",
          description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة",
        });

        // توجيه المستخدم إلى صفحة تسجيل الدخول
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: response.data.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Syria Go Logo"
              width={120}
              height={120}
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>
            أدخل كلمة المرور الجديدة
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="phone-input-container">
                <PhoneInput
                  defaultCountry="ae"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    height: '40px',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
                  }}
                  value={phone}
                  onChange={(phone) => {
                    if (!searchParams.get("phone")) {
                      setPhoneNumber(phone);
                      
                      // Validate phone number
                      const isValid = isValidPhone(phone);
                      if (!isValid && phone.length > 4) {
                        setPhoneError("رقم الهاتف غير صحيح");
                      } else {
                        setPhoneError(null);
                      }
                    }
                  }}
                  inputProps={{
                    placeholder: "أدخل رقم الهاتف",
                    required: true,
                    name: "phone_display",
                    readOnly: !!searchParams.get("phone"),
                  }}
                />
                {phoneError && (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
                {errors.phone && !phoneError && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  dir="ltr"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="******"
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={errors.password_confirmation ? "border-red-500 pr-10" : "pr-10"}
                  dir="ltr"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">{errors.password_confirmation}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري الإرسال..." : "إعادة تعيين كلمة المرور"}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
