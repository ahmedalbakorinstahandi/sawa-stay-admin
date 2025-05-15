"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, XCircle } from "lucide-react"

// Mock data
const recentBookings = [
  {
    id: 1,
    listing_title: "شقة فاخرة في وسط دمشق",
    guest_name: "سارة أحمد",
    guest_avatar: "/placeholder.svg?height=32&width=32",
    start_date: "2023-06-15T00:00:00Z",
    end_date: "2023-06-20T00:00:00Z",
    status: "confirmed",
    price: 250000,
    currency: "USD",
  },
  {
    id: 2,
    listing_title: "فيلا مع مسبح في اللاذقية",
    guest_name: "فاطمة حسن",
    guest_avatar: "/placeholder.svg?height=32&width=32",
    start_date: "2023-07-10T00:00:00Z",
    end_date: "2023-07-17T00:00:00Z",
    status: "paid",
    price: 840000,
    currency: "USD",
  },
  {
    id: 3,
    listing_title: "استوديو مفروش في حلب",
    guest_name: "أحمد محمد",
    guest_avatar: "/placeholder.svg?height=32&width=32",
    start_date: "2023-08-05T00:00:00Z",
    end_date: "2023-08-10T00:00:00Z",
    status: "waiting_payment",
    price: 175000,
    currency: "USD",
  },
  {
    id: 4,
    listing_title: "بيت ريفي في طرطوس",
    guest_name: "محمد علي",
    guest_avatar: "/placeholder.svg?height=32&width=32",
    start_date: "2023-09-01T00:00:00Z",
    end_date: "2023-09-05T00:00:00Z",
    status: "completed",
    price: 300000,
    currency: "USD",
  },
  {
    id: 5,
    listing_title: "شاليه على البحر في اللاذقية",
    guest_name: "خالد عمر",
    guest_avatar: "/placeholder.svg?height=32&width=32",
    start_date: "2023-10-10T00:00:00Z",
    end_date: "2023-10-15T00:00:00Z",
    status: "cancelled",
    price: 450000,
    currency: "USD",
  },
]

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
    default:
      return <Badge>{status}</Badge>
  }
}

export function RecentBookings() {
  return (
    <div className="space-y-4">
      {recentBookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={booking.guest_avatar || "/placeholder.svg"} alt={booking.guest_name} />
              <AvatarFallback>{booking.guest_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{booking.guest_name}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{booking.listing_title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">
                {booking.price} {booking.currency}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(booking.start_date).toLocaleDateString("ar-SY")} -{" "}
                {new Date(booking.end_date).toLocaleDateString("ar-SY")}
              </div>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>
      ))}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <a href="/bookings">عرض كل الحجوزات</a>
        </Button>
      </div>
    </div>
  )
}
