"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, CheckCircle, Search, Trash2, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notificationsAPI } from "@/lib/api"
import {
  Notification,
  NotificationResponse,
  isNotificationRead,
  getNotificationType
} from "@/types/notification"
import { NotificationTestHelper } from "@/components/notifications/notification-test-helper"
import { NotificationBehaviorTester } from "@/components/notifications/notification-behavior-tester"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  const router = useRouter()

  // وظيفة التعامل مع النقر على الإشعار
  const handleNotificationClick = async (notification: Notification) => {
    // تعيين الإشعار كمقروء إذا لم يكن مقروءاً
    if (!isNotificationRead(notification)) {
      await markAsRead(notification.id)
    }

    // تحديد مسار إعادة التوجيه بناءً على نوع الإشعار
    const notificationType = (notification.notificationable_type)
    let redirectPath = null

    switch (notificationType) {
      case  "general":
        redirectPath = "/"
        break
      case "booking":
        if (notification.notificationable_id) {
          redirectPath = `/bookings/${notification.notificationable_id}`
        }
        break
      case "listing":
        if (notification.notificationable_id) {
          redirectPath = `/listings/${notification.notificationable_id}`
        }
        break
      case "user_verification":
        redirectPath = "/verification"
        break
      case "custom":
        redirectPath = "/"
        break
      case "user":
        if (notification.notificationable_id) {
          redirectPath = `/users/${notification.notificationable_id}`
        }
        break
      default:
        // للأنواع الأخرى أو null، لا نعيد التوجيه
        break
    }

    // إعادة التوجيه إذا كان هناك مسار
    if (redirectPath) {
      router.push(redirectPath)
    }
  }
  // جلب الإشعارات من الباك إند
  const fetchNotifications = async (page = 1, showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const response = await notificationsAPI.getAll(page, 50)
      if (response.success) {
        setNotifications(response.data)
        setCurrentPage(response.meta.current_page)
        setTotalPages(response.meta.last_page)

        // حساب عدد الإشعارات غير المقروءة
        const unread = response.data.filter((notification: Notification) => !isNotificationRead(notification)).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "خطأ",
        description: "فشل في جلب الإشعارات",
        variant: "destructive",
      })
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.count)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  // تحديث البيانات
  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchNotifications(1, false),
      fetchUnreadCount()
    ])
    setRefreshing(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const isRead = isNotificationRead(notification)
    const notificationType = getNotificationType(notification.notificationable_type)

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !isRead) ||
      (activeTab !== "all" && activeTab !== "unread" && notificationType === activeTab)

    return matchesSearch && matchesTab
  })
  const markAsRead = async (id: number) => {
    try {
      const response = await notificationsAPI.markAsRead(id)
      if (response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast({
          title: "تم تعيين الإشعار كمقروء",
          description: "تم تعيين الإشعار كمقروء بنجاح",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تعيين الإشعار كمقروء",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await notificationsAPI.markAllAsRead()
      if (response.success) {
        const now = new Date().toISOString()
        setNotifications(notifications.map((notification) => ({
          ...notification,
          read_at: notification.read_at || now
        })))
        setUnreadCount(0)
        toast({
          title: "تم تعيين جميع الإشعارات كمقروءة",
          description: "تم تعيين جميع الإشعارات كمقروءة بنجاح",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تعيين جميع الإشعارات كمقروءة",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await notificationsAPI.delete(id)
      if (response.success) {
        const deletedNotification = notifications.find(n => n.id === id)
        setNotifications(notifications.filter((notification) => notification.id !== id))

        // تقليل عدد الإشعارات غير المقروءة إذا كان الإشعار المحذوف غير مقروء
        if (deletedNotification && !isNotificationRead(deletedNotification)) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }

        toast({
          title: "تم حذف الإشعار",
          description: "تم حذف الإشعار بنجاح",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الإشعار",
        variant: "destructive",
      })
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const response = await notificationsAPI.deleteAll()
      if (response.success) {
        setNotifications([])
        setUnreadCount(0)
        toast({
          title: "تم حذف جميع الإشعارات",
          description: "تم حذف جميع الإشعارات بنجاح",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف جميع الإشعارات",
        variant: "destructive",
      })
    }
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
      case "general":
        return "عام"
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
      case "general":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جارٍ تحميل الإشعارات...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإشعارات</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          {/* <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="ml-2 h-4 w-4" />
            تعيين الكل كمقروء
          </Button>
          <Button
            variant="outline"
            onClick={deleteAllNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف الكل
          </Button> */}
        </div>
      </div>

      {/* Test helper for notifications */}
      <NotificationBehaviorTester />
      <NotificationTestHelper />

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
              <TabsList className="grid grid-cols-4 md:grid-cols-1">
                <TabsTrigger value="all" className="relative">
                  الكل
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 text-xs  z-10 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                {/* <TabsTrigger value="unread" className="relative">
                  غير مقروءة
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 text-xs  z-10 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
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
                </TabsTrigger> */}
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
                    filteredNotifications.map((notification) => {
                      const isRead = isNotificationRead(notification)
                      const notificationType = getNotificationType(notification.notificationable_type)

                      return (
                        <div
                          key={notification.id}
                          className={`relative rounded-lg border p-4 transition-colors ${!isRead ? "bg-muted/50" : ""
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`${getNotificationTypeColor(
                                notificationType,
                              )} flex h-10 w-10 items-center justify-center rounded-full text-white`}
                            >
                              <Bell className="h-5 w-5" />
                            </div>
                            <div 
                              className="flex-1 cursor-pointer hover:bg-muted/30 rounded-md p-2 -m-2 transition-colors"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{notification.title}</h3>
                                {!isRead && (
                                  <Badge variant="default" className="h-5 px-1.5 text-xs">
                                    جديد
                                  </Badge>
                                )}
                                <Badge variant="outline" className="h-5 px-1.5 text-xs">
                                  {getNotificationTypeLabel(notificationType)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                              <div className="mt-2 flex items-center gap-2">
                                {notification.user && (
                                  <>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={notification.user.avatar || "/placeholder.svg"}
                                        alt={notification.user.name}
                                      />
                                      <AvatarFallback>{notification.user?.name?.charAt(0) || "N/A"}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {notification.user.name} -{" "}
                                    </span>
                                  </>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleDateString("ar-SY")}{" "}
                                  {new Date(notification.created_at).toLocaleTimeString("ar-SY", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  title="تعيين كمقروء"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
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
