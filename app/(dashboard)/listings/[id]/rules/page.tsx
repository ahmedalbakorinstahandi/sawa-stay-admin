"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// مخطط التحقق من قواعد الإعلان
const rulesSchema = z.object({
  allows_pets: z.boolean().default(false).optional(),
  allows_smoking: z.boolean().default(false).optional(),
  allows_parties: z.boolean().default(false).optional(),
  allows_children: z.boolean().default(true).optional(),
  remove_shoes: z.boolean().default(false).optional(),
  no_extra_guests: z.boolean().default(false).optional(),
  quiet_hours: z.object({
    ar: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  }),
  restricted_rooms_note: z.object({
    ar: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  }),
  garbage_disposal_note: z.object({
    ar: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  }),
  pool_usage_note: z.object({
    ar: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  }),
  forbidden_activities_note: z.object({
    ar: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  }),
  check_in_time: z.string().default("14:00"),
  check_out_time: z.string().default("12:00"),
});

type RulesFormValues = z.infer<typeof rulesSchema>;

export default function ListingRulesPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listingTitle, setListingTitle] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  // نموذج البيانات
  const form = useForm<RulesFormValues>({
    resolver: zodResolver(rulesSchema as any),
    defaultValues: {
      allows_pets: false,
      allows_smoking: false,
      allows_parties: false,
      allows_children: true,
      remove_shoes: false,
      no_extra_guests: false,
      quiet_hours: {
        ar: "",
        en: "",
      },
      restricted_rooms_note: {
        ar: "",
        en: "",
      },
      garbage_disposal_note: {
        ar: "",
        en: "",
      },
      pool_usage_note: {
        ar: "",
        en: "",
      },
      forbidden_activities_note: {
        ar: "",
        en: "",
      },
      check_in_time: "14:00",
      check_out_time: "12:00",
    },
  });

  // جلب بيانات قواعد الإعلان
  useEffect(() => {
    const fetchListingRules = async () => {
      try {
        setIsLoading(true);

        // جلب بيانات الإعلان
        const response: any = await api.get(`/admin/listings/${listingId}`);
        console.log(response);

        if (response.data.success && response.data.data) {
          setListingTitle(
            response.data.data.title.ar ||
              response.data.data.title.en ||
              "الإعلان"
          );

          // تعبئة النموذج بالبيانات
          if (response.data.data.rule) {
            const rule = response.data.data.rule;
            form.reset({
              allows_pets: rule.allows_pets || false,
              allows_smoking: rule.allows_smoking || false,
              allows_parties: rule.allows_parties || false,
              allows_children: rule.allows_children !== false, // افتراضياً true
              remove_shoes: rule.remove_shoes === 1,
              no_extra_guests: rule.no_extra_guests === 1,
              quiet_hours: rule.quiet_hours || { ar: "", en: "" },
              restricted_rooms_note: rule.restricted_rooms_note || {
                ar: "",
                en: "",
              },
              garbage_disposal_note: rule.garbage_disposal_note || {
                ar: "",
                en: "",
              },
              pool_usage_note: rule.pool_usage_note || { ar: "", en: "" },
              forbidden_activities_note: rule.forbidden_activities_note || {
                ar: "",
                en: "",
              },
              check_in_time: response.data.check_in || "14:00",
              check_out_time: response.data.check_out || "12:00",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching listing rules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingRules();
  }, []);

  // حفظ قواعد الإعلان
  const onSubmit = async (data: RulesFormValues) => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // تحويل البيانات إلى الشكل المطلوب للـ API
      const formattedData = {
        ...data,
        remove_shoes: data.remove_shoes ? 1 : 0,
        no_extra_guests: data.no_extra_guests ? 1 : 0,
      };

      // إرسال البيانات
      const response: any = await api.put(
        `/admin/listings/${listingId}/rules`,
        formattedData
      );

      if (response.data.success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم تحديث قواعد الإعلان بنجاح.",
          variant: "default",
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
      }
    } catch (error) {
      console.error("Error updating listing rules:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
     <div className="space-y-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/listings`)}
            className="ml-2"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">قواعد الإعلان</h1>
        </div>

        <p className="text-gray-600 mb-6">
          تعديل قواعد الإعلان:{" "}
          <span className="font-medium">{listingTitle}</span>
        </p>

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <AlertTitle>تم الحفظ بنجاح</AlertTitle>
            </div>
            <AlertDescription>تم تحديث قواعد الإعلان بنجاح.</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>القواعد الأساسية</CardTitle>
                  <CardDescription>
                    حدد القواعد الأساسية للإقامة في الإعلان
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="allows_pets"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
                                <path d="M14.5 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
                                <path d="M8 14v.5" />
                                <path d="M16 14v.5" />
                                <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
                                <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
                              </svg>
                              مسموح بالحيوانات الأليفة
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل يُسمح للضيوف بإحضار حيواناتهم الأليفة؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allows_smoking"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M18 12H2v4h16" />
                                <path d="M22 12v4" />
                                <path d="M7 12v4" />
                                <path d="M18 8c0-2.5-2-2.5-2-5" />
                                <path d="M22 8c0-2.5-2-2.5-2-5" />
                              </svg>
                              مسموح بالتدخين
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل يُسمح للضيوف بالتدخين داخل الإعلان؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allows_parties"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M5.8 11.3 2 22l10.7-3.79" />
                                <path d="M4 3h.01" />
                                <path d="M22 8h.01" />
                                <path d="M15 2h.01" />
                                <path d="M22 20h.01" />
                                <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
                                <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
                                <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
                                <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
                              </svg>
                              مسموح بالحفلات
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل يُسمح للضيوف بإقامة حفلات في الإعلان؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allows_children"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M9 21h6" />
                                <path d="M12 21v-2" />
                                <path d="M11 9a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
                                <path d="M7 3v2" />
                                <path d="M17 3v2" />
                                <path d="M7 8h10" />
                                <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5z" />
                              </svg>
                              مناسب للأطفال
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل الإعلان مناسب للأطفال والرضع؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remove_shoes"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M2.5 14.5c.63.51 1.29.94 2.03 1.29a9 9 0 0 0 3.97.71c2.93 0 5.5-1.5 7-4 1.5-2.5 1.5-5.5 0-8-1.5-2.5-4.07-4-7-4a9 9 0 0 0-3.97.71A8.99 8.99 0 0 0 2.5 2.5" />
                                <path d="M2.5 2.5v12" />
                                <path d="M7 15v7" />
                                <path d="M14 15v7" />
                                <path d="M7 22h7" />
                              </svg>
                              خلع الأحذية
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل يجب على الضيوف خلع أحذيتهم عند الدخول؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="no_extra_guests"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0">
                          <div>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-rose-500"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="17" x2="22" y1="8" y2="13" />
                                <line x1="22" x2="17" y1="8" y2="13" />
                              </svg>
                              لا ضيوف إضافيين
                            </FormLabel>
                            <p className="text-xs text-gray-500 mr-7">
                              هل يُمنع إحضار ضيوف إضافيين غير المسجلين؟
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="check_in_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وقت تسجيل الدخول</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="check_out_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وقت تسجيل الخروج</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات وتعليمات إضافية</CardTitle>
                  <CardDescription>
                    أضف ملاحظات وتعليمات إضافية للضيوف
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="quiet_hours.ar"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>ساعات الهدوء (بالعربية)</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    حدد الأوقات التي يجب على الضيوف الالتزام
                                    بالهدوء خلالها
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="مثال: من الساعة 10 مساءً حتى 8 صباحاً"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quiet_hours.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ساعات الهدوء (بالإنجليزية)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Example: From 10 PM to 8 AM"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="restricted_rooms_note.ar"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>
                              ملاحظات الغرف المقيدة (بالعربية)
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    أضف ملاحظات حول الغرف التي لا يمكن للضيوف
                                    استخدامها أو لها قيود معينة
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="مثال: غرفة التخزين في الطابق العلوي غير متاحة للضيوف"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="restricted_rooms_note.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            ملاحظات الغرف المقيدة (بالإنجليزية)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Example: The storage room on the upper floor is not available for guests"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="garbage_disposal_note.ar"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>
                              ملاحظات التخلص من النفايات (بالعربية)
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    أضف تعليمات حول كيفية التخلص من النفايات في
                                    الإعلان
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="مثال: يرجى فصل النفايات القابلة للتدوير ووضعها في الحاوية الزرقاء"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="garbage_disposal_note.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            ملاحظات التخلص من النفايات (بالإنجليزية)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Example: Please separate recyclable waste and place it in the blue container"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pool_usage_note.ar"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>
                              ملاحظات استخدام المسبح (بالعربية)
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    أضف تعليمات حول استخدام المسبح إن وجد
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="مثال: ساعات استخدام المسبح من 9 صباحاً حتى 9 مساءً، الأطفال يجب أن يكونوا تحت إشراف البالغين"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pool_usage_note.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            ملاحظات استخدام المسبح (بالإنجليزية)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Example: Pool hours are from 9 AM to 9 PM, children must be supervised by adults"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="forbidden_activities_note.ar"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>الأنشطة الممنوعة (بالعربية)</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    أضف قائمة بالأنشطة الممنوعة في الإعلان
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="مثال: ممنوع الشواء في الشرفة، ممنوع تشغيل الموسيقى بصوت عالٍ بعد الساعة 10 مساءً"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="forbidden_activities_note.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الأنشطة الممنوعة (بالإنجليزية)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Example: No barbecuing on the balcony, no loud music after 10 PM"
                              className="resize-none"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(`/host/listings/${listingId}/edit`)
                    }
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 ml-2" />
                        حفظ القواعد
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
    </div>
  );
}
