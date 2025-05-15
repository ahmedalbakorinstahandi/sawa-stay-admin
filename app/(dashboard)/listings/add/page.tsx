"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Save, Loader2, Upload, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, uploadImage } from "@/lib/api";
import { LocationPicker } from "@/components/map/location-picker";
import { useRouter } from "next/navigation";

const multilingualTextSchema = z.object({
  ar: z.string().min(1, { message: "هذا الحقل مطلوب" }),
  en: z.string().optional(),
});

const locationSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  extra_address: z.string().optional(),
  street_address: z.string().optional(),
});

const PropertyType = z.enum(["House", "Apartment", "Guesthouse"]);
type PropertyTypeEnum = z.infer<typeof PropertyType>;

const listingFormSchema = z.object({
  title: multilingualTextSchema,
  description: multilingualTextSchema,
  property_type: PropertyType,
  house_type_id: z.coerce.number().positive(),
  location: locationSchema,
  // images: z.array(z.string()).default([]),
  price: z.coerce.number().positive({
    message: "السعر يجب أن يكون رقم موجب",
  }),
  // currency: z.string().default("USD"),
  commission: z.coerce.number().nonnegative().default(0),
  status: z
    .enum(["draft", "in_review", "approved", "paused", "rejected"])
    .default("draft"),
  guests_count: z.coerce.number().positive().default(1),
  bedrooms_count: z.coerce.number().positive().default(1),
  beds_count: z.coerce.number().positive().default(1),
  bathrooms_count: z.coerce.number().positive().default(1),
  booking_capacity: z.coerce.number().positive().default(1),
  min_booking_days: z.coerce.number().positive().default(1),
  max_booking_days: z.coerce.number().positive().default(30),
  is_contains_cameras: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  camera_locations: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  noise_monitoring_device: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  weapons_on_property: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  floor_number: z.coerce.number().nonnegative().optional(),
  features: z.array(z.number()).default([]),
  categories: z.array(z.number()).default([]),
  host_id: z.number().optional(),
  // images vount more than 5
  images: z
    .array(z.union([z.string(), z.number()]))
    .min(1, { message: "يجب تحميل  صورة على الأقل" }),
});
const listingFormSchemaEdit = z.object({
  title: multilingualTextSchema,
  description: multilingualTextSchema,
  property_type: PropertyType,
  house_type_id: z.coerce.number().positive(),
  // location: locationSchema,
  // images: z.array(z.string()).default([]),
  price: z.coerce.number().positive({
    message: "السعر يجب أن يكون رقم موجب",
  }),
  // currency: z.string().default("USD"),
  commission: z.coerce.number().nonnegative().default(0),
  status: z
    .enum(["draft", "in_review", "approved", "paused", "rejected"])
    .default("draft"),
  guests_count: z.coerce.number().positive().default(1),
  bedrooms_count: z.coerce.number().positive().default(1),
  beds_count: z.coerce.number().positive().default(1),
  bathrooms_count: z.coerce.number().positive().default(1),
  booking_capacity: z.coerce.number().positive().default(1),
  min_booking_days: z.coerce.number().positive().default(1),
  max_booking_days: z.coerce.number().positive().default(30),
  is_contains_cameras: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  camera_locations: z
    .object({
      ar: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  noise_monitoring_device: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  weapons_on_property: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  floor_number: z.coerce.number().nonnegative().optional(),
  features: z.array(z.number()).default([]),
  categories: z.array(z.number()).default([]),
  host_id: z.number().optional(),
  // images vount more than 5
  // images: z.array(z.string()).min(5, { message: "يجب تحميل 5 صور على الأقل" }),
});
interface MultilingualText {
  ar: string;
  en: string;
}

interface Location {
  latitude: number;
  longitude: number;
  extra_address?: string;
  street_address?: string;
}

interface CameraLocations {
  ar?: string;
  en?: string;
}

interface ListingFormValues {
  title: MultilingualText;
  description: MultilingualText;
  property_type: PropertyTypeEnum;
  house_type_id: number;
  location: Location;
  images: (number | string | ImageType)[];
  price: number;
  // currency: string;
  commission: number;
  status: "draft" | "in_review" | "approved" | "paused" | "rejected";
  guests_count: number;
  bedrooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  booking_capacity: number;
  min_booking_days: number;
  max_booking_days: number;
  is_contains_cameras: boolean;
  camera_locations?: CameraLocations;
  noise_monitoring_device: boolean;
  weapons_on_property: boolean;
  floor_number?: number;
  features: number[];
  categories: number[];
  host_id?: number;
}

interface Category {
  id: number;
  name: MultilingualText;
  description: MultilingualText;
  icon_url?: string;
  is_visible: boolean;
}

interface PropertyType {
  id: number;
  name: MultilingualText;
  description: MultilingualText;
  icon_url?: string;
  is_visible: boolean;
}

interface Feature {
  id: number;
  name: MultilingualText;
  description: MultilingualText;
  icon_url?: string;
  is_visible: boolean;
}

interface Listing {
  id?: number;
  title: MultilingualText;
  description: MultilingualText;
  property_type: string;
  house_type_id: number;
  location: Location;
  images: string[];
  price: number;
  // currency: string;
  commission: number;
  status: string;
  guests_count: number;
  bedrooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  booking_capacity: number;
  min_booking_days: number;
  max_booking_days: number;
  is_contains_cameras: boolean;
  camera_locations?: CameraLocations;
  noise_monitoring_device: boolean;
  weapons_on_property: boolean;
  floor_number?: number;
  features: Feature[];
  categories: Category[];
  host_id?: number;
  images_remove: number[];
}

interface RequestBody
  extends Omit<
    ListingFormValues,
    "is_contains_cameras" | "noise_monitoring_device" | "weapons_on_property"
  > {
  is_contains_cameras: 0 | 1;
  noise_monitoring_device: 0 | 1;
  weapons_on_property: 0 | 1;
  images_remove: number[];
}

interface ImageType {
  id: number | string;
  url: string;
}

interface ImageResponse {
  id: string | number;
  url: string;
}

export default function ListingDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<ImageType[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  // house types
  const [houseTypes, setHouseTypes] = useState<any[]>([]);
  // hosts
  const [hosts, setHosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: { ar: "", en: "" },
      description: { ar: "", en: "" },
      property_type: "House",
      house_type_id: 0,
      location: {
        latitude: 0,
        longitude: 0,
        extra_address: "",
        street_address: "",
      },
      images: [],
      price: 0,
      commission: 0,
      status: "draft",
      guests_count: 1,
      bedrooms_count: 1,
      beds_count: 1,
      bathrooms_count: 1,
      booking_capacity: 1,
      min_booking_days: 1,
      max_booking_days: 30,
      is_contains_cameras: false,
      noise_monitoring_device: false,
      weapons_on_property: false,
      features: [],
      categories: [],
    },
  });
  // imageRemove
  const [imageRemove, setImageRemove] = useState<number[]>([]);
  useEffect(() => {
    // Fetch features and categories
    const fetchData = async () => {
      try {
        const [featuresRes, categoriesRes, hostsRes, houseTypesRes] =
          await Promise.all([
            api.get("/admin/features"),
            api.get("/admin/categories"),
            api.get("/admin/users?id_verified=approved&role=user"),
            api.get("/admin/house-types"),
          ]);
        setFeatures(featuresRes.data.data);
        setCategories(categoriesRes.data.data);
        setHosts(hostsRes.data.data);
        setHouseTypes(houseTypesRes.data.data);
      } catch (error: any) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل البيانات",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const featureOptions = features.map((feature) => ({
    label: feature.name?.ar || "",
    value: feature.id,
  }));

  const categoryOptions = categories.map((category) => ({
    label: category.name?.ar || "",
    value: category.id,
  }));

  type ImageValue = number | string | ImageType;

  const handleImageDelete = (url: ImageType) => {
    // Remove from preview URLs
    setPreviewUrls((prev) => prev.filter((item) => item.id !== url.id));

    // If the image has a numeric ID, it's an existing image that needs to be removed
    if (typeof url.id === "number") {
      setImageRemove((prev) => [...prev, url.id as number]);
    }

    // Update form values
    const currentImages = form.getValues("images") as (
      | string
      | number
      | ImageType
    )[];
    form.setValue(
      "images",
      currentImages.filter((img): img is string | number => {
        if (typeof img === "object" && "id" in img) {
          return img.id !== url.id;
        }
        return typeof img === "string" || typeof img === "number";
      })
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const uploadedFiles = await Promise.all(
        files.map((file) => uploadImage(file))
      );

      const newImages = uploadedFiles.map((file) => ({
        id: file.image_name,
        url: file.image_url,
      }));

      setPreviewUrls((prev) => [...prev, ...newImages]);

      // Get current images array and filter out any nulls/undefined
      const currentImages = form.getValues("images") || [];
      const validCurrentImages = currentImages.filter(Boolean);

      // Add new image IDs to the form
      const newImageIds = newImages.map((img) => img.id).filter(Boolean);
      form.setValue("images", [...validCurrentImages, ...newImageIds]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل الصور",
        variant: "destructive",
      });
    }
  };

  const router = useRouter();
  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Prepare request body with proper boolean to number conversion
      const requestBody: RequestBody = {
        ...values,
        is_contains_cameras: values.is_contains_cameras ? 1 : 0,
        noise_monitoring_device: values.noise_monitoring_device ? 1 : 0,
        weapons_on_property: values.weapons_on_property ? 1 : 0,
        features: values.features,
        categories: values.categories,
        // Correctly handle images array
        images: Array.isArray(values.images)
          ? values.images.filter(Boolean)
          : [],
        images_remove: imageRemove,
      };

      const response = await api.post("/admin/listings", requestBody);

      if (response.data?.success) {
        toast({
          title: "تم إضافة الإعلان",
        });
        router.push("/listings");
      }
      setImageRemove([]);
      setPreviewUrls([]);
      form.reset();
    } catch (error: any) {
      console.log(error);

      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الإعلان",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update image preview render function
  const renderImagePreview = (url: ImageType, index: number) => (
    <div key={index} className="relative group">
      <img
        src={url.url}
        alt={`Preview ${index + 1}`}
        className="h-20 w-20 object-cover rounded-md"
      />
      <button
        type="button"
        onClick={() => handleImageDelete(url)}
        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );

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
        <h1 className="text-2xl font-bold">إضافة الإعلان</h1>
      </div>

      {/* </DialogTitle>
        <DialogDescription> */}
      {"قم بإدخال بيانات الإعلان الجديد"}
      {/* </DialogDescription>
      </DialogHeader> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title.ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان الإعلان (عربي)</FormLabel>
                <FormControl>
                  <Input {...field} dir="rtl" />
                </FormControl>
                <FormDescription>
                  عنوان الإعلان الذي سيظهر للمستخدمين
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
                <FormLabel>وصف الإعلان (عربي)</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} dir="rtl" />
                </FormControl>
                <FormDescription>وصف تفصيلي للإعلان</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (English)</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
                <FormDescription>
                  The listing title that will be shown to users
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
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} dir="ltr" />
                </FormControl>
                <FormDescription>
                  Detailed description of the listing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
          <FormField
            control={form.control}
            name="property_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع العقار</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العقار" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="House">منزل</SelectItem>
                    <SelectItem value="Apartment">شقة</SelectItem>
                    <SelectItem value="Guesthouse">غرفة مشتركة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* host_id */}
          <FormField
            control={form.control}
            name="host_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المضيف</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(Number.parseInt(value))
                  }
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المضيف" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hosts.map((host: any) => (
                      <SelectItem key={host.id} value={host.id.toString()}>
                        {host.first_name} {host.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {/* </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الإعلان</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الإعلان" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="in_review">قيد المراجعة</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="paused">متوقف</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العملة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العمولة</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="guests_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الضيوف</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
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
                    <Input type="number" min="1" {...field} />
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
                    <Input type="number" min="1" {...field} />
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
                    <Input type="number" min="0.5" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="booking_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعة الحجز</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
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
                  <FormLabel>الحد الأدنى للحجز (أيام)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
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
                  <FormLabel>الحد الأقصى للحجز (أيام)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="floor_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الطابق</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_contains_cameras"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">كاميرات مراقبة</FormLabel>
                  <FormDescription>
                    هل يوجد كاميرات مراقبة في العقار؟
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
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
                <FormItem>
                  <FormLabel>أماكن الكاميرات (عربي)</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormDescription>
                    أدخل أماكن الكاميرات في العقار
                  </FormDescription>
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
                <FormItem>
                  <FormLabel>Camera Locations (English)</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" />
                  </FormControl>
                  <FormDescription>
                    Enter the locations of cameras in the property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="noise_monitoring_device"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    أجهزة مراقبة الضوضاء
                  </FormLabel>
                  <FormDescription>
                    هل يوجد أجهزة مراقبة الضوضاء في العقار؟
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="weapons_on_property"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">أسلحة في العقار</FormLabel>
                  <FormDescription>هل يوجد أسلحة في العقار؟</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الميزات</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={featureOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="اختر الميزات"
                    searchPlaceholder="ابحث عن الميزات..."
                    emptyMessage="لم يتم العثور على ميزات"
                  />
                </FormControl>
                <FormDescription>اختر ميزات العقار</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيفات</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={categoryOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="اختر التصنيفات"
                    searchPlaceholder="ابحث عن نوع المنزل..."
                    emptyMessage="لم يتم العثور على تصنيفات"
                  />
                </FormControl>
                <FormDescription>اختر تصنيفات العقار</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* locations */}
          <div className="space-y-4">
            <FormLabel>الموقع على الخريطة</FormLabel>
            <LocationPicker
              latitude={form.watch("location.latitude")}
              longitude={form.watch("location.longitude")}
              onChange={(lat, lng) => {
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
                      toast({
                        title: "خطأ",
                        description: "تعذر الحصول على الموقع الحالي",
                        variant: "destructive",
                      });
                    }
                  );
                } else {
                  toast({
                    title: "خطأ",
                    description: "المتصفح لا يدعم تحديد الموقع الجغرافي",
                    variant: "destructive",
                  });
                }
              }}
            >
              الحصول على الموقع الحالي
            </Button>
          </div>
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
          {/* location.street_address */}
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
          {/* location.extra_ */}
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

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>صور العقار</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </FormControl>
                <FormDescription>
                  {/* يجب ان تكون اكثر من 5 صور */}
                  قم بتحميل صور العقار (يمكنك تحميل أكثر من صورة)
                  <br />
                  يجب ان تكون اكثر من 5 صور
                </FormDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) =>
                    renderImagePreview(url, index)
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {"إضافة إعلان"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
