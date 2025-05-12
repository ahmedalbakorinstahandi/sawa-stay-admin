"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import {
  ArrowDownUp,
  Calendar,
  Download,
  Filter,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  FileText,
  Printer,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [reportType, setReportType] = useState("bookings")
  const [period, setPeriod] = useState("monthly")
  const [viewMode, setViewMode] = useState("charts")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data for bookings by month
  const bookingsByMonth = [
    { name: "يناير", bookings: 65, revenue: 3250000 },
    { name: "فبراير", bookings: 59, revenue: 2950000 },
    { name: "مارس", bookings: 80, revenue: 4000000 },
    { name: "أبريل", bookings: 81, revenue: 4050000 },
    { name: "مايو", bookings: 56, revenue: 2800000 },
    { name: "يونيو", bookings: 55, revenue: 2750000 },
    { name: "يوليو", bookings: 40, revenue: 2000000 },
    { name: "أغسطس", bookings: 70, revenue: 3500000 },
    { name: "سبتمبر", bookings: 90, revenue: 4500000 },
    { name: "أكتوبر", bookings: 110, revenue: 5500000 },
    { name: "نوفمبر", bookings: 120, revenue: 6000000 },
    { name: "ديسمبر", bookings: 130, revenue: 6500000 },
  ]

  // Mock data for user registrations
  const userRegistrations = [
    { name: "يناير", users: 120 },
    { name: "فبراير", users: 132 },
    { name: "مارس", users: 101 },
    { name: "أبريل", users: 134 },
    { name: "مايو", users: 90 },
    { name: "يونيو", users: 70 },
    { name: "يوليو", users: 50 },
    { name: "أغسطس", users: 80 },
    { name: "سبتمبر", users: 100 },
    { name: "أكتوبر", users: 110 },
    { name: "نوفمبر", users: 130 },
    { name: "ديسمبر", users: 150 },
  ]

  // Mock data for listings by city
  const listingsByCity = [
    { name: "دمشق", value: 120, color: "#FF4D6D" },
    { name: "حلب", value: 80, color: "#0096C7" },
    { name: "اللاذقية", value: 70, color: "#FFB703" },
    { name: "حمص", value: 50, color: "#8AC926" },
    { name: "طرطوس", value: 30, color: "#9D4EDD" },
  ]

  // Mock data for revenue by payment method
  const revenueByPaymentMethod = [
    { name: "محفظة", value: 4500000, color: "#FF4D6D" },
    { name: "شام كاش", value: 3000000, color: "#0096C7" },
    { name: "الهرم", value: 2500000, color: "#FFB703" },
    { name: "نقدي", value: 1500000, color: "#8AC926" },
    { name: "عملات رقمية", value: 500000, color: "#9D4EDD" },
  ]

  // Mock data for detailed bookings
  const detailedBookings = [
    {
      id: 1,
      listing: "شقة فاخرة في وسط دمشق",
      guest: "سارة أحمد",
      host: "أحمد محمد",
      startDate: "2023-06-15",
      endDate: "2023-06-20",
      nights: 5,
      guests: 2,
      price: 250000,
      fees: 25000,
      commission: 25000,
      total: 300000,
      status: "completed",
    },
    {
      id: 2,
      listing: "فيلا مع مسبح في اللاذقية",
      guest: "فاطمة حسن",
      host: "محمد علي",
      startDate: "2023-07-10",
      endDate: "2023-07-17",
      nights: 7,
      guests: 4,
      price: 840000,
      fees: 84000,
      commission: 84000,
      total: 1008000,
      status: "completed",
    },
    {
      id: 3,
      listing: "استوديو مفروش في حلب",
      guest: "أحمد محمد",
      host: "خالد عمر",
      startDate: "2023-08-05",
      endDate: "2023-08-10",
      nights: 5,
      guests: 1,
      price: 175000,
      fees: 17500,
      commission: 17500,
      total: 210000,
      status: "pending",
    },
    {
      id: 4,
      listing: "بيت ريفي في طرطوس",
      guest: "محمد علي",
      host: "سارة أحمد",
      startDate: "2023-09-01",
      endDate: "2023-09-05",
      nights: 4,
      guests: 3,
      price: 300000,
      fees: 30000,
      commission: 30000,
      total: 360000,
      status: "completed",
    },
    {
      id: 5,
      listing: "شاليه على البحر في اللاذقية",
      guest: "خالد عمر",
      host: "فاطمة حسن",
      startDate: "2023-10-10",
      endDate: "2023-10-15",
      nights: 5,
      guests: 2,
      price: 450000,
      fees: 45000,
      commission: 45000,
      total: 540000,
      status: "cancelled",
    },
  ]

  // Filter detailed bookings based on search term
  const filteredBookings = detailedBookings.filter(
    (booking) =>
      booking.listing.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm),
  )

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">مكتمل</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">ملغي</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">التقارير</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>تنسيق التصدير</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileSpreadsheet className="ml-2 h-4 w-4" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="ml-2 h-4 w-4" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FilePieChart className="ml-2 h-4 w-4" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            تقارير{" "}
            {reportType === "bookings"
              ? "الحجوزات"
              : reportType === "users"
                ? "المستخدمين"
                : reportType === "listings"
                  ? "الإعلانات"
                  : "الإيرادات"}
          </CardTitle>
          <CardDescription>
            عرض وتحليل بيانات{" "}
            {reportType === "bookings"
              ? "الحجوزات"
              : reportType === "users"
                ? "المستخدمين"
                : reportType === "listings"
                  ? "الإعلانات"
                  : "الإيرادات"}{" "}
            في النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">الحجوزات</SelectItem>
                <SelectItem value="users">المستخدمين</SelectItem>
                <SelectItem value="listings">الإعلانات</SelectItem>
                <SelectItem value="revenue">الإيرادات</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="yearly">سنوي</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <DatePickerWithRange className="w-full" value={dateRange} onChange={setDateRange} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "charts" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none rounded-r-md"
                  onClick={() => setViewMode("charts")}
                >
                  <FileBarChart className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "tables" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none rounded-l-md"
                  onClick={() => setViewMode("tables")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {viewMode === "charts" && (
            <div className="space-y-4">
              {reportType === "bookings" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">الحجوزات الشهرية</CardTitle>
                      <CardDescription>عدد الحجوزات لكل شهر</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsByMonth}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}`, "الحجوزات"]} />
                          <Bar dataKey="bookings" fill="#FF4D6D" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">الإيرادات الشهرية</CardTitle>
                      <CardDescription>إجمالي الإيرادات لكل شهر</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bookingsByMonth}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} SYP`, "الإيرادات"]} />
                          <Line type="monotone" dataKey="revenue" stroke="#FF4D6D" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {reportType === "users" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">تسجيلات المستخدمين</CardTitle>
                    <CardDescription>عدد المستخدمين الجدد لكل شهر</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={userRegistrations}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, "المستخدمين"]} />
                        <Bar dataKey="users" fill="#0096C7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {reportType === "listings" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">الإعلانات حسب المدينة</CardTitle>
                    <CardDescription>توزيع الإعلانات على المدن</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[400px] w-full max-w-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={listingsByCity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {listingsByCity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}`, "الإعلانات"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reportType === "revenue" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">الإيرادات حسب طريقة الدفع</CardTitle>
                    <CardDescription>توزيع الإيرادات على طرق الدفع المختلفة</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[400px] w-full max-w-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByPaymentMethod}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {revenueByPaymentMethod.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} SYP`, "الإيرادات"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {viewMode === "tables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <Button variant="outline" size="sm">
                  <ArrowDownUp className="ml-2 h-4 w-4" />
                  ترتيب
                </Button>
              </div>

              {reportType === "bookings" && (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>قائمة الحجوزات - {filteredBookings.length} حجز</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">رقم الحجز</TableHead>
                        <TableHead>الإعلان</TableHead>
                        <TableHead>الضيف</TableHead>
                        <TableHead>المضيف</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الليالي</TableHead>
                        <TableHead>الضيوف</TableHead>
                        <TableHead className="text-left">السعر</TableHead>
                        <TableHead className="text-left">الرسوم</TableHead>
                        <TableHead className="text-left">العمولة</TableHead>
                        <TableHead className="text-left">الإجمالي</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.id}</TableCell>
                          <TableCell>{booking.listing}</TableCell>
                          <TableCell>{booking.guest}</TableCell>
                          <TableCell>{booking.host}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">من: {booking.startDate}</span>
                              <span className="text-xs text-muted-foreground">إلى: {booking.endDate}</span>
                            </div>
                          </TableCell>
                          <TableCell>{booking.nights}</TableCell>
                          <TableCell>{booking.guests}</TableCell>
                          <TableCell className="text-left">{booking.price} SYP</TableCell>
                          <TableCell className="text-left">{booking.fees} SYP</TableCell>
                          <TableCell className="text-left">{booking.commission} SYP</TableCell>
                          <TableCell className="text-left font-medium">{booking.total} SYP</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={7}>الإجمالي</TableCell>
                        <TableCell className="text-left">
                          {filteredBookings.reduce((sum, booking) => sum + booking.price, 0)} SYP
                        </TableCell>
                        <TableCell className="text-left">
                          {filteredBookings.reduce((sum, booking) => sum + booking.fees, 0)} SYP
                        </TableCell>
                        <TableCell className="text-left">
                          {filteredBookings.reduce((sum, booking) => sum + booking.commission, 0)} SYP
                        </TableCell>
                        <TableCell className="text-left">
                          {filteredBookings.reduce((sum, booking) => sum + booking.total, 0)} SYP
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}

              {reportType === "users" && (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>تسجيلات المستخدمين الشهرية</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الشهر</TableHead>
                        <TableHead className="text-left">عدد المستخدمين الجدد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRegistrations.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-left">{item.users}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>الإجمالي</TableCell>
                        <TableCell className="text-left">
                          {userRegistrations.reduce((sum, item) => sum + item.users, 0)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}

              {reportType === "listings" && (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>الإعلانات حسب المدينة</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المدينة</TableHead>
                        <TableHead className="text-left">عدد الإعلانات</TableHead>
                        <TableHead className="text-left">النسبة المئوية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listingsByCity.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-left">{item.value}</TableCell>
                          <TableCell className="text-left">
                            {((item.value / listingsByCity.reduce((sum, city) => sum + city.value, 0)) * 100).toFixed(
                              1,
                            )}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>الإجمالي</TableCell>
                        <TableCell className="text-left">
                          {listingsByCity.reduce((sum, item) => sum + item.value, 0)}
                        </TableCell>
                        <TableCell className="text-left">100%</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}

              {reportType === "revenue" && (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>الإيرادات حسب طريقة الدفع</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>طريقة الدفع</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                        <TableHead className="text-left">النسبة المئوية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueByPaymentMethod.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-left">{item.value} SYP</TableCell>
                          <TableCell className="text-left">
                            {(
                              (item.value / revenueByPaymentMethod.reduce((sum, method) => sum + method.value, 0)) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>الإجمالي</TableCell>
                        <TableCell className="text-left">
                          {revenueByPaymentMethod.reduce((sum, item) => sum + item.value, 0)} SYP
                        </TableCell>
                        <TableCell className="text-left">100%</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {dateRange?.from
                  ? `${dateRange.from.toLocaleDateString()} - ${
                      dateRange.to ? dateRange.to.toLocaleDateString() : dateRange.from.toLocaleDateString()
                    }`
                  : "جميع الفترات"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              تم تحديث البيانات في {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
