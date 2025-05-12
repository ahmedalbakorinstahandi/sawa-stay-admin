"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

// Mock user data
const userData = {
  id: 1,
  name: "أحمد محمد",
  email: "ahmed@example.com",
  phone: "+963 912 345 678",
  avatar: "/placeholder.svg?height=128&width=128",
  address: "دمشق، سوريا",
  created_at: "2023-01-15T10:30:00Z",
  updated_at: "2023-05-20T14:45:00Z",
  status: "active",
  verified: true,
  role: "host",
  bio: "مضيف نشط يقدم تجارب إقامة مميزة في دمشق وضواحيها. أهتم بتوفير أماكن إقامة مريحة ونظيفة للضيوف.",
  listings_count: 5,
  bookings_count: 12,
  rating: 4.8,
  reviews_count: 45,
  total_earnings: 250000,
  currency: "SYP",
  last_login: "2023-06-10T08:15:00Z",
  social_accounts: {
    facebook: "https://facebook.com/ahmed",
    instagram: "https://instagram.com/ahmed",
    twitter: null,
  },
  identity_verified: true,
  email_verified: true,
  phone_verified: true,
}

// Mock listings data
const userListings = [
  {
    id: 1,
    title: "شقة فاخرة في وسط دمشق",
    property_type: "Apartment",
    price: 50000,
    currency: "SYP",
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
    currency: "SYP",
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
    currency: "SYP",
    status: "in_review",
    created_at: "2023-03-10T09:15:00Z",
    image: "/placeholder.svg?height=80&width=120",
    bookings_count: 0,
  },
]

// Mock bookings data
const userBookings = [
  {
    id: 1,
    listing_title: "فيلا مع مسبح في اللاذقية",
    host_name: "سارة أحمد",
    check_in: "2023-04-10T14:00:00Z",
    check_out: "2023-04-15T12:00:00Z",
    guests: 4,
    total_price: 120000,
    currency: "SYP",
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
    currency: "SYP",
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
    currency: "SYP",
    status: "upcoming",
    created_at: "2023-05-30T09:15:00Z",
  },
]

