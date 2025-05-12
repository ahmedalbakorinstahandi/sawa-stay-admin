"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, Calendar, CreditCard } from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,853</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="text-green-500 mr-1">+12%</span> منذ الشهر الماضي
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-[75%] rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,245</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="text-green-500 mr-1">+8%</span> منذ الشهر الماضي
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-[60%] rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3,456</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="text-green-500 mr-1">+15%</span> منذ الشهر الماضي
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-[85%] rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,456</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="text-green-500 mr-1">+20%</span> منذ الشهر الماضي
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-[90%] rounded-full bg-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
