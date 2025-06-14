"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Save,
  Loader2,
  ArrowLeft,
  Upload,
  Plus,
  X,
  Home,
  Building,
  Warehouse,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SortableItem } from "@/components/listings/sortable-item";

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

import { Skeleton } from "@/components/ui/skeleton";
import { api, listingsAPI } from "@/lib/api";
import { uploadImage } from "@/lib/upload-helpers";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker } from "@/components/map/location-picker";
import { set } from "date-fns";
// نوع بيانات الإعلان
interface Listing {
  id: number;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  house_type_id: number;
  property_type: "House" | "Apartment" | "Guesthouse";
  price: number;
  currency: string;
  guests_count: number;
  bedrooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  booking_capacity: number;
  is_contains_cameras: boolean;
  camera_locations?: {
    ar?: string;
    en?: string;
  };
  noise_monitoring_device: boolean;
  weapons_on_property: boolean;
  floor_number: number;
  min_booking_days: number;
  max_booking_days: number;
  check_in: string;
  check_out: string;
  allow_pets: boolean;
  status: string;
  images: {
    id: number;
    url: string;
    orders: number;
    path: string;
  }[];
  features: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  }[];
  categories: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  }[];
  rule?: {
    allows_pets: boolean;
    allows_smoking: boolean;
    allows_parties: boolean;
    allows_children: boolean;
    remove_shoes?: number;
    no_extra_guests?: number;
    quiet_hours: {
      ar: string;
      en: string;
    };
    restricted_rooms_note?: {
      ar: string;
      en: string;
    };
    garbage_disposal_note?: {
      ar: string;
      en: string;
    };
    pool_usage_note?: {
      ar: string;
      en: string;
    };
    forbidden_activities_note?: {
      ar: string;
      en: string;
    };
  };
}

interface HouseType {
  id: number;
  name: {
    ar: string;
    en: string;
  };
}

interface Feature {
  id: number;
  icon_url: string;
  name: {
    ar: string;
    en: string;
  };
}

interface Category {
  id: number;
  icon_url: string;
  name: {
    ar: string;
    en: string;
  };
}

// مخطط التحقق من البيانات
const listingSchema = z.object({
  title: z.object({
    ar: z.string().min(5, { message: "العنوان يجب أن يكون 5 أحرف على الأقل" }),
    en: z.string().optional(),
  }),
  description: z.object({
    ar: z.string().min(20, { message: "الوصف يجب أن يكون 20 حرفاً على الأقل" }),
    en: z.string().optional(),
  }),
  house_type_id: z.number().min(1, { message: "يرجى اختيار نوع الإعلان" }),
  property_type: z.enum(["House", "Apartment", "Guesthouse"], {
    required_error: "يرجى اختيار نوع الإعلان",
  }),
  price: z.number().min(1, { message: "يجب أن يكون السعر أكبر من صفر" }),
  currency: z.string().optional(),
  guests_count: z
    .number()
    .min(1, { message: "يجب أن يكون عدد الضيوف 1 على الأقل" }),
  bedrooms_count: z
    .number()
    .min(1, { message: "يجب أن يكون عدد غرف النوم 1 على الأقل" }),
  beds_count: z
    .number()
    .min(1, { message: "يجب أن يكون عدد الأسرّة 1 على الأقل" }),
  bathrooms_count: z
    .number()
    .min(0.5, { message: "يجب أن يكون عدد الحمامات 0.5 على الأقل" }),
  booking_capacity: z.number().min(1),
  is_contains_cameras: z.boolean(),
  camera_locations: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  noise_monitoring_device: z.boolean(),
  weapons_on_property: z.boolean(),
  floor_number: z.number().min(0),
  min_booking_days: z.number().min(1),
  max_booking_days: z.number().min(1),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  allow_pets: z.boolean({
    required_error: "لا يمكن تخطي السماح بالحيوانات الأليفة",
  }),
  features: z.array(z.number()).optional(),
  categories: z.array(z.number()).optional(),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      street_address: z.string().optional(),
      extra_address: z.string().optional(),
    })
    .optional(),
});

// Using the SortableItem component imported from @/components/listings/sortable-item

