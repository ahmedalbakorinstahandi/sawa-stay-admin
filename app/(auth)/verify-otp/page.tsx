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
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { isValidPhone } from "@/lib/phone-validation";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, {
    message: "يرجى إدخال رقم هاتف صحيح",
  }),
  otp: z.string().length(6, {
    message: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
  }),
});

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const [phone, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);
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
      verifyOtpSchema.parse({ phone, otp });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { phone?: string; otp?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "phone") {
            formattedErrors.phone = err.message;
          }
          if (err.path[0] === "otp") {
            formattedErrors.otp = err.message;
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
      const response = await api.post("/auth/verify-otp", {
        phone,
        otp,
      });

      if (response.data.success) {
        toast({
          title: "تم التحقق بنجاح",
          description: "يمكنك الآن إعادة تعيين كلمة المرور الخاصة بك",
        });

        // توجيه المستخدم إلى صفحة إعادة تعيين كلمة المرور مع تمرير رقم الهاتف
        router.push(`/reset-password?phone=${encodeURIComponent(phone)}`);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: response.data.message || "رمز التحقق غير صحيح",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء التحقق من الرمز",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrors({ phone: "يرجى إدخال رقم هاتف صحيح" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        phone,
      });

      if (response.data.success) {
        toast({
          title: "تم إعادة إرسال رمز التحقق",
          description: "يرجى التحقق من هاتفك للحصول على رمز التحقق الجديد",
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: response.data.message || "حدث خطأ أثناء إرسال رمز التحقق",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء إرسال رمز التحقق",
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
          <CardTitle className="text-2xl">التحقق من الرمز</CardTitle>
          <CardDescription>
            أدخل رمز التحقق المرسل إلى هاتفك
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
              <Label htmlFor="otp">رمز التحقق</Label>
              <Input
                id="otp"
                type="text"
                placeholder="******"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                className={errors.otp ? "border-red-500" : ""}
                maxLength={6}
                dir="ltr"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحقق..." : "تحقق من الرمز"}
            </Button>
            <div className="flex justify-between w-full text-sm">
              <button
                type="button"
                onClick={resendOtp}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                إعادة إرسال الرمز
              </button>
              <Link href="/forgot-password" className="flex items-center text-muted-foreground hover:text-primary">
                <ArrowRight className="h-4 w-4 ml-1" />
                العودة
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
