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

// Mock data for a single transaction
const transactionData = {
  id: 1,
  reference: "TRX-001",
  amount: 250000,
  currency: "USD",
  type: "booking_payment",
  status: "completed",
  payment_method: "wallet",
  user: {
    id: 2,
    name: "سارة أحمد",
    email: "sara@example.com",
    phone: "+963 912 345 678",
    avatar: "/placeholder.svg?height=128&width=128",
  },
  related_id: 1,
  related_type: "booking",
  related_info: {
    booking_id: 1,
    listing_title: "شقة فاخرة في وسط دمشق",
    host_name: "أحمد محمد",
    check_in: "2023-06-20",
    check_out: "2023-06-25",
    guests: 2,
  },
  description: "دفع حجز شقة فاخرة في وسط دمشق",
  notes: "تم الدفع بنجاح من خلال المحفظة الإلكترونية",
  created_at: "2023-06-15T10:30:00Z",
  updated_at: "2023-06-15T10:35:00Z",
  transaction_fee: 5000,
  total_amount: 255000,
  receipt_url: "#",
  admin_notes: "تمت مراجعة المعاملة والتأكد من صحتها",
  history: [
    {
      action: "created",
      timestamp: "2023-06-15T10:30:00Z",
      user: "النظام",
      details: "تم إنشاء المعاملة",
    },
    {
      action: "processing",
      timestamp: "2023-06-15T10:32:00Z",
      user: "النظام",
      details: "جاري معالجة المعاملة",
    },
    {
      action: "completed",
      timestamp: "2023-06-15T10:35:00Z",
      user: "النظام",
      details: "تم اكتمال المعاملة بنجاح",
    },
  ],
}

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch transaction details
    const fetchTransaction = async () => {
      try {
        // In a real app, you would fetch the transaction from an API
        // const response = await fetch(`/api/transactions/${params.id}`)
        // const data = await response.json()

        // Using mock data for demonstration
        setTimeout(() => {
          setTransaction(transactionData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching transaction:", error)
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات المعاملة",
          description: "حدث خطأ أثناء محاولة جلب بيانات المعاملة. يرجى المحاولة مرة أخرى.",
        })
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [params.id, toast])

  const handleGoBack = () => {
    router.back()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            مكتمل
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
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
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">تفاصيل المعاملة #{transaction.reference}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button>
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
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
                    {transaction.amount.toLocaleString()} {transaction.currency}
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
                    <span className="text-muted-foreground">رق�� المرجع</span>
                    <span className="font-medium">{transaction.reference}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">طريقة الدفع</span>
                    <span className="font-medium">{getPaymentMethodLabel(transaction.payment_method)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ</span>
                    <span className="font-medium">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رسوم المعاملة</span>
                    <span className="font-medium">
                      {transaction.transaction_fee.toLocaleString()} {transaction.currency}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ الإجمالي</span>
                    <span className="font-medium text-lg">
                      {transaction.total_amount.toLocaleString()} {transaction.currency}
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
                {transaction.related_type === "booking" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رقم الحجز</span>
                      <span className="font-medium">#{transaction.related_info.booking_id}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عنوان الإعلان</span>
                      <span className="font-medium">{transaction.related_info.listing_title}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">اسم المضيف</span>
                      <span className="font-medium">{transaction.related_info.host_name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ الوصول</span>
                      <span className="font-medium">{transaction.related_info.check_in}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ المغادرة</span>
                      <span className="font-medium">{transaction.related_info.check_out}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عدد الضيوف</span>
                      <span className="font-medium">{transaction.related_info.guests}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">الوصف</h4>
                  <p>{transaction.description}</p>
                  {transaction.notes && (
                    <>
                      <h4 className="font-medium mt-4 mb-2">ملاحظات</h4>
                      <p>{transaction.notes}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              تم إنشاء المعاملة بواسطة <span className="font-medium">النظام</span>
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
                <AvatarImage src={transaction.user.avatar || "/placeholder.svg"} alt={transaction.user.name} />
                <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{transaction.user.name}</h3>
              <p className="text-muted-foreground">{transaction.user.email}</p>
              <p className="text-muted-foreground">{transaction.user.phone}</p>
              <Button variant="outline" className="mt-4 w-full">
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
                {transaction.history.map((event: any, index: number) => (
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
                  <Button className="w-full" variant="default">
                    <CheckCircle className="ml-2 h-4 w-4" />
                    تأكيد المعاملة
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <XCircle className="ml-2 h-4 w-4" />
                    رفض المعاملة
                  </Button>
                </>
              )}
              <Button className="w-full" variant="outline">
                <FileText className="ml-2 h-4 w-4" />
                إنشاء فاتورة
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="ml-2 h-4 w-4" />
                تنزيل الإيصال
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
