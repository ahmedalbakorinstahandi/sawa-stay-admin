"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";

const formSchema = z.object({
  name: z.object({
    ar: z.string().min(2, {
      message: "يجب أن يحتوي الاسم على حرفين على الأقل.",
    }),
    en: z.string().min(2, {
      message: "يجب أن يحتوي الاسم على حرفين على الأقل.",
    }),
  }),
  description: z.object({
    ar: z.string().min(5, {
      message: "يجب أن يحتوي الوصف على 5 أحرف على الأقل.",
    }),
    en: z.string().min(5, {
      message: "يجب أن يحتوي الوصف على 5 أحرف على الأقل.",
    }),
  }),
  icon: z.any().optional(),
  is_visible: z.boolean(),
});

type HouseTypeFormValues = z.infer<typeof formSchema>;

interface HouseTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  housetype: any;
  onSave: (data: any) => void;
}

export function HouseTypeDialog({
  open,
  onOpenChange,
  housetype,
  onSave,
}: HouseTypeDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Initialize previewUrl with the housetype's icon_url when editing
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    housetype?.icon_url || null
  );

  const defaultValues: Partial<HouseTypeFormValues> = {
    name: {
      ar: housetype?.name?.ar || "",
      en: housetype?.name?.en || "",
    },
    description: {
      ar: housetype?.description?.ar || "",
      en: housetype?.description?.en || "",
    },
    is_visible:
      housetype?.is_visible !== undefined ? housetype.is_visible : true,
  };

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
  const form = useForm<HouseTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when housetype changes or when dialog opens
  useEffect(() => {
    if (open) {
      // Reset form with housetype values when editing
      form.reset({
        name: {
          ar: housetype?.name?.ar || "",
          en: housetype?.name?.en || "",
        },
        description: {
          ar: housetype?.description?.ar || "",
          en: housetype?.description?.en || "",
        },
        is_visible: housetype?.is_visible !== undefined ? housetype.is_visible : true,
      });
      
      // Reset the preview URL to the housetype icon URL if editing
      setPreviewUrl(housetype?.icon_url || null);
      setSelectedFile(null);
    }
  }, [housetype, open, form]);

  function onSubmit(data: HouseTypeFormValues) {
    setIsPending(true);

    // Prepare form data for API
    const formData = new FormData();

    // Add multilingual fields
    formData.append("name[ar]", data.name.ar);
    formData.append("name[en]", data.name.en);
    formData.append("description[ar]", data.description.ar);
    formData.append("description[en]", data.description.en);

    // Add other fields
    formData.append("is_visible", data.is_visible ? "1" : "0");

    // If there's an icon file, append it
    if (selectedFile) {
      formData.append("icon", selectedFile);
    }
    
    // If we're editing and we have an existing icon but no new one is selected
    if (housetype?.id && !selectedFile && housetype?.icon_url) {
      formData.append("keep_existing_icon", "1");
    }

    // Call the onSave function with the form data
    onSave(formData);
    // Reset form state
    form.reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPending(false);
    onOpenChange(false);
  }

  // Reset the form when the housetype prop changes
  useEffect(() => {
    if (housetype) {
      form.reset({
        name: {
          ar: housetype.name.ar,
          en: housetype.name.en,
        },
        description: {
          ar: housetype.description.ar,
          en: housetype.description.en,
        },
        is_visible: housetype.is_visible,
      });
      setPreviewUrl(housetype.icon_url || null);
    } else {
      form.reset();
    }
  }, [housetype, form]);

  return (
    <Dialog
      // i need scrollable

      open={open}
      onOpenChange={(isOpen) => !isPending && onOpenChange(isOpen)}
    >
      <DialogContent className="sm:max-w-[500px]  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {housetype ? "تعديل نوع المنزل" : "إضافة نوع منزل جديد"}
          </DialogTitle>
          <DialogDescription>
            {housetype
              ? "قم بتعديل معلومات نوع المنزل أدناه."
              : "قم بإدخال معلومات نوع المنزل الجديد أدناه."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ar">عربي</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList> */}

            {/* <TabsContent value="ar" className="space-y-4 mt-4"> */}
            <FormField
              control={form.control}
              name="name.ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم (عربي)</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم نوع المنزل" {...field} />
                  </FormControl>
                  <FormDescription>
                    اسم نوع المنزل الذي سيظهر للمستخدمين.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description.ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (عربي)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أدخل وصفاً لنوع المنزل" {...field} />
                  </FormControl>
                  <FormDescription>وصف موجز لنوع المنزل.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </TabsContent> */}

            {/* <TabsContent value="en" className="space-y-4 mt-4"> */}
            <FormField
              control={form.control}
              name="name.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم (إنجليزي)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter house type name" {...field} />
                  </FormControl>
                  <FormDescription>
                    اسم نوع المنزل باللغة الإنجليزية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (إنجليزي)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter house type description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    وصف موجز لنوع المنزل باللغة الإنجليزية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </TabsContent> */}
            {/* </Tabs> */}            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الأيقونة</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {housetype && (
                        <p className="text-sm text-muted-foreground">
                          اترك هذا الحقل فارغًا للاحتفاظ بالصورة الحالية
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>صورة تمثل نوع المنزل.</FormDescription>
                  {previewUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedFile ? "معاينة الصورة الجديدة:" : "الصورة الحالية:"}
                      </p>
                      <img
                        src={previewUrl}
                        alt={housetype?.name?.ar || "Preview"}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>الحالة</FormLabel>
                    <FormDescription>
                      تفعيل أو تعطيل نوع المنزل في النظام.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : housetype ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
