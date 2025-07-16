"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Edit,
  Eye,
  Home,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  Shield,
  Star,
  User,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api, usersAPI, bookingsAPI, transactionsAPI, listingsAPI } from "@/lib/api";
import Loading from "../loading";
import UserDetailsLoading from "./loading";
import axios from "axios";

interface UserData {
  id: number;
  first_name: string;
  verifications: {
    id: number;
    type: string;
    status: string;
    created_at: string;
    file_path: string;
  }[];
  last_name: string;
  wallet_balance: number;
  avatar: string | null;
  avatar_url: string | null;
  email: string;
  email_verified: boolean;
  country_code: string;
  phone_number: string;
  phone_verified: boolean;
  role: string;
  id_verified: string;
  host_verified: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  my_listings_count: number;
}

interface Listing {
  id: number;
  title: {
    ar: string;
    en?: string;
  };

  property_type: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  image?: string;
  images?: { url: string }[];
  bookings_count?: number;
  house_type?: {
    name: { ar: string; en?: string } | string;
  };
}

interface Booking {
  id: number;
  listing_title?: string;
  listing?: {
    title: {
      ar: string;
      en?: string;
    }
  };
  host_name?: string;
  host?: { first_name: string; last_name: string };
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: {
    ar: string;
    en?: string;
  };
  payment_method?: string;
  booking?: {
    listing?: {
      title: {
        ar: string;
        en?: string;

      }
    }
  };
}

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch user listings
  const fetchUserListings = async () => {
    setIsLoadingListings(true);
    try {
      const response = await listingsAPI.getAll(1, 50, { host_id: resolvedParams.id });
      if (response.success) {
        setUserListings(response.data || []);
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب إعلانات المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user listings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب إعلانات المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Fetch user bookings
  const fetchUserBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await bookingsAPI.getAll(1, 50, { host_id: resolvedParams.id });
      if (response.success) {
        setUserBookings(response.data || []);
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب حجوزات المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب حجوزات المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await transactionsAPI.getAll(1, 50, { user_id: resolvedParams.id });
      if (response.success) {
        setUserTransactions(response.data || []);
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب معاملات المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب معاملات المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await usersAPI.get(parseInt(resolvedParams.id));
        if (response.success) {
          setUserData(response.data);
        } else {
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء جلب بيانات المستخدم",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات المستخدم",
          variant: "destructive",
        });
      }
    };

    if (resolvedParams.id) {
      fetchUserData();
    }
  }, [resolvedParams.id, toast]);
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
  // Fetch data when tab changes
  useEffect(() => {
    if (!userData) return;

    switch (activeTab) {
      case "listings":
        fetchUserListings();
        break;
      case "bookings":
        fetchUserBookings();
        break;
      case "transactions":
        fetchUserTransactions();
        break;
    }
  }, [activeTab, userData]);

  if (!userData) {
    return <UserDetailsLoading />;
  }

  const fetchUserData = async () => {
    try {
      const response = await usersAPI.get(parseInt(resolvedParams.id));
      if (response.success) {
        setUserData(response.data);
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    try {
      api.put(`/admin/users/${userData.id}`, {
        status: newStatus,
      });
      setUserData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
        };
      });
      toast({
        title: "نجاح",
        description: `تم تغيير حالة المستخدم إلى ${newStatus}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير حالة المستخدم",
        variant: "destructive",
      });
    }
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-100 text-green-800"
          >
            <CheckCircle className="h-3 w-3" />
            معتمد
          </Badge>
        );
      case "in_review":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
          >
            <Eye className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100 text-gray-800"
          >
            <PauseCircle className="h-3 w-3" />
            مسودة
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-red-100 text-red-800"
          >
            <XCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-blue-100 text-blue-800"
          >
            <PauseCircle className="h-3 w-3" />
            متوقف
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-600">
            مكتمل
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-600">
            قادم
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-600">مكتمل</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">قيد الانتظار</Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-600">فشل</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "booking_payment":
        return <Badge variant="outline">دفع حجز</Badge>;
      case "host_payout":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            دفعة مستحقة
          </Badge>
        );
      case "refund":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            استرداد
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getFullName = (user: UserData) => {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  };

  const getImageSrc = (imageUrl?: string | null) => {
    if (imageUrl && imageUrl.trim() !== "") {
      return imageUrl;
    }
    return "/placeholder.svg";
  };

  const getListingImageSrc = (listing: Listing) => {
    if (listing.images && listing.images.length > 0 && listing.images[0].url) {
      const imageUrl = listing.images[0].url.trim();
      if (imageUrl !== "") {
        return imageUrl;
      }
    }
    if (listing.image && listing.image.trim() !== "") {
      return listing.image;
    }
    return "/placeholder.svg";
  };

  const getHouseTypeName = (listing: Listing) => {
    if (listing.house_type?.name) {
      // Check if name is an object with ar property
      if (typeof listing.house_type.name === 'object' && listing.house_type.name.ar) {
        return listing.house_type.name.ar;
      }
      // Check if name is a string
      if (typeof listing.house_type.name === 'string') {
        return listing.house_type.name;
      }
    }
    return listing.property_type || "غير محدد";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">تفاصيل المستخدم</h2>
        </div>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={() => router.push(`/users/${userData.id}/edit`)}
          >
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button> */}
          {userData.status === "active" ? (
            <Button
              variant="destructive"
              onClick={() => handleStatusChange("banneded")}
            >
              <UserX className="ml-2 h-4 w-4" />
              حظر المستخدم
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => handleStatusChange("active")}
            >
              <UserCheck className="ml-2 h-4 w-4" />
              تفعيل المستخدم
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>معلومات المستخدم</CardTitle>
            <CardDescription>البيانات الأساسية للمستخدم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={getImageSrc(userData.avatar_url)}
                  alt={getFullName(userData)}
                />
                <AvatarFallback>
                  {getFullName(userData).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">
                  {getFullName(userData)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userData.role === "host" ? "مضيف" : "مستخدم"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {userData.status === "active" ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" /> نشط
                  </Badge>
                ) : userData.status === "banneded" ? (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3" /> محظور
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    <PauseCircle className="h-3 w-3" /> متوقف
                  </Badge>
                )
                }
                {userData.is_verified && (
                  <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-500"
                  >
                    <Shield className="ml-1 h-3 w-3" /> موثق
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">رقم الهاتف</p>
                  <p className="text-sm text-muted-foreground">
                    {userData.country_code} {userData.phone_number}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">تاريخ التسجيل</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userData.created_at).toLocaleDateString("ar-SY")}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">الإعلانات</p>
                <p className="text-2xl font-bold">
                  {userData.my_listings_count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                {/* <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  <span>الملف الشخصي</span>
                </TabsTrigger> */}
                <TabsTrigger
                  value="listings"
                  className="flex items-center gap-1"
                >
                  <Home className="h-4 w-4" />
                  <span>الإعلانات</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>الحجوزات</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center gap-1"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>المعاملات</span>
                </TabsTrigger>
                {/* verifications */}
                {/* <TabsTrigger
                  value="verifications"
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>التحقق</span>
                </TabsTrigger> */}
              </TabsList>

            </CardHeader>
            <CardContent>
              <TabsContent value="verifications" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">وثائق التحقق</h3>
                  </div>

                  {userData.verifications && userData.verifications.length > 0 ? (
                    <div className="space-y-4">
                      {userData.verifications.map((verification) => (
                        <div key={verification.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                <Shield className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {verification.type === "id_front" ? "وثيقة الهوية (الأمامية)" :
                                    verification.type === "id_back" ? "وثيقة الهوية (الخلفية)" :
                                      verification.type === "selfie" ? "صورة شخصية" :
                                        "وثيقة أخرى"}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  تم الرفع بتاريخ: {new Date(verification.created_at).toLocaleDateString("ar-SY")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  verification.status === "approved" ? "bg-green-100 text-green-600" :
                                    verification.status === "rejected" ? "bg-red-100 text-red-600" :
                                      "bg-yellow-100 text-yellow-600"
                                }
                              >
                                {verification.status === "approved" ? "تمت الموافقة" :
                                  verification.status === "rejected" ? "تم الرفض" :
                                    "قيد المراجعة"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={verification.file_path} target="_blank" rel="noopener noreferrer">
                                عرض الوثيقة
                              </a>
                            </Button>
                            {verification.status === "in_review" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    api.put(`/admin/verifications/${verification.id}`, {
                                      status: "approved"
                                    }).then(() => {
                                      toast({
                                        title: "تم قبول الوثيقة بنجاح",
                                        variant: "default",
                                      });

                                      fetchUserData(); // Refresh user data
                                    }).catch(() => {
                                      toast({
                                        title: "حدث خطأ أثناء قبول الوثيقة",
                                        variant: "destructive",
                                      });
                                    });
                                  }}
                                >
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    api.put(`/admin/verifications/${verification.id}`, {
                                      status: "rejected"
                                    }).then(() => {
                                      toast({
                                        title: "تم رفض الوثيقة بنجاح",
                                        variant: "default",
                                      });
                                      fetchUserData(); // Refresh user data
                                    }).catch(() => {
                                      toast({
                                        title: "حدث خطأ أثناء رفض الوثيقة",
                                        variant: "destructive",
                                      });
                                    });
                                  }}
                                >
                                  رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h4 className="text-lg font-semibold">لا توجد وثائق تحقق</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        لم يقم المستخدم بتحميل أي وثائق للتحقق بعد.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">نبذة عن المستخدم</h3>
                    <p className="mt-2 text-muted-foreground">
                      اكتب نص معبر عن المستخدم هنا. يمكنك إضافة معلومات إضافية
                      مثل الاهتمامات، الهوايات، أو أي شيء آخر تود مشاركته.
                      <br />
                    </p>
                  </div>

                  {/* <Separator /> */}

                  <div>
                    <h3 className="text-lg font-semibold">حالة التحقق</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2 rounded-lg border p-3">
                        <div
                          className={`rounded-full p-1 ${userData.is_verified
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {userData.is_verified ? (
                            <UserCheck className="h-5 w-5" />
                          ) : (
                            <UserX className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">الهوية</p>
                          <p className="text-sm text-muted-foreground">
                            {userData.is_verified
                              ? "تم التحقق"
                              : "لم يتم التحقق"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border p-3">
                        <div
                          className={`rounded-full p-1 ${userData.email_verified
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {userData.email_verified ? (
                            <Mail className="h-5 w-5" />
                          ) : (
                            <Mail className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">البريد الإلكتروني</p>
                          <p className="text-sm text-muted-foreground">
                            {userData.email_verified
                              ? "تم التحقق"
                              : "لم يتم التحقق"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border p-3">
                        <div
                          className={`rounded-full p-1 ${userData.phone_verified
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {userData.phone_verified ? (
                            <Phone className="h-5 w-5" />
                          ) : (
                            <Phone className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">رقم الهاتف</p>
                          <p className="text-sm text-muted-foreground">
                            {userData.phone_verified
                              ? "تم التحقق"
                              : "لم يتم التحقق"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold">معلومات إضافية</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                          آخر تسجيل دخول
                        </p>
                        <p className="font-medium">
                          {new Date(userData.created_at).toLocaleDateString(
                            "ar-SY"
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                          إجمالي الأرباح
                        </p>
                        <p className="font-medium">16.000.000 $</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="listings" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">إعلانات المستخدم</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/listings")}
                    >
                      عرض الكل
                    </Button>
                  </div>

                  {isLoadingListings ? (
                    <div className="flex justify-center p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">جاري تحميل الإعلانات...</p>
                      </div>
                    </div>
                  ) : userListings.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h4 className="text-lg font-semibold">لا توجد إعلانات</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        لم يقم هذا المستخدم بإضافة أي إعلانات بعد.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الإعلان</TableHead>
                            <TableHead>نوع العقار</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>الحالة</TableHead>
                            {/* <TableHead>الحجوزات</TableHead> */}
                            <TableHead>تاريخ الإنشاء</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userListings.map((listing) => (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={getListingImageSrc(listing)}
                                    alt={listing.title.ar}
                                    width={80}
                                    height={60}
                                    className="h-12 w-16 rounded-md object-cover"
                                  />
                                  <span>{listing.title.ar}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getPropertyTypeLabel(listing.property_type)}
                              </TableCell>
                              <TableCell>
                                {listing.price} {listing.currency}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(listing.status)}
                              </TableCell>
                              {/* <TableCell>{listing.bookings_count || 0}</TableCell> */}
                              <TableCell>
                                {new Date(
                                  listing.created_at
                                ).toLocaleDateString("ar-SY")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">حجوزات المستخدم</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/bookings")}
                    >
                      عرض الكل
                    </Button>
                  </div>

                  {isLoadingBookings ? (
                    <div className="flex justify-center p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">جاري تحميل الحجوزات...</p>
                      </div>
                    </div>
                  ) : userBookings.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h4 className="text-lg font-semibold">لا توجد حجوزات</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        لم يقم هذا المستخدم بأي حجوزات بعد.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الإعلان</TableHead>
                            <TableHead>المضيف</TableHead>
                            <TableHead>تاريخ الوصول</TableHead>
                            <TableHead>تاريخ المغادرة</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">
                                {booking.listing?.title.ar || booking.listing_title || "غير محدد"}
                              </TableCell>
                              <TableCell>
                                {booking.host
                                  ? `${booking.host.first_name} ${booking.host.last_name}`
                                  : booking.host_name || "غير محدد"}
                              </TableCell>
                              <TableCell>
                                {new Date(booking.check_in).toLocaleDateString(
                                  "ar-SY"
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(booking.check_out).toLocaleDateString(
                                  "ar-SY"
                                )}
                              </TableCell>
                              <TableCell>
                                {booking.total_price} {booking.currency}
                              </TableCell>
                              <TableCell>
                                {getBookingStatusBadge(booking.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">معاملات المستخدم</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/transactions")}
                    >
                      عرض الكل
                    </Button>
                  </div>

                  {isLoadingTransactions ? (
                    <div className="flex justify-center p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">جاري تحميل المعاملات...</p>
                      </div>
                    </div>
                  ) : userTransactions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <h4 className="text-lg font-semibold">لا توجد معاملات</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        لم يقم هذا المستخدم بأي معاملات مالية بعد.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>رقم المعاملة</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>الوصف</TableHead>
                            <TableHead>المبلغ</TableHead>
                            <TableHead>طريقة الدفع</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>التاريخ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">
                                #{transaction.id}
                              </TableCell>
                              <TableCell>
                                {getTransactionTypeBadge(transaction.type)}
                              </TableCell>
                              <TableCell>
                                {transaction.description?.ar ||
                                  (transaction.booking?.listing?.title.ar ?
                                    `معاملة لإعلان: ${transaction.booking.listing.title.ar}` :
                                    "غير محدد")}
                              </TableCell>
                              <TableCell>
                                {transaction.amount} {transaction.currency}
                              </TableCell>
                              <TableCell>
                                {transaction.payment_method || "غير محدد"}
                              </TableCell>
                              <TableCell>
                                {getTransactionStatusBadge(transaction.status)}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  transaction.created_at
                                ).toLocaleDateString("ar-SY")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
