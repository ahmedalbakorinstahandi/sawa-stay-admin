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
import { Bell, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "حجز جديد",
      message: "تم إنشاء حجز جديد بواسطة أحمد محمد",
      time: "منذ 5 دقائق",
      read: false,
    },
    {
      id: 2,
      title: "إعلان جديد",
      message: "تم إضافة إعلان جديد بواسطة سارة أحمد",
      time: "منذ 30 دقيقة",
      read: false,
    },
    {
      id: 3,
      title: "تقييم جديد",
      message: "تم إضافة تقييم جديد بواسطة محمد علي",
      time: "منذ ساعة",
      read: true,
    },
    {
      id: 4,
      title: "تحديث النظام",
      message: "تم تحديث النظام إلى الإصدار الجديد",
      time: "منذ 3 ساعات",
      read: true,
    },
  ]);

  // هذا مهم لتجنب مشكلة عدم تطابق الترميز بين الخادم والعميل
  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
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
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-primary/5">
              <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
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
            </div>
            <DropdownMenuSeparator className="m-0" />
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <div className="mb-2 text-4xl">🔔</div>
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex cursor-pointer flex-col items-start p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="font-medium">{notification.title}</div>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">
                          جديد
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground/70">
                      {notification.time}
                    </div>
                  </div>
                ))}
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