// Mock transactions data
const userTransactions = [
  {
    id: 1,
    type: "booking_payment",
    amount: 120000,
    currency: "SYP",
    status: "completed",
    created_at: "2023-03-20T10:35:00Z",
    description: "دفع حجز فيلا مع مسبح في اللاذقية",
    payment_method: "credit_card",
  },
  {
    id: 2,
    type: "booking_payment",
    amount: 75000,
    currency: "SYP",
    status: "completed",
    created_at: "2023-04-15T16:50:00Z",
    description: "دفع حجز شاليه على البحر في طرطوس",
    payment_method: "wallet",
  },
  {
    id: 3,
    type: "booking_payment",
    amount: 150000,
    currency: "SYP",
    status: "pending",
    created_at: "2023-05-30T09:20:00Z",
    description: "دفع حجز بيت ريفي في ريف دمشق",
    payment_method: "credit_card",
  },
  {
    id: 4,
    type: "host_payout",
    amount: 47500,
    currency: "SYP",
    status: "completed",
    created_at: "2023-04-16T10:00:00Z",
    description: "دفعة مستحقة عن حجوزات مكتملة",
    payment_method: "bank_transfer",
  },
]

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const { toast } = useToast()

  // In a real application, you would fetch the user data based on the ID
  // const userId = params.id;

  const handleStatusChange = (newStatus: string) => {
    toast({
      title: "تم تغيير حالة المستخدم",
      description: `تم تغيير حالة المستخدم إلى "${newStatus === "active" ? "نشط" : "محظور"}" بنجاح`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">نشط</Badge>
      case "inactive":
        return <Badge variant="secondary">غير نشط</Badge>
      case "blocked":
        return <Badge variant="destructive">محظور</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">مكتمل</Badge>
      case "upcoming":
        return <Badge variant="warning">قادم</Badge>
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">مكتمل</Badge>
      case "pending":
        return <Badge variant="warning">قيد الانتظار</Badge>
      case "failed":
        return <Badge variant="destructive">فشل</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "booking_payment":
        return <Badge variant="outline">دفع حجز</Badge>
      case "host_payout":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            دفعة مستحقة
          </Badge>
        )
      case "refund":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            استرداد
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

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
          <Button variant="outline">
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button>
          {userData.status === "active" ? (
            <Button variant="destructive" onClick={() => handleStatusChange("blocked")}>
              <UserX className="ml-2 h-4 w-4" />
              حظر المستخدم
            </Button>
          ) : (
            <Button variant="default" onClick={() => handleStatusChange("active")}>
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
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.role === "host" ? "مضيف" : "مستخدم"}</p>
              </div>
              <div className="flex items-center gap-1">
                {getStatusBadge(userData.status)}
                {userData.verified && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
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
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">رقم الهاتف</p>
                  <p className="text-sm text-muted-foreground">{userData.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">العنوان</p>
                  <p className="text-sm text-muted-foreground">{userData.address}</p>
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
                <p className="text-2xl font-bold">{userData.listings_count}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">الحجوزات</p>
                <p className="text-2xl font-bold">{userData.bookings_count}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">التقييم</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <p className="text-2xl font-bold">{userData.rating}</p>
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm text-muted-foreground">المراجعات</p>
                <p className="text-2xl font-bold">{userData.reviews_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>الملف الشخصي</span>
                </TabsTrigger>
                <TabsTrigger value="listings" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>الإعلانات</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>الحجوزات</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span>المعاملات</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="profile" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">نبذة عن المستخدم</h3>
                  <p className="mt-2 text-muted-foreground">{userData.bio}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold">حالة التحقق</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <div
                        className={`rounded-full p-1 ${userData.identity_verified ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {userData.identity_verified ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">الهوية</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.identity_verified ? "تم التحقق" : "لم يتم التحقق"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <div
                        className={`rounded-full p-1 ${userData.email_verified ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {userData.email_verified ? <Mail className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">البريد الإلكتروني</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.email_verified ? "تم التحقق" : "لم يتم التحقق"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <div
                        className={`rounded-full p-1 ${userData.phone_verified ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {userData.phone_verified ? <Phone className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">رقم الهاتف</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.phone_verified ? "تم التحقق" : "لم يتم التحقق"}
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
                      <p className="text-sm text-muted-foreground">آخر تسجيل دخول</p>
                      <p className="font-medium">{new Date(userData.last_login).toLocaleString("ar-SY")}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                      <p className="font-medium">
                        {userData.total_earnings} {userData.currency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="listings" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">إعلانات المستخدم</h3>
                  <Button variant="outline" size="sm" onClick={() => router.push("/listings")}>
                    عرض الكل
                  </Button>
                </div>

                {userListings.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h4 className="text-lg font-semibold">لا توجد إعلانات</h4>
                    <p className="mt-2 text-sm text-muted-foreground">لم يقم هذا المستخدم بإضافة أي إعلانات بعد.</p>
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
                            <TableCell>{getStatusBadge(listing.status)}</TableCell>
                            <TableCell>{listing.bookings_count}</TableCell>
                            <TableCell>{new Date(listing.created_at).toLocaleDateString("ar-SY")}</TableCell>
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
                  <Button variant="outline" size="sm" onClick={() => router.push("/bookings")}>
                    عرض الكل
                  </Button>
                </div>

                {userBookings.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h4 className="text-lg font-semibold">لا توجد حجوزات</h4>
                    <p className="mt-2 text-sm text-muted-foreground">لم يقم هذا المستخدم بأي حجوزات بعد.</p>
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
                            <TableCell className="font-medium">{booking.listing_title}</TableCell>
                            <TableCell>{booking.host_name}</TableCell>
                            <TableCell>{new Date(booking.check_in).toLocaleDateString("ar-SY")}</TableCell>
                            <TableCell>{new Date(booking.check_out).toLocaleDateString("ar-SY")}</TableCell>
                            <TableCell>
                              {booking.total_price} {booking.currency}
                            </TableCell>
                            <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
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
                  <Button variant="outline" size="sm" onClick={() => router.push("/transactions")}>
                    عرض الكل
                  </Button>
                </div>

                {userTransactions.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h4 className="text-lg font-semibold">لا توجد معاملات</h4>
                    <p className="mt-2 text-sm text-muted-foreground">لم يقم هذا المستخدم بأي معاملات مالية بعد.</p>
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
                            <TableCell className="font-medium">#{transaction.id}</TableCell>
                            <TableCell>{getTransactionTypeBadge(transaction.type)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              {transaction.amount} {transaction.currency}
                            </TableCell>
                            <TableCell>{transaction.payment_method}</TableCell>
                            <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                            <TableCell>{new Date(transaction.created_at).toLocaleDateString("ar-SY")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
