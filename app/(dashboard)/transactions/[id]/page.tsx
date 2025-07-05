"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  CreditCard,
  Download,
  RefreshCcw,
  XCircle,
  Clock,
  User,
  FileText,
  Calendar,
  DollarSign,
  Printer,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// تعريف نوع البيانات للمعاملة
interface Transaction {
  id: number
  user_id: number
  amount: number
  description: {
    ar: any
    en: any
  }
  status: string
  type: string
  direction: string
  method: string
  transactionable_id: number | null
  transactionable_type: string | null
  attached: string | null
  attached_url?: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  // بيانات إضافية للعرض
  user?: {
    id: number
    first_name: string

    last_name: string
    email?: string
    phone?: string
    avatar?: string
  }
  related_info?: any
}

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/transactions/${params.id}`)

        if (response.data.success) {
          // اضافة بيانات المستخدم المؤقتة للعرض حتى يتم تنفيذ واجهة برمجة التطبيقات الكاملة
          const transactionData = response.data.data;

          // اضافة معلومات المستخدم (يمكن استبدالها بطلب API إضافي للحصول على معلومات المستخدم)
          const enhancedTransaction = {
            ...transactionData,


          };

          setTransaction(enhancedTransaction)
        } else {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "لم نتمكن من العثور على بيانات المعاملة",
          })
        }
      } catch (error) {
        console.error("Error fetching transaction:", error)
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات المعاملة",
          description: "حدث خطأ أثناء محاولة جلب بيانات المعاملة. يرجى المحاولة مرة أخرى.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTransaction()
    }
  }, [params.id, toast])

  const handleGoBack = () => {
    router.back()
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      if (!transaction) return

      const response = await api.put(`/admin/transactions/${params.id}`, { status })

      if (response.data.success) {
        toast({
          title: "تم التحديث",
          description: "تم تحديث حالة المعاملة بنجاح",
        })

        // تحديث البيانات المحلية
        setTransaction({
          ...transaction,
          status: status,
          updated_at: new Date().toISOString(),
        })
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل تحديث حالة المعاملة",
        })
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة تحديث حالة المعاملة.",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className={cn("flex items-center gap-1 bg-green-500 hover:bg-green-600")}>
            <CheckCircle className="h-3 w-3" />
            مكتمل
          </Badge>
        )
      case "pending":
        return (
          <Badge className={cn("flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600")}>
            <RefreshCcw className="h-3 w-3" />
            قيد الانتظار
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking_payment":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />
      case "booking_refund":
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />
      case "commission":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case "deposit":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />
      case "withdrawal":
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "booking_payment":
        return "دفع حجز"
      case "booking_refund":
        return "استرداد حجز"
      case "commission":
        return "عمولة"
      case "deposit":
        return "إيداع"
      case "withdrawal":
        return "سحب"
      default:
        return type
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "wallet":
        return "محفظة"
      case "shamcash":
        return "شام كاش"
      case "alharam":
        return "الهرم"
      case "bank_transfer":
        return "تحويل بنكي"
      case "system":
        return "النظام"
      default:
        return method
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const getDescription = (description: any) => {
    if (!description) return "لا يوجد وصف";

    if (typeof description === 'string') {
      return description;
    }

    if (description.ar && typeof description.ar === 'string') {
      return description.ar;
    }

    if (description.ar && description.ar.ar) {
      return description.ar.ar;
    }

    return "لا يوجد وصف";
  }

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
    )
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">لم يتم العثور على المعاملة</h2>
        <p className="text-muted-foreground">
          لم نتمكن من العثور على معاملة بالمعرف {params.id}. قد تكون المعاملة غير موجودة أو تم حذفها.
        </p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
      </div>
    )
  }

  // إنشاء سجل المعاملة استناداً إلى البيانات المتاحة
  const transactionHistory = [
    {
      action: "created",
      timestamp: transaction.created_at,
      user: "النظام",
      details: "تم إنشاء المعاملة",
    }
  ];

  if (transaction.updated_at && transaction.updated_at !== transaction.created_at) {
    transactionHistory.push({
      action: transaction.status,
      timestamp: transaction.updated_at,
      user: "النظام",
      details: `تم تحديث المعاملة إلى: ${getTypeLabel(transaction.status)}`,
    });
  }

  // يمكن إضافة المزيد من الإجراءات إلى سجل المعاملة هنا إذا كانت هناك بيانات متاحة

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">تفاصيل المعاملة #{transaction.id}</h2>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          {transaction.attached && transaction.attached_url && (
            <Button variant="outline" onClick={() => window.open(transaction.attached_url, "_blank")}>
              <Download className="ml-2 h-4 w-4" />
              تنزيل المرفق
            </Button>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>معلومات المعاملة</CardTitle>
              {getStatusBadge(transaction.status)}
            </div>
            <CardDescription>تفاصيل المعاملة والمعلومات المالية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نوع المعاملة</p>
                  <p className="font-medium">{getTypeLabel(transaction.type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ</p>
                  <p className="font-medium text-xl">
                    {transaction.amount.toLocaleString()} USD
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ المعاملة</p>
                  <p className="font-medium">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">تفاصيل المعاملة</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم المرجع</span>
                    <span className="font-medium">#{transaction.id}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">طريقة الدفع</span>
                    <span className="font-medium">{getPaymentMethodLabel(transaction.method)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-medium">
                      {transaction.amount.toLocaleString()} USD
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاتجاه</span>
                    <span className="font-medium">
                      {transaction.direction === "in" ? "وارد" : "صادر"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة</span>
                    <span>{getStatusBadge(transaction.status)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الإنشاء</span>
                    <span className="font-medium">{formatDate(transaction.created_at)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">آخر تحديث</span>
                    <span className="font-medium">{formatDate(transaction.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معلومات متعلقة</h3>
                {transaction.transactionable_id && transaction.transactionable_type && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نوع العلاقة</span>
                      <span className="font-medium">
                        {transaction.transactionable_type.includes("Booking") ? "حجز" : transaction.transactionable_type.replace("App\\Models\\", "")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">معرف العلاقة</span>
                      <span className="font-medium">#{transaction.transactionable_id}</span>
                    </div>
                    {transaction.related_info && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">عنوان الإعلان</span>
                          <span className="font-medium">{transaction.related_info.listing_title}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">الوصف</h4>
                  <p>{getDescription(transaction.description)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              معرف المستخدم: {transaction.user_id}
            </div>
            <div className="text-sm text-muted-foreground">آخر تحديث: {formatDate(transaction.updated_at)}</div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المستخدم</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={transaction.user?.avatar || "/placeholder.svg"} alt={transaction.user?.first_name} />
                <AvatarFallback>{transaction.user?.first_name?.charAt(0) || ""}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{transaction.user?.first_name + " " + transaction.user?.last_name}</h3>
              {transaction.user?.email && <p className="text-muted-foreground">{transaction.user.email}</p>}
              {transaction.user?.phone && <p className="text-muted-foreground">{transaction.user.phone}</p>}
              <Button variant="outline" className="mt-4 w-full" onClick={() => router.push(`/users/${transaction.user_id}`)}>
                <User className="ml-2 h-4 w-4" />
                عرض ملف المستخدم
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 before:absolute before:inset-y-0 before:right-4 before:w-[2px] before:bg-muted">
                {transactionHistory.map((event, index) => (
                  <div key={index} className="relative grid grid-cols-[1fr_auto] items-start gap-4 pb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.action}</span>
                        <Badge variant="outline" className="ml-2">
                          {event.user}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted z-10">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transaction.status === "pending" && (
                <>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleUpdateStatus("completed")}
                  >
                    <CheckCircle className="ml-2 h-4 w-4" />
                    تأكيد المعاملة
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleUpdateStatus("rejected")}
                  >
                    <XCircle className="ml-2 h-4 w-4" />
                    رفض المعاملة
                  </Button>
                </>
              )}
              {/* <Button className="w-full" variant="outline" onClick={() => window.print()}>
                <FileText className="ml-2 h-4 w-4" />
                طباعة الإيصال
              </Button> */}
              {transaction.transactionable_id && transaction.transactionable_type?.includes("Booking") && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/bookings/${transaction.transactionable_id}`)}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  عرض الحجز المرتبط
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
