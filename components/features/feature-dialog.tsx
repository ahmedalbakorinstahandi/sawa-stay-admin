"use client";

import { useState, useEffect } from "react";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { featuresAPI, uploadImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/features";

interface FeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature: Feature | null;
    onFeatureChange: (feature: Feature) => void;
}

const featureSchema = z.object({
    nameAr: z.string().min(1, "الاسم العربي مطلوب"),
    nameEn: z.string().optional(),
    descriptionAr: z.string().min(1, "الوصف العربي مطلوب"),
    descriptionEn: z.string().optional(),
    isVisible: z.boolean(),
    icon: z.any().optional(),
});

export function FeatureDialog({
    open,
    onOpenChange,
    feature,
    onFeatureChange,
}: FeatureDialogProps) {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof featureSchema>>({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            nameAr: "",
            nameEn: "",
            descriptionAr: "",
            descriptionEn: "",
            isVisible: true,
        },
    });
    useEffect(() => {
        if (feature) {
            form.reset({
                nameAr: feature.name.ar,
                nameEn: feature.name.en || "",
                descriptionAr: feature.description.ar,
                descriptionEn: feature.description.en || "",
                isVisible: feature.is_visible,
            });
            setPreviewImage(feature.icon_url);
            setUploadedImageName(feature.icon);
        } else {
            form.reset({
                nameAr: "",
                nameEn: "",
                descriptionAr: "",
                descriptionEn: "",
                isVisible: true,
            });
            setPreviewImage(null);
            setUploadedImageName(null);
        }
    }, [feature, form]); const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLoading(true);
            setUploadProgress(0);

            try {
                // Simulate progress for better UX
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return prev;
                        }
                        return prev + 10;
                    });
                }, 200);

                // Upload image to backend
                const uploadResult = await uploadImage(file);
                console.log("Upload result:", uploadResult);

                clearInterval(progressInterval);
                setUploadProgress(100);
                setPreviewImage(uploadResult.image_url);
                setUploadedImageName(uploadResult.image_name);
                form.setValue("icon", uploadResult.image_name);
                toast({
                    title: "تم رفع الصورة بنجاح",
                    description: "تم تحميل أيقونة الميزة بنجاح",
                });

            } catch (error) {
                console.error("Error uploading image:", error);
                // Fallback to local preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(file);
                form.setValue("icon", file);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                    setUploadProgress(0);
                }, 500);
            }
        }
    };
    const removeImage = () => {
        setPreviewImage(null);
        setUploadedImageName(null);
        form.setValue("icon", null);
    };
    const onSubmit = async (values: z.infer<typeof featureSchema>) => {
        setLoading(true);
        try {
            const featureData = {
                name: {
                    ar: values.nameAr,
                    en: values.nameEn || undefined,
                },
                description: {
                    ar: values.descriptionAr,
                    en: values.descriptionEn || undefined,
                },
                is_visible: values.isVisible,
                icon: uploadedImageName || feature?.icon || "",
            };

            let response;
            if (feature) {
                // Update existing feature
                response = await featuresAPI.update(feature.id, featureData);
            } else {
                // Create new feature
                response = await featuresAPI.create(featureData);
            } if (response.success) {
                const updatedFeature: Feature = {
                    id: feature?.id || response.data?.id || Date.now(),
                    name: {
                        ar: values.nameAr,
                        en: values.nameEn || null,
                    },
                    description: {
                        ar: values.descriptionAr,
                        en: values.descriptionEn || null,
                    },
                    is_visible: values.isVisible,
                    icon: uploadedImageName || feature?.icon || "",
                    icon_url: previewImage || feature?.icon_url || "",
                };

                onFeatureChange(updatedFeature);
                onOpenChange(false);

                toast({
                    title: feature ? "تم تحديث الميزة بنجاح" : "تم إضافة الميزة بنجاح",
                    description: feature ? "تم حفظ التغييرات على الميزة" : "تمت إضافة الميزة الجديدة إلى النظام",
                });
            } else {
                console.error("Failed to save feature:", response.message);
                toast({
                    title: "خطأ في حفظ الميزة",
                    description: response.message || "فشل في حفظ بيانات الميزة",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error saving feature:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {feature ? "تعديل الميزة" : "إضافة ميزة جديدة"}
                    </DialogTitle>
                    <DialogDescription>
                        {feature
                            ? "قم بتعديل بيانات الميزة المحددة"
                            : "أضف ميزة جديدة إلى المنصة"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">أيقونة الميزة</h3>
                            <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    {previewImage ? (
                                        <div className="relative">
                                            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-muted">
                                                <Image
                                                    src={previewImage}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>                      <div className="text-center mt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('icon-upload')?.click()}
                                                    disabled={loading}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {loading ? "جاري الرفع..." : "تغيير الصورة"}
                                                </Button>
                                                {loading && uploadProgress > 0 && (
                                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="mx-auto w-24 h-24 rounded-lg bg-muted flex items-center justify-center mb-4">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>                      <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('icon-upload')?.click()}
                                                disabled={loading}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {loading ? "جاري الرفع..." : "رفع أيقونة"}
                                            </Button>
                                            {loading && uploadProgress > 0 && (
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-2">
                                                PNG, JPG أو SVG (الحد الأقصى 2MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        id="icon-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Arabic Fields */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">البيانات العربية</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nameAr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الاسم العربي*</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="أدخل اسم الميزة بالعربية"
                                                    {...field}
                                                    className="text-right"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="descriptionAr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوصف العربي*</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="أدخل وصف الميزة بالعربية"
                                                    {...field}
                                                    className="text-right min-h-[80px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* English Fields */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">البيانات الإنجليزية (اختيارية)</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nameEn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الاسم الإنجليزي</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter feature name in English"
                                                    {...field}
                                                    className="text-left"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="descriptionEn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوصف الإنجليزي</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter feature description in English"
                                                    {...field}
                                                    className="text-left min-h-[80px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Visibility Settings */}
                        <Card className="bg-muted/30">
                            <CardContent className="p-4">
                                <FormField
                                    control={form.control}
                                    name="isVisible"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <FormLabel className="text-base font-semibold">
                                                    حالة الظهور
                                                </FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    هل تريد إظهار هذه الميزة للمستخدمين؟
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
                            </CardContent>
                        </Card>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        {feature ? "تحديث الميزة" : "إضافة الميزة"}
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
