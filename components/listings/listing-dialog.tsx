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
import { MapPin, Save, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, uploadImage } from "@/lib/api";

const multilingualTextSchema = z.object({
  ar: z.string().min(1, { message: "هذا الحقل مطلوب" }),
  en: z.string().min(1, { message: "This field is required" }),
});

const locationSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  extra_address: z.string().optional(),
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
  currency: z.string().default("SYP"),
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
  images: z.array(z.string()).min(5, { message: "يجب تحميل 5 صور على الأقل" }),
});

interface MultilingualText {
  ar: string;
  en: string;
}

interface Location {
  latitude: number;
  longitude: number;
  extra_address?: string;
}

interface CameraLocations {
  ar?: string;
  en?: string;
}

type ListingFormValues = {
  title: MultilingualText;
  description: MultilingualText;
  property_type: PropertyTypeEnum;
  house_type_id: number;
  location: Location;
  images: string[];
  price: number;
  currency: string;
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
};

interface ListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: any;
  onSave: (data: RequestBody) => Promise<void>;
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
  currency: string;
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
}

interface RequestBody
  extends Omit<
    ListingFormValues,
    "is_contains_cameras" | "noise_monitoring_device" | "weapons_on_property"
  > {
  is_contains_cameras: 0 | 1;
  noise_monitoring_device: 0 | 1;
  weapons_on_property: 0 | 1;
}

export function ListingDialog({
  open,
  onOpenChange,
  listing,
  onSave,
}: ListingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  // house types
  const [houseTypes, setHouseTypes] = useState<any[]>([]);
  // hosts
  const [hosts, setHosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: listing || {
      title: { ar: "", en: "" },
      description: { ar: "", en: "" },
      property_type: "House",
      house_type_id: 0,
      location: {
        latitude: 0,
        longitude: 0,
        extra_address: "",
      },
      images: [],
      price: 0,
      currency: "SYP",
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

  useEffect(() => {
    // Fetch features and categories
    const fetchData = async () => {
      try {
        const [featuresRes, categoriesRes, hostsRes, houseTypesRes] =
          await Promise.all([
            api.get("/admin/features"),
            api.get("/admin/categories"),
            api.get("/admin/users"),
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

  const handleImageDelete = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    form.setValue(
      "images",
      form.getValues("images").filter((_: string, i: number) => i !== index)
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // i need use uploadImage function to upload image
    const uploadedFiles = await Promise.all(
      files.map((file) => uploadImage(file))
    );
    setImageFiles((prev) => [
      ...prev,
      ...uploadedFiles.map((f) => f.image_name),
    ]);
    setPreviewUrls((prev) => [
      ...prev,
      ...uploadedFiles.map((file) => file.image_url),
    ]);
    // setImageFiles((prev) => [...prev, ...files]);

    // const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    // setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // if listing exist get listing.id an fetch data
  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const response = await api.get(`/admin/listings/${listing.id}`);
        const data = response.data.data;
        // setImageFiles(data.images);
        setPreviewUrls(data.images.map((image: string) => image));
        form.reset({
          ...data,
          title: {
            ar: data.title.ar,
            en: data.title.en,
          },
          description: {
            ar: data.description.ar,
            en: data.description.en,
          },
          // location: {
          //   latitude: data.location.latitude,
          //   longitude: data.location.longitude,
          //   extra_address: data.location.extra_address,
          // },
          images: data.images,

          price: data.price,
          currency: data.currency,
          commission: data.commission,
          status: data.status,
          guests_count: data.guests_count,
          bedrooms_count: data.bedrooms_count,
          beds_count: data.beds_count,
          bathrooms_count: data.bathrooms_count,
          booking_capacity: data.booking_capacity,
          min_booking_days: data.min_booking_days,
          max_booking_days: data.max_booking_days,
          is_contains_cameras: data.is_contains_cameras,
          is_contains_wifi: data.is_contains_wifi,
          noise_monitoring_device: data.noise_monitoring_device,
          is_contains_parking: data.is_contains_parking,
          weapons_on_property: data.weapons_on_property,
          floor_number: data.floor_number,
          features: data.features.map((feature: Feature) => feature.id),
          categories: data.categories.map((category: Category) => category.id),
          host_id: data.host_id,
        });
      } catch (error) {
        console.error(error);
      }
    };
    if (listing) {
      fetchListingData();
    }
  }, [listing]);

  const onSubmit = async (values: ListingFormValues) => {
    setIsSubmitting(true);
    try {
      // Upload images first if there are any new ones
      // const uploadedImages = await Promise.all(
      //   imageFiles.map(async (file) => {
      //     const formData = new FormData();
      //     formData.append("image", file);
      //     const response = await api.post("/upload", formData);
      //     return response.data.url;
      //   })
      // );

      // Prepare request body with proper boolean to number conversion
      const requestBody: RequestBody = {
        ...values,
        is_contains_cameras: values.is_contains_cameras ? 1 : 0,
        noise_monitoring_device: values.noise_monitoring_device ? 1 : 0,
        weapons_on_property: values.weapons_on_property ? 1 : 0,
        features: values.features,
        categories: values.categories,
        // Combine existing images with newly uploaded ones
        images: [...(listing?.images || imageFiles)],
      };

      await onSave(requestBody);
      onOpenChange(false);
      // toast({
      //   title: "تم الحفظ",
      //   description: "تم حفظ الإعلان بنجاح",
      // });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الإعلان",
        variant: "destructive",
      });
    } finally {
      // i need empty all values
      setImageFiles([]);
      setPreviewUrls([]);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {listing ? "تعديل إعلان" : "إضافة إعلان جديد"}
          </DialogTitle>
          <DialogDescription>
            {listing
              ? "قم بتعديل بيانات الإعلان أدناه"
              : "قم بإدخال بيانات الإعلان الجديد"}
          </DialogDescription>
        </DialogHeader>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <FormField
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
                        <SelectItem value="Guesthouse">بيت ضيافة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
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
                    <FormLabel>التصنيف</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التصنيف" />
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
            </div>
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
              <FormField
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
                        <SelectItem value="SYP">ليرة سورية</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
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
            />
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الميزات</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={featureOptions}
                      selected={field.value}
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
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="اختر التصنيفات"
                      searchPlaceholder="ابحث عن التصنيفات..."
                      emptyMessage="لم يتم العثور على تصنيفات"
                    />
                  </FormControl>
                  <FormDescription>اختر تصنيفات العقار</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* locations */}
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
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
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
                    {listing ? "تحديث الإعلان" : "إضافة إعلان"}
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
