"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Search, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryDialog } from "@/components/listings/category-dialog"
import { CategoryDeleteDialog } from "@/components/listings/category-delete-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  description: {
    ar: string
    en: string
  }
  icon: string
  icon_url: string
  key: string | null
  is_visible: boolean
}

interface ApiResponse {
  success: boolean
  data: Category[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  message?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const { toast } = useToast()

  // Fetch categories
  const fetchCategories = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/admin/categories?page=${page}&per_page=${perPage}`)
      const data = response.data as ApiResponse

      if (data.success) {
        setCategories(data.data)
        if (data.meta) {
          setCurrentPage(data.meta.current_page)
          setTotalPages(data.meta.last_page)
          setPerPage(data.meta.per_page)
          setTotalItems(data.meta.total)
        }
      } else {
        toast({
          title: "خطأ في جلب البيانات",
          description: data.message || "حدث خطأ أثناء محاولة جلب التصنيفات",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ أثناء محاولة جلب التصنيفات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories
  const filteredCategories = categories.filter(
    (category) =>
      category.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.en.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Category handlers
  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsCategoryDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsCategoryDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsCategoryDeleteDialogOpen(true)
  }

  const handleSaveCategory = async (categoryData: any) => {
    try {
      let response

      if (selectedCategory) {
        // Update existing category
        response = await api.put(`/admin/categories/${selectedCategory.id}`, categoryData)

        if (response.data.success) {
          toast({
            title: "تم تحديث التصنيف",
            description: `تم تحديث التصنيف "${categoryData.get ? categoryData.get("name[ar]") : categoryData.name.ar}" بنجاح`,
          })
        } else {
          throw new Error(response.data.message || "فشل تحديث التصنيف")
        }
      } else {
        // Add new category
        response = await api.post("/admin/categories", categoryData)

        if (response.data.success) {
          toast({
            title: "تمت إضافة التصنيف",
            description: `تمت إضافة التصنيف "${categoryData.get ? categoryData.get("name[ar]") : categoryData.name.ar}" بنجاح`,
          })
        } else {
          throw new Error(response.data.message || "فشل إضافة التصنيف")
        }
      }

      // Refresh categories
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "فشل العملية",
        description: error.message || "حدث خطأ أثناء محاولة حفظ التصنيف",
        variant: "destructive",
      })
    } finally {
      setIsCategoryDialogOpen(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return

    try {
      const response = await api.delete(`/admin/categories/${selectedCategory.id}`)

      if (response.data.success) {
        toast({
          title: "تم حذف التصنيف",
          description: `تم حذف التصنيف "${selectedCategory.name.ar}" بنجاح`,
        })
        // Refresh categories
        fetchCategories()
      } else {
        throw new Error(response.data.message || "فشل حذف التصنيف")
      }
    } catch (error: any) {
      toast({
        title: "فشل العملية",
        description: error.message || "حدث خطأ أثناء محاولة حذف التصنيف",
        variant: "destructive",
      })
    } finally {
      setIsCategoryDeleteDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>التصنيفات</CardTitle>
        <CardDescription>إدارة وتعديل التصنيفات الموجودة.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Input
              type="search"
              placeholder="ابحث عن تصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Search className="ml-2 h-4 w-4 text-gray-500" />
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة تصنيف
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">الاسم (عربي)</TableHead>
                  <TableHead className="px-6 py-3">الاسم (انجليزي)</TableHead>
                  <TableHead className="px-6 py-3">الوصف (عربي)</TableHead>
                  <TableHead className="px-6 py-3">الوصف (انجليزي)</TableHead>
                  <TableHead className="px-6 py-3">مرئي</TableHead>
                  <TableHead className="px-6 py-3">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {category.name.ar}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {category.name.en}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {category.description.ar}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {category.description.en}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <Badge variant={category.is_visible ? "default" : "secondary"}>
                        {category.is_visible ? "نعم" : "لا"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => fetchCategories(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={currentPage === page}>
                  <PaginationLink href="#" onClick={() => fetchCategories(page)} isActive={currentPage === page}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => fetchCategories(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <CategoryDialog
          open={isCategoryDialogOpen}
          setOpen={setIsCategoryDialogOpen}
          category={selectedCategory}
          onSave={handleSaveCategory}
        />

        <CategoryDeleteDialog
          open={isCategoryDeleteDialogOpen}
          setOpen={setIsCategoryDeleteDialogOpen}
          category={selectedCategory}
          onConfirm={handleDeleteConfirm}
        />
      </CardContent>
    </Card>
  )
}
