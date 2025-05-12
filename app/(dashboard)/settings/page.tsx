"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save } from "lucide-react"

// Mock data
const settings = [
  {
    id: 1,
    key: "site_name",
    value: "Syria Go",
    type: "text",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 2,
    key: "site_description",
    value: "منصة حجز الإقامات في سوريا",
    type: "text",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 3,
    key: "contact_email",
    value: "info@syriagp.com",
    type: "text",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 4,
    key: "contact_phone",
    value: "+963912345678",
    type: "text",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 5,
    key: "commission_percentage",
    value: "10",
    type: "float",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 6,
    key: "service_fee_percentage",
    value: "5",
    type: "float",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 7,
    key: "enable_registration",
    value: "1",
    type: "bool",
    allow_null: false,
    is_settings: true,
  },
  {
    id: 8,
    key: "maintenance_mode",
    value: "0",
    type: "bool",
    allow_null: false,
    is_settings: true,
  },
]

const generalSettingsSchema = z.object({
  site_name: z.string().min(2, {
    message: "اسم الموقع يجب أن يكون أكثر من حرفين",
  }),
  site_description: z.string().min(10, {
    message: "وصف الموقع يجب أن يكون أكثر من 10 أحرف",
  }),
  contact_email: z.string().email({
    message: "يرجى إدخال بريد إلكتروني صحيح",
  }),
  contact_phone: z.string().min(10, {
    message: "يرجى إدخال رقم هاتف صحيح",
  }),
})

const bookingSettingsSchema = z.object({
  commission_percentage: z.coerce.number().min(0).max(100),
  service_fee_percentage: z.coerce.number().min(0).max(100),
})

const systemSettingsSchema = z.object({
  enable_registration: z.boolean(),
  maintenance_mode: z.boolean(),
})

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: settings.find((s) => s.key === "site_name")?.value || "",
      site_description: settings.find((s) => s.key === "site_description")?.value || "",
      contact_email: settings.find((s) => s.key === "contact_email")?.value || "",
      contact_phone: settings.find((s) => s.key === "contact_phone")?.value || "",
    },
  })

  const bookingForm = useForm<z.infer<typeof bookingSettingsSchema>>({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: {
      commission_percentage: Number(settings.find((s) => s.key === "commission_percentage")?.value || "10"),
      service_fee_percentage: Number(settings.find((s) => s.key === "service_fee_percentage")?.value || "5"),
    },
  })

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      enable_registration: settings.find((s) => s.key === "enable_registration")?.value === "1",
      maintenance_mode: settings.find((s) => s.key === "maintenance_mode")?.value === "1",
    },
  })

  function onGeneralSubmit(values: z.infer<typeof generalSettingsSchema>) {
    console.log(values)
    // Here you would save the settings to the database
  }

  function onBookingSubmit(values: z.infer<typeof bookingSettingsSchema>) {
    console.log(values)
    // Here you would save the settings to the database
  }

  function onSystemSubmit(values: z.infer<typeof systemSettingsSchema>) {
    console.log(values)
    // Here you would save the settings to the database
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإعدادات</h2>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
          <TabsTrigger value="booking">إعدادات الحجز</TabsTrigger>
          {/*
          <TabsTrigger value="system">إعدادات النظام</TabsTrigger>
          */}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>إدارة الإعدادات العامة للموقع مثل الاسم والوصف ومعلومات الاتصال</CardDescription>
            </CardHeader>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="site_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الموقع</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>اسم الموقع الذي سيظهر في العنوان وفي جميع أنحاء الموقع</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="site_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الموقع</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>وصف موجز للموقع يظهر في نتائج البحث ووسائل التواصل الاجتماعي</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني للتواصل</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormDescription>البريد الإلكتروني الرئيسي للتواصل مع إدارة الموقع</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف للتواصل</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>رقم الهاتف الرئيسي للتواصل مع إدارة الموقع</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الحجز</CardTitle>
              <CardDescription>إدارة إعدادات الحجز مثل العمولة ورسوم الخدمة</CardDescription>
            </CardHeader>
            <Form {...bookingForm}>
              <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={bookingForm.control}
                    name="commission_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نسبة العمولة (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="100" />
                        </FormControl>
                        <FormDescription>نسبة العمولة التي يتم خصمها من المضيف عند إتمام الحجز</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bookingForm.control}
                    name="service_fee_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نسبة رسوم الخدمة (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" max="100" />
                        </FormControl>
                        <FormDescription>نسبة رسوم الخدمة التي يتم إضافتها إلى سعر الحجز</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
              <CardDescription>إدارة إعدادات النظام مثل التسجيل ووضع الصيانة</CardDescription>
            </CardHeader>
            <Form {...systemForm}>
              <form onSubmit={systemForm.handleSubmit(onSystemSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={systemForm.control}
                    name="enable_registration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">تفعيل التسجيل</FormLabel>
                          <FormDescription>السماح للمستخدمين الجدد بالتسجيل في الموقع</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={systemForm.control}
                    name="maintenance_mode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">وضع الصيانة</FormLabel>
                          <FormDescription>تفعيل وضع الصيانة لإغلاق الموقع مؤقتًا للمستخدمين العاديين</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    حفظ الإعدادات
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
