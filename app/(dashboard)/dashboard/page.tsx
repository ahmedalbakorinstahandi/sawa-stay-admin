"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UserActivity } from "@/components/dashboard/user-activity";
import { ListingStatus } from "@/components/dashboard/listing-status";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileBarChart,
  RefreshCw,
  Users,
  Home,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">لوحة التحكم</h2>
        <p className="text-muted-foreground">
          مرحباً بك في لوحة تحكم Sawa Stay، هنا يمكنك متابعة جميع الإحصائيات
          والبيانات المهمة.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-background/50 backdrop-blur-sm">
              <TabsTrigger
                value="overview"
                className="transition-all duration-300"
              >
                نظرة عامة
              </TabsTrigger>
              {/* 
              <TabsTrigger value="analytics" className="transition-all duration-300">
                التحليلات
              </TabsTrigger>
              <TabsTrigger value="reports" className="transition-all duration-300">
                التقارير
              </TabsTrigger>
              */}
            </TabsList>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleRefresh}
              >
                <RefreshCw
                  className={`ml-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""
                    }`}
                />
                تحديث
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <TrendingUp className="ml-2 h-5 w-5 text-primary" />
                    نظرة عامة
                  </CardTitle>
                  <CardDescription>
                    إحصائيات الحجوزات والإيرادات للشهر الحالي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Overview />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Home className="ml-2 h-5 w-5 text-primary" />
                    حالة الإعلانات
                  </CardTitle>
                  <CardDescription>توزيع الإعلانات حسب الحالة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ListingStatus />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="ml-2 h-5 w-5 text-primary" />
                    الحجوزات الأخيرة
                  </CardTitle>
                  <CardDescription>آخر 5 حجوزات تمت في النظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBookings />
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    تم تحديث البيانات منذ 5 دقائق
                  </p>
                  <Button variant="ghost" size="sm" className="h-8">
                    عرض الكل
                  </Button>
                </CardFooter>
              </Card>
              <Card className="lg:col-span-3 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="ml-2 h-5 w-5 text-primary" />
                    نشاط المستخدمين
                  </CardTitle>
                  <CardDescription>
                    نشاط المستخدمين خلال الأسبوع الماضي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActivity />
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    تم تحديث البيانات منذ 10 دقائق
                  </p>
                  <Button variant="ghost" size="sm" className="h-8">
                    تفاصيل أكثر
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="ml-2 h-5 w-5 text-primary" />
                    المستخدمين النشطين
                  </CardTitle>
                  <CardDescription>
                    عدد المستخدمين النشطين خلال الشهر الحالي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,248</div>
                  <div className="mt-2 flex items-center text-sm text-green-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>زيادة بنسبة 12% عن الشهر الماضي</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Home className="ml-2 h-5 w-5 text-primary" />
                    إعلانات جديدة
                  </CardTitle>
                  <CardDescription>
                    عدد الإعلانات الجديدة خلال الشهر الحالي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">356</div>
                  <div className="mt-2 flex items-center text-sm text-green-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>زيادة بنسبة 8% عن الشهر الماضي</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="ml-2 h-5 w-5 text-primary" />
                    حجوزات جديدة
                  </CardTitle>
                  <CardDescription>
                    عدد الحجوزات الجديدة خلال الشهر الحالي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">892</div>
                  <div className="mt-2 flex items-center text-sm text-green-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    <span>زيادة بنسبة 15% عن الشهر الماضي</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileBarChart className="ml-2 h-5 w-5 text-primary" />
                  التحليلات المتقدمة
                </CardTitle>
                <CardDescription>تحليلات مفصلة لأداء المنصة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">زيارات المنصة</h4>
                      <span className="text-sm text-muted-foreground">
                        12,546
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-4/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">معدل التحويل</h4>
                      <span className="text-sm text-muted-foreground">
                        8.2%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-1/4 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">معدل الاحتفاظ</h4>
                      <span className="text-sm text-muted-foreground">76%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <p className="text-sm text-muted-foreground">
                  تم تحديث البيانات منذ 3 ساعات
                </p>
                <Button>عرض التقرير الكامل</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <FileBarChart className="ml-2 h-5 w-5 text-primary" />
                    تقارير الإيرادات
                  </CardTitle>
                  <CardDescription>
                    تقارير مفصلة عن إيرادات المنصة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير الإيرادات الشهري
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير الإيرادات الربع سنوي
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير الإيرادات السنوي
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <AlertCircle className="ml-2 h-5 w-5 text-primary" />
                    تقارير النشاط
                  </CardTitle>
                  <CardDescription>تقارير مفصلة عن نشاط المنصة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير نشاط المستخدمين
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير الإعلانات النشطة
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          تقرير الحجوزات المكتملة
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileBarChart className="ml-2 h-5 w-5 text-primary" />
                  إنشاء تقرير مخصص
                </CardTitle>
                <CardDescription>
                  قم بإنشاء تقرير مخصص حسب احتياجاتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">📊</div>
                    <p>اختر نوع التقرير والفترة الزمنية لإنشاء تقرير مخصص</p>
                    <Button className="mt-4">إنشاء تقرير جديد</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
