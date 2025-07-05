"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  total_price: number
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
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")  // Initialize status filter from URL or default to "all"
  const [statusFilter, setStatusFilter] = useState(() => {
    return searchParams.get("status") || "all"
  })
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const { toast } = useToast()
  const [totalCount, setTotalCount] = useState(0)

  // Initialize current page from URL or default to 1
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page")
    return pageParam ? parseInt(pageParam, 10) : 1
  })

  // Update URL when page changes
  const updatePageInURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString())
    } else {
      params.delete("page")
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Update URL when filters change
  const updateFiltersInURL = (newStatusFilter?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newStatusFilter && newStatusFilter !== "all") {
      params.set("status", newStatusFilter)
    } else {
      params.delete("status")
    }
    
    // Reset page to 1 when filters change
    params.delete("page")
    setPage(1)
    
    router.push(`?${params.toString()}`, { scroll: false })
  }

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

  // Update state when URL parameters change
  useEffect(() => {
    const pageParam = searchParams.get("page")
    const statusParam = searchParams.get("status")
    
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10)
      if (pageNumber !== page) {
        setPage(pageNumber)
      }
    } else if (page !== 1) {
      setPage(1)
    }
    
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam)
    } else if (!statusParam && statusFilter !== "all") {
      setStatusFilter("all")
    }
  }, [searchParams])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "accepted":
        return (<Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
          <CheckCircle className="h-3 w-3" />
          تم الدفع
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
    updatePageInURL(pageNumber)
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">الحجوزات</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة جميع حجوزات المنصة</p>
        </div>
        <Button onClick={handleAddBooking} className="bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all">
          <Plus className="ml-2 h-4 w-4" /> إضافة حجز
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.all_count}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الحجوزات في النظام</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">بانتظار الدفع</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تنتظر الدفع</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">مقبولة</CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تم قبولها</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">تم الدفعة</CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تم تأكيدها</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تم إكمالها</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-red-500 to-red-600 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">ملغاة</CardTitle>
                <div className="p-2 bg-red-100 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تم إلغاؤها</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1"></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                  <XCircle className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected_count}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات تم رفضها</p>
            </CardContent>
          </Card>
        </div>
      )}      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">إدارة الحجوزات</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:space-x-reverse p-4 bg-gray-50 rounded-lg border border-gray-100 mb-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-blue-600" />
              <Input
                placeholder="بحث عن حجز..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              updateFiltersInURL(value)
            }}>
              <SelectTrigger className="w-full md:w-[180px] border-gray-200 focus:ring-blue-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusFilter === 'all' ? 'bg-blue-500' :
                      statusFilter === 'pending' ? 'bg-yellow-500' :
                        statusFilter === 'accepted' ? 'bg-blue-500' :
                          statusFilter === 'confirmed' ? 'bg-green-500' :
                            statusFilter === 'completed' ? 'bg-emerald-500' :
                              statusFilter === 'cancelled' ? 'bg-red-500' :
                                'bg-orange-500'
                    }`}></div>
                  <SelectValue placeholder="الحالة" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  بانتظار الدفع
                </SelectItem>
                <SelectItem value="accepted" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  مقبول
                </SelectItem>
                <SelectItem value="confirmed" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  تم الدفع
                </SelectItem>
                <SelectItem value="completed" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  مكتمل
                </SelectItem>
                <SelectItem value="cancelled" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  ملغي
                </SelectItem>
                <SelectItem value="rejected" className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  مرفوض
                </SelectItem>
              </SelectContent>
            </Select>
          </div>            <div className="rounded-lg border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50 border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-gray-700 text-xs">رقم الحجز</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">الإعلان</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">الضيف</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">المضيف</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">التاريخ</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">المبلغ</TableHead>
                    <TableHead className="font-bold text-gray-700 text-xs">الحالة</TableHead>
                    <TableHead className="text-left font-bold text-gray-700 text-xs">الإجراءات</TableHead>
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
                  ) : (filteredBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="hover:bg-gray-50/60 transition-colors border-b border-gray-100 hover:shadow-sm"
                    >
                      <TableCell className="font-medium text-blue-600">#{booking.id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>{booking.listing?.title?.ar || `إعلان #${booking.listing_id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.guest?.avatar_url ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <img src={booking.guest.avatar_url} alt="الضيف" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs">{booking.guest?.first_name?.charAt(0) || '?'}</span>
                            </div>
                          )}
                          <span>
                            {booking.guest
                              ? `${booking.guest.first_name} ${booking.guest.last_name}`
                              : `ضيف #${booking.guest_id}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.host?.avatar_url ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <img src={booking.host.avatar_url} alt="المضيف" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs">{booking.host?.first_name?.charAt(0) || '?'}</span>
                            </div>
                          )}
                          <span>
                            {booking.host
                              ? `${booking.host.first_name} ${booking.host.last_name}`
                              : `مضيف #${booking.host_id}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <div className="flex flex-col text-nowrap">
                          <span className="font-medium">{new Date(booking.start_date).toLocaleDateString("ar-SY")}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-4 h-[1px] bg-gray-300"></div>
                            إلى
                            <div className="w-4 h-[1px] bg-gray-300"></div>
                          </span>
                          <span className="font-medium">{new Date(booking.end_date).toLocaleDateString("ar-SY")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{booking.total_price} <span className="text-xs text-muted-foreground">{booking.currency}</span></div>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                              <Eye className="ml-2 h-4 w-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            {booking.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "accepted")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تم الدفع
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "rejected")}>
                                  <XCircle className="ml-2 h-4 w-4" />
                                  رفض
                                </DropdownMenuItem>
                              </>
                            )}
                            {booking.status === "accepted" && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "confirmed")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تأكيد
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "cancelled")}>
                                  <XCircle className="ml-2 h-4 w-4" />
                                  إلغاء
                                </DropdownMenuItem>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "completed")}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  إكمال
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(booking, "cancelled")}>
                                  <XCircle className="ml-2 h-4 w-4" />
                                  إلغاء
                                </DropdownMenuItem>
                              </>
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
            </div>            <Pagination className="mt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  إجمالي <span className="font-bold text-blue-600">{totalCount}</span> الحجوزات
                </span>                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    setPerPage(parseInt(value, 10));
                    handlePageChange(1); // إعادة تعيين الصفحة إلى الأولى عند تغيير عدد العناصر في الصفحة
                  }}
                >
                  <SelectTrigger className="w-[150px] border-gray-200 focus:ring-blue-500">
                    <SelectValue placeholder={`${perPage} لكل صفحة`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 لكل صفحة</SelectItem>
                    <SelectItem value="25">25 لكل صفحة</SelectItem>
                    <SelectItem value="50">50 لكل صفحة</SelectItem>
                    <SelectItem value="100">100 لكل صفحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={`${page <= 1 ? "pointer-events-none opacity-50" : ""
                      } sm:hidden border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors`}
                    aria-label="الصفحة السابقة"
                  />
                  <PaginationPrevious
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className={`${page <= 1 ? "pointer-events-none opacity-50" : ""
                      } hidden sm:flex cursor-pointer border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors`}
                  />
                </PaginationItem>{/* First page */}                {totalPages > 0 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      isActive={page === 1}
                      className={`cursor-pointer ${page === 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50 transition-colors'}`}
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

                {/* Pages around current page */}                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return pageNum !== 1 &&
                    pageNum !== totalPages &&
                    pageNum >= page - 1 &&
                    pageNum <= page + 1 ? (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={page === pageNum}
                        className={`cursor-pointer ${page === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50 transition-colors'}`}
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

                {/* Last page */}                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      isActive={page === totalPages}
                      className={`cursor-pointer ${page === totalPages ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50 transition-colors'}`}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className={`${page >= totalPages ? "pointer-events-none opacity-50" : ""
                      } sm:hidden cursor-pointer border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors`}
                    aria-label="الصفحة التالية"
                  />
                  <PaginationNext
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className={`${page >= totalPages ? "pointer-events-none opacity-50" : ""
                      } hidden sm:flex cursor-pointer border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors`}
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
