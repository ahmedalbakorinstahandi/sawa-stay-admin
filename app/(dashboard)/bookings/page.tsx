"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Calendar, CheckCircle, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingDialog } from "@/components/bookings/booking-dialog"
import { BookingDeleteDialog } from "@/components/bookings/booking-delete-dialog"
import { useToast } from "@/hooks/use-toast"

// Mock data
const initialBookings = [
  {
    id: 1,
    listing_id: 1,
    listing_title: "شقة فاخرة في وسط دمشق",
    host_id: 1,
    host_name: "أحمد محمد",
    guest_id: 2,
    guest_name: "سارة أحمد",
    start_date: "2023-06-15T00:00:00Z",
    end_date: "2023-06-20T00:00:00Z",
    status: "confirmed",
    payment_method: "wallet",
    price: 250000,
    service_fees: 25000,
    commission: 25000,
    adults_count: 2,
    children_count: 1,
    infants_count: 0,
    pets_count: 0,
    created_at: "2023-06-01T10:30:00Z",
    currency: "SYP",
  },
  {
    id: 2,
    listing_id: 2,
    listing_title: "فيلا مع مسبح في اللاذقية",
    host_id: 3,
    host_name: "محمد علي",
    guest_id: 4,
    guest_name: "فاطمة حسن",
    start_date: "2023-07-10T00:00:00Z",
    end_date: "2023-07-17T00:00:00Z",
    status: "paid",
    payment_method: "shamcash",
    price: 840000,
    service_fees: 84000,
    commission: 84000,
    adults_count: 4,
    children_count: 2,
    infants_count: 1,
    pets_count: 0,
    created_at: "2023-06-25T14:45:00Z",
    currency: "SYP",
  },
  {
    id: 3,
    listing_id: 3,
    listing_title: "استوديو مفروش في حلب",
    host_id: 5,
    host_name: "خالد عمر",
    guest_id: 1,
    guest_name: "أحمد محمد",
    start_date: "2023-08-05T00:00:00Z",
    end_date: "2023-08-10T00:00:00Z",
    status: "waiting_payment",
    payment_method: "wallet",
    price: 175000,
    service_fees: 17500,
    commission: 17500,
    adults_count: 1,
    children_count: 0,
    infants_count: 0,
    pets_count: 0,
    created_at: "2023-07-20T09:15:00Z",
    currency: "SYP",
  },
  {
    id: 4,
    listing_id: 4,
    listing_title: "بيت ريفي في طرطوس",
    host_id: 2,
    host_name: "سارة أحمد",
    guest_id: 3,
    guest_name: "محمد علي",
    start_date: "2023-09-01T00:00:00Z",
    end_date: "2023-09-05T00:00:00Z",
    status: "completed",
    payment_method: "alharam",
    price: 300000,
    service_fees: 30000,
    commission: 30000,
    adults_count: 3,
    children_count: 1,
    infants_count: 0,
    pets_count: 0,
    created_at: "2023-08-15T16:20:00Z",
    currency: "SYP",
  },
  {
    id: 5,
    listing_id: 5,
    listing_title: "شاليه على البحر في اللاذقية",
    host_id: 4,
    host_name: "فاطمة حسن",
    guest_id: 5,
    guest_name: "خالد عمر",
    start_date: "2023-10-10T00:00:00Z",
    end_date: "2023-10-15T00:00:00Z",
    status: "cancelled",
    payment_method: "wallet",
    price: 450000,
    service_fees: 45000,
    commission: 45000,
    adults_count: 2,
    children_count: 0,
    infants_count: 0,
    pets_count: 0,
    created_at: "2023-09-25T11:10:00Z",
    currency: "SYP",
  },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState(initialBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
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
      case "waiting_payment":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "wallet":
        return "محفظة"
      case "shamcash":
        return "شام كاش"
      case "alharam":
        return "الهرم"
      case "cash":
        return "نقدي"
      case "crypto":
        return "عملات رقمية"
      default:
        return method
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.listing_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.host_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesPaymentMethod = paymentMethodFilter === "all" || booking.payment_method === paymentMethodFilter

    return matchesSearch && matchesStatus && matchesPaymentMethod
  })

  const handleAddBooking = () => {
    setSelectedBooking(null)
    setIsDialogOpen(true)
  }

  const handleEditBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const handleDeleteBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveBooking = (bookingData: any) => {
    if (selectedBooking) {
      // Update existing booking
      const updatedBookings = bookings.map((booking) =>
        booking.id === selectedBooking.id ? { ...booking, ...bookingData } : booking,
      )
      setBookings(updatedBookings)
    } else {
      // Add new booking
      const newBooking = {
        id: Math.max(...bookings.map((b) => b.id)) + 1,
        ...bookingData,
      }
      setBookings([...bookings, newBooking])
    }
  }

  const handleDeleteConfirm = () => {
    if (!selectedBooking) return

    const updatedBookings = bookings.filter((booking) => booking.id !== selectedBooking.id)
    setBookings(updatedBookings)
  }

  const handleUpdateStatus = (booking: any, newStatus: string) => {
    const updatedBookings = bookings.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b))
    setBookings(updatedBookings)

    let statusText = ""
    switch (newStatus) {
      case "confirmed":
        statusText = "تأكيد"
        break
      case "paid":
        statusText = "تأكيد دفع"
        break
      case "cancelled":
        statusText = "إلغاء"
        break
      case "rejected":
        statusText = "رفض"
        break
      default:
        statusText = "تحديث حالة"
        break
    }

    toast({
      title: `تم ${statusText} الحجز`,
      description: `تم ${statusText} الحجز رقم #${booking.id} بنجاح`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الحجوزات</h2>
        <Button onClick={handleAddBooking}>
          <Plus className="ml-2 h-4 w-4" /> إضافة حجز
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الحجوزات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن حجز..."
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
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="waiting_payment">بانتظار الدفع</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطرق</SelectItem>
                  <SelectItem value="wallet">محفظة</SelectItem>
                  <SelectItem value="shamcash">شام كاش</SelectItem>
                  <SelectItem value="alharam">الهرم</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="crypto">عملات رقمية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحجز</TableHead>
                    <TableHead>الإعلان</TableHead>
                    <TableHead>الضيف</TableHead>
                    <TableHead>المضيف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{booking.listing_title}</TableCell>
                        <TableCell>{booking.guest_name}</TableCell>
                        <TableCell>{booking.host_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{new Date(booking.start_date).toLocaleDateString("ar-SY")}</span>
                            <span className="text-xs text-muted-foreground">إلى</span>
                            <span>{new Date(booking.end_date).toLocaleDateString("ar-SY")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.price} {booking.currency}
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(booking.payment_method)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                              <DropdownMenuItem>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              {booking.status === "waiting_payment" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "paid")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تأكيد الدفع
                                </DropdownMenuItem>
                              )}
                              {booking.status === "paid" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "confirmed")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تأكيد الحجز
                                </DropdownMenuItem>
                              )}
                              {(booking.status === "paid" || booking.status === "waiting_payment") && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "rejected")}>
                                  <XCircle className="ml-2 h-4 w-4" />
                                  رفض
                                </DropdownMenuItem>
                              )}
                              {(booking.status === "paid" ||
                                booking.status === "waiting_payment" ||
                                booking.status === "confirmed") && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "cancelled")}>
                                  <XCircle className="ml-2 h-4 w-4" />
                                  إلغاء
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteBooking(booking)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
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

      <BookingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        booking={selectedBooking}
        onSave={handleSaveBooking}
      />

      <BookingDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        booking={selectedBooking}
        onDelete={handleDeleteConfirm}
      />
    </div>
  )
}
