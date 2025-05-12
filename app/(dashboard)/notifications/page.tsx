"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, CheckCircle, Search, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const initialNotifications = [
  {
    id: 1,
    title: "حجز جديد",
    message: "تم إنشاء حجز جديد بواسطة أحمد محمد",
    type: "booking",
    read: false,
    created_at: "2023-06-15T10:30:00Z",
    user: {
      name: "أحمد محمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 2,
    title: "إعلان جديد",
    message: "تم إضافة إعلان جديد بواسطة سارة أحمد",
    type: "listing",
    read: false,
    created_at: "2023-06-14T14:45:00Z",
    user: {
      name: "سارة أحمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 3,
    title: "تقييم جديد",
    message: "تم إضافة تقييم جديد بواسطة محمد علي",
    type: "review",
    read: true,
    created_at: "2023-06-13T09:15:00Z",
    user: {
      name: "محمد علي",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 4,
    title: "دفع جديد",
    message: "تم استلام دفعة جديدة من فاطمة حسن",
    type: "payment",
    read: true,
    created_at: "2023-06-12T16:20:00Z",
    user: {
      name: "فاطمة حسن",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 5,
    title: "تحديث النظام",
    message: "تم تحديث النظام إلى الإصدار الجديد",
    type: "system",
    read: false,
    created_at: "2023-06-11T11:10:00Z",
    user: {
      name: "النظام",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 6,
    title: "إلغاء حجز",
    message: "تم إلغاء الحجز رقم #123 بواسطة خالد عمر",
    type: "booking",
    read: true,
    created_at: "2023-06-10T08:30:00Z",
    user: {
      name: "خالد عمر",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 7,
    title: "تعديل إعلان",
    message: "تم تعديل الإعلان '��قة فاخرة في وسط دمشق' بواسطة أحمد محمد",
    type: "listing",
    read: false,
    created_at: "2023-06-09T13:45:00Z",
    user: {
      name: "أحمد محمد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 8,
    title: "مستخدم جديد",
    message: "انضم مستخدم جديد إلى المنصة: سمير خالد",
    type: "user",
    read: true,
    created_at: "2023-06-08T10:20:00Z",
    user: {
      name: "سمير خالد",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 9,
    title: "تقرير جديد",
    message: "تم إنشاء تقرير جديد: إحصائيات الحجوزات الشهرية",
    type: "report",
    read: false,
    created_at: "2023-06-07T15:30:00Z",
    user: {
      name: "النظام",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 10,
    title: "تحديث الإعدادات",
    message: "تم تحديث إعدادات النظام بواسطة المدير",
    type: "system",
    read: true,
    created_at: "2023-06-06T09:10:00Z",
    user: {
      name: "المدير",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab !== "all" && activeTab !== "unread" && notification.type === activeTab)

    return matchesSearch && matchesTab
  })

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )

    toast({
      title: "تم تعيين الإشعار كمقروء",
      description: "تم تعيين الإشعار كمقروء بنجاح",
    })
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

    toast({
      title: "تم تعيين جميع الإشعارات كمقروءة",
      description: "تم تعيين جميع الإشعارات كمقروءة بنجاح",
    })
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))

    toast({
      title: "تم حذف الإشعار",
      description: "تم حذف الإشعار بنجاح",
    })
  }

  const deleteAllNotifications = () => {
    setNotifications([])

    toast({
      title: "تم حذف جميع الإشعارات",
      description: "تم حذف جميع الإشعارات بنجاح",
    })
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "booking":
        return "حجز"
      case "listing":
        return "إعلان"
      case "review":
        return "تقييم"
      case "payment":
        return "دفع"
      case "system":
        return "نظام"
      case "user":
        return "مستخدم"
      case "report":
        return "تقرير"
      default:
        return type
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-500"
      case "listing":
        return "bg-green-500"
      case "review":
        return "bg-yellow-500"
      case "payment":
        return "bg-purple-500"
      case "system":
        return "bg-red-500"
      case "user":
        return "bg-pink-500"
      case "report":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإشعارات</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="ml-2 h-4 w-4" />
            تعيين الكل كمقروء
          </Button>
          <Button variant="outline" onClick={deleteAllNotifications} disabled={notifications.length === 0}>
            <Trash2 className="ml-2 h-4 w-4" />
            حذف الكل
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الإشعارات</CardTitle>
          <CardDescription>عرض وإدارة جميع الإشعارات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن إشعار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 md:grid-cols-7">
                <TabsTrigger value="all" className="relative">
                  الكل
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  غير مقروءة
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="booking">الحجوزات</TabsTrigger>
                <TabsTrigger value="listing">الإعلانات</TabsTrigger>
                <TabsTrigger value="payment" className="hidden md:inline-flex">
                  المدفوعات
                </TabsTrigger>
                <TabsTrigger value="user" className="hidden md:inline-flex">
                  المستخدمين
                </TabsTrigger>
                <TabsTrigger value="system" className="hidden md:inline-flex">
                  النظام
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Bell className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">لا توجد إشعارات</h3>
                        <p className="text-sm text-muted-foreground">لا توجد إشعارات متاحة في هذا القسم</p>
                      </div>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative rounded-lg border p-4 transition-colors ${
                          !notification.read ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`${getNotificationTypeColor(
                              notification.type,
                            )} flex h-10 w-10 items-center justify-center rounded-full text-white`}
                          >
                            <Bell className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 px-1.5 text-xs">
                                  جديد
                                </Badge>
                              )}
                              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={notification.user.avatar || "/placeholder.svg"}
                                  alt={notification.user.name}
                                />
                                <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {notification.user.name} -{" "}
                                {new Date(notification.created_at).toLocaleDateString("ar-SY")}{" "}
                                {new Date(notification.created_at).toLocaleTimeString("ar-SY", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                                title="تعيين كمقروء"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
