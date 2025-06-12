"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, MapPin, Users, XCircle } from "lucide-react"
import { bookingsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// نوع بيانات الحجز
type Booking = {
    id: number
    listing_id: number
    host_id: number
    guest_id: number
    start_date: string
    end_date: string
    check_in: string | null
    check_out: string | null
    status: string
    currency: string
    price: number
    commission: number
    service_fees: number
    message: string | null
    adults_count: number
    children_count: number
    infants_count: number
    pets_count: number
    host_notes: string | null
    admin_notes: string | null
    created_at: string
    listing?: {
        id: number
        title: {
            ar: string
            en: string | null
        }
        description?: {
            ar: string
            en: string | null
        }
    }
    host?: {
        id: number
        first_name: string
        last_name: string
        avatar?: string | null
        avatar_url?: string | null
        email?: string
        phone_number?: string
        country_code?: string
    }
    guest?: {
        id: number
        first_name: string
        last_name: string
        avatar?: string | null
        avatar_url?: string | null
        email?: string
        phone_number?: string
        country_code?: string
    }
}

// نوع بيانات الحجز
// type Booking = {
//   id: number
//   listing_id: number
//   host_id: number
//   guest_id: number
//   start_date: string
//   end_date: string
//   check_in: string | null
//   check_out: string | null
//   status: string
//   currency: string
//   price: number
//   commission: number
//   service_fees: number
//   message: string | null
//   adults_count: number
//   children_count: number
//   infants_count: number
//   pets_count: number
//   host_notes: string | null
//   admin_notes: string | null
//   created_at: string
//   listing?: {
//     id: number
//     title: {
//       ar: string
//       en: string | null
//     }
//     description?: {
//       ar: string
//       en: string | null
//     }
//   }
//   host?: {
//     id: number
//     first_name: string
//     last_name: string
//     avatar?: string | null
//     avatar_url?: string | null
//     email?: string
//     phone_number?: string
//     country_code?: string
//   }
//   guest?: {
//     id: number
//     first_name: string
//     last_name: string
//     avatar?: string | null
//     avatar_url?: string | null
//     email?: string
//     phone_number?: string
//     country_code?: string
//   }
// }

interface BookingDetailsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: Booking | null
    onStatusChange?: (booking: Booking, newStatus: string) => void
}

