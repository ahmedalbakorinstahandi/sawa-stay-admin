"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/api";

// Form schemas
const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "يجب أن يحتوي الاسم الأول على حرفين على الأقل",
  }),
  last_name: z.string().min(2, {
    message: "يجب أن يحتوي الاسم الأخير على حرفين على الأقل",
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  avatar: z.string().optional(),
  bank_details: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    old_password: z.string().min(6, {
      message: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
    }),
    password: z.string().min(6, {
      message: "يجب أن تحتوي كلمة المرور الجديدة على 6 أحرف على الأقل",
    }),
    password_confirmation: z.string().min(6, {
      message: "يجب أن تحتوي تأكيد كلمة المرور على 6 أحرف على الأقل",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "كلمات المرور غير متطابقة",
    path: ["password_confirmation"],
  });

interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  wallet_balance: number;
  avatar: string | null;
  avatar_url: string | null;
  email: string;
  email_verified: boolean;
  country_code: string;
  phone_number: string;
  phone_verified: boolean;
  role: string;
  id_verified: string;
  status: string;
  otp: string | null;
  otp_expire_at: string | null;
  is_verified: boolean;
  created_at: string;
  my_listings_count: number;
  bank_details?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // توجيه التسلسل من آخر إنشاء للعربية
  useEffect(() => {
    document.documentElement.dir = "rtl";
  }, []);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      avatar: "",
      bank_details: "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      old_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/admin/profile");
        
        if (response.data.success) {
          setUserData(response.data.data);
          
          profileForm.reset({
            first_name: response.data.data.first_name,
            last_name: response.data.data.last_name,
            email: response.data.data.email,
            bank_details: response.data.data.bank_details || "",
          });
        } else {
          toast({
            title: "خطأ",
            description: response.data.message || "فشل في جلب بيانات الملف الشخصي",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "خطأ",
          description: "فشل في جلب بيانات الملف الشخصي",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast, profileForm]);

  // Handle file change for avatar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file) {
        try {
          const image_upload = await uploadImage(file);
          console.log(image_upload);

          if (image_upload.image_url) {
            setPreviewUrl(image_upload.image_url);
            setSelectedFile(image_upload.image_name);
          } else {
            toast({
              title: "خطأ",
              description: "فشل في تحميل الصورة",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "خطأ",
            description: "فشل في تحميل الصورة",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Submit profile form
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      
      const formData = {
        ...values,
      };

      if (selectedFile) {
        formData.avatar = selectedFile;
      }

      const response = await api.put("/admin/profile", formData);

      if (response.data.success) {
        toast({
          title: "تم بنجاح",
          description: "تم تحديث الملف الشخصي بنجاح",
        });
        
        // Refresh user data
        const profileResponse = await api.get("/admin/profile");
        if (profileResponse.data.success) {
          setUserData(profileResponse.data.data);
        }
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحديث الملف الشخصي",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit password form
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsPasswordLoading(true);
      
      const response = await api.put("/admin/profile", {
        old_password: values.old_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      if (response.data.success) {
        toast({
          title: "تم بنجاح",
          description: "تم تغيير كلمة المرور بنجاح",
        });
        
        // Reset password form
        passwordForm.reset();
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تغيير كلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Get full name
  const getFullName = (user: ProfileData) => {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!userData) return "";
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">مدير</Badge>;
      case "user":
        return <Badge className="bg-blue-100 text-blue-800">مستخدم</Badge>;
      case "host":
        return <Badge className="bg-green-100 text-green-800">مضيف</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Loading state
  if (!userData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">الملف الشخصي</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-24 w-24 bg-gray-200 rounded-full" />
                <div className="w-40 h-6 bg-gray-200 rounded" />
                <div className="w-20 h-4 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 animate-pulse">
            <CardHeader>
              <div className="h-10 w-full bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الملف الشخصي</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>معلومات المستخدم</CardTitle>
            <CardDescription>البيانات الأساسية للمستخدم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userData.avatar_url || "/placeholder.svg"}
                  alt={getFullName(userData)}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">
                  {getFullName(userData)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getRoleBadge(userData.role)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">رقم الهاتف</p>
                  <p className="text-sm text-muted-foreground" style={{ unicodeBidi: "plaintext" }}>
                    {userData.country_code} {userData.phone_number}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">تاريخ التسجيل</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userData.created_at).toLocaleDateString("ar-SY")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">رصيد المحفظة</p>
                  <p className="text-sm text-muted-foreground">
                    {userData.wallet_balance} USD
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <div className="rounded-lg border p-3 text-center flex-1">
                <p className="text-sm text-muted-foreground">الإعلانات</p>
                <p className="text-2xl font-bold">
                  {userData.my_listings_count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  <span>البيانات الشخصية</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>كلمة المرور</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="profile" className="mt-0">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الأول</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الأخير</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>صورة المستخدم</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </FormControl>
                          <FormDescription>
                            يمكنك تحميل صورة جديدة للملف الشخصي.
                          </FormDescription>
                          {userData?.avatar_url && !selectedFile && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                الصورة الحالية:
                              </p>
                              <img
                                src={userData.avatar_url || "/placeholder.svg"}
                                alt={userData.first_name || ""}
                                className="h-16 w-16 object-cover rounded-md"
                              />
                            </div>
                          )}
                          {previewUrl && selectedFile && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                معاينة الصورة الجديدة:
                              </p>
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-16 w-16 object-cover rounded-md"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bank_details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>معلومات البنك</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormDescription>
                            أدخل معلومات البنك لاستلام المدفوعات (اختياري)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>حفظ التغييرات</span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="password" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <p className="text-sm">
                      لتغيير كلمة المرور، يجب عليك إدخال كلمة المرور الحالية أولاً.
                    </p>
                  </div>

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="old_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور الحالية</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showPassword.oldPassword ? "text" : "password"}
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute left-0 top-0 h-full px-3"
                                onClick={() => setShowPassword({
                                  ...showPassword,
                                  oldPassword: !showPassword.oldPassword
                                })}
                              >
                                {showPassword.oldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور الجديدة</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showPassword.newPassword ? "text" : "password"}
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute left-0 top-0 h-full px-3"
                                onClick={() => setShowPassword({
                                  ...showPassword,
                                  newPassword: !showPassword.newPassword
                                })}
                              >
                                {showPassword.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="password_confirmation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showPassword.confirmPassword ? "text" : "password"}
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute left-0 top-0 h-full px-3"
                                onClick={() => setShowPassword({
                                  ...showPassword,
                                  confirmPassword: !showPassword.confirmPassword
                                })}
                              >
                                {showPassword.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isPasswordLoading} className="flex items-center gap-2">
                        {isPasswordLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <span>جاري الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>تغيير كلمة المرور</span>
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
