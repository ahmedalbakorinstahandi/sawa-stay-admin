"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, Menu, Moon, Settings, Sun, User, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import { notificationsAPI } from "@/lib/api";
import { 
  Notification, 
  isNotificationRead, 
  getNotificationType 
} from "@/types/notification";
import Link from "next/link";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // جلب الإشعارات من الباك إند
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await notificationsAPI.getAll(1, 10); // أول 10 إشعارات فقط للـ header
      if (response.success) {
        setNotifications(response.data);
        const unread = response.data.filter((notification: Notification) => !isNotificationRead(notification)).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications in header:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching unread count in header:", error);
    }
  };
  // هذا مهم لتجنب مشكلة عدم تطابق الترميز بين الخادم والعميل
  useEffect(() => {
    setMounted(true);
    // جلب الإشعارات عند تحميل المكون
    fetchNotifications();
  }, []);
  // تحديث الإشعارات كل دقيقة للحصول على أحدث البيانات
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      // تحديث قائمة الإشعارات كل 2 دقيقة
      if (Date.now() % 120000 < 60000) {
        fetchNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      if (response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      if (response.success) {
        const now = new Date().toISOString();
        setNotifications(notifications.map((notification) => ({ 
          ...notification, 
          read_at: notification.read_at || now 
        })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  // دالة للحصول على لون نوع الإشعار
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "text-blue-600";
      case "listing":
        return "text-green-600";
      case "review":
        return "text-yellow-600";
      case "payment":
        return "text-purple-600";
      case "system":
        return "text-red-600";
      case "user":
        return "text-pink-600";
      case "report":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  // دالة للحصول على رمز نوع الإشعار
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "📅";
      case "listing":
        return "🏠";
      case "review":
        return "⭐";
      case "payment":
        return "💰";
      case "system":
        return "⚙️";
      case "user":
        return "👤";
      case "report":
        return "📊";
      default:        return "📢";
    }
  };

  // دالة مساعدة لحساب الوقت النسبي
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-SY');
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.logout();
      window.location.href = "/login";
    }
  };

  // لا تعرض أي شيء حتى يتم تحميل الصفحة بالكامل
  if (!mounted) {
    return null;
  }
  console.log("Header mounted with theme:", theme);
  console.log("Sidebar open state:", sidebarOpen);
  console.log("Auth user:", auth);

  return (
    <header
      className={`sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:h-[60px] theme-transition ${
        !isMobile && sidebarOpen ? "lg:pr-4" : "lg:pr-4"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="focus:outline-none hover:bg-primary/10"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">فتح القائمة</span>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* زر تبديل الوضع الليلي/النهاري */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative hover:bg-primary/10"
          aria-label={
            theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
          }
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">تبديل السمة</span>
        </Button>

        {/* قائمة الإشعارات */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">            <div className="flex items-center justify-between p-4 bg-primary/5">
              <div className="flex items-center gap-2">
                <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchNotifications();
                  }}
                  disabled={loadingNotifications}
                >
                  <RefreshCw className={`h-3 w-3 ${loadingNotifications ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80 hover:bg-transparent"
                  onClick={markAllAsRead}
                >
                  تعيين الكل كمقروء
                </Button>
              )}
            </div><DropdownMenuSeparator className="m-0" />
            {loadingNotifications ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <div className="mb-2 text-xl">⏳</div>
                <p>جارٍ تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <div className="mb-2 text-4xl">🔔</div>
                <p>لا توجد إشعارات</p>
              </div>) : (
              <div className="max-h-[300px] overflow-auto">
                {notifications.map((notification) => {
                  const isRead = isNotificationRead(notification);
                  const notificationType = getNotificationType(notification.notificationable_type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`flex cursor-pointer flex-col items-start p-4 hover:bg-muted/50 transition-colors ${
                        !isRead ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex w-full items-start justify-between">
                        <div className="font-medium">{notification.title}</div>
                        {!isRead && (
                          <Badge variant="default" className="ml-2">
                            جديد
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        {getRelativeTime(notification.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Button variant="outline" className="w-full" asChild>
                <a href="/notifications">عرض كل الإشعارات</a>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                <AvatarImage
                  src={
                    auth?.user?.avatar_url ||
                    auth?.user?.avatar ||
                    "/placeholder.svg"
                  }
                  alt="صورة المستخدم"
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {auth?.user?.first_name?.charAt(0) ||
                    auth?.user?.name?.charAt(0) ||
                    "م"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">
                  {`${auth?.user?.first_name || ""} ${
                    auth?.user?.last_name || ""
                  }` ||
                    auth?.user?.name ||
                    "المستخدم"}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  style={{ direction: "ltr", unicodeBidi: "plaintext" }}
                >
                  {auth?.user?.country_code && auth?.user?.phone_number
                    ? `${auth?.user?.country_code} ${auth?.user?.phone_number}`
                    : auth?.user?.phone || "رقم الهاتف"}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                <User className="ml-2 h-4 w-4 text-primary" />
                الملف الشخصي
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                <Settings className="ml-2 h-4 w-4 text-primary" />
                الإعدادات
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
