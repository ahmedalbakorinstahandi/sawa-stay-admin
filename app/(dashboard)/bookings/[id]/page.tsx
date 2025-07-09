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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock, MapPin, Users, XCircle, Plus } from "lucide-react"
import { bookingsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useRouter } from "next/navigation"

// نوع بيانات الحجز
type Booking = {
    id: number
    listing_id: number
    host_id: number
    total_price: number
    guest_id: number
    start_date: string
    end_date: string
    check_in: string | null
    check_out: string | null
    status: string
    currency: string
    price: number
    final_total_price?: number
    final_price_for_host?: number
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
    transactions?: Array<{
        id: number
        user_id: number
        amount: number
        description: {
            ar: string
            en: string | null
        }
        status: string
        type: string
        direction: string
        method: string
        transactionable_id: number
        transactionable_type: string
        attached: string | null
        attached_url: string | null
        created_at: string
    }>
    prices?: Array<{
        id: number
        booking_id: number
        price: number
        type: string
        date: string
    }>
}

interface BookingDetailsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    booking: Booking | null
    onStatusChange?: (booking: Booking, newStatus: string) => void
}

export default function BookingDetails() {
    const params = useParams()
    const router = useRouter()

    const [bookingDetails, setBookingDetails] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [transactionAmount, setTransactionAmount] = useState<number>(0)
    const [transactionMethod, setTransactionMethod] = useState<string>("wallet")
    const [transactionDescription, setTransactionDescription] = useState<string>("")
    const { toast } = useToast()

    // جلب بيانات الحجز عند فتح الحوار
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!params.id) return

            setIsLoading(true)
            try {
                const response = await bookingsAPI.get(Number(params.id))
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

        if (params.id) {
            fetchBookingDetails()
        } else {
            setBookingDetails(null)
        }
    }, [params.id, toast])

    // إضافة معاملة مالية جديدة
    const handleAddTransaction = async () => {
        if (!bookingDetails) return

        setIsSubmitting(true)
        try {
            const transactionData = {
                amount: transactionAmount,
                method: transactionMethod,
                description: transactionDescription || `معاملة مالية للحجز #${bookingDetails.id}`
            }

            const response = await bookingsAPI.createTransaction(bookingDetails.id, transactionData)

            if (response.success) {
                toast({
                    title: "تمت الإضافة",
                    description: "تمت إضافة المعاملة المالية بنجاح",
                })

                // تحديث بيانات الحجز لعرض المعاملة الجديدة
                const updatedBooking = await bookingsAPI.get(bookingDetails.id)
                if (updatedBooking.success && updatedBooking.data) {
                    setBookingDetails(updatedBooking.data)
                }

                // إعادة تعيين الحقول
                setTransactionAmount(0)
                setTransactionMethod("wallet")
                setTransactionDescription("")
            } else {
                toast({
                    title: "خطأ",
                    description: response.message || "حدث خطأ أثناء إضافة المعاملة المالية",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error adding transaction:", error)
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء إضافة المعاملة المالية",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-500">
                        <Calendar className="h-3 w-3" />
                        قيد الانتظار
                    </Badge>
                )
            case "waiting_payment":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-500">
                        <Calendar className="h-3 w-3" />
                        انتظار الدفع
                    </Badge>
                )
            case "accepted":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-500">
                        <CheckCircle className="h-3 w-3" />
                        تأكيد الإتاحية
                    </Badge>
                )
            case "confirmed":
                return (
                    <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        مؤكد
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
                        ملغى
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
    const handleStatusChange = async (newStatus: string) => {
        if (!bookingDetails) return;

        setIsSubmitting(true);
        try {
            const response = await bookingsAPI.updateStatus(bookingDetails.id, newStatus);

            if (response.success) {
                toast({
                    title: "تم تحديث الحالة",
                    description: "تم تحديث حالة الحجز بنجاح",
                });

                // تحديث بيانات الحجز محليًا
                const updatedBooking = await bookingsAPI.get(bookingDetails.id);
                if (updatedBooking.success && updatedBooking.data) {
                    setBookingDetails(updatedBooking.data);
                }
            } else {
                toast({
                    title: "خطأ",
                    description: response.message || "حدث خطأ أثناء تحديث حالة الحجز",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating booking status:", error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء تحديث حالة الحجز",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleStatusChange = (newStatus: string) => {
    //     if (onStatusChange && bookingDetails && booking) {
    //         onStatusChange(booking, newStatus)
    //         onOpenChange(false)
    //     }
    // }

    return (
        <div className="space-y-4">
            <Card >
                <CardContent >
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                تفاصيل الحجز{" "}
                                {!isLoading && bookingDetails && (
                                    <span className="text-muted-foreground">#{bookingDetails.id}</span>
                                )}
                            </div>
                            {!isLoading && bookingDetails && getStatusBadge(bookingDetails.status)}
                        </CardTitle>
                        <CardDescription>
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
                            )
                            }
                        </CardDescription>
                    </CardHeader>
                    {
                        isLoading ? (
                            <div className="space-y-4 p-4">
                                <Skeleton className="h-[125px] w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-[150px] w-full" />
                                    <Skeleton className="h-[150px] w-full" />
                                </div>
                                <Skeleton className="h-[100px] w-full" />
                            </div>
                        ) : bookingDetails ? (<Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                                <TabsTrigger value="guest">بيانات الضيف</TabsTrigger>
                                <TabsTrigger value="host">بيانات المضيف</TabsTrigger>
                                <TabsTrigger value="transactions">المعاملات المالية</TabsTrigger>
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = `/listings/${bookingDetails.listing_id}`}
                                                className="text-xs"
                                            >
                                                عرض الإعلان
                                            </Button>
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
                                                            <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                                                            {new Date(bookingDetails.start_date).toLocaleDateString("ar-SY")}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">إلى</div>
                                                        <div className="flex items-center font-medium">
                                                            <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
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
                                                        <Users className="ml-2 h-4 w-4 text-muted-foreground" />
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
                                    <h3 className="text-lg font-semibold">ملخص السعر</h3>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="space-y-3">
                                                {/* عرض تفاصيل الأسعار من prices array */}
                                                {bookingDetails.prices && bookingDetails.prices.length > 0 ? (
                                                    <>
                                                        {/* تجميع الأسعار حسب النوع */}
                                                        {(() => {
                                                            const normalPrices = bookingDetails.prices.filter((p: any) => p.type === 'normal');
                                                            const weekendPrices = bookingDetails.prices.filter((p: any) => p.type === 'weekend');

                                                            return (
                                                                <>
                                                                    {normalPrices.length > 0 && (
                                                                        <div className="flex items-center justify-between">
                                                                            <span>ليالي عادية ({normalPrices.length})</span>
                                                                            <span>
                                                                                ${normalPrices[0].price} × {normalPrices.length}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {weekendPrices.length > 0 && (
                                                                        <div className="flex items-center justify-between">
                                                                            <span>ليالي نهاية الأسبوع ({weekendPrices.length})</span>
                                                                            <span>
                                                                                ${weekendPrices[0].price} × {weekendPrices.length}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}

                                                        <div className="flex items-center justify-between font-medium">
                                                            <span>المجموع قبل الرسوم</span>
                                                            <span>
                                                                {bookingDetails.currency} {bookingDetails.total_price}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <span>السعر الأساسي</span>
                                                        <span>
                                                            {bookingDetails.currency} {bookingDetails.total_price}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span>رسوم الخدمة</span>
                                                    <span>
                                                        {bookingDetails.currency} {(bookingDetails.final_total_price !== undefined
                                                            ? bookingDetails.final_total_price - bookingDetails.total_price
                                                            : bookingDetails.service_fees)}
                                                    </span>
                                                </div>

                                                <Separator className="my-2" />

                                                <div className="flex items-center justify-between font-bold text-lg">
                                                    <span>المجموع الكلي</span>
                                                    <span className="text-green-600">
                                                        {bookingDetails.currency} {bookingDetails.final_total_price || (bookingDetails.total_price + bookingDetails.service_fees)}
                                                    </span>
                                                </div>

                                                {/* معلومات إضافية للمضيف */}
                                                {bookingDetails.final_price_for_host && (
                                                    <>
                                                        <Separator className="my-2" />
                                                        <div className="bg-muted/50 p-3 rounded-lg">
                                                            <div className="text-sm font-medium mb-2">تفاصيل المضيف:</div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span>المبلغ المستحق للمضيف</span>
                                                                <span>
                                                                    {bookingDetails.currency} {bookingDetails.final_price_for_host}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm mt-1">
                                                                <span>العمولة ({bookingDetails.commission}%)</span>
                                                                <span>
                                                                    {bookingDetails.currency} {Math.round(bookingDetails.total_price * bookingDetails.commission / 100)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* تاريخ الحجز */}
                                                <div className="mt-4 pt-2 border-t border-dashed">
                                                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 ml-1" />
                                                        تاريخ الحجز: {new Date(bookingDetails.start_date).toLocaleDateString("ar-SY", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric"
                                                        })} - {new Date(bookingDetails.end_date).toLocaleDateString("ar-SY", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric"
                                                        })}
                                                    </div>
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
                                            )}                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="transactions" className="space-y-4 py-4">
                                {/* بيانات المعاملات المالية */}
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">المعاملات المالية</h3>
                                        {bookingDetails && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => {
                                                    // فتح/إغلاق النموذج
                                                    const element = document.getElementById('transaction-form');
                                                    if (element) {
                                                        element.classList.toggle('hidden');
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                إضافة معاملة
                                            </Button>
                                        )}
                                    </div>

                                    {/* نموذج إضافة معاملة جديدة */}
                                    <Card id="transaction-form" className="hidden">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">إضافة معاملة مالية جديدة</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="grid gap-2">
                                                    <label htmlFor="amount" className="text-sm font-medium">
                                                        المبلغ
                                                    </label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        min={0}
                                                        placeholder="أدخل المبلغ"
                                                        value={transactionAmount || ''}
                                                        onChange={(e) => setTransactionAmount(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label htmlFor="method" className="text-sm font-medium">
                                                        طريقة الدفع
                                                    </label>
                                                    <Select value={transactionMethod} onValueChange={setTransactionMethod}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر طريقة الدفع" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                                                            <SelectItem value="shamcash">شام كاش</SelectItem>
                                                            <SelectItem value="alharam">الهرم</SelectItem>
                                                            <SelectItem value="cash">نقداً</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <label htmlFor="description" className="text-sm font-medium">
                                                        الوصف
                                                    </label>
                                                    <Input
                                                        id="description"
                                                        placeholder="وصف المعاملة (اختياري)"
                                                        value={transactionDescription}
                                                        onChange={(e) => setTransactionDescription(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const element = document.getElementById('transaction-form');
                                                            if (element) {
                                                                element.classList.add('hidden');
                                                            }
                                                        }}
                                                    >
                                                        إلغاء
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={isSubmitting || !transactionAmount || transactionAmount <= 0}
                                                        onClick={handleAddTransaction}
                                                    >
                                                        {isSubmitting ? "جاري الإضافة..." : "إضافة"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {bookingDetails.transactions && bookingDetails.transactions.length > 0 ? (
                                        bookingDetails.transactions.map((transaction) => (
                                            <Card key={transaction.id} className="overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                                {transaction.direction === "in" ? (
                                                                    <Badge variant="outline" className="border-green-500 text-green-500">
                                                                        وارد
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="border-red-500 text-red-500">
                                                                        صادر
                                                                    </Badge>
                                                                )}                                                <Badge variant={transaction.status === "confirmed" ? "default" : "outline"}>
                                                                    {transaction.status === "confirmed" ? "مؤكد" :
                                                                        transaction.status === "pending" ? "قيد الانتظار" :
                                                                            transaction.status === "waiting_payment" ? "انتظار الدفع" :
                                                                                transaction.status === "rejected" ? "مرفوض" :
                                                                                    transaction.status === "cancelled" ? "ملغى" :
                                                                                        transaction.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="font-bold">
                                                                {transaction.amount} {bookingDetails.currency}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium">{transaction.description.ar}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                بتاريخ {new Date(transaction.created_at).toLocaleDateString("ar-SY")}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                طريقة الدفع: {transaction.method}
                                                            </div>
                                                        </div>
                                                        {transaction.attached_url && (
                                                            <div className="mt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-xs"
                                                                    onClick={() => window.open(transaction.attached_url!, '_blank')}
                                                                >
                                                                    عرض المرفق
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="rounded-lg border p-4 text-center text-muted-foreground">
                                            لا توجد معاملات مالية لهذا الحجز
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                        ) : (
                            <div className="flex h-40 items-center justify-center">
                                <p>لا توجد بيانات للعرض</p>
                            </div>
                        )}

                    <CardFooter className="flex flex-wrap items-center gap-2">
                        {!isLoading && params.id && (
                            <>
                                {bookingDetails && (bookingDetails.status === "pending" || bookingDetails.status === "waiting_payment") && (
                                    <Button
                                        variant="default"
                                        onClick={() => handleStatusChange("accepted")}
                                        className="gap-2"
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        تأكيد الإتاحية
                                    </Button>
                                )}
                                {bookingDetails && (bookingDetails.status === "accepted" || bookingDetails.status === "waiting_payment") && (
                                    <Button
                                        variant="default"
                                        onClick={() => handleStatusChange("confirmed")}
                                        className="gap-2"
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        تأكيد الدفع
                                    </Button>
                                )}
                                {bookingDetails && bookingDetails.status === "confirmed" && (
                                    <Button
                                        variant="default"
                                        onClick={() => handleStatusChange("completed")}
                                        className="gap-2"
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        إكمال
                                    </Button>
                                )}
                                {bookingDetails && (bookingDetails.status === "pending" ||
                                    bookingDetails.status === "waiting_payment" ||
                                    bookingDetails.status === "accepted") && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatusChange("rejected")}
                                            className="gap-2"
                                            disabled={isSubmitting}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            رفض
                                        </Button>
                                    )}
                                {bookingDetails && (bookingDetails.status === "pending" ||
                                    bookingDetails.status === "waiting_payment" ||
                                    bookingDetails.status === "accepted" ||
                                    bookingDetails.status === "confirmed") && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatusChange("cancelled")}
                                            className="gap-2"
                                            disabled={isSubmitting}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            إلغاء
                                        </Button>
                                    )}
                            </>
                        )}
                        <Button variant="ghost" onClick={() => router.back()}>
                            إغلاق
                        </Button>
                    </CardFooter>
                </CardContent>
            </Card>
        </div>
    )
}
