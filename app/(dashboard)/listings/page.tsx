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
import {
  CheckCircle,
  Edit,
  Eye,
  Home,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Search,
  Trash2,
  XCircle,
  ListFilter,
  Tag,
  Heart,
  Loader2,
  RefreshCcw,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { ListingDialog } from "@/components/listings/listing-dialog";
import { ListingDeleteDialog } from "@/components/listings/listing-delete-dialog";
import { CategoryDialog } from "@/components/listings/category-dialog";
import { CategoryDeleteDialog } from "@/components/listings/category-delete-dialog";
import { FeatureDialog } from "@/components/listings/feature-dialog";
import { FeatureDeleteDialog } from "@/components/listings/feature-delete-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ro } from "date-fns/locale";

export default function ListingsPage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState<
    { id: number; name: { ar: string } }[]
  >([]);
  const [features, setFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);
  const [isListingDeleteDialogOpen, setIsListingDeleteDialogOpen] =
    useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] =
    useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [isFeatureDeleteDialogOpen, setIsFeatureDeleteDialogOpen] =
    useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);  const [isLoading, setIsLoading] = useState(true);
  const [perPage, setPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize current page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  // Update URL when page changes
  const updatePageInURL = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Function to update current page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePageInURL(page);
  };

  // Fetch listings
  useEffect(() => {
    fetchListings();
    fetchHouseTypes();
  }, [
    currentPage,
    statusFilter,
    propertyTypeFilter,
    categoryFilter,
    perPage,
    searchTerm,
  ]);
  // Fetch categories and features when the tab changes

  // Fetch categories
  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  // Fetch features
  useEffect(() => {
    if (activeTab === "features") {
      fetchFeatures();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", perPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (propertyTypeFilter !== "all") {
        params.append("property_type", propertyTypeFilter);
      }

      if (categoryFilter !== "all") {
        params.append("house_type_id", categoryFilter);
      }

      const response = await api.get(`/admin/listings?${params.toString()}`);
      // console.log("response", response);

      if (response.data?.success) {
        setListings(response.data?.data || []);
        setTotalPages(response.data?.meta?.last_page || 1);
        setTotalCount(response.data?.meta?.total || 0);
      } else {
        toast({
          title: "خطأ في جلب الإعلانات",
          description: "حدث خطأ أثناء جلب الإعلانات. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "خطأ في جلب الإعلانات",
        description: "حدث خطأ أثناء جلب الإعلانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // fetch house-types
  const [houseTypes, setHouseTypes] = useState<
    { id: number; name: { ar: string } }[]
  >([]);
  const fetchHouseTypes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/house-types");
      console.log("response", response);
      if (response.data?.success) {
        setHouseTypes(response.data.data || []);
      } else {
        toast({
          title: "خطأ في جلب أنواع المنازل",
          description:
            "حدث خطأ أثناء جلب أنواع المنازل. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching house types:", error);
      toast({
        title: "خطأ في جلب أنواع المنازل",
        description: "حدث خطأ أثناء جلب أنواع المنازل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/categories");
      console.log("response", response);

      if (response.data?.success) {
        setCategories(response.data.data || []);
      } else {
        toast({
          title: "خطأ في جلب التصنيفات",
          description: "حدث خطأ أثناء جلب التصنيفات. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "خطأ في جلب التصنيفات",
        description: "حدث خطأ أثناء جلب التصنيفات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/features");

      if (response.data?.success) {
        setFeatures(response.data?.data || []);
      } else {
        toast({
          title: "خطأ في جلب الميزات",
          description: "حدث خطأ أثناء جلب الميزات. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      toast({
        title: "خطأ في جلب الميزات",
        description: "حدث خطأ أثناء جلب الميزات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-green-100 text-green-800"
          >
            <CheckCircle className="h-3 w-3" />
            معتمد
          </Badge>
        );
      case "in_review":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
          >
            <Eye className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100 text-gray-800"
          >
            <PauseCircle className="h-3 w-3" />
            مسودة
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 bg-red-100 text-red-800"
          >
            <XCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-blue-100 text-blue-800"
          >
            <PauseCircle className="h-3 w-3" />
            متوقف
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "House":
        return <Home className="h-4 w-4 ml-1" />;
      case "Apartment":
        return <Home className="h-4 w-4 ml-1" />;
      case "Guesthouse":
        return <Home className="h-4 w-4 ml-1" />;
      default:
        return <Home className="h-4 w-4 ml-1" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case "House":
        return "منزل";
      case "Apartment":
        return "شقة";
      case "Guesthouse":
        return "غرفة مشتركة";
      default:
        return type;
    }
  };

  const getCategoryById = (id: number) => {
    const category = categories.find((category: any) => category.id === id);
    return category && category.name ? category.name.ar : "غير محدد";
  };

  // Listing handlers
  const handleAddListing = () => {
    setSelectedListing(null);
    setIsListingDialogOpen(true);
  };

  const handleEditListing = (listing: any) => {
    setSelectedListing(listing);
    setIsListingDialogOpen(true);
  };

  const handleDeleteListing = (listing: any) => {
    setSelectedListing(listing);
    setIsListingDeleteDialogOpen(true);
  };

  const handleSaveListing = async (listingData: any) => {
    try {
      if (selectedListing) {
        // Update existing listing
        const response = await api.put(
          `/admin/listings/${selectedListing.id}`,
          JSON.stringify(listingData),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success) {
          toast({
            title: "تم تحديث الإعلان",
            description: `تم تحديث الإعلان "${listingData.title.ar}" بنجاح`,
          });
          fetchListings();
        } else {
          toast({
            title: "خطأ في تحديث الإعلان",
            description:
              response.data?.message ||
              "حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        // Add new listing
        const response = await api.post("/admin/listings", listingData);

        if (response.data?.success) {
          toast({
            title: "تم إضافة الإعلان",
            description: `تم إضافة الإعلان "${listingData.title.ar}" بنجاح`,
          });
          fetchListings();
        } else {
          toast({
            title: "خطأ في إضافة الإعلان",
            description:
              response.data?.message ||
              "حدث خطأ أثناء إضافة الإعلان. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving listing:", error);
      toast({
        title: "خطأ في حفظ الإعلان",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حفظ الإعلان. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListingConfirm = async () => {
    if (!selectedListing) return;

    try {
      const response = await api.delete(
        `/admin/listings/${selectedListing.id}`
      );

      if (response.data?.success) {
        toast({
          title: "تم حذف الإعلان",
          description: `تم حذف الإعلان بنجاح`,
        });
        fetchListings();
      } else {
        toast({
          title: "خطأ في حذف الإعلان",
          description:
            response.data?.message ||
            "حدث خطأ أثناء حذف الإعلان. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast({
        title: "خطأ في حذف الإعلان",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حذف الإعلان. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateListingStatus = async (listing: any, newStatus: string) => {
    try {
      const response = await api.put(`/admin/listings/${listing.id}`, {
        status: newStatus,
      });

      if (response.data?.success) {
        let statusText = "";
        switch (newStatus) {
          case "approved":
            statusText = "اعتماد";
            break;
          case "paused":
            statusText = "إيقاف";
            break;
          case "rejected":
            statusText = "رفض";
            break;
          default:
            statusText = "تحديث حالة";
            break;
        }

        toast({
          title: `تم ${statusText} الإعلان`,
          description: `تم ${statusText} الإعلان بنجاح`,
        });
        fetchListings();
      } else {
        toast({
          title: "خطأ في تحديث حالة الإعلان",
          description:
            response.data?.message ||
            "حدث خطأ أثناء تحديث حالة الإعلان. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating listing status:", error);
      toast({
        title: "خطأ في تحديث حالة الإعلان",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء تحديث حالة الإعلان. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setIsCategoryDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const response = await api.put(
          `/admin/categories/${selectedCategory.id}`,
          categoryData
        );

        if (response.data?.success) {
          toast({
            title: "تم تحديث التصنيف",
            description: `تم تحديث التصنيف بنجاح`,
          });
          fetchCategories();
        } else {
          toast({
            title: "خطأ في تحديث التصنيف",
            description:
              response.data?.message ||
              "حدث خطأ أثناء تحديث التصنيف. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        // Add new category
        const response = await api.post("/admin/categories", categoryData);

        if (response.data?.success) {
          toast({
            title: "تم إضافة التصنيف",
            description: `تم إضافة التصنيف بنجاح`,
          });
          fetchCategories();
        } else {
          toast({
            title: "خطأ في إضافة التصنيف",
            description:
              response.data?.message ||
              "حدث خطأ أثناء إضافة التصنيف. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "خطأ في حفظ التصنيف",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حفظ التصنيف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!selectedCategory) return;

    try {
      const response = await api.delete(
        `/admin/categories/${selectedCategory.id}`
      );

      if (response.data?.success) {
        toast({
          title: "تم حذف التصنيف",
          description: `تم حذف التصنيف بنجاح`,
        });
        fetchCategories();
      } else {
        toast({
          title: "خطأ في حذف التصنيف",
          description:
            response.data?.message ||
            "حدث خطأ أثناء حذف التصنيف. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "خطأ في حذف التصنيف",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حذف التصنيف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // Feature handlers
  const handleAddFeature = () => {
    setSelectedFeature(null);
    setIsFeatureDialogOpen(true);
  };

  const handleEditFeature = (feature: any) => {
    setSelectedFeature(feature);
    setIsFeatureDialogOpen(true);
  };

  const handleDeleteFeature = (feature: any) => {
    setSelectedFeature(feature);
    setIsFeatureDeleteDialogOpen(true);
  };

  const handleSaveFeature = async (featureData: any) => {
    try {
      if (selectedFeature) {
        // Update existing feature
        const response = await api.put(
          `/admin/features/${selectedFeature.id}`,
          featureData
        );

        if (response.data?.success) {
          toast({
            title: "تم تحديث الميزة",
            description: `تم تحديث الميزة بنجاح`,
          });
          setIsFeatureDialogOpen(false);
          fetchFeatures();
        } else {
          toast({
            title: "خطأ في تحديث الميزة",
            description:
              response.data?.message ||
              "حدث خطأ أثناء تحديث الميزة. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        // Add new feature
        const response = await api.post("/admin/features", featureData);

        if (response.data?.success) {
          toast({
            title: "تم إضافة الميزة",
            description: `تم إضافة الميزة بنجاح`,
          });
          fetchFeatures();
          setIsFeatureDialogOpen(false);
        } else {
          toast({
            title: "خطأ في إضافة الميزة",
            description:
              response.data?.message ||
              "حدث خطأ أثناء إضافة الميزة. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error saving feature:", error);
      toast({
        title: "خطأ في حفظ الميزة",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حفظ الميزة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeatureConfirm = async () => {
    if (!selectedFeature) return;

    try {
      const response = await api.delete(
        `/admin/features/${selectedFeature.id}`
      );

      if (response.data?.success) {
        toast({
          title: "تم حذف الميزة",
          description: `تم حذف الميزة بنجاح`,
        });
        fetchFeatures();
      } else {
        toast({
          title: "خطأ في حذف الميزة",
          description:
            response.data?.message ||
            "حدث خطأ أثناء حذف الميزة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting feature:", error);
      toast({
        title: "خطأ في حذف الميزة",
        description:
          error.response?.data?.message ||
          "حدث خطأ أثناء حذف الميزة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get the first image URL from a listing
  const getListingImageUrl = (listing: any) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0].url;
    }
    return "/placeholder.svg?height=80&width=120";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الإعلانات</h2>
        <div className="flex gap-2">
          {activeTab === "listings" && (
            <Button onClick={() => router.push("/listings/add")}>
              <Plus className="ml-2 h-4 w-4" /> إضافة إعلان
            </Button>
          )}
          {activeTab === "categories" && (
            <Button onClick={handleAddCategory}>
              <Plus className="ml-2 h-4 w-4" /> إضافة تصنيف
            </Button>
          )}
          {activeTab === "features" && (
            <Button onClick={handleAddFeature}>
              <Plus className="ml-2 h-4 w-4" /> إضافة ميزة
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>التصنيفات</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1">
            <ListFilter className="h-4 w-4" />
            <span>الميزات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  إدارة الإعلانات
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setCurrentPage(1);
                      fetchListings();
                    }}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    تحديث البيانات
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                عرض وإدارة جميع الإعلانات في النظام
              </CardDescription>
              {/* add btn for refrech data  */}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:space-x-reverse">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث عن إعلان..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="in_review">قيد المراجعة</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="paused">متوقف</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={propertyTypeFilter}
                    onValueChange={setPropertyTypeFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="نوع العقار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="House">منزل</SelectItem>
                      <SelectItem value="Apartment">شقة</SelectItem>
                      <SelectItem value="Guesthouse">غرفة مشتركة</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التصنيفات</SelectItem>
                      {houseTypes.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name?.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الإعلان</TableHead>
                        <TableHead>المضيف</TableHead>
                        <TableHead>نوع العقار</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>العمولة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span className="mr-2">جاري التحميل...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : listings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            لا توجد نتائج.
                          </TableCell>
                        </TableRow>
                      ) : (
                        listings.map((listing: any) => (
                          <TableRow key={listing.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={
                                    getListingImageUrl(listing) ||
                                    "/placeholder.svg"
                                  }
                                  alt={listing.title?.ar || ""}
                                  width={80}
                                  priority
                                  height={60}
                                  className="h-12 w-16 rounded-md object-cover"
                                />
                                <div className="max-w-[200px] truncate">
                                  {listing.title?.ar}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {listing.host
                                ? `${listing.host.first_name} ${listing.host.last_name}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getPropertyTypeIcon(listing.property_type)}
                                {getPropertyTypeLabel(listing.property_type)}
                              </div>
                            </TableCell>

                            <TableCell>
                              {listing.price} {listing.currency}
                            </TableCell>
                            <TableCell>
                              {listing.commission} {listing.currency}
                            </TableCell>

                            <TableCell className="text-nowrap">
                              {getStatusBadge(listing.status)}
                            </TableCell>
                            <TableCell>
                              {new Date(listing.created_at).toLocaleDateString(
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
                                  <DropdownMenuLabel>
                                    الإجراءات
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/listings/${listing.id}`)
                                    }
                                  >
                                    <Eye className="ml-2 h-4 w-4" />
                                    عرض
                                  </DropdownMenuItem>
                                  {/* go to listings/id/rules */}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/listings/${listing.id}/rules`
                                      )
                                    }
                                  >
                                    <ListFilter className="ml-2 h-4 w-4" />
                                    إدارة القوانين
                                  </DropdownMenuItem>
                                  {/* go to listings/id/price */}

                                  {/* go to listings/id/celander */}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/listings/${listing.id}/calendar`
                                      )
                                    }
                                  >
                                    <Calendar className="ml-2 h-4 w-4" />
                                    ادارة التواقيت
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/listings/${listing.id}/edit`
                                      )
                                    }
                                  >
                                    <Edit className="ml-2 h-4 w-4" />
                                    تعديل
                                  </DropdownMenuItem>
                                  {listing.status !== "approved" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateListingStatus(
                                          listing,
                                          "approved"
                                        )
                                      }
                                    >
                                      <CheckCircle className="ml-2 h-4 w-4" />
                                      اعتماد
                                    </DropdownMenuItem>
                                  )}
                                  {listing.status === "approved" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateListingStatus(
                                          listing,
                                          "paused"
                                        )
                                      }
                                    >
                                      <PauseCircle className="ml-2 h-4 w-4" />
                                      إيقاف
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteListing(listing)}
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
                  <Pagination className="w-full">
                    <div className="flex flex-col xs:flex-row sm:flex-row gap-4 items-start sm:items-center justify-between  mb-4">
                      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        إجمالي {totalCount} الاعلانات
                      </span>
                      <Select
                        value={perPage.toString()}
                        onValueChange={(value) => {
                          setPerPage(parseInt(value, 10));
                          handlePageChange(1);
                        }}
                      >
                        <SelectTrigger className="w-[120px] sm:w-[150px] text-xs sm:text-sm">
                          <SelectValue placeholder={`${perPage} لكل صفحة`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 لكل صفحة</SelectItem>
                          <SelectItem value="25">25 لكل صفحة</SelectItem>
                          <SelectItem value="50">50 لكل صفحة</SelectItem>
                          <SelectItem value="100">100 لكل صفحة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <PaginationContent className="flex-wrap justify-center">
                      <PaginationItem>                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1)
                              handlePageChange(currentPage - 1);
                          }}
                          className={`${currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                            } sm:hidden`}
                          aria-label="الصفحة السابقة"
                        />                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1)
                              handlePageChange(currentPage - 1);
                          }}
                          className={`${currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                            } hidden sm:flex`}
                        />
                      </PaginationItem>

                      {/* First page */}
                      {totalPages > 0 && (
                        <PaginationItem>                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                            isActive={currentPage === 1}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Left ellipsis */}
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Pages around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page !== 1 &&
                            page !== totalPages &&
                            page >= currentPage - 1 &&
                            page <= currentPage + 1
                        )
                        .map((page) => (
                          <PaginationItem key={page}>                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                      {/* Right ellipsis */}
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {/* Last page */}
                      {totalPages > 1 && (
                        <PaginationItem>                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}                      <PaginationItem>                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              handlePageChange(currentPage + 1);
                          }}
                          className={`${currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                            } sm:hidden`}
                          aria-label="الصفحة التالية"
                        />                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              handlePageChange(currentPage + 1);
                          }}
                          className={`${currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                            } hidden sm:flex`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>إدارة التصنيفات</CardTitle>
              <CardDescription>
                عرض وإدارة تصنيفات الإعلانات في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن تصنيف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم التصنيف</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الأيقونة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span className="mr-2">جاري التحميل...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            لا توجد نتائج.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category: any) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              {category.name?.ar}
                            </TableCell>
                            <TableCell>{category.description?.ar}</TableCell>
                            <TableCell>
                              {category.icon_url ? (
                                <img
                                  src={category.icon_url || "/placeholder.svg"}
                                  alt={category.name?.ar}
                                  className="h-8 w-8 object-cover rounded-md"
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {category.is_visible ? (
                                <Badge variant="default">مفعل</Badge>
                              ) : (
                                <Badge variant="secondary">غير مفعل</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(category.created_at).toLocaleDateString(
                                "ar-SY"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                  title="تعديل"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCategory(category)}
                                  title="حذف"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الميزات</CardTitle>
              <CardDescription>
                عرض وإدارة ميزات الإعلانات في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن ميزة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم الميزة</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الأيقونة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span className="mr-2">جاري التحميل...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : features.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            لا توجد نتائج.
                          </TableCell>
                        </TableRow>
                      ) : (
                        features.map((feature: any) => (
                          <TableRow key={feature.id}>
                            <TableCell className="font-medium">
                              {feature.name?.ar}
                            </TableCell>
                            <TableCell>{feature.description?.ar}</TableCell>
                            <TableCell>
                              {feature.icon_url ? (
                                <img
                                  src={feature.icon_url || "/placeholder.svg"}
                                  alt={feature.name?.ar}
                                  className="h-8 w-8 object-cover rounded-md"
                                />
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {feature.is_visible ? (
                                <Badge variant="default">مفعل</Badge>
                              ) : (
                                <Badge variant="secondary">غير مفعل</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditFeature(feature)}
                                  title="تعديل"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteFeature(feature)}
                                  title="حذف"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ListingDialog
        open={isListingDialogOpen}
        onOpenChange={setIsListingDialogOpen}
        listing={selectedListing}
        onSave={handleSaveListing}
      />

      <ListingDeleteDialog
        open={isListingDeleteDialogOpen}
        onOpenChange={setIsListingDeleteDialogOpen}
        listing={selectedListing}
        onDelete={handleDeleteListingConfirm}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      <CategoryDeleteDialog
        open={isCategoryDeleteDialogOpen}
        onOpenChange={setIsCategoryDeleteDialogOpen}
        category={selectedCategory}
        onDelete={handleDeleteCategoryConfirm}
      />

      <FeatureDialog
        open={isFeatureDialogOpen}
        onOpenChange={setIsFeatureDialogOpen}
        feature={selectedFeature}
        onSave={handleSaveFeature}
      />

      <FeatureDeleteDialog
        open={isFeatureDeleteDialogOpen}
        onOpenChange={setIsFeatureDeleteDialogOpen}
        feature={selectedFeature}
        onDelete={handleDeleteFeatureConfirm}
      />
    </div>
  );
}
