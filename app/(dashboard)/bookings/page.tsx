"use client"

import { useState, useEffect } from "react"
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
  PaginationEllipsis,
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
import { BookingDetails } from "@/components/bookings/booking-details"
import { useToast } from "@/hooks/use-toast"
import { bookingsAPI } from "@/lib/api"

// Types for bookings data
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
  }
  host?: {
    id: number
    first_name: string
    last_name: string
    avatar?: string | null
    avatar_url?: string | null
  }
  guest?: {
    id: number
    first_name: string
    last_name: string
    avatar?: string | null
    avatar_url?: string | null
  }
}

type BookingStats = {
  all_count: number
  pending_count: number
  accepted_count: number
  confirmed_count: number
  completed_count: number
  cancelled_count: number
  rejected_count: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const { toast } = useToast()
  const [totalCount, setTotalCount] = useState(0);

  // Fetch bookings from API
  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const filters: any = {}
      if (statusFilter !== "all") {
        filters.status = statusFilter
      }

      const response = await bookingsAPI.getAll(page, perPage, filters)
      if (response.success) {
        setBookings(response.data || [])
        setStats(response.info || null)
        setTotalCount(response.meta?.total || 0)
        // Calculate total pages from all_count
        if (response.info && response.info.all_count) {
          setTotalPages(Math.ceil(response.info.all_count / perPage))
        }
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات الحجوزات",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الحجوزات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load bookings when component mounts or filters change
  useEffect(() => {
    fetchBookings()
  }, [page, statusFilter, perPage, searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "accepted":
        return (<Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
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
        return (<Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-500">
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
    // Filter by search term
    const bookingTitle = booking.listing?.title?.ar || ""
    const guestName = `${booking.guest?.first_name || ""} ${booking.guest?.last_name || ""}`
    const hostName = `${booking.host?.first_name || ""} ${booking.host?.last_name || ""}`

    const matchesSearch =
      bookingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostName.toLowerCase().includes(searchTerm.toLowerCase())

    // We already filter by status in the API call
    const matchesStatus = true

    return matchesSearch && matchesStatus
  })

  const handleAddBooking = () => {
    setSelectedBooking(null)
    setIsDialogOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsDialogOpen(true)
  }

  const handleSaveBooking = async (bookingData: any) => {
    try {
      if (selectedBooking) {
        // Update existing booking
        const response = await bookingsAPI.update(selectedBooking.id, bookingData)
        if (response.success) {
          toast({
            title: "تم التحديث",
            description: "تم تحديث بيانات الحجز بنجاح",
          })
          fetchBookings() // Refresh bookings after update
        } else {
          toast({
            title: "خطأ",
            description: response.message || "حدث خطأ أثناء تحديث بيانات الحجز",
            variant: "destructive",
          })
        }
      } else {
        // Add new booking
        const response = await bookingsAPI.create(bookingData)
        if (response.success) {
          toast({
            title: "تمت الإضافة",
            description: "تم إضافة الحجز الجديد بنجاح",
          })
          fetchBookings() // Refresh bookings after adding
        } else {
          toast({
            title: "خطأ",
            description: response.message || "حدث خطأ أثناء إضافة الحجز الجديد",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error saving booking:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ بيانات الحجز",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return

    try {
      const response = await bookingsAPI.delete(selectedBooking.id)
      if (response.success) {
        toast({
          title: "تم الحذف",
          description: "تم حذف الحجز بنجاح",
        })
        fetchBookings() // Refresh bookings after deletion
      } else {
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ أثناء حذف الحجز",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الحجز",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (booking: Booking, newStatus: string) => {
    try {
      const response = await bookingsAPI.updateStatus(booking.id, newStatus)
      if (response.success) {
        let statusText = ""
        switch (newStatus) {
          case "confirmed":
          case "accepted":
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
        fetchBookings() // Refresh bookings after status update
      } else {
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ أثناء تحديث حالة الحجز",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الحجز",
        variant: "destructive",
      })
    }
  }

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الحجوزات</h2>
        <Button onClick={handleAddBooking}>
          <Plus className="ml-2 h-4 w-4" /> إضافة حجز
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.all_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">بانتظار الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">الحجوزات المؤكدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed_count + stats.accepted_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">الحجوزات الملغاة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  <SelectItem value="pending">بانتظار الدفع</SelectItem>
                  <SelectItem value="accepted">مقبول</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
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
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {booking.listing?.title?.ar || `إعلان #${booking.listing_id}`}
                        </TableCell>
                        <TableCell>
                          {booking.guest
                            ? `${booking.guest.first_name} ${booking.guest.last_name}`
                            : `ضيف #${booking.guest_id}`}
                        </TableCell>
                        <TableCell>
                          {booking.host
                            ? `${booking.host.first_name} ${booking.host.last_name}`
                            : `مضيف #${booking.host_id}`}
                        </TableCell>
                        <TableCell className="text-nowrap">
                          <div className="flex flex-col text-nowrap">
                            <span>{new Date(booking.start_date).toLocaleDateString("ar-SY")}</span>
                            <span className="text-xs text-muted-foreground">إلى</span>
                            <span>{new Date(booking.end_date).toLocaleDateString("ar-SY")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.price} {booking.currency}
                        </TableCell>
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
                              <DropdownMenuSeparator />                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              {(booking.status === "pending" || booking.status === "waiting_payment") && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "accepted")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تأكيد الدفع
                                </DropdownMenuItem>
                              )}
                              {booking.status === "accepted" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "confirmed")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تأكيد الحجز
                                </DropdownMenuItem>
                              )}
                              {(booking.status === "pending" ||
                                booking.status === "waiting_payment" ||
                                booking.status === "accepted") && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "rejected")}>
                                    <XCircle className="ml-2 h-4 w-4" />
                                    رفض
                                  </DropdownMenuItem>
                                )}
                              {(booking.status === "pending" ||
                                booking.status === "waiting_payment" ||
                                booking.status === "accepted" ||
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
            </div>            <Pagination>
              <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between w-full mb-2">
                <span className="text-sm text-muted-foreground">
                  إجمالي {totalCount} الحجوزات
                </span>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    setPerPage(parseInt(value, 10));
                    setPage(1); // إعادة تعيين الصفحة إلى الأولى عند تغيير عدد العناصر في الصفحة
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={`${perPage} لكل صفحة`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 لكل صفحة</SelectItem>
                    <SelectItem value="25">25 لكل صفحة</SelectItem>
                    <SelectItem value="50">50 لكل صفحة</SelectItem>
                    <SelectItem value="100">100 لكل صفحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={`${
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    } sm:hidden`}
                    aria-label="الصفحة السابقة"
                  />
                  <PaginationPrevious
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={`${
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    } hidden sm:flex cursor-pointer`}
                  />
                </PaginationItem>                {/* First page */}
                {totalPages > 0 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      isActive={page === 1}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Left ellipsis */}
                {page > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Pages around current page */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return pageNum !== 1 && 
                         pageNum !== totalPages && 
                         pageNum >= page - 1 && 
                         pageNum <= page + 1 ? (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null;
                })}

                {/* Right ellipsis */}
                {page < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      isActive={page === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className={`${
                      page >= totalPages ? "pointer-events-none opacity-50" : ""
                    } sm:hidden cursor-pointer`}
                    aria-label="الصفحة التالية"
                  />
                  <PaginationNext
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className={`${
                      page >= totalPages ? "pointer-events-none opacity-50" : ""
                    } hidden sm:flex cursor-pointer`}
                  />
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
      <BookingDetails
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        booking={selectedBooking}
        onStatusChange={handleUpdateStatus}
      />
    </div>
  )
}
