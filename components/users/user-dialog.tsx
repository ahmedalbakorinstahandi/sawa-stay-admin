"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usersAPI } from "@/lib/api"

const userFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "الاسم الأول يجب أن يكون أكثر من حرفين",
  }),
  last_name: z.string().min(2, {
    message: "الاسم الأخير يجب أن يكون أكثر من حرفين",
  }),
  email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  country_code: z.string(),
  phone_number: z.string().min(9, {
    message: "رقم الهاتف يجب أن يكون أكثر من 9 أرقام",
  }),
  role: z.enum(["user", "admin", "host"]),
  status: z.enum(["active", "inactive", "banned"]),
  language: z.string(),
})

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onSuccess: () => void
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          country_code: user.country_code || "+963",
          phone_number: user.phone_number || "",
          role: (user.role as "user" | "admin" | "host") || "user",
          status: (user.status as "active" | "inactive" | "banned") || "active",
          language: user.language || "ar",
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          country_code: "+963",
          phone_number: "",
          role: "user",
          status: "active",
          language: "ar",
        },
  })

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    setIsLoading(true)

    try {
      let response

      if (user?.id) {
        // تحديث مستخدم موجود
        response = await usersAPI.update(user.id, values)
      } else {
        // إنشاء مستخدم جديد
        response = await usersAPI.create(values)
      }

      if (response.success) {
        toast({
          title: user ? "تم تحديث المستخدم" : "تمت إضافة المستخدم",
          description: user
            ? `تم تحديث بيانات المستخدم ${values.first_name} ${values.last_name} بنجاح`
            : `تمت إضافة المستخدم ${values.first_name} ${values.last_name} بنجاح`,
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشلت العملية، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشلت العملية، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // إنشاء الأحرف الأولى للاسم بشكل آمن
  const getInitials = () => {
    const firstName = user?.first_name || ""
    const lastName = user?.last_name || ""
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
          <DialogDescription>
            {user ? "قم بتعديل بيانات المستخدم أدناه" : "قم بإدخال بيانات المستخدم الجديد"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {user && (
              <div className="flex justify-center py-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.avatar ? user.avatar : `/placeholder.svg?height=80&width=80`}
                    alt={`${user.first_name || ""} ${user.last_name || ""}`}
                  />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
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
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الدولة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              />
              <FormField
                control={form.control}
                name="phone_number"
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">مستخدم</SelectItem>
                        <SelectItem value="host">مضيف</SelectItem>
                        <SelectItem value="admin">مدير</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormDescription>اللغة المفضلة للمستخدم في التطبيق</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
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
  )
}
