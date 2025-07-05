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
  Ban,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Star,
  MessageSquare,
  User,
  Calendar,
  Home,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { reviewsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Review, ReviewResponse } from "@/types/review";
import { ReviewDetailDialog } from "@/components/reviews/review-detail-dialog";

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [ratingFilter, setRatingFilter] = useState(searchParams.get("rating") || "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(15);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, statusFilter, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (ratingFilter !== "all") {
        params.rating = ratingFilter;
      }

      const response = await reviewsAPI.getAll(params);

      if (response.success) {
        setReviews(response.data || []);
        setTotalCount(response.meta?.total || 0);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        console.error("Failed to fetch reviews:", response.message);
        toast({
          title: "خطأ في جلب التقييمات",
          description: response.message || "فشل في جلب التقييمات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "خطأ في جلب التقييمات",
        description: "حدث خطأ أثناء جلب التقييمات",
        variant: "destructive",
      });
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

  const handleRatingFilter = (value: string) => {
    setRatingFilter(value);
    setCurrentPage(1);
    updateURL({ rating: value, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  const updateURL = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`/reviews?${newSearchParams.toString()}`);
  };

  const handleToggleBlock = async (review: Review) => {
    try {
      const response = review.blocked_at
        ? await reviewsAPI.unblock(review.id)
        : await reviewsAPI.block(review.id);

      if (response.success) {
        setReviews(prev => prev.map(r =>
          r.id === review.id ? { ...r, blocked_at: review.blocked_at ? null : new Date().toISOString() } : r
        ));
        toast({
          title: review.blocked_at ? "تم إلغاء حظر التقييم" : "تم حظر التقييم",
          description: `تم ${review.blocked_at ? 'إلغاء حظر' : 'حظر'} التقييم بنجاح`,
        });
      } else {
        console.error("Failed to toggle review block:", response.message);
        toast({
          title: "خطأ في تعديل حالة التقييم",
          description: response.message || "فشل في تعديل حالة التقييم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling review block:", error);
      toast({
        title: "خطأ في تعديل حالة التقييم",
        description: "حدث خطأ أثناء تعديل حالة التقييم",
        variant: "destructive",
      });
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setDetailDialogOpen(true);
  };

  const handleReviewUpdated = (updatedReview: Review) => {
    setReviews(prev => prev.map(r =>
      r.id === updatedReview.id ? updatedReview : r
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
      />
    ));
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
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              إدارة التقييمات
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة جميع تقييمات المستخدمين في المنصة
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي التقييمات</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {totalCount}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">التقييمات النشطة</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {reviews.filter(r => !r.blocked_at).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950 dark:to-red-900 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">التقييمات المحظورة</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {reviews.filter(r => r.blocked_at).length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950 dark:to-yellow-900 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">متوسط التقييم</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
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
                    placeholder="البحث في التقييمات..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pr-10 h-11"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="حالة التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="blocked">محظورة</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ratingFilter} onValueChange={handleRatingFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <Star className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4 نجوم</SelectItem>
                    <SelectItem value="3">3 نجوم</SelectItem>
                    <SelectItem value="2">2 نجوم</SelectItem>
                    <SelectItem value="1">1 نجمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews Table */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              قائمة التقييمات ({totalCount})
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
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الإقامة</TableHead>
                      <TableHead>التقييم</TableHead>
                      <TableHead>التعليق</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead className="w-24">الحالة</TableHead>
                      <TableHead className="w-32 text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {reviews.map((review, index) => (
                        <motion.tr
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/30 group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-muted">
                                {review.user.avatar_url ? (
                                  <Image
                                    src={review.user.avatar_url}
                                    alt={`${review.user.first_name} ${review.user.last_name}`}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {review.user.first_name} {review.user.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {review.user.country_code} {review.user.phone_number}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-muted">
                                {review.booking.listing.first_image?.url ? (
                                  <Image
                                    src={review.booking.listing.first_image.url}
                                    alt={review.booking.listing.title.ar}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Home className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="max-w-xs">
                                <p className="font-medium text-foreground line-clamp-1">
                                  {review.booking.listing.title.ar}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {review.booking.listing.property_type}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {review.comment ? (
                                <p className="text-sm text-foreground line-clamp-2">
                                  {review.comment}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  بدون تعليق
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={review.blocked_at ? "destructive" : "default"}
                              className={`${review.blocked_at
                                ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                                }`}
                            >
                              {review.blocked_at ? (
                                <>
                                  <Ban className="mr-1 h-3 w-3" />
                                  محظور
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  نشط
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReview(review)}
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleBlock(review)}
                                className={`h-8 w-8 p-0 hover:bg-${review.blocked_at ? 'green' : 'red'}-100 hover:text-${review.blocked_at ? 'green' : 'red'}-600`}
                              >
                                {review.blocked_at ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
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

      {/* Review Detail Dialog */}
      <ReviewDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        review={selectedReview}
        onReviewUpdated={handleReviewUpdated}
      />
    </motion.div>
  );
}
