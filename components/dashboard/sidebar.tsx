"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  User,
  X,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Star,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const routes = [
    {
      label: "لوحة التحكم",
      icon: <LayoutDashboard className="ml-2 h-5 w-5" />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },

    {
      label: "المستخدمين",
      icon: <Users className="ml-2 h-5 w-5" />,
      href: "/users",
      active: pathname === "/users",
    },
    {
      label: "طاقم العمل",
      icon: <Briefcase className="ml-2 h-5 w-5" />,
      href: "/staff",
      active: pathname === "/staff",
    },
    {
      label: "الإعلانات",
      icon: <Home className="ml-2 h-5 w-5" />,
      href: "/listings",
      active: pathname === "/listings",
    },    {
      label: "أنواع المنازل",
      icon: <Home className="ml-2 h-5 w-5" />,
      href: "/housetypes",
      active: pathname === "/housetypes",
    },
    {
      label: "الميزات ",
      icon: <Star className="ml-2 h-5 w-5" />,
      href: "/features",
      active: pathname === "/features",
    },
    {
      label: "الحجوزات",
      icon: <BookOpen className="ml-2 h-5 w-5" />,
      href: "/bookings",
      active: pathname === "/bookings",
    },
    {
      label: "التقييمات",
      icon: <MessageSquare className="ml-2 h-5 w-5" />,
      href: "/reviews",
      active: pathname === "/reviews",
    },
    {
      label: "المعاملات المالية",
      icon: <CreditCard className="ml-2 h-5 w-5" />,
      href: "/transactions",
      active: pathname === "/transactions",
    },
    {
      label: "التقارير",
      icon: <BarChart3 className="ml-2 h-5 w-5" />,
      href: "/reports",
      active: pathname === "/reports",
    },
    {
      label: "الإشعارات",
      icon: <Bell className="ml-2 h-5 w-5" />,
      href: "/notifications",
      active: pathname === "/notifications",
    },
    {
      label: "الملف الشخصي",
      icon: <User className="ml-2 h-5 w-5" />,
      href: "/profile",
      active: pathname === "/profile",
    },
    {
      label: "الإعدادات",
      icon: <Settings className="ml-2 h-5 w-5" />,
      href: "/settings",
      active: pathname === "/settings",
    },
  ];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: 300, opacity: 0 },
  };

  const sidebarContent = (
    <div className="flex h-full flex-col border-l theme-transition">
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={() => onOpenChange(false)}
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image
              src="/logo.png"
              alt="Sawa Stay"
              width={32}
              height={32}
              className="h-8 w-auto animate-pulse-slow"
            />
          </div>
          <span className="text-lg font-bold gradient-text">Sawa Stay</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden hover:bg-primary/10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">إغلاق</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, index) => (
            <motion.div
              key={route.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={route.href}
                onClick={() => isMobile && onOpenChange(false)}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover-scale",
                  route.active
                    ? "gradient-primary text-white shadow-md"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                {route.icon}
                {route.label}
                {route.active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="mr-auto h-2 w-2 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start hover:gradient-destructive hover:text-white transition-all duration-300"
          asChild
        >
          <Button type="button" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </Button>
      </div>
    </div>
  );

  // For mobile, use Sheet component
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="p-0 w-[80%] max-w-[300px] glass-effect"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, render the sidebar directly with animation
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-20 w-64 bg-background/80 backdrop-blur-md theme-transition"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsible button */}
      {!isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onOpenChange(!open)}
          className={`fixed top-1/2 right-0 z-30 -translate-y-1/2 rounded-l-lg p-1.5 shadow-md transition-all duration-300 ${
            open ? "right-64" : "right-0"
          } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
        >
          {open ? (
            <ChevronRight className="h-5 w-5 text-primary" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-primary" />
          )}
        </motion.button>
      )}
    </>
  );
}
