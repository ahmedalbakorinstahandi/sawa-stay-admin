"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  Eye,
  MapPin,
  PauseCircle,
  Printer,
  Star,
  User,
  XCircle,
  Calendar,
  Bed,
  Bath,
  Users,
  Wifi,
  Car,
  PocketIcon as Pool,
  AirVent,
  Heart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Mock data for a single listing
const listingData = {
  id: 1,
  title: "شقة فاخرة في وسط دمشق",
  description:
    "شقة فاخرة ومريحة في قلب دمشق، قريبة من جميع المعالم السياحية والأسواق. تتميز بإطلالة رائعة على المدينة وديكور عصري أنيق. مناسبة للعائلات والأزواج.",
  host: {
    id: 1,
    name: "أحمد محمد",
    email: "ahmed@example.com",
    phone: "+963 911 234 567",
    avatar: "/placeholder.svg?height=128&width=128",
    rating: 4.8,
    reviews_count: 45,
    joined_at: "2022-03-15",
    verified: true,
  },
  property_type: "Apartment",
  category_id: 1,
  category_name: "شقق",
  price: 50000,
  currency: "USD",
  commission: 5000,
  status: "approved",
  guests_count: 4,
  bedrooms_count: 2,
  beds_count: 3,
  bathrooms_count: 1.5,
  size: 120, // square meters
  booking_capacity: 30,
  allow_pets: false,
  allows_families_only: true,
  created_at: "2023-01-15T10:30:00Z",
  updated_at: "2023-05-20T14:20:00Z",
  images: [
    {
      id: 1,
      url: "/placeholder.svg?height=400&width=600",
      is_primary: true,
    },
    {
      id: 2,
      url: "/placeholder.svg?height=400&width=600",
      is_primary: false,
    },
    {
      id: 3,
      url: "/placeholder.svg?height=400&width=600",
      is_primary: false,
    },
  ],
  address: {
    street: "شارع بغداد",
    city: "دمشق",
    state: "دمشق",
    country: "سوريا",
    zip_code: "00000",
    latitude: 33.5138,
    longitude: 36.2765,
  },
  features: [
    {
      id: 1,
      name: "واي فاي",
      icon: "Wifi",
    },
    {
      id: 2,
      name: "موقف سيارات",
      icon: "Car",
    },
    {
      id: 3,
      name: "مكيف هواء",
      icon: "AirVent",
    },
  ],
  rating: 4.7,
  reviews_count: 23,
  favorites_count: 15,
  views_count: 342,
  bookings_count: 18,
  cancellations_count: 2,
  admin_notes: "تم التحقق من الإعلان والموافقة عليه. الصور واضحة والوصف دقيق.",
  recent_bookings: [
    {
      id: 101,
      guest_name: "سارة أحمد",
      check_in: "2023-06-20",
      check_out: "2023-06-25",
      status: "completed",
      amount: 250000,
    },
    {
      id: 102,
      guest_name: "محمد علي",
      check_in: "2023-07-10",
      check_out: "2023-07-15",
      status: "confirmed",
      amount: 250000,
    },
    {
      id: 103,
      guest_name: "فاطمة حسن",
      check_in: "2023-08-05",
      check_out: "2023-08-10",
      status: "pending",
      amount: 250000,
    },
  ],
};

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/listings/${params.id}`);
        const result = await response.data;

        if (result.success && result.data) {
          // Transform API data to match UI structure
          const transformedData = {
            id: result.data.id,
            title: result.data.title?.ar || result.data.title || "عنوان غير محدد", // Using Arabic title
            description: result.data.description?.ar || result.data.description || "وصف غير محدد", // Using Arabic description
            host: {
              id: result.data.host?.id || 0,
              name: `${result.data.host?.first_name || ""} ${result.data.host?.last_name || ""}`.trim() || "مضيف غير معروف",
              email: result.data.host?.email || "",
              phone: `${result.data.host?.country_code || ""}${result.data.host?.phone_number || ""}`,
              avatar: result.data.host?.avatar_url || "/placeholder.svg",
              rating: 4.8, // Default since not in API
              reviews_count: 0, // Default since not in API
              joined_at: result.data.host?.created_at || new Date().toISOString(),
              verified: result.data.host?.is_verified || false,
            },
            property_type: result.data.property_type,
            category_id: result.data.categories?.[0]?.id || 0,
            category_name: result.data.categories?.[0]?.name?.ar || "تصنيف غير محدد",
            price: result.data.price,
            currency: result.data.currency,
            commission: result.data.commission,
            status: result.data.status,
            guests_count: result.data.guests_count,
            bedrooms_count: result.data.bedrooms_count,
            price_weekend: result.data.price_weekend,
            beds_count: result.data.beds_count,
            bathrooms_count: result.data.bathrooms_count,
            size: 120, // Not provided in API
            booking_capacity: result.data.booking_capacity,
            allow_pets: result.data.rule?.allows_pets || false,
            allows_families_only: result.data.rule?.allows_families_only || false,
            created_at: result.data.created_at,
            updated_at: result.data.created_at,
            images: result.data.images?.map((img: any) => ({
              id: img.id,
              url: img.url,
              is_primary: img.id === result.data.images?.[0]?.id, // First image is primary
            })) || [],
            address: {
              street: result.data.address?.street_address || "",
              city: result.data.address?.city?.name?.ar || "",
              state: result.data.address?.state || "",
              country: result.data.address?.country || "",
              zip_code: result.data.address?.zip_code || "",
              latitude: result.data.address?.latitude || 33.5138,
              longitude: result.data.address?.longitude || 36.2765,
            },
            features: result.data.features?.map((feature: any) => ({
              id: feature.id,
              name: feature.name?.ar || feature.name || "ميزة غير محددة",
              icon: feature.icon_url,
            })) || [],
            rating: 4.7, // Default since not in API
            reviews_count: result.data.reviews?.length || 0,
            favorites_count: 0, // Not provided in API
            views_count: 0, // Not provided in API
            bookings_count: 0, // Not provided in API
            cancellations_count: 0, // Not provided in API
            admin_notes: "", // Not provided in API
            recent_bookings: [], // Not provided in API, using empty array
          };
          setActiveImage(transformedData.images[0]?.url || null);
          setListing(transformedData);
        } else {
          // If API request fails or returns invalid data, use static data
          setListing(listingData);
          toast({
            variant: "default",
            title: "تم استخدام البيانات الاحتياطية",
            description: "لم نتمكن من جلب البيانات المحدثة من الخادم.",
          });
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        // Fallback to static data
        setListing(listingData);
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات الإعلان",
          description:
            "حدث خطأ أثناء محاولة جلب بيانات الإعلان. تم استخدام البيانات الاحتياطية.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.id, toast]);

  const handleGoBack = () => {
    router.back();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            معتمد
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <PauseCircle className="h-3 w-3" />
            مسودة
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <PauseCircle className="h-3 w-3" />
            متوقف
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">مؤكد</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case "House":
        return "منزل";
      case "Apartment":
        return "شقة";
      case "Guesthouse":
        return "غرفة مشتركة";
      default:
        return type;
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "Wifi":
        return <Wifi className="h-4 w-4" />;
      case "Car":
        return <Car className="h-4 w-4" />;
      case "AirVent":
        return <AirVent className="h-4 w-4" />;
      case "Pool":
        return <Pool className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-[300px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">لم يتم العثور على الإعلان</h2>
        <p className="text-muted-foreground">
          لم نتمكن من العثور على إعلان بالمعرف {params.id}. قد يكون الإعلان غير
          موجود أو تم حذفه.
        </p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{listing.title}</h2>
          {getStatusBadge(listing.status)}
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline">
            <Eye className="ml-2 h-4 w-4" />
            معاينة
          </Button> */}
          <Button
            variant="outline"
            onClick={() => router.push(`/listings/${listing.id}/edit`)}
          >
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <div className="relative aspect-video overflow-hidden">
              {activeImage && (
                <Image
                  src={activeImage || "/placeholder.svg"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex p-2 gap-2 overflow-x-auto">
              {listing.images.map((image: any) => (
                <div
                  key={image.id}
                  className={`relative w-24 h-16 cursor-pointer rounded-md overflow-hidden ${activeImage === image.url ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() => setActiveImage(image.url)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المضيف</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={listing.host.avatar || "/placeholder.svg"}
                alt={listing.host.name}
              />
              <AvatarFallback>{listing.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{listing.host.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{listing.host.rating}</span>
              <span className="text-muted-foreground">
                ({listing.host.reviews_count} تقييم)
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{listing.host.email}</p>
            <p className="text-muted-foreground">{listing.host.phone}</p>
            {listing.host.verified && (
              <Badge variant="outline" className="mt-2">
                <CheckCircle className="h-3 w-3 ml-1" />
                مُتحقق
              </Badge>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              انضم في {formatDate(listing.host.joined_at)}
            </p>
            <Button variant="outline" className="mt-4 w-full">
              <User className="ml-2 h-4 w-4" />
              عرض ملف المضيف
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>تفاصيل الإعلان</CardTitle>
            <CardDescription>معلومات مفصلة عن الإعلان</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                <TabsTrigger value="features">الميزات</TabsTrigger>
                <TabsTrigger value="location">الموقع</TabsTrigger>
                <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">
                      الضيوف
                    </span>
                    <span className="font-semibold">
                      {listing.guests_count}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Bed className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">
                      غرف النوم
                    </span>
                    <span className="font-semibold">
                      {listing.bedrooms_count}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Bed className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">
                      الأسرّة
                    </span>
                    <span className="font-semibold">{listing.beds_count}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Bath className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">
                      الحمامات
                    </span>
                    <span className="font-semibold">
                      {listing.bathrooms_count}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-semibold">الوصف</h3>
                  <p>{listing.description}</p>

                  <h3 className="text-lg font-semibold mt-6">معلومات إضافية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          نوع العقار
                        </span>
                        <span className="font-medium">
                          {getPropertyTypeLabel(listing.property_type)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">التصنيف</span>
                        <span className="font-medium">
                          {listing.category_name}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المساحة</span>
                        <span className="font-medium">
                          {listing.size} متر مربع
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          السماح بالحيوانات الأليفة
                        </span>
                        <span className="font-medium">
                          {listing.allow_pets ? "نعم" : "لا"}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          للعائلات فقط
                        </span>
                        <span className="font-medium">
                          {listing.allows_families_only ? "نعم" : "لا"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">السعر</span>
                        <span className="font-medium">
                          {listing.price.toLocaleString()} {listing.currency}
                        </span>
                      </div>
                      {/* price_weekend */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          سعر عطلة نهاية الأسبوع
                        </span>
                        <span className="font-medium">
                          {listing.price_weekend || 0} {listing.currency}
                        </span>
                      </div>

                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العمولة</span>
                        <span className="font-medium">
                          {listing.commission.toLocaleString()}{" "}
                          {listing.currency}
                        </span>
                      </div>
                      <Separator />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.features.map((feature: any) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {/* {feature.icon} */}
                        <img
                          src={feature.icon}
                          alt={feature.name}
                          className="h-6 w-6 text-primary"
                        />
                      </div>
                      <span className="font-medium">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="location" className="space-y-4 mt-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">العنوان</h3>
                      <p className="text-muted-foreground">
                        {listing.address.street}، {listing.address.city}،{" "}
                        {listing.address.state}، {listing.address.country}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="bg-muted/50 rounded-lg overflow-hidden"
                  style={{ height: "300px" }}
                >
                  <MapContainer
                    center={[
                      listing.address.latitude,
                      listing.address.longitude,
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[
                        listing.address.latitude,
                        listing.address.longitude,
                      ]}
                    >
                      <Popup>
                        {listing.address.street}, {listing.address.city},{" "}
                        {listing.address.state}, {listing.address.country}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </TabsContent>
              <TabsContent value="bookings" className="space-y-4 mt-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-right">رقم الحجز</th>
                        <th className="p-2 text-right">الضيف</th>
                        <th className="p-2 text-right">تاريخ الوصول</th>
                        <th className="p-2 text-right">تاريخ المغادرة</th>
                        <th className="p-2 text-right">المبلغ</th>
                        <th className="p-2 text-right">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listing.recent_bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            لا توجد حجوزات حديثة
                          </td>
                        </tr>
                      ) : (
                        listing.recent_bookings.length > 0 &&
                        listing.recent_bookings.map((booking: any) => (
                          <tr key={booking.id} className="border-b">
                            <td className="p-2">#{booking.id}</td>
                            <td className="p-2">{booking.guest_name}</td>
                            <td className="p-2">{booking.check_in}</td>
                            <td className="p-2">{booking.check_out}</td>
                            <td className="p-2">
                              {booking.amount.toLocaleString()}{" "}
                              {listing.currency}
                            </td>
                            <td className="p-2">
                              {getBookingStatusBadge(booking.status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline">عرض جميع الحجوزات</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الإعلان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center پ-4 bg-muted/50 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mb-1" />
                  <span className="text-sm text-muted-foreground">التقييم</span>
                  <span className="font-semibold text-lg">
                    {listing.rating}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({listing.reviews_count})
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center پ-4 bg-muted/50 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-sm text-muted-foreground">المفضلة</span>
                  <span className="font-semibold text-lg">
                    {listing.favorites_count}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center پ-4 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-sm text-muted-foreground">
                    المشاهدات
                  </span>
                  <span className="font-semibold text-lg">
                    {listing.views_count}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center پ-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-sm text-muted-foreground">
                    الحجوزات
                  </span>
                  <span className="font-semibold text-lg">
                    {listing.bookings_count}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {listing.status !== "approved" && (
                <Button className="w-full" variant="default">
                  <CheckCircle className="ml-2 h-4 w-4" />
                  اعتماد الإعلان
                </Button>
              )}
              {listing.status === "approved" && (
                <Button className="w-full" variant="outline">
                  <PauseCircle className="ml-2 h-4 w-4" />
                  إيقاف الإعلان
                </Button>
              )}
              <Button className="w-full" variant="outline">
                <Edit className="ml-2 h-4 w-4" />
                تعديل الإعلان
              </Button>
              <Button className="w-full" variant="destructive">
                <XCircle className="ml-2 h-4 w-4" />
                حذف الإعلان
              </Button>
            </CardContent>
          </Card>

          {listing.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات الإدارة</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{listing.admin_notes}</p>
              </CardContent>
            </Card>
          )} */}
        </div>
      </div>
    </div>
  );
}
