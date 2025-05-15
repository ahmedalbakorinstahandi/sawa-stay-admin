"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {  useRouter } from 'next/navigation'

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

// Mock data
const initialTransactions = [
  {
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
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 1,
    related_type: "booking",
    description: "دفع حجز شقة فاخرة في وسط دمشق",
    created_at: "2023-06-15T10:30:00Z",
  },
  {
    id: 2,
    reference: "TRX-002",
    amount: 840000,
    currency: "USD",
    type: "booking_payment",
    status: "completed",
    payment_method: "shamcash",
    user: {
      id: 4,
      name: "فاطمة حسن",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 2,
    related_type: "booking",
    description: "دفع حجز فيلا مع مسبح في اللاذقية",
    created_at: "2023-06-25T14:45:00Z",
  },
  {
    id: 3,
    reference: "TRX-003",
    amount: 175000,
    currency: "USD",
    type: "booking_payment",
    status: "pending",
    payment_method: "wallet",
    user: {
      id: 1,
      name: "أحمد محمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 3,
    related_type: "booking",
    description: "دفع حجز استوديو مفروش في حلب",
    created_at: "2023-07-20T09:15:00Z",
  },
  {
    id: 4,
    reference: "TRX-004",
    amount: 300000,
    currency: "USD",
    type: "booking_payment",
    status: "completed",
    payment_method: "alharam",
    user: {
      id: 3,
      name: "محمد علي",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 4,
    related_type: "booking",
    description: "دفع حجز بيت ريفي في طرطوس",
    created_at: "2023-08-15T16:20:00Z",
  },
  {
    id: 5,
    reference: "TRX-005",
    amount: 450000,
    currency: "USD",
    type: "booking_refund",
    status: "completed",
    payment_method: "wallet",
    user: {
      id: 5,
      name: "خالد عمر",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 5,
    related_type: "booking",
    description: "استرداد حجز شاليه على البحر في اللاذقية",
    created_at: "2023-09-25T11:10:00Z",
  },
  {
    id: 6,
    reference: "TRX-006",
    amount: 50000,
    currency: "USD",
    type: "commission",
    status: "completed",
    payment_method: "system",
    user: {
      id: 1,
      name: "أحمد محمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 1,
    related_type: "listing",
    description: "عمولة إعلان شقة فاخرة في وسط دمشق",
    created_at: "2023-06-16T08:30:00Z",
  },
  {
    id: 7,
    reference: "TRX-007",
    amount: 120000,
    currency: "USD",
    type: "commission",
    status: "completed",
    payment_method: "system",
    user: {
      id: 2,
      name: "سارة أحمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: 2,
    related_type: "listing",
    description: "عمولة إعلان فيلا مع مسبح في اللاذقية",
    created_at: "2023-06-26T12:45:00Z",
  },
  {
    id: 8,
    reference: "TRX-008",
    amount: 200000,
    currency: "USD",
    type: "deposit",
    status: "completed",
    payment_method: "shamcash",
    user: {
      id: 3,
      name: "محمد علي",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: null,
    related_type: null,
    description: "إيداع رصيد في المحفظة",
    created_at: "2023-07-05T10:20:00Z",
  },
  {
    id: 9,
    reference: "TRX-009",
    amount: 150000,
    currency: "USD",
    type: "withdrawal",
    status: "pending",
    payment_method: "bank_transfer",
    user: {
      id: 4,
      name: "فاطمة حسن",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: null,
    related_type: null,
    description: "سحب رصيد من المحفظة",
    created_at: "2023-07-10T15:30:00Z",
  },
  {
    id: 10,
    reference: "TRX-010",
    amount: 100000,
    currency: "USD",
    type: "withdrawal",
    status: "rejected",
    payment_method: "bank_transfer",
    user: {
      id: 5,
      name: "خالد عمر",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    related_id: null,
    related_type: null,
    description: "سحب رصيد من المحفظة",
    created_at: "2023-07-15T09:10:00Z",
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const router = useRouter();

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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    let matchesDate = true
    if (dateRange?.from && dateRange?.to) {
      const transactionDate = new Date(transaction.created_at)
      matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">المعاملات المالية</h2>
        <Button>
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
                <DatePickerWithRange className="w-full" />
              </div>
              <Button variant="outline">
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
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.reference}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={transaction.user.avatar || "/placeholder.svg"}
                                alt={transaction.user.name}
                              />
                              <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{transaction.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(transaction.type)}
                            {getTypeLabel(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.amount} {transaction.currency}
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
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
                              <DropdownMenuItem onClick={()=>router.push("/transactions/1")}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              {transaction.status === "pending" && (
                                <>
                                  <DropdownMenuItem>
                                    <CheckCircle className="ml-2 h-4 w-4" />
                                    تأكيد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <XCircle className="ml-2 h-4 w-4" />
                                    رفض
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Download className="ml-2 h-4 w-4" />
                                تصدير
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