export const BookingDetails = ({ open, onOpenChange, booking, onStatusChange }: BookingDetailsProps) => {
    const [bookingDetails, setBookingDetails] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // جلب بيانات الحجز عند فتح الحوار
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!booking) return

            setIsLoading(true)
            try {
                const response = await bookingsAPI.get(booking.id)
                if (response.success && response.data) {
                    setBookingDetails(response.data)
                } else {
                    toast({
                        title: "خطأ",
                        description: "فشل في جلب بيانات الحجز",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error("Error fetching booking details:", error)
                toast({
                    title: "خطأ",
                    description: "حدث خطأ أثناء جلب بيانات الحجز",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (open && booking) {
            fetchBookingDetails()
        } else {
            setBookingDetails(null)
        }
    }, [open, booking, toast])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
            case "accepted":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        مؤكد
                    </Badge>
                )
            case "paid":
                return (
                    <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        مدفوع
                    </Badge>
                )
            case "pending":
            case "waiting_payment":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-500">
                        <Calendar className="h-3 w-3" />
                        بانتظار الدفع
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        مكتمل
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        ملغي
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        مرفوض
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }
    const handleStatusChange = (newStatus: string) => {
        if (onStatusChange && bookingDetails && booking) {
            onStatusChange(booking, newStatus)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            تفاصيل الحجز{" "}
                            {!isLoading && bookingDetails && (
                                <span className="text-muted-foreground">#{bookingDetails.id}</span>
                            )}
                        </div>
                        {!isLoading && bookingDetails && getStatusBadge(bookingDetails.status)}
                    </DialogTitle>
                    <DialogDescription>
                        {isLoading ? (
                            <Skeleton className="h-4 w-[250px]" />
                        ) : (
                            bookingDetails && (
                                <span className="text-sm text-muted-foreground">
                                    تم الحجز بتاريخ{" "}
                                    {new Date(bookingDetails.created_at).toLocaleDateString("ar-SY", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            )
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4 p-4">
                        <Skeleton className="h-[125px] w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-[150px] w-full" />
                            <Skeleton className="h-[150px] w-full" />
                        </div>
                        <Skeleton className="h-[100px] w-full" />
                    </div>
                ) : bookingDetails ? (
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">التفاصيل</TabsTrigger>
                            <TabsTrigger value="guest">بيانات الضيف</TabsTrigger>
                            <TabsTrigger value="host">بيانات المضيف</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 py-4">
                            {/* معلومات الإعلان */}
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-lg font-semibold">معلومات الإعلان</h3>
                                <div className="rounded-lg border p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="font-semibold">
                                            {bookingDetails?.listing?.title?.ar || `إعلان رقم #${bookingDetails?.listing_id || 'N/A'}`}
                                        </div>
                                    </div>
                                    {bookingDetails.listing?.description?.ar && (
                                        <p className="text-sm text-muted-foreground">
                                            {bookingDetails.listing.description.ar}
                                        </p>
                                    )}
                                </div>

                                {/* معلومات الحجز */}
                                <h3 className="text-lg font-semibold">معلومات الحجز</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">التواريخ</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-muted-foreground">من</div>
                                                    <div className="flex items-center font-medium">
                                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        {new Date(bookingDetails.start_date).toLocaleDateString("ar-SY")}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground">إلى</div>
                                                    <div className="flex items-center font-medium">
                                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        {new Date(bookingDetails.end_date).toLocaleDateString("ar-SY")}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">الضيوف</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium">{bookingDetails.adults_count} بالغين</span>
                                                        {bookingDetails.children_count > 0 && (
                                                            <span className="text-muted-foreground">
                                                                {" "}
                                                                • {bookingDetails.children_count} أطفال
                                                            </span>
                                                        )}
                                                        {bookingDetails.infants_count > 0 && (
                                                            <span className="text-muted-foreground">
                                                                {" "}
                                                                • {bookingDetails.infants_count} رضع
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* التفاصيل المالية */}
                                <h3 className="text-lg font-semibold">التفاصيل المالية</h3>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span>السعر الأساسي</span>
                                                <span>
                                                    {bookingDetails.price} {bookingDetails.currency}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>رسوم الخدمة</span>
                                                <span>
                                                    {bookingDetails.service_fees} {bookingDetails.currency}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>العمولة</span>
                                                <span>
                                                    {bookingDetails.commission} {bookingDetails.currency}
                                                </span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex items-center justify-between font-bold">
                                                <span>المجموع</span>
                                                <span>
                                                    {bookingDetails.price + bookingDetails.service_fees} {bookingDetails.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* الملاحظات */}
                                {bookingDetails.message && (
                                    <>
                                        <h3 className="text-lg font-semibold">رسالة الضيف</h3>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-sm">{bookingDetails.message}</p>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {bookingDetails.host_notes && (
                                    <>
                                        <h3 className="text-lg font-semibold">ملاحظات المضيف</h3>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-sm">{bookingDetails.host_notes}</p>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {bookingDetails.admin_notes && (
                                    <>
                                        <h3 className="text-lg font-semibold">ملاحظات المشرف</h3>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-sm">{bookingDetails.admin_notes}</p>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="guest" className="space-y-4 py-4">
                            {/* بيانات الضيف */}
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-lg font-semibold">معلومات الضيف</h3>
                                <div className="flex items-start space-x-4 space-x-reverse">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={bookingDetails.guest?.avatar_url || "/placeholder-user.jpg"}
                                            alt={`${bookingDetails.guest?.first_name || ""} ${bookingDetails.guest?.last_name || ""}`}
                                        />
                                        <AvatarFallback>
                                            {bookingDetails.guest?.first_name?.charAt(0) || "G"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold">
                                                {bookingDetails.guest
                                                    ? `${bookingDetails.guest.first_name} ${bookingDetails.guest.last_name}`
                                                    : `ضيف #${bookingDetails.guest_id}`}
                                            </h3>
                                        </div>
                                        {bookingDetails.guest?.email && (
                                            <p className="text-sm text-muted-foreground">{bookingDetails.guest.email}</p>
                                        )}
                                        {bookingDetails.guest?.phone_number && (
                                            <p className="text-sm text-muted-foreground">
                                                {bookingDetails.guest.country_code} {bookingDetails.guest.phone_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="host" className="space-y-4 py-4">
                            {/* بيانات المضيف */}
                            <div className="flex flex-col space-y-4">
                                <h3 className="text-lg font-semibold">معلومات المضيف</h3>
                                <div className="flex items-start space-x-4 space-x-reverse">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={bookingDetails.host?.avatar_url || "/placeholder-user.jpg"}
                                            alt={`${bookingDetails.host?.first_name || ""} ${bookingDetails.host?.last_name || ""}`}
                                        />
                                        <AvatarFallback>
                                            {bookingDetails.host?.first_name?.charAt(0) || "H"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold">
                                                {bookingDetails.host
                                                    ? `${bookingDetails.host.first_name} ${bookingDetails.host.last_name}`
                                                    : `مضيف #${bookingDetails.host_id}`}
                                            </h3>
                                        </div>
                                        {bookingDetails.host?.email && (
                                            <p className="text-sm text-muted-foreground">{bookingDetails.host.email}</p>
                                        )}
                                        {bookingDetails.host?.phone_number && (
                                            <p className="text-sm text-muted-foreground">
                                                {bookingDetails.host.country_code} {bookingDetails.host.phone_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex h-40 items-center justify-center">
                        <p>لا توجد بيانات للعرض</p>
                    </div>
                )}

                <DialogFooter className="flex flex-wrap items-center gap-2">
                    {!isLoading && booking && (
                        <>
                            {(booking.status === "pending" || booking.status === "waiting_payment") && (
                                <Button
                                    variant="default"
                                    onClick={() => handleStatusChange("accepted")}
                                    className="gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    تأكيد الدفع
                                </Button>
                            )}
                            {booking.status === "accepted" && (
                                <Button
                                    variant="default"
                                    onClick={() => handleStatusChange("confirmed")}
                                    className="gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    تأكيد الحجز
                                </Button>
                            )}
                            {(booking.status === "pending" ||
                                booking.status === "waiting_payment" ||
                                booking.status === "accepted") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusChange("rejected")}
                                        className="gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        رفض
                                    </Button>
                                )}
                            {(booking.status === "pending" ||
                                booking.status === "waiting_payment" ||
                                booking.status === "accepted" ||
                                booking.status === "confirmed") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusChange("cancelled")}
                                        className="gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        إلغاء
                                    </Button>
                                )}
                        </>
                    )}
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        إغلاق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
