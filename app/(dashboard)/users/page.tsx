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
import { UserDialog } from "@/components/users/user-dialog";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { usersAPI } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isUserDeleteDialogOpen, setIsUserDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { toast } = useToast();
  const router = useRouter();

  // جلب المستخدمين من الباك اند
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (roleFilter !== "all") filters.role = roleFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (roleFilter === "host") {
        filters.role = "user";
        filters.id_verified = "approved";
      } else if (roleFilter === "user") {
        filters.role = "user";
        filters.id_verified = "none";
      }
      if (searchTerm) filters.search = searchTerm;
      filters.not_in_role = ["employee"]; // استبعاد المديرين من النتائج

      const response = await usersAPI.getAll(currentPage, perPage, filters);

      if (response.success) {
        setUsers(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشل في جلب بيانات المستخدمين",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في جلب بيانات المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب المستخدمين عند تحميل الصفحة أو تغيير المرشحات
  useEffect(() => {
    fetchUsers();
  }, [currentPage, perPage, roleFilter, statusFilter, searchTerm]);

  // البحث عند الضغط على زر البحث أو Enter
  const handleSearch = () => {
    setCurrentPage(1); // إعادة تعيين الصفحة إلى الأولى عند البحث
    fetchUsers();
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
          <Badge variant="outline" className="border-green-500 text-green-500">
            نشط
          </Badge>
        );

      case "banneded":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            محظور
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string, id_verified: string) => {
    const badgeStyles = {
      user: "border-blue-500 text-blue-500",
      admin: "border-purple-500 text-purple-500",
    };

    if (role === "user") {
      return (
        <Badge
          variant="outline"
          className={id_verified === "approved" ? badgeStyles.user : undefined}
        >
          {id_verified === "approved" ? "مضيف" : "مستخدم"}
        </Badge>
      );
    }

    if (role === "admin") {
      return (
        <Badge variant="outline" className={badgeStyles.admin}>
          مدير
        </Badge>
      );
    }

    return <Badge variant="outline">{role}</Badge>;
  };

  // User handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDeleteDialogOpen(true);
  };

  const handleViewUserDetails = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  const handleUpdateUserStatus = async (user: any, newStatus: string) => {
    try {
      const response = await usersAPI.updateStatus(user.id, newStatus);

      if (response.success) {
        let statusText = "";
        switch (newStatus) {
          case "active":
            statusText = "تفعيل";
            break;
          case "banned":
            statusText = "حظر";
            break;
          default:
            statusText = "تحديث حالة";
            break;
        }

        toast({
          title: `تم ${statusText} المستخدم`,
          description: `تم ${statusText} المستخدم "${user.first_name} ${user.last_name}" بنجاح`,
        });

        fetchUsers(); // إعادة تحميل البيانات
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشل في تحديث حالة المستخدم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشل في تحديث حالة المستخدم",
        variant: "destructive",
      });
    }
  };

  // إنشاء الأحرف الأولى للاسم بشكل آمن
  const getInitials = (user: any) => {
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`;
  };

  // التنقل بين الصفحات
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">المستخدمين</h2>
        <Button onClick={handleAddUser}>
          <Plus className="ml-2 h-4 w-4" /> إضافة مستخدم
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين</CardTitle>
          <CardDescription>
            عرض وإدارة جميع المستخدمين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pr-9"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                بحث
              </Button>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="host">مضيف</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
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
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={
                                  user.avatar_url ||
                                  `/placeholder.svg?height=40&width=40`
                                }
                                alt={`${user.first_name || ""} ${
                                  user.last_name || ""
                                }`}
                              />
                              <AvatarFallback>
                                {getInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{`${user.first_name || ""} ${
                                user.last_name || ""
                              }`}</span>
                              {user.email_verified && (
                                <span className="text-xs text-muted-foreground">
                                  موثق
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell style={{ unicodeBidi: "plaintext" }}>
                          {user.country_code} {user.phone_number}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role, user.id_verified)}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString(
                            "ar-SY"
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">فتح القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewUserDetails(user.id)}
                              >
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              {/* {user.status !== "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateUserStatus(user, "active")
                                  }
                                >
                                  <UserCheck className="ml-2 h-4 w-4" />
                                  تفعيل
                                </DropdownMenuItem>
                              )}
                              {user.status !== "banned" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateUserStatus(user, "banned")
                                  }
                                >
                                  <UserX className="ml-2 h-4 w-4" />
                                  حظر
                                </DropdownMenuItem>
                              )} */}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user)}
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

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <UserDeleteDialog
        open={isUserDeleteDialogOpen}
        onOpenChange={setIsUserDeleteDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
