"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, usersAPI } from "@/lib/api";

// Schema for editing - all fields are optional without validation
const editUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  host_verified: z.enum(["none", "approved"]).optional(),
  // phone: z.string().optional(),
  // role: z.enum(["user", "admin", "host"]).optional(),
  avatar: z.string().optional(),
  // password: z.string().optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  language: z.string().optional(),
});

// Schema for creating new user - all fields are required with validation
const createUserSchema = z.object({
  first_name: z.string().min(2, {
    message: "الاسم الأول يجب أن يكون أكثر من حرفين",
  }),
  last_name: z.string().min(2, {
    message: "الاسم الأخير يجب أن يكون أكثر من حرفين",
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  host_verified: z.enum(["none", "approved"]),
  phone: z.string().min(9, {
    message: "رقم الهاتف يجب أن يكون أكثر من 9 أرقام",
  }),
  role: z.enum(["user", "admin", "host"]),
  avatar: z.string().optional(),
  password: z.string().min(8, {
    message: "كلمة المرور يجب أن تكون أكثر من 8 أحرف",
  }),
  status: z.enum(["active", "inactive", "banned"]),
  language: z.string(),
});

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Type for form values that works for both edit and create
  type UserFormValues = z.infer<typeof createUserSchema>;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(user ? editUserSchema : createUserSchema),
    defaultValues: user
      ? {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          avatar: user.avatar || "",
          // country_code: user.country_code || "+963",
          host_verified: user.host_verified || "none",
          phone: user.phone_number || "",
          role: (user.role as "user" | "admin" | "host") || "user",
          status: (user.status as "active" | "inactive" | "banned") || "active",
          language: user.language || "ar",
          // password: "",
          password: user.password || "",
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          avatar: "",
          // country_code: "+963",
          phone: "",
          host_verified: "none",
          role: "user",
          password: "",
          status: "active",
          language: "ar",
        },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        host_verified: user.host_verified || "none",
        phone: user.phone || "",
        role: (user.role as "user" | "admin" | "host") || "user",
        status: (user.status as "active" | "inactive" | "banned") || "active",
        language: user.language || "ar",
        password: user.password || "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        avatar: "",
        phone: "",
        host_verified: "none",
        role: "user",
        password: "",
        status: "active",
        language: "ar",
      });
    }
  }, [user, form]);
  async function onSubmit(values: UserFormValues) {
    setIsLoading(true);

    try {
      let response;
      // Prepare the data to send
      const formData = {
        ...values,
        // Remove empty strings and undefined values
        ...Object.fromEntries(
          Object.entries(values).filter(
            ([_, value]) => value !== "" && value !== undefined
          )
        ),
      };

      if (selectedFile) {
        formData.avatar = selectedFile.toString();
      }

      if (user?.id) {
        // Update existing user
        delete formData.password; // Remove password from edit requests unless specifically changed
        response = await usersAPI.update(user.id, formData);
      } else {
        // Create new user - all required fields should be present
        response = await usersAPI.create(formData);
      }

      if (response.success) {
        toast({
          title: user ? "تم تحديث المستخدم" : "تمت إضافة المستخدم",
          description: user
            ? `تم تحديث بيانات المستخدم ${
                values.first_name || user.first_name
              } ${values.last_name || user.last_name} بنجاح`
            : `تمت إضافة المستخدم ${values.first_name} ${values.last_name} بنجاح`,
        });
        onSuccess();
        onOpenChange(false);
        setPreviewUrl(null);
        setSelectedFile(null);
      } else {
        toast({
          title: "حدث خطأ",
          description:
            response.message || "فشلت العملية، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشلت العملية، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file) {
        // use fun uploadImage
        const image_upload = await uploadImage(file);
        console.log(image_upload);

        setPreviewUrl(image_upload.image_url);
        setSelectedFile(image_upload.image_name);
      }
    }
  };
  // إنشاء الأحرف الأولى للاسم بشكل آمن
  const getInitials = () => {
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "قم بتعديل بيانات المستخدم أدناه"
              : "قم بإدخال بيانات المستخدم الجديد"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {user && (
              <div className="flex justify-center py-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      user.avatar
                        ? user.avatar
                        : `/placeholder.svg?height=80&width=80`
                    }
                    alt={`${user.first_name || ""} ${user.last_name || ""}`}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أيقونة التصنيف</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  <FormDescription>صورة تمثل التصنيف</FormDescription>
                  {user?.avatar && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        الصورة الحالية:
                      </p>
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.first_name || ""}
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
            {/* <div className="grid grid-cols-3 gap-4"> */}
            {/* <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الدولة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر رمز الدولة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="+963">+963 (سوريا)</SelectItem>
                        <SelectItem value="+961">+961 (لبنان)</SelectItem>
                        <SelectItem value="+962">+962 (الأردن)</SelectItem>
                        <SelectItem value="+20">+20 (مصر)</SelectItem>
                        <SelectItem value="+966">+966 (السعودية)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* password  with icon eye */}
            {!user && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* </div> */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">مستخدم</SelectItem>
                        <SelectItem value="admin">مدير</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* "host_verified": "none", // required|in:none,approved */}
              <FormField
                control={form.control}
                name="host_verified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التحقق من الهوية</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة التحقق" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">غير متحقق</SelectItem>
                        <SelectItem value="approved">تم التحقق</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="banned">محظور</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اللغة المفضلة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    اللغة المفضلة للمستخدم في التطبيق
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {user ? "تحديث المستخدم" : "إضافة مستخدم"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
