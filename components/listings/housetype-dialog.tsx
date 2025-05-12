"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/api";

// Remove the schema since we're using TypeScript types directly

type HouseTypeFormValues = {
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  is_visible: boolean;
  icon?: any;
};

interface HouseTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  housetype: any;
  onSave: (data: FormData) => Promise<void>;
}

export function HouseTypeDialog({
  open,
  onOpenChange,
  housetype,
  onSave,
}: HouseTypeDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const defaultValues = {
    name: {
      ar: housetype?.name?.ar || "",
      en: housetype?.name?.en || "",
    },
    description: {
      ar: housetype?.description?.ar || "",
      en: housetype?.description?.en || "",
    },
    is_visible: housetype?.is_visible ?? true,
    icon: undefined,
  } satisfies HouseTypeFormValues;

  const form = useForm<HouseTypeFormValues>({
    defaultValues,
  });

  async function onSubmit(data: HouseTypeFormValues) {
    try {
      setIsPending(true);

      // Prepare form data for API
      const formData = new FormData();

      // Add multilingual fields
      formData.append("name[ar]", data.name.ar);
      formData.append("name[en]", data.name.en);
      formData.append("description[ar]", data.description.ar);
      formData.append("description[en]", data.description.en);
      formData.append("is_visible", data.is_visible ? "1" : "0");

      // If there's an icon file, upload it first
      if (selectedFile) {
        formData.append("icon", selectedFile);
      }
      // onSvae data to json

      await onSave(formData);
      setIsPending(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsPending(false);
    }
  }

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

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isPending && onOpenChange(isOpen)}
    >
      <DialogContent
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
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

            <FormField
              control={form.control}
              name="icon"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>الأيقونة</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>صورة تمثل نوع المنزل.</FormDescription>
                  {housetype?.icon_url && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        الصورة الحالية:
                      </p>
                      <img
                        src={housetype.icon_url}
                        alt={housetype.name?.ar || ""}
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
