"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex-1 w-full p-4 transition-all duration-300 ${
              sidebarOpen ? "lg:mr-64" : "lg:mr-0"
            }`}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </AuthGuard>
  );
}
