"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { isValidPhone } from "@/lib/phone-validation";

const forgotPasswordSchema = z.object({
  phone: z.string().min(10, {
    message: "يرجى إدخال رقم هاتف صحيح",
  }),
});

export default function ForgotPasswordPage() {
  const [phone, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string }>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ phone });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { phone?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "phone") {
            formattedErrors.phone = err.message;
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
      console.log("Sending forgot password request with phone:", phone);
      const response = await api.post("/auth/forgot-password", {
        phone,
      });
      console.log("Forgot password response:", response.data);
      console.log("Headers:", response.headers);
      console.log("Status:", response.status);

      if (response.data.success) {
        toast({
          title: "تم إرسال رمز التحقق",
          description: "يرجى التحقق من هاتفك للحصول على رمز التحقق",
        });

        // توجيه المستخدم إلى صفحة التحقق مع تمرير رقم الهاتف
        console.log("About to navigate to verify-otp page");
        setTimeout(() => {
          router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);
        }, 500);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description:
            response.data.message ||
            "حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center  min-w-[390px] justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-lg">
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
          <CardTitle className="text-2xl">نسيت كلمة المرور</CardTitle>
          <CardDescription>أدخل رقم هاتفك لإرسال رمز التحقق</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {" "}
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
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                )}
                {errors.phone && !phoneError && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </Button>
            <Link
              href="/login"
              className="flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowRight className="h-4 w-4 ml-1" />
              العودة إلى تسجيل الدخول
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
