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
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
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
import { Briefcase, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, usersAPI } from "@/lib/api";
import { Textarea } from "../ui/textarea";

// Schema for editing staff
const editStaffSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  avatar: z.string().optional(),
  status: z.enum(["active", "banneded"]).optional(),
});

// Schema for creating new staff
const createStaffSchema = z.object({
  first_name: z.string().min(2, {
    message: "الاسم الأول يجب أن يكون أكثر من حرفين",
  }),
  last_name: z.string().min(2, {
    message: "الاسم الأخير يجب أن يكون أكثر من حرفين",
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  department: z.string(),
  position: z.string(),
  phone: z.string().min(9, {
    message: "رقم الهاتف يجب أن يكون أكثر من 9 أرقام",
  }),
  avatar: z.string().optional(),
  password: z.string().min(8, {
    message: "كلمة المرور يجب أن تكون أكثر من 8 أحرف",
  }),
  status: z.enum(["active", "banneded"]),
  role: z.literal("employee"), // دائمًا قيمة "employee" للموظفين
  skills: z.string().optional(),
});

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: any;
  onSuccess: () => void;
}

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const { toast } = useToast();

  const isValidPhone = (phone: string) => {
    return phone.length >= 8 && /^\+?\d+$/.test(phone);
  };

  // Type for form values that works for both edit and create
  type StaffFormValues = z.infer<typeof createStaffSchema>;

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(
      staff
        ? (editStaffSchema as unknown as z.ZodType<StaffFormValues>)
        : createStaffSchema
    ),
    defaultValues: staff
      ? {
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          email: staff.email || "",
          avatar: staff.avatar || "",
          department: staff.department || "",
          position: staff.position || "",
          phone: staff.country_code + staff.phone_number || "",
          status: (staff.status as "active" | "banneded") || "active",
          skills: staff.skills || "",
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          avatar: "",
          department: "operations",
          position: "",
          phone: "",
          password: "",
          status: "active",
          role: "employee",
          skills: "",
        },
  });

  useEffect(() => {
    if (staff) {
      form.reset({
        first_name: staff.first_name || "",
        last_name: staff.last_name || "",
        email: staff.email || "",
        avatar: staff.avatar || "",
        department: staff.department || "",
        position: staff.position || "",
        phone: staff.country_code + staff.phone_number || "",
        status: (staff.status as "active" | "banneded") || "active",
        skills: staff.skills || "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        avatar: "",
        department: "operations",
        position: "",
        phone: "",
        password: "",
        status: "active",
        role: "employee",
        skills: "",
      });
    }
  }, [staff, form]);
  async function onSubmit(values: StaffFormValues) {
    // Validate phone number before submission
    if (values.phone && !isValidPhone(values.phone)) {
      setPhoneError("رقم الهاتف غير صحيح");
      return;
    }

    setIsLoading(true);

    try {
      // إضافة قيمة role = "employee" للتأكد من أن المستخدم يتم إضافته كموظف
      const formData = {
        ...values,
        role: "employee",
        id_verified:"none", // Assuming this is a required field, set it to "none" or adjust as needed
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

      let response;
      if (staff?.id) {
        // Update existing staff
        response = await usersAPI.update(staff.id, formData);
      } else {
        // Create new staff
        response = await usersAPI.create(formData);
      }

      if (response.success) {
        toast({
          title: staff ? "تم تحديث الموظف" : "تمت إضافة الموظف",
          description: staff
            ? `تم تحديث بيانات الموظف ${
                values.first_name || staff.first_name
              } ${values.last_name || staff.last_name} بنجاح`
            : `تمت إضافة الموظف ${values.first_name} ${values.last_name} بنجاح`,
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
    const firstName = staff?.first_name || "";
    const lastName = staff?.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {staff ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
          </DialogTitle>
          <DialogDescription>
            {staff
              ? "قم بتعديل بيانات الموظف أدناه"
              : "قم بإدخال بيانات الموظف الجديد"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {staff && (
              <div className="flex justify-center py-2">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage
                    src={
                      staff.avatar_url
                        ? staff.avatar_url
                        : `/placeholder.svg?height=80&width=80`
                    }
                    alt={`${staff.first_name || ""} ${staff.last_name || ""}`}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
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
                    <FormLabel className="text-primary">الاسم الأول</FormLabel>
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
                    <FormLabel className="text-primary">الاسم الأخير</FormLabel>
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
                  <FormLabel className="text-primary">
                    البريد الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" dir="ltr" />
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
                  <FormLabel className="text-primary">صورة الموظف</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  <FormDescription>
                    يمكنك تحميل صورة شخصية للموظف. إذا لم تقم بتحميل صورة، سيتم
                    استخدام الصورة الافتراضية.
                  </FormDescription>
                  {staff?.avatar && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        الصورة الحالية:
                      </p>
                      <img
                        src={staff.avatar_url || "/placeholder.svg"}
                        alt={staff.first_name || ""}
                        className="h-16 w-16 object-cover rounded-md border border-primary/20"
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
                        className="h-16 w-16 object-cover rounded-md border border-primary/20"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {" "}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">رقم الهاتف</FormLabel>
                    <FormControl>
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
                          
                          
                          value={field.value}
                          onChange={(phone) => {
                            field.onChange(phone);

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
                            name: "phone",
                          }}
                        />
                      </div>
                    </FormControl>
                    {phoneError && (
                      <p className="text-sm text-destructive mt-1">
                        {phoneError}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">الحالة</FormLabel>
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
                        <SelectItem value="banneded">محظور</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">القسم</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="management">الإدارة</SelectItem>
                        <SelectItem value="support">الدعم</SelectItem>
                        <SelectItem value="operations">العمليات</SelectItem>
                        <SelectItem value="finance">المالية</SelectItem>
                        <SelectItem value="marketing">التسويق</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">المنصب الوظيفي</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: مدير مبيعات" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            {!staff && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* 
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">المهارات والملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="أدخل المهارات والخبرات أو أي ملاحظات إضافية"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-primary hover:opacity-90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    {staff ? "تحديث بيانات الموظف" : "إضافة موظف"}
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