export default function EditListingPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [houseTypes, setHouseTypes] = useState<HouseType[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // صور الإعلان
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState<string[]>(
    []
  );
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // نموذج البيانات
  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: { ar: "", en: "" },
      description: { ar: "", en: "" },
      house_type_id: 0,
      property_type: "Apartment",
      price: 0,
      currency: "SYP",
      guests_count: 1,
      bedrooms_count: 1,
      beds_count: 1,
      bathrooms_count: 1,
      booking_capacity: 1,
      is_contains_cameras: false,
      camera_locations: { ar: "", en: "" },
      noise_monitoring_device: false,
      weapons_on_property: false,
      floor_number: 1,
      min_booking_days: 1,
      max_booking_days: 30,
      check_in: "14:00",
      check_out: "12:00",
      allow_pets: false,
      features: [],
      categories: [],
      location: {
        latitude: 0,
        longitude: 0,
        street_address: "",
        extra_address: "",
      },
    },
  });

  // جلب بيانات الإعلان
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);

        // جلب بيانات الإعلان
        const response = await api.get(`/admin/listings/${listingId}`);

        if (response.data.success && response.data) {
          setListing(response.data.data);
          console.log(response);

          // تعبئة النموذج بالبيانات
          form.reset({
            title: {
              ar: response.data.data.title?.ar || "",
              en: response.data.data.title?.en || "",
            },
            description: {
              ar: response.data.data.description?.ar || "",
              en: response.data.data.description?.en || "",
            },
            house_type_id: response.data.data.house_type_id,
            property_type: response.data.data.property_type,
            price: response.data.data.price,
            currency: response.data.data.currency,
            guests_count: response.data.data.guests_count,
            bedrooms_count: response.data.data.bedrooms_count,
            beds_count: response.data.data.beds_count,
            bathrooms_count: response.data.data.bathrooms_count,
            booking_capacity: response.data.data.booking_capacity,
            is_contains_cameras: response.data.data.is_contains_cameras,
            camera_locations: {
              ar: response.data.data.camera_locations?.ar || "",
              en: response.data.data.camera_locations?.en || "",
            },
            noise_monitoring_device: response.data.data.noise_monitoring_device,
            weapons_on_property: response.data.data.weapons_on_property,
            floor_number: response.data.data.floor_number,
            min_booking_days: response.data.data.min_booking_days,
            max_booking_days: response.data.data.max_booking_days,
            check_in: response.data.data.check_in || "14:00",
            check_out: response.data.data.check_out || "12:00",
            allow_pets: response.data.data.allow_pets || false,
            features:
              response.data.data.features?.map((feature: any) => feature.id) ||
              [],
            categories:
              response.data.data.categories?.map(
                (category: any) => category.id
              ) || [],
            location: {
              latitude: response.data.data.address?.latitude || 0,
              longitude: response.data.data.address?.longitude || 0,
              street_address: response.data.data.address?.street_address || "",
              extra_address: response.data.data.address?.extra_address || "",
            },
          });
        } else {
          router.push("/listings");
        }

        // جلب أنواع الإعلانات
        const houseTypesResponse = await api.get("/admin/house-types");
        if (houseTypesResponse.data.success && houseTypesResponse.data) {
          setHouseTypes(houseTypesResponse.data.data);
        }

        // جلب الميزات
        const featuresResponse = await api.get("/admin/features");
        if (featuresResponse.data.success && featuresResponse.data) {
          setFeatures(featuresResponse.data.data);
        }

        // جلب الفئات
        const categoriesResponse = await api.get("/admin/categories");
        if (categoriesResponse.data.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        router.push("/listings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, []);

  // معالجة تحميل صور الإعلان ورفعها مباشرة
  // معالجة تحميل صور الإعلان ورفعها مباشرة
  const handlePropertyImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    setUploadingImages(true);

    try {
      for (const file of newFiles) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);

        // رفع الصورة مباشرة عند اختيارها
        const result = await uploadImage(file, "listings");
        if (result.success && result.url) {
          // هنا يتم فقط إضافة ملف الصورة والمعاينة، وليس رابط الصورة المرفوعة
          setPropertyImages((prev) => [...prev, result.url]);
          setPropertyImagePreviews((prev) => [...prev, previewUrl]);
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  // حذف صورة عقار
  const removePropertyImage = (index: number) => {
    // إلغاء عنوان URL للمعاينة
    URL.revokeObjectURL(propertyImagePreviews[index]);

    // حذف الصورة والمعاينة من المصفوفات
    setPropertyImages((prev) => prev.filter((_, i) => i !== index));
    setPropertyImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };  // إضافة صورة للحذف
  const addImageToDelete = (imageId: number) => {
    console.log("إضافة صورة للحذف بالمعرف:", imageId);
    setImagesToDelete((prev) => {
      // تأكد من عدم تكرار المعرف
      if (!prev.includes(imageId)) {
        const newState = [...prev, imageId];
        console.log("حالة imagesToDelete الجديدة:", newState);
        return newState;
      }
      return prev;
    });
  };
  // إعادة ترتيب الصور باستخدام السحب والإفلات باستخدام dnd-kit
  const handleDragEnd = (event: any) => {
    console.log("handleDragEnd called with event:", event);

    const { active, over } = event;
    console.log("handleDragEnd called with active:", active, "over:", over);


    if (active.id !== over.id) {
      const activeIndex = parseInt(active.id.split('-')[1]);
      const overIndex = parseInt(over.orders);

      // إعادة ترتيب معاينات الصور
      setPropertyImagePreviews((items) => {
        return arrayMove(items, activeIndex, overIndex);
      });

      // إعادة ترتيب روابط الصور المرفوعة بنفس الترتيب
      setPropertyImages((items) => {
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  // تكوين أجهزة الاستشعار للسحب والإفلات
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categoryOptions = categories.map((category) => ({
    label: category.name?.ar || "",
    value: category.id,
  }));
  // رفع صور الإعلان
  const uploadPropertyImages = async () => {
    if (propertyImages.length === 0) return [];
    console.log("propertyImages", propertyImages);

    setUploadingImages(true);
    const uploadedPaths: string[] = [];

    try {
      for (const image of propertyImages) {
        // Skip empty File objects (e.g., if user didn't select any image)
        if (!image || !(image instanceof File) || image.size === 0) continue;

        const result = await uploadImage(image, "listings");
        if (result.success && result.url) {
          uploadedPaths.push(result.url);
        }
      }
      return uploadedPaths;
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    } finally {
      setUploadingImages(false);
    }
  };
  // حفظ التغييرات
  const onSubmit = async (data: z.infer<typeof listingSchema>) => {
    console.log("بدء عملية إرسال النموذج");
    console.log("Form data:", data);
    console.log("propertyImages:", propertyImages);
    console.log("imagesToDelete:", imagesToDelete);

    // مباشرة قبل تغيير حالة الزر، طباعة رسالة
    console.log("جاري تغيير حالة الزر للحفظ...");
    setIsSaving(true);
    console.log("تم تغيير حالة الزر");

    try {
      // رفع الصور الجديدة
      // const uploadedImagePaths =propertyImages;      // تجهيز البيانات للإرسال
      const formData = {
        ...data, images: [
          ...propertyImages,
          ...(listing?.images?.filter((img) => !imagesToDelete.includes(img.id))?.map((img) => img.path) || []),
        ].map((item: any) => (item?.image_name ? item?.image_name : item)),
        images_remove: imagesToDelete, // استخدام الحقل الصحيح حسب API
        images_to_delete: imagesToDelete, // تعديل اسم الحقل
        delete_images: imagesToDelete // الاحتفاظ بالاسم القديم للتوافقية
      };

      console.log("جاري إرسال البيانات:", formData);
      console.log("بدء الاتصال بـ API...");
      console.log("الرابط:", `/admin/listings/${listingId}`);      // طباعة تفاصيل الصور للتشخيص
      console.log("الصور المراد حذفها:", imagesToDelete);
      console.log("الصور المحتفظ بها:", listing?.images?.filter((img) => !imagesToDelete.includes(img.id)));

      // إرسال البيانات
      const response = await api.put(`/admin/listings/${listingId}`, formData);
      console.log("تم استلام الرد من API:", response.data);

      if (response.data.success) {
        toast.toast({
          title: "تم حفظ التغييرات بنجاح",
          description: "تم تحديث الإعلان بنجاح.",
          variant: "default",
        });
        router.push("/listings");
      } else {
        // عرض رسالة الخطأ
        toast.toast({
          title: "حدث خطأ",
          description: response.data.message || "حدث خطأ أثناء تحديث الإعلان.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      // طباعة تفاصيل الخطأ للتشخيص
      console.log("نوع الخطأ:", typeof error);
      console.log("رسالة الخطأ:", error.message);
      if (error.response) {
        console.log("استجابة الخطأ:", error.response.data);
        console.log("حالة الخطأ:", error.response.status);
      }

      // عرض رسالة الخطأ للمستخدم
      toast.toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الإعلان.",
        variant: "destructive",
      });
    } finally {
      console.log("تنتهي عملية الحفظ، إعادة حالة الزر");
      setIsSaving(false);
    }
  };

  // زيادة أو نقصان قيمة عددية
  const incrementValue = (key: string, max = 20) => {
    const currentValue = form.getValues(key as any) as number;
    form.setValue(key as any, Math.min(currentValue + 1, max));
  };

  const decrementValue = (key: string, min = 0) => {
    const currentValue = form.getValues(key as any) as number;
    form.setValue(key as any, Math.max(currentValue - 1, min));
  };
  // إعادة ترتيب الصور الحالية باستخدام السحب والإفلات
  const handleExistingImageDragEnd = async (event: any) => {
    const { active, over } = event;
    console.log("handleExistingImageDragEnd called with active:", active, "over:", over);

    if (active.id !== over.id) {
      // استخراج معرفات الصور من معرّفات العناصر
      const activeImageId = parseInt(active.id.split('-')[2]);
      const overImageId = parseInt(over.id.split('-')[2]);
      // get orders from listing?.images where id matches overImageId
      const overImage = listing?.images.find(img => img.id === overImageId);
      if (!overImage) {
        console.error("الصورة المستهدفة غير موجودة في قائمة الصور");
        return;
      }

      console.log("Active image ID:", overImage);


      console.log("Reordering images from", activeImageId, "to", overImageId);


      // تحديث الواجهة بشكل فوري
      setListing(prevListing => {
        if (!prevListing) return null;

        // ابحث عن مواضع الصور في المصفوفة
        const activeIndex = prevListing.images.findIndex(img => img.id === activeImageId);
        const overIndex = prevListing.images.findIndex(img => img.id === overImageId);

        if (activeIndex !== -1 && overIndex !== -1) {
          // قم بتحديث مصفوفة الصور
          const newImages = arrayMove([...prevListing.images], activeIndex, overIndex);

          // إرجاع كائن الإعلان المحدث
          return { ...prevListing, images: newImages };
        }

        return prevListing;
      });

      try {
        // إرسال طلب إعادة الترتيب إلى API
        // نستخدم معرّف الإعلان، ومعرّف الصورة النشطة، ومعرّف الصورة المستهدفة
        if (listing) {
          const result = await listingsAPI.reorderImage(
            parseInt(listingId),
            activeImageId,
            overImage.orders
          );

          if (result && !result.hasOwnProperty('success') || result.success) {
            setListing((prevListing) => {
              if (!prevListing) return null;
              // تحديث ترتيب الصور في الإعلان
              const updatedImages = prevListing.images.map((img) => {
                if (img.id === activeImageId) {
                  return { ...img, orders: overImage.orders };
                }
                return img;
              });
              return { ...prevListing, images: updatedImages };
            });
          } else {
            toast.toast({
              title: "حدث خطأ أثناء تحديث ترتيب الصور",
              description: result.message,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("خطأ في إعادة ترتيب الصور:", error);
        toast.toast({
          title: "حدث خطأ أثناء تحديث ترتيب الصور",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/listings")}
          className="ml-2"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">تعديل الإعلان</h1>
      </div>

      {isLoading ? (
        <HostListingsSkeleton />) : (
        <Form {...form}>          <form onSubmit={(e) => {
          e.preventDefault(); // منع السلوك الافتراضي للنموذج
        }} className="space-y-8">
          {/* معلومات أساسية */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">معلومات أساسية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الإعلان (بالعربية)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="مثال: شقة فاخرة مع إطلالة على البحر"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الإعلان (بالإنجليزية)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Example: Luxury apartment with sea view"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FormField
                  control={form.control}
                  name="description.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف الإعلان (بالعربية)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="اكتب وصفاً تفصيلياً لمكانك"
                          className="resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف الإعلان (بالإنجليزية)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write a detailed description of your place"
                          className="resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* نوع الإعلان */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">نوع الإعلان</h2>

              <FormField
                control={form.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${field.value === "House"
                            ? "ring-2 ring-rose-500"
                            : "border"
                            }`}
                          onClick={() =>
                            form.setValue("property_type", "House")
                          }
                        >
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <Home className="h-12 w-12 mb-4 text-rose-500" />
                            <h3 className="font-medium">مسكن بالكامل</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              منزل مستقل أو فيلا
                            </p>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${field.value === "Apartment"
                            ? "ring-2 ring-rose-500"
                            : "border"
                            }`}
                          onClick={() =>
                            form.setValue("property_type", "Apartment")
                          }
                        >
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <Building className="h-12 w-12 mb-4 text-rose-500" />
                            <h3 className="font-medium">شقة</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              شقة في مبنى سكني
                            </p>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${field.value === "Guesthouse"
                            ? "ring-2 ring-rose-500"
                            : "border"
                            }`}
                          onClick={() =>
                            form.setValue("property_type", "Guesthouse")
                          }
                        >
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <Warehouse className="h-12 w-12 mb-4 text-rose-500" />
                            <h3 className="font-medium">شقة مشتركة </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              مكان مخصص للضيوف
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* السعة والغرف */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">السعة والغرف</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="guests_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد الضيوف</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => decrementValue("guests_count", 1)}
                            disabled={field.value <= 1}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => incrementValue("guests_count", 16)}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد غرف النوم</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() =>
                              decrementValue("bedrooms_count", 1)
                            }
                            disabled={field.value <= 1}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() =>
                              incrementValue("bedrooms_count", 10)
                            }
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beds_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد الأسرّة</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => decrementValue("beds_count", 1)}
                            disabled={field.value <= 1}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => incrementValue("beds_count", 20)}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد الحمامات</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => {
                              const newValue = Math.max(
                                field.value - 0.5,
                                0.5
                              );
                              form.setValue("bathrooms_count", newValue);
                            }}
                            disabled={field.value <= 0.5}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(0.5, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={0.5}
                            step={0.5}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => {
                              const newValue = Math.min(
                                field.value + 0.5,
                                10
                              );
                              form.setValue("bathrooms_count", newValue);
                            }}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الطابق</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => decrementValue("floor_number", 0)}
                            disabled={field.value <= 0}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={0}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => incrementValue("floor_number", 50)}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* السعر والحجز */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">السعر والحجز</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر لليلة الواحدة</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => decrementValue("price", 0)}
                            disabled={field.value <= 0}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={0}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => incrementValue("price", 9999999)}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_booking_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأدنى للإقامة (ليالي)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() =>
                              decrementValue("min_booking_days", 1)
                            }
                            disabled={field.value <= 1}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() =>
                              incrementValue("min_booking_days", 30)
                            }
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_booking_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأقصى للإقامة (ليالي)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() =>
                              decrementValue("max_booking_days", 1)
                            }
                            disabled={field.value <= 1}
                          >
                            <span>-</span>
                          </Button>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="rounded-none text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() =>
                              incrementValue("max_booking_days", 365)
                            }
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="house_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المنزل</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الاعلان" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {houseTypes.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name?.ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                    control={form.control}
                    name="check_in"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت تسجيل الدخول</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                {/* 
                  <FormField
                    control={form.control}
                    name="check_out"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت تسجيل الخروج</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
              </div>
            </CardContent>
          </Card>

          {/* الموقع */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">الموقع</h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>الموقع على الخريطة</FormLabel>
                  <LocationPicker
                    latitude={form.watch("location.latitude") ?? 0}
                    longitude={form.watch("location.longitude") ?? 0}
                    onChange={(lat: number, lng: number) => {
                      form.setValue("location.latitude", lat);
                      form.setValue("location.longitude", lng);
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            form.setValue("location.latitude", latitude);
                            form.setValue("location.longitude", longitude);
                          },
                          (error) => {
                            toast.toast({
                              title: "خطأ",
                              description: "تعذر الحصول على الموقع الحالي",
                              variant: "destructive",
                            });
                          }
                        );
                      } else {
                        toast.toast({
                          title: "خطأ",
                          description:
                            "المتصفح لا يدعم تحديد الموقع الجغرافي",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    الحصول على الموقع الحالي
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location.latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط العرض</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>خط العرض للعقار</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط الطول</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>خط الطول للعقار</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location.street_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الشارع</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>عنوان الشارع للعقار</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.extra_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان إضافي</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>عنوان إضافي للعقار</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* الميزات والفئات */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">الميزات والفئات</h2>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الميزات المتوفرة</FormLabel>
                      <FormDescription>
                        حدد الميزات المتوفرة في الإعلان
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {features.map((feature) => {
                          const isSelected =
                            field.value?.includes(feature.id) || false;
                          return (
                            <div
                              key={feature.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${isSelected
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                }`}
                              onClick={() => {
                                const currentValues = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    currentValues.filter(
                                      (id) => id !== feature.id
                                    )
                                  );
                                } else {
                                  field.onChange([
                                    ...currentValues,
                                    feature.id,
                                  ]);
                                }
                              }}
                            >
                              {isSelected && (
                                <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                              )}
                              <span className="flex items-center text-sm">
                                {feature.icon_url && (
                                  <img
                                    src={feature.icon_url}
                                    alt=""
                                    className="h-4 w-4 ml-2 inline-block"
                                    loading="lazy"
                                  />
                                )}
                                {feature.name.ar}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فئات الإعلان</FormLabel>
                      <FormDescription>
                        حدد الفئات التي ينتمي إليها الإعلان
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {categories.map((category) => {
                          const isSelected =
                            field.value?.includes(category.id) || false;
                          return (
                            <div
                              key={category.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${isSelected
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                }`}
                              onClick={() => {
                                const currentValues = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    currentValues.filter(
                                      (id) => id !== category.id
                                    )
                                  );
                                } else {
                                  field.onChange([
                                    ...currentValues,
                                    category.id,
                                  ]);
                                }
                              }}
                            >
                              {isSelected && (
                                <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                              )}
                              <span className="flex items-center text-sm">
                                {category.icon_url && (
                                  <img
                                    src={category.icon_url}
                                    alt=""
                                    className="h-4 w-4 ml-2 inline-block"
                                    loading="lazy"
                                  />
                                )}
                                {category.name.ar}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* معلومات السلامة */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">معلومات السلامة</h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_contains_cameras"
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
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          كاميرات مراقبة
                        </FormLabel>
                        <p className="text-xs text-gray-500 mx-7">
                          هل يوجد كاميرات مراقبة في الإعلان؟
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

                {form.watch("is_contains_cameras") && (
                  <FormField
                    control={form.control}
                    name="camera_locations.ar"
                    render={({ field }) => (
                      <FormItem className="pr-7 border-r-2 border-rose-200">
                        <FormLabel className="text-sm">
                          أماكن الكاميرات (بالعربية)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="اذكر أماكن وجود الكاميرات بالتفصيل"
                            className="mt-1 resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("is_contains_cameras") && (
                  <FormField
                    control={form.control}
                    name="camera_locations.en"
                    render={({ field }) => (
                      <FormItem className="pr-7 border-r-2 border-rose-200">
                        <FormLabel className="text-sm">
                          أماكن الكاميرات (بالإنجليزية)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe camera locations in detail"
                            className="mt-1 resize-none"
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* صور الإعلان */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">صور الإعلان</h2>

              <div className="space-y-4">                  {/* الصور الحالية */}
                {listing?.images && listing.images.length > 0 && (
                  <div>                    <h3 className="text-md font-medium mb-2">
                    الصور الحالية
                    <span className="text-sm text-gray-500 mr-2">
                      (يمكنك سحب وإفلات الصور لتغيير ترتيبها)
                    </span>
                  </h3>
                    <div className="mb-4 text-sm bg-amber-50 rounded-md p-3 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1 text-amber-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span className="font-medium">تعليمات الصور:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li><span className="font-medium">لحذف صورة:</span> اضغط على زر سلة المهملات (باللون الأحمر)</li>
                        <li><span className="font-medium">لإلغاء الحذف:</span> اضغط على زر الاستعادة (باللون الأخضر)</li>
                        <li><span className="font-medium">لإعادة الترتيب:</span> اسحب وأفلت الصور</li>
                      </ul>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleExistingImageDragEnd}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SortableContext
                          items={listing.images.map(image => `existing-image-${image.id}`)}
                          strategy={horizontalListSortingStrategy}
                        >
                          {listing.images.map((image, idx) => (
                            <SortableItem
                              key={`existing-image-${image.id}`}
                              id={`existing-image-${image.id}`}
                              index={idx}
                              url={image.url || "/placeholder.svg"}
                              onRemove={() => {
                                console.log("ضغط زر إزالة الصورة:", image.id);

                                if (imagesToDelete.includes(image.id)) {
                                  setImagesToDelete(
                                    imagesToDelete.filter(
                                      (id) => id !== image.id
                                    )
                                  );
                                  console.log("إزالة الصورة من الحذف:", image.id);

                                } else {
                                  addImageToDelete(image.id);
                                  console.log("تمت إضافة الصورة للحذف:", image.id);
                                }
                              }}
                              isMarkedForDeletion={imagesToDelete.includes(image.id)}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </DndContext>
                  </div>
                )}

                {/* إضافة صور جديدة */}
                <div>
                  <h3 className="text-md font-medium mb-2">
                    إضافة صور جديدة
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="font-medium mb-2">اسحب الصور هنا</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        أو انقر لاختيار الصور من جهازك
                      </p>
                      <input
                        type="file"
                        id="property-images"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handlePropertyImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("property-images")?.click()
                        }
                      >
                        اختيار الصور
                      </Button>
                    </div>
                  </div>
                </div>                  {/* معاينة الصور الجديدة */}
                {propertyImagePreviews.length > 0 && (
                  <div>                      <h3 className="text-md font-medium mb-2">
                    الصور الجديدة
                    <span className="text-sm text-gray-500 mr-2">
                      (يمكنك سحب وإفلات الصور لتغيير ترتيبها)
                    </span>
                  </h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SortableContext
                          items={propertyImagePreviews.map((_, index) => `image-${index}`)}
                          strategy={horizontalListSortingStrategy}
                        >
                          {propertyImagePreviews.map((preview, index) => (
                            <SortableItem
                              key={`image-${index}`}
                              id={`image-${index}`}
                              index={index}
                              url={preview}
                              onRemove={() => {
                                console.log("ضغط زر إزالة الصورة:", index);

                                removePropertyImage(index)
                              }}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </DndContext>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>نصائح للصور:</p>
                  <ul className="list-disc list-inside mx-4 mt-1 space-y-1">
                    <li>أضف صوراً لجميع الغرف والمساحات المتاحة للضيوف</li>
                    <li>أضف صوراً للمناظر والإطلالات إن وجدت</li>
                    <li>تجنب استخدام الصور التي تحتوي على علامات مائية</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/listings")}
            >
              إلغاء
            </Button>              <Button
              type="button"
              onClick={async () => {
                try {
                  console.log("ضغط زر الحفظ - طريقة جديدة");

                  // البيانات الحالية من النموذج
                  const formData = form.getValues();
                  console.log("بيانات النموذج الأصلية:", formData);

                  // إظهار تقدم الحفظ
                  setIsSaving(true);                  // تجهيز البيانات
                  const dataToSubmit = {
                    ...formData, images: [
                      ...propertyImages,
                      ...(listing?.images?.filter(img => !imagesToDelete.includes(img.id))?.map(img => img.path) || []),
                    ].map(item => (item?.image_name ? item?.image_name : item)),
                    images_remove: imagesToDelete, // استخدام الحقل الصحيح حسب API
                    images_to_delete: imagesToDelete, // تعديل اسم الحقل
                    delete_images: imagesToDelete // الاحتفاظ بالاسم القديم للتوافقية
                  };

                  console.log("البيانات المرسلة:", dataToSubmit);

                  // إرسال البيانات مباشرة
                  const response = await api.put(`/admin/listings/${listingId}`, dataToSubmit);
                  console.log("استجابة API:", response.data);

                  if (response.data.success) {
                    toast.toast({
                      title: "تم حفظ التغييرات بنجاح",
                      description: "تم تحديث الإعلان بنجاح.",
                      variant: "default",
                    });
                    router.push("/listings");
                  } else {
                    toast.toast({
                      title: "حدث خطأ",
                      description: response.data.message || "حدث خطأ أثناء تحديث الإعلان.",
                      variant: "destructive",
                    });
                  }
                } catch (error: any) {
                  console.error("خطأ أثناء الحفظ:", error);
                  console.log("تفاصيل الخطأ:", error.message);

                  if (error.response) {
                    console.log("بيانات الاستجابة:", error.response.data);
                    console.log("رمز الحالة:", error.response.status);
                  }

                  toast.toast({
                    title: "حدث خطأ",
                    description: "حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving || uploadingImages}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isSaving || uploadingImages ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </form>
        </Form>
      )}
    </div>
  );
}

export function HostListingsSkeleton() {
  return (
    <div className="space-y-4" dir={"rtl"}>
      {/* معلومات أساسية */}
      <div className="space-y-4 p-6 border rounded-lg">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>

      {/* تفاصيل الإعلان */}
      <div className="space-y-4 p-6 border rounded-lg">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* الصور */}
      <div className="space-y-4 p-6 border rounded-lg">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
