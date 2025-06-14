"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { api } from "@/lib/api"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import * as React from "react"
import { DateRange } from "react-day-picker"

// نوع البيانات للمعاملات
interface Transaction {
  id: number
  user_id: number
  amount: number
  description: {
    ar: string
    en: string
  }
  status: string
  type: string
  direction: string
  method: string
  transactionable_id: number | null
  transactionable_type: string | null
  attached: string | null
  attached_url: string
  created_at: string
  user?: {
    id: number
    name: string
    avatar?: string
  }
}

interface ApiResponse {
  success: boolean
  data: Transaction[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 50,
    total: 0,
  })
  const router = useRouter()

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let url = `/admin/transactions?page=${currentPage}`

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      if (typeFilter !== "all") {
        url += `&type=${typeFilter}`
      }

      if (dateRange?.from && dateRange?.to) {
        const formattedFrom = dateRange.from.toISOString().split('T')[0]
        const formattedTo = dateRange.to.toISOString().split('T')[0]
        url += `&from=${formattedFrom}&to=${formattedTo}`
      }

      if (searchTerm) {
        url += `&search=${searchTerm}`
      }

      const response = await api.get<ApiResponse>(url)

      if (response.data.success) {
        // إضافة بيانات المستخدم المؤقتة للعرض حتى يتم تنفيذ واجهة برمجة التطبيقات الكاملة
        const transactionsWithUsers = response.data.data.map(transaction => ({
          ...transaction,
          user: {
            id: transaction.user_id,
            name: `مستخدم ${transaction.user_id}`, // يمكن استبداله بالاسم الحقيقي عندما يكون متاحًا في API
            avatar: "/placeholder.svg"
          }
        }))

        setTransactions(transactionsWithUsers)
        setPagination({
          currentPage: response.data.meta.current_page,
          lastPage: response.data.meta.last_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
        })
      }
    } catch (error) {
      console.error("خطأ في جلب المعاملات:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب المعاملات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, statusFilter, typeFilter, dateRange])

  const handleFilter = () => {
    setCurrentPage(1) // إعادة التعيين إلى الصفحة الأولى عند التصفية
    fetchTransactions()
  }

  const handleExport = async () => {
    try {
      let url = `/admin/transactions/export`

      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`
      }

      if (typeFilter !== "all") {
        url += `${url.includes('?') ? '&' : '?'}type=${typeFilter}`
      }

      if (dateRange?.from && dateRange?.to) {
        const formattedFrom = dateRange.from.toISOString().split('T')[0]
        const formattedTo = dateRange.to.toISOString().split('T')[0]
        url += `${url.includes('?') ? '&' : '?'}from=${formattedFrom}&to=${formattedTo}`
      }

      if (searchTerm) {
        url += `${url.includes('?') ? '&' : '?'}search=${searchTerm}`
      }

      const response = await api.get(url, { responseType: 'blob' })

      // إنشاء رابط تنزيل للملف
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير المعاملات بنجاح",
      })
    } catch (error) {
      console.error("خطأ في تصدير المعاملات:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير المعاملات",
        variant: "destructive",
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
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case "booking_refund":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      case "commission":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case "deposit":
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4" />
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/transactions/${id}`, { status })
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة المعاملة بنجاح",
      })
      fetchTransactions() // إعادة تحميل البيانات بعد التحديث
    } catch (error) {
      console.error("خطأ في تحديث المعاملة:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المعاملة",
        variant: "destructive",
      })
    }
  }

  // إنشاء صفحات الترقيم
  const renderPagination = () => {
    const pages = []
    const { currentPage, lastPage } = pagination

    // إضافة زر الصفحة السابقة
    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (currentPage > 1) handlePageChange(currentPage - 1)
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    )

    // حساب نطاق الصفحات التي سيتم عرضها
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(lastPage, startPage + 4)

    if (endPage - startPage < 4 && lastPage > 5) {
      startPage = Math.max(1, endPage - 4)
    }

    // إضافة أرقام الصفحات
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(i)
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // إضافة زر الصفحة التالية
    pages.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (currentPage < lastPage) handlePageChange(currentPage + 1)
          }}
          className={currentPage === lastPage ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    )

    return pages
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">المعاملات المالية</h2>
        <Button onClick={handleExport}>
          <Download className="ml-2 h-4 w-4" />
          تصدير المعاملات
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة المعاملات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن معاملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="booking_payment">دفع حجز</SelectItem>
                  <SelectItem value="booking_refund">استرداد حجز</SelectItem>
                  <SelectItem value="commission">عمولة</SelectItem>
                  <SelectItem value="deposit">إيداع</SelectItem>
                  <SelectItem value="withdrawal">سحب</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-full md:w-[250px]">
                <DatePickerWithRange
                  className="w-full"
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                />
              </div>
              <Button variant="outline" onClick={handleFilter}>
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم المرجع</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        جاري تحميل البيانات...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">#{transaction.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={transaction.user?.avatar || "/placeholder.svg"}
                                alt={transaction.user?.name || ""}
                              />
                              <AvatarFallback>{transaction.user?.name?.charAt(0) || ""}</AvatarFallback>
                            </Avatar>
                            <span>{transaction.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(transaction.type)}
                            {getTypeLabel(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.amount} USD
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(transaction.method)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString("ar-SY")}{" "}
                          {new Date(transaction.created_at).toLocaleTimeString("ar-SY", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">فتح القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/transactions/${transaction.id}`)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              {transaction.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, "completed")}>
                                    <CheckCircle className="ml-2 h-4 w-4" />
                                    تأكيد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, "rejected")}>
                                    <XCircle className="ml-2 h-4 w-4" />
                                    رفض
                                  </DropdownMenuItem>
                                </>
                              )}
                              {transaction.attached && (
                                <DropdownMenuItem onClick={() => window.open(transaction.attached_url, '_blank')}>
                                  <Download className="ml-2 h-4 w-4" />
                                  تنزيل المرفق
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && pagination.lastPage > 1 && (
              <Pagination>
                <PaginationContent>
                  {renderPagination()}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
