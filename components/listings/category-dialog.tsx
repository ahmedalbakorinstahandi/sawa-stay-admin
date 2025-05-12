"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadImage } from "@/lib/api";

const categoryFormSchema = z.object({
  name: z.object({
    ar: z.string().min(2, {
      message: "اسم التصنيف يجب أن يكون أكثر من حرفين",
    }),
    en: z.string().min(2, {
      message: "اسم التصنيف يجب أن يكون أكثر من حرفين",
    }),
  }),
  description: z.object({
    ar: z.string().min(5, {
      message: "وصف التصنيف يجب أن يكون أكثر من 5 أحرف",
    }),
    en: z.string().min(5, {
      message: "وصف التصنيف يجب أن يكون أكثر من 5 أحرف",
    }),
  }),
  icon: z.any().optional(),
  is_visible: z.boolean(),
});

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any;
  onSave: (category: any) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          name: {
            ar: category.name?.ar || "",
            en: category.name?.en || "",
          },
          description: {
            ar: category.description?.ar || "",
            en: category.description?.en || "",
          },
          is_visible:
            category.is_visible !== undefined ? category.is_visible : true,
        }
      : {
          name: {
            ar: "",
            en: "",
          },
          description: {
            ar: "",
            en: "",
          },
          is_visible: true,
        },
  });
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
  // Update form values when the category prop changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: {
          ar: category.name?.ar || "",
          en: category.name?.en || "",
        },
        description: {
          ar: category.description?.ar || "",
          en: category.description?.en || "",
        },
        is_visible:
          category.is_visible !== undefined ? category.is_visible : true,
      });
      setPreviewUrl(category.icon_url || null);
      setSelectedFile(null);
    }
  }, [category, form]);
  function onSubmit(values: z.infer<typeof categoryFormSchema>) {
    setIsLoading(true);

    // Prepare form data for API
    const formData = new FormData();

    // Add multilingual fields
    formData.append("name[ar]", values.name.ar);
    formData.append("name[en]", values.name.en);
    formData.append("description[ar]", values.description.ar);
    formData.append("description[en]", values.description.en);

    // Add other fields
    formData.append("is_visible", values.is_visible ? "1" : "0");

    // If there's an icon file, append it
    if (selectedFile) {
      formData.append("icon", selectedFile);
    }

    // Call the onSave function with the form data
    onSave(formData);
    // .then(() => {
    setIsLoading(false);
    onOpenChange(false);

    toast({
      title: category ? "تم تحديث التصنيف" : "تم إضافة التصنيف",
      description: category
        ? `تم تحديث التصنيف "${values.name.ar}" بنجاح`
        : `تم إضافة التصنيف "${values.name.ar}" بنجاح`,
    });
    // })
    // .catch((error) => {
    //   setIsLoading(false);

    //   toast({
    //     title: "خطأ في حفظ التصنيف",
    //     description: "حدث خطأ أثناء حفظ التصنيف. يرجى المحاولة مرة أخرى.",
    //     variant: "destructive",
    //   });

    //   console.error("Error saving category:", error);
    // });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}
    >
      <DialogContent className="sm:max-w-[500px]  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "قم بتعديل بيانات التصنيف أدناه"
              : "قم بإدخال بيانات التصنيف الجديد"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ar">عربي</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>

              <TabsContent value="ar" className="space-y-4 mt-4"> */}
            <FormField
              control={form.control}
              name="name.ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم التصنيف (عربي)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    اسم التصنيف الذي سيظهر للمستخدمين
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
                  <FormLabel>وصف التصنيف (عربي)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>وصف موجز للتصنيف</FormDescription>
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
                  <FormLabel>اسم التصنيف (إنجليزي)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    اسم التصنيف باللغة الإنجليزية
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
                  <FormLabel>وصف التصنيف (إنجليزي)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    وصف موجز للتصنيف باللغة الإنجليزية
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </TabsContent>
            </Tabs> */}

            <FormField
              control={form.control}
              name="icon"
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
                  {category?.icon_url && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        الصورة الحالية:
                      </p>
                      <img
                        src={category.icon_url || "/placeholder.svg"}
                        alt={category.name?.ar || ""}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">تفعيل التصنيف</FormLabel>
                    <FormDescription>
                      هل التصنيف مفعل ومرئي للمستخدمين؟
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
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {category ? "تحديث التصنيف" : "إضافة تصنيف"}
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
