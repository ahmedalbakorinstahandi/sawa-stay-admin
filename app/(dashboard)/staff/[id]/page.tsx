"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Edit,
  GraduationCap,
  Mail,
  Phone,
  Star,
  UserCheck,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/lib/api";
import StaffDetailsLoading from "./loading";
import { StaffDialog } from "@/components/staff/staff-dialog";

interface StaffData {
  id: number;
  first_name: string;
  avatar_url: string | null;
  last_name: string;
  avatar: string | null;
  email: string;
  country_code: string;
  phone_number: string;
  role: string;
  status: string;
  department: string;
  position: string;
  skills: string;
  created_at: string;
}

export default function StaffDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const staffId = parseInt(params.id);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await usersAPI.get(staffId);
        if (response.success) {
          // Check if this user is an employee
          if (response.data.role !== "employee") {
            toast({
              title: "خطأ",
              description: "هذا المستخدم ليس من طاقم العمل",
              variant: "destructive",
            });
            router.push("/staff");
            return;
          }

          setStaffData(response.data);
        } else {
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء جلب بيانات الموظف",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات الموظف",
          variant: "destructive",
        });
      }
    };

    if (staffId) {
      fetchStaffData();
    }
  }, [staffId, toast, router]);

  if (!staffData) {
    return <StaffDetailsLoading />;
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await usersAPI.updateStatus(staffData.id, newStatus);

      if (response.success) {
        setStaffData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: newStatus,
          };
        });

        toast({
          title: "نجاح",
          description: `تم تغيير حالة الموظف إلى ${
            newStatus === "active" ? "نشط" : "محظور"
          }`,
        });

        router.refresh();
      } else {
        throw new Error(response.message || "حدث خطأ أثناء تغيير حالة الموظف");
      }
    } catch (error) {
      console.error("Error updating staff status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير حالة الموظف",
        variant: "destructive",
      });
    }
  };

  const handleEditStaff = () => {
    // أنت بحاجة إلى تنفيذ وظيفة التعديل هنا
    // يمكن أن يتضمن ذلك فتح نافذة حوار لتعديل بيانات الموظف
    toast({
      title: "قيد التطوير",
      description: "وظيفة تعديل بيانات الموظف قيد التطوير",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-500"
          >
            نشط
          </Badge>
        );
      case "banneded":
        return (
          <Badge variant="outline" className="border-rose-500 text-rose-500">
            محظور
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartmentBadge = (department: string) => {
    const departments: Record<string, { color: string; label: string }> = {
      management: {
        color: "border-purple-500 text-purple-500",
        label: "الإدارة",
      },
      support: { color: "border-blue-500 text-blue-500", label: "الدعم" },
      operations: {
        color: "border-amber-500 text-amber-500",
        label: "العمليات",
      },
      finance: { color: "border-green-500 text-green-500", label: "المالية" },
      marketing: { color: "border-pink-500 text-pink-500", label: "التسويق" },
    };

    if (department && departments[department]) {
      return (
        <Badge variant="outline" className={departments[department].color}>
          {departments[department].label}
        </Badge>
      );
    }

    return <Badge variant="outline">قسم آخر</Badge>;
  };

  // إنشاء الأحرف الأولى للاسم بشكل آمن
  const getInitials = () => {
    const firstName = staffData?.first_name || "";
    const lastName = staffData?.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/staff")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            عودة إلى قائمة الموظفين
          </Button>
        </div>

        <div className="flex space-x-2 space-x-reverse">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleEditStaff}
            className="hover:bg-primary/10"
          >
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button> */}
          {staffData.status !== "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("active")}
              className="hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-600"
            >
              <UserCheck className="ml-2 h-4 w-4" />
              تفعيل
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("banneded")}
              className="hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600"
            >
              <UserX className="ml-2 h-4 w-4" />
              حظر
            </Button>
          )}
        </div>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage
                src={
                  staffData.avatar_url || "/placeholder.svg?height=80&width=80"
                }
                alt={`${staffData.first_name} ${staffData.last_name}`}
              />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {staffData.first_name} {staffData.last_name}
                </h2>
                {getStatusBadge(staffData.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Briefcase className="ml-1 h-4 w-4" />
                  <span>{staffData.position || "موظف"}</span>
                </div>
                {/* <div className="flex items-center">
                  <Building className="ml-1 h-4 w-4" />
                  <span>{getDepartmentBadge(staffData.department)}</span>
                </div> */}
                <div className="flex items-center">
                  <Calendar className="ml-1 h-4 w-4" />
                  <span>
                    تاريخ التعيين:{" "}
                    {new Date(staffData.created_at).toLocaleDateString("ar-SY")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full justify-start bg-primary/5">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            الملف الشخصي
          </TabsTrigger>
          {/* <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            المهام
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            الأداء
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            المستندات
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="ml-2 h-5 w-5 text-primary" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      الاسم الأول
                    </p>
                    <p>{staffData.first_name || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      الاسم الأخير
                    </p>
                    <p>{staffData.last_name || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      البريد الإلكتروني
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <p style={{ direction: "ltr", unicodeBidi: "embed" }}>
                        {staffData.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      رقم الهاتف
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <p style={{ direction: "ltr" }}>
                        {staffData.country_code} {staffData.phone_number || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* <Separator /> */}
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">المنصب</p>
                    <p>{staffData.position || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">القسم</p>
                    <div>{getDepartmentBadge(staffData.department)}</div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="ml-2 h-5 w-5 text-primary" />
                  المهارات والخبرات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">المهارات</p>
                  <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
                    {staffData.skills || "لم يتم إضافة مهارات"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">التقييم</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5"
                        fill={star <= 4 ? "#FFD700" : "none"}
                        stroke={star <= 4 ? "#FFD700" : "currentColor"}
                      />
                    ))}
                    <span className="ml-2">4.0/5</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المهام المسندة</CardTitle>
              <CardDescription>قائمة المهام المسندة للموظف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">
                  لا توجد مهام مسندة حالياً
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  هذه الميزة قيد التطوير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقييم الأداء</CardTitle>
              <CardDescription>إحصائيات وبيانات عن أداء الموظف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">
                  لا تتوفر بيانات أداء حالياً
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  هذه الميزة قيد التطوير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المستندات</CardTitle>
              <CardDescription>مستندات ووثائق متعلقة بالموظف</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">لا توجد مستندات حالياً</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  هذه الميزة قيد التطوير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
