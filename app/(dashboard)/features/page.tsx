"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  XCircle,
  ListFilter,
  Star,
  Sparkles,
  Filter,
  Image as ImageIcon,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import { FeatureDialog } from "@/components/features/feature-dialog";
import { FeatureDeleteDialog } from "@/components/features/feature-delete-dialog";
import { featuresAPI, uploadImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Feature, FeatureResponse } from "@/types/features";

export default function FeaturesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const { toast } = useToast();

  // Mock data for development
  const mockFeatures: Feature[] = [
    {
      id: 30,
      name: { ar: "منظفات", en: null },
      icon: "listings/6829cc63066e4.png",
      icon_url: "https://backend.sawastay.com/storage/listings/6829cc63066e4.png",
      description: { ar: "منظفات", en: null },
      is_visible: true
    },
    {
      id: 29,
      name: { ar: "خزانة ملابس", en: null },
      icon: "listings/6829d0947e6c5.png",
      icon_url: "https://backend.sawastay.com/storage/listings/6829d0947e6c5.png",
      description: { ar: "خزانة ملابس", en: null },
      is_visible: true
    },
    {
      id: 28,
      name: { ar: "عدة مطبخ متكاملة", en: null },
      icon: "listings/6829cbde9bd8d.png",
      icon_url: "https://backend.sawastay.com/storage/listings/6829cbde9bd8d.png",
      description: { ar: "عدة مطبخ متكاملة", en: null },
      is_visible: true
    },
    {
      id: 1,
      name: { ar: "واي فاي", en: "Wi-Fi" },
      icon: "listings/6829ca1055fa3.png",
      icon_url: "https://backend.sawastay.com/storage/listings/6829ca1055fa3.png",
      description: { ar: "اتصال لاسلكي بالإنترنت عالي السرعة", en: "High-speed wireless internet access" },
      is_visible: false
    }
  ];

  useEffect(() => {
    fetchFeatures();
  }, [currentPage, searchTerm, statusFilter]);
  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      // Apply search filter
      if (searchTerm) {
        params.search = searchTerm;
      }

      // Apply status filter
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await featuresAPI.getAll(params);

      if (response.success) {
        setFeatures(response.data || []);
        setTotalCount(response.meta?.total || 0);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        console.error("Failed to fetch features:", response.message);
        // Fallback to mock data on error
        setFeatures(mockFeatures);
        setTotalCount(mockFeatures.length);
        setTotalPages(Math.ceil(mockFeatures.length / perPage));
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      // Fallback to mock data on error
      setFeatures(mockFeatures);
      setTotalCount(mockFeatures.length);
      setTotalPages(Math.ceil(mockFeatures.length / perPage));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURL({ search: value, page: "1" });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    updateURL({ status: value, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  const updateURL = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`/features?${newSearchParams.toString()}`);
  };

  const handleEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const handleDelete = (feature: Feature) => {
    setSelectedFeature(feature);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedFeature(null);
    setDialogOpen(true);
  };
  const handleToggleVisibility = async (feature: Feature) => {
    try {
      const response = await featuresAPI.toggleVisibility(feature.id, !feature.is_visible);
      if (response.success) {
        // Update local state
        setFeatures(prev => prev.map(f =>
          f.id === feature.id ? { ...f, is_visible: !f.is_visible } : f
        ));
        toast({
          title: "تم تحديث حالة الظهور",
          description: `تم ${!feature.is_visible ? 'إظهار' : 'إخفاء'} الميزة "${feature.name.ar}"`,
        });
      } else {
        console.error("Failed to toggle feature visibility:", response.message);
        toast({
          title: "خطأ في تحديث حالة الظهور",
          description: response.message || "فشل في تحديث حالة ظهور الميزة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling feature visibility:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              إدارة الميزات             </h1>
            <p className="text-muted-foreground mt-1">
              إدارة جميع الميزات المتاحة في المنصة
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">الميزات المرئية</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {features.filter(f => f.is_visible).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950 dark:to-amber-950 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">الميزات المخفية</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {features.filter(f => !f.is_visible).length}
                  </p>
                </div>
                <EyeOff className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">إجمالي الميزات</p>
                  <p className="text-2xl font-bold text-primary">{totalCount}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-background to-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="البحث في الميزات..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pr-10 h-11"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="حالة الظهور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الميزات</SelectItem>
                    <SelectItem value="visible">مرئية</SelectItem>
                    <SelectItem value="hidden">مخفية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-11 px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                إضافة ميزة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Table */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="flex items-center gap-2">
              <ListFilter className="h-5 w-5" />
              قائمة الميزات ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16">الأيقونة</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="w-24">الحالة</TableHead>
                      <TableHead className="w-32 text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {features.map((feature, index) => (
                        <motion.tr
                          key={feature.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/30 group"
                        >
                          <TableCell>
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-muted group-hover:border-primary/50 transition-colors">
                              <Image
                                src={feature.icon_url}
                                alt={feature.name.ar}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 bg-muted flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">
                                {feature.name.ar}
                              </p>
                              {feature.name.en && (
                                <p className="text-sm text-muted-foreground">
                                  {feature.name.en}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 max-w-xs">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feature.description.ar}
                              </p>
                              {feature.description.en && (
                                <p className="text-xs text-muted-foreground/70 line-clamp-1">
                                  {feature.description.en}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={feature.is_visible ? "default" : "secondary"}
                              className={`${feature.is_visible
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                                } cursor-pointer transition-colors`}
                              onClick={() => handleToggleVisibility(feature)}
                            >
                              {feature.is_visible ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  مرئي
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-1 h-3 w-3" />
                                  مخفي
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(feature)}
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(feature)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  عرض {((currentPage - 1) * perPage) + 1} إلى {Math.min(currentPage * perPage, totalCount)} من {totalCount} نتيجة
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dialogs */}
      <FeatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feature={selectedFeature} onFeatureChange={(feature: Feature) => {
          if (selectedFeature) {
            setFeatures(prev => prev.map(f => f.id === feature.id ? feature : f));
          } else {
            setFeatures(prev => [...prev, feature]);
            setTotalCount(prev => prev + 1);
          }
          // Refresh data from server to ensure consistency
          fetchFeatures();
        }}
      />

      <FeatureDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        feature={selectedFeature} onFeatureDeleted={(featureId: number) => {
          setFeatures(prev => prev.filter(f => f.id !== featureId));
          setTotalCount(prev => prev - 1);
          // Refresh data from server to ensure consistency
          fetchFeatures();
        }}
      />
    </motion.div>
  );
}
