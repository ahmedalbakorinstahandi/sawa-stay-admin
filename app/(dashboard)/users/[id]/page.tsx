"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  Edit,
  Home,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api, usersAPI } from "@/lib/api";
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

const userListings = [
  {
    id: 1,
    title: "شقة فاخرة في وسط دمشق",
    property_type: "Apartment",
    price: 50000,
    currency: "USD",
    status: "approved",
    created_at: "2023-01-15T10:30:00Z",
    image: "/placeholder.svg?height=80&width=120",
    bookings_count: 8,
  },
  {
    id: 2,
    title: "استوديو مفروش في المزة",
    property_type: "Studio",
    price: 35000,
    currency: "USD",
    status: "approved",
    created_at: "2023-02-20T14:45:00Z",
    image: "/placeholder.svg?height=80&width=120",
    bookings_count: 5,
  },
  {
    id: 3,
    title: "شقة مع إطلالة على جبل قاسيون",
    property_type: "Apartment",
    price: 65000,
    currency: "USD",
    status: "in_review",
    created_at: "2023-03-10T09:15:00Z",
    image: "/placeholder.svg?height=80&width=120",
    bookings_count: 0,
  },
];

const userBookings = [
  {
    id: 1,
    listing_title: "فيلا مع مسبح في اللاذقية",
    host_name: "سارة أحمد",
    check_in: "2023-04-10T14:00:00Z",
    check_out: "2023-04-15T12:00:00Z",
    guests: 4,
    total_price: 120000,
    currency: "USD",
    status: "completed",
    created_at: "2023-03-20T10:30:00Z",
  },
  {
    id: 2,
    listing_title: "شاليه على البحر في طرطوس",
    host_name: "خالد عمر",
    check_in: "2023-05-05T14:00:00Z",
    check_out: "2023-05-08T12:00:00Z",
    guests: 2,
    total_price: 75000,
    currency: "USD",
    status: "completed",
    created_at: "2023-04-15T16:45:00Z",
  },
  {
    id: 3,
    listing_title: "بيت ريفي في ريف دمشق",
    host_name: "فاطمة حسن",
    check_in: "2023-06-20T14:00:00Z",
    check_out: "2023-06-25T12:00:00Z",
    guests: 6,
    total_price: 150000,
    currency: "USD",
    status: "upcoming",
    created_at: "2023-05-30T09:15:00Z",
  },
];

const userTransactions = [
  {
    id: 1,
    type: "booking_payment",
    amount: 120000,
    currency: "USD",
    status: "completed",
    created_at: "2023-03-20T10:35:00Z",
    description: "دفع حجز فيلا مع مسبح في اللاذقية",
    payment_method: "credit_card",
  },
  {
    id: 2,
    type: "booking_payment",
    amount: 75000,
    currency: "USD",
    status: "completed",
    created_at: "2023-04-15T16:50:00Z",
    description: "دفع حجز شاليه على البحر في طرطوس",
    payment_method: "wallet",
  },
  {
    id: 3,
    type: "booking_payment",
    amount: 150000,
    currency: "USD",
    status: "pending",
    created_at: "2023-05-30T09:20:00Z",
    description: "دفع حجز بيت ريفي في ريف دمشق",
    payment_method: "credit_card",
  },
  {
    id: 4,
    type: "host_payout",
    amount: 47500,
    currency: "USD",
    status: "completed",
    created_at: "2023-04-16T10:00:00Z",
    description: "دفعة مستحقة عن حجوزات مكتملة",
    payment_method: "bank_transfer",
  },
];

export default function UserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await usersAPI.get(parseInt(params.id));
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

    if (params.id) {
      fetchUserData();
    }
  }, [params.id, toast]);

  if (!userData) {
    return <UserDetailsLoading />;
  }
  const fetchUserData = async () => {
    try {
      const response = await usersAPI.get(parseInt(params.id));
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
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-600">
            نشط
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">غير نشط</Badge>;
      case "blocked":
        return <Badge variant="destructive">محظور</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
        <Badge className="bg-green-100 text-green-600">مكتمل</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-600">قيد الانتظار</Badge>
        );
      case "failed":
        return (
          <Badge className="bg-blue-100 text-blue-600">قيد الانتظار</Badge>
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
                  src={userData.avatar_url || "/placeholder.svg"}
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
                {getStatusBadge(userData.status)}
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  <span>الملف الشخصي</span>
                </TabsTrigger>
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
                <TabsTrigger
                  value="verifications"
                  className="flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>التحقق</span>
                </TabsTrigger>
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

                  {userListings.length === 0 ? (
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
                            <TableHead>الحجوزات</TableHead>
                            <TableHead>تاريخ الإنشاء</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userListings.map((listing) => (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={listing.image || "/placeholder.svg"}
                                    alt={listing.title}
                                    width={80}
                                    height={60}
                                    className="h-12 w-16 rounded-md object-cover"
                                  />
                                  <span>{listing.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>{listing.property_type}</TableCell>
                              <TableCell>
                                {listing.price} {listing.currency}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(listing.status)}
                              </TableCell>
                              <TableCell>{listing.bookings_count}</TableCell>
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

                  {userBookings.length === 0 ? (
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
                                {booking.listing_title}
                              </TableCell>
                              <TableCell>{booking.host_name}</TableCell>
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

                  {userTransactions.length === 0 ? (
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
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                {transaction.amount} {transaction.currency}
                              </TableCell>
                              <TableCell>
                                {transaction.payment_method}
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
