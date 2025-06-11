"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StaffDialog } from "@/components/staff/staff-dialog";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffDeleteDialog } from "@/components/staff/staff-delete-dialog";

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isStaffDeleteDialogOpen, setIsStaffDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const { toast } = useToast();
  const router = useRouter();

  // جلب طاقم العمل من الباك اند مع فلتر role=employee
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const filters: any = {
        role: "employee", // فلترة لجلب طاقم العمل فقط
      };

      if (departmentFilter !== "all") filters.department = departmentFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await usersAPI.getAll(currentPage, perPage, filters);

      if (response.success) {
        setStaffMembers(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشل في جلب بيانات طاقم العمل",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في جلب بيانات طاقم العمل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب طاقم العمل عند تحميل الصفحة أو تغيير المرشحات
  useEffect(() => {
    fetchStaff();
  }, [currentPage, perPage, departmentFilter, statusFilter, searchTerm]);

  // البحث عند الضغط على زر البحث أو Enter
  const handleSearch = () => {
    setCurrentPage(1); // إعادة تعيين الصفحة إلى الأولى عند البحث
    fetchStaff();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
        return <Badge>{status}</Badge>;
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

  // Staff handlers
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsStaffDialogOpen(true);
  };

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsStaffDialogOpen(true);
  };

  const handleDeleteStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsStaffDeleteDialogOpen(true);
  };

  const handleViewStaffDetails = (staffId: number) => {
    router.push(`/staff/${staffId}`);
  };

  const handleUpdateStaffStatus = async (staff: any, newStatus: string) => {
    try {
      const response = await usersAPI.updateStatus(staff.id, newStatus);

      if (response.success) {
        let statusText = "";
        switch (newStatus) {
          case "active":
            statusText = "تفعيل";
            break;
          case "banneded":
            statusText = "حظر";
            break;
          default:
            statusText = "تحديث حالة";
            break;
        }

        toast({
          title: `تم ${statusText} الموظف`,
          description: `تم ${statusText} الموظف "${staff.first_name} ${staff.last_name}" بنجاح`,
        });

        fetchStaff(); // إعادة تحميل البيانات
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشل في تحديث حالة الموظف",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في تحديث حالة الموظف",
        variant: "destructive",
      });
    }
  };

  // إنشاء الأحرف الأولى للاسم بشكل آمن
  const getInitials = (staff: any) => {
    const firstName = staff?.first_name || "";
    const lastName = staff?.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  // التنقل بين الصفحات
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">طاقم العمل</h2>
        <Button
          onClick={handleAddStaff}
          className="gradient-primary hover:opacity-90"
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة موظف
        </Button>
      </div>

      <Card className="border-l-4 border-l-primary shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            إدارة طاقم العمل
          </CardTitle>
          <CardDescription>
            عرض وإدارة جميع أعضاء طاقم العمل في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن موظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pr-9"
                />
              </div>
              <Button
                onClick={handleSearch}
                variant="secondary"
                className="shadow-sm"
              >
                بحث
              </Button>
              {/* <Select
                value={departmentFilter}
                onValueChange={(value) => {
                  setDepartmentFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="management">الإدارة</SelectItem>
                  <SelectItem value="support">الدعم</SelectItem>
                  <SelectItem value="operations">العمليات</SelectItem>
                  <SelectItem value="finance">المالية</SelectItem>
                  <SelectItem value="marketing">التسويق</SelectItem>
                </SelectContent>
              </Select> */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="banneded">محظور</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    {/* <TableHead>القسم</TableHead> */}
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التعيين</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // عرض هيكل تحميل
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={`loading-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : staffMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffMembers.map((staff) => (
                      <TableRow
                        key={staff.id}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="border-2 border-primary/20">
                              <AvatarImage
                                src={
                                  staff.avatar_url ||
                                  `/placeholder.svg?height=40&width=40`
                                }
                                alt={`${staff.first_name || ""} ${
                                  staff.last_name || ""
                                }`}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(staff)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{`${staff.first_name || ""} ${
                                staff.last_name || ""
                              }`}</span>
                              <span className="text-xs text-muted-foreground">
                                {staff.position || "موظف"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell
                          style={{
                            unicodeBidi: "plaintext",
                            textAlign: "right",
                          }}
                        >
                          {staff.country_code} {staff.phone_number}
                        </TableCell>
                        {/* <TableCell>
                          {getDepartmentBadge(staff.department)}
                        </TableCell> */}
                        <TableCell>{getStatusBadge(staff.status)}</TableCell>
                        <TableCell>
                          {new Date(staff.created_at).toLocaleDateString(
                            "ar-SY"
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary/10"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">فتح القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 border-primary/20"
                            >
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewStaffDetails(staff.id)}
                                className="hover:bg-primary/10"
                              >
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditStaff(staff)}
                                className="hover:bg-primary/10"
                              >
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              {staff.status !== "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStaffStatus(staff, "active")
                                  }
                                  className="hover:bg-green-100 dark:hover:bg-green-900/20"
                                >
                                  <UserCheck className="ml-2 h-4 w-4 text-green-500" />
                                  تفعيل
                                </DropdownMenuItem>
                              )}
                              {staff.status !== "banneded" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStaffStatus(staff, "banneded")
                                  }
                                  className="hover:bg-red-100 dark:hover:bg-red-900/20"
                                >
                                  <UserX className="ml-2 h-4 w-4 text-red-500" />
                                  حظر
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteStaff(staff)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      <StaffDialog
        open={isStaffDialogOpen}
        onOpenChange={setIsStaffDialogOpen}
        staff={selectedStaff}
        onSuccess={fetchStaff}
      />

      <StaffDeleteDialog
        open={isStaffDeleteDialogOpen}
        onOpenChange={setIsStaffDeleteDialogOpen}
        staff={selectedStaff}
        onSuccess={fetchStaff}
      />
    </div>
  );
}
