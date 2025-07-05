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
import { HouseTypeDialog } from "@/components/listings/housetype-dialog"
import { HouseTypeDeleteDialog } from "@/components/listings/housetype-delete-dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface HouseType {
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
  is_visible: boolean
}

interface ApiResponse {
  success: boolean
  data: HouseType[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  message?: string
}

export default function HouseTypesPage() {
  const [houseTypes, setHouseTypes] = useState<HouseType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isHouseTypeDialogOpen, setIsHouseTypeDialogOpen] = useState(false)
  const [isHouseTypeDeleteDialogOpen, setIsHouseTypeDeleteDialogOpen] = useState(false)
  const [selectedHouseType, setSelectedHouseType] = useState<HouseType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const { toast } = useToast()

  // Fetch house types
  const fetchHouseTypes = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/admin/house-types?page=${page}&per_page=${perPage}`)
      const data = response.data as ApiResponse

      if (data.success) {
        setHouseTypes(data.data)
        if (data.meta) {
          setCurrentPage(data.meta.current_page)
          setTotalPages(data.meta.last_page)
          setPerPage(data.meta.per_page)
          setTotalItems(data.meta.total)
        }
      } else {
        toast({
          title: "خطأ في جلب البيانات",
          description: data.message || "حدث خطأ أثناء محاولة جلب أنواع المنازل",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching house types:", error)
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ أثناء محاولة جلب أنواع المنازل",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHouseTypes()
  }, [])

  // Filter house types
  const filteredHouseTypes = houseTypes.filter(
    (houseType) =>
      houseType.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      houseType.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      houseType.description.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      houseType.description.en.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // House type handlers
  const handleAddHouseType = () => {
    setSelectedHouseType(null)
    setIsHouseTypeDialogOpen(true)
  }

  const handleEditHouseType = (houseType: HouseType) => {
    setSelectedHouseType(houseType)
    setIsHouseTypeDialogOpen(true)
  }

  const handleDeleteHouseType = (houseType: HouseType) => {
    setSelectedHouseType(houseType)
    setIsHouseTypeDeleteDialogOpen(true)
  }

  const handleSaveHouseType = async (houseTypeData: any) => {
    try {
      let response

      if (selectedHouseType) {
        // Update existing house type
        response = await api.put(`/admin/house-types/${selectedHouseType.id}`, houseTypeData)

        if (response.data.success) {
          toast({
            title: "تم تحديث نوع المنزل",
            description: `تم تحديث نوع المنزل  بنجاح`,
          })
        } else {
          throw new Error(response.data.message || "فشل تحديث نوع المنزل")
        }
      } else {
        // Add new house type
        response = await api.post("/admin/house-types", houseTypeData)

        if (response.data.success) {
          toast({
            title: "تمت إضافة نوع المنزل",
            description: `تمت إضافة نوع المنزل بنجاح`,
          })
        } else {
          throw new Error(response.data.message || "فشل إضافة نوع المنزل")
        }
      }

      // Refresh the list
      fetchHouseTypes(currentPage)
    } catch (error: any) {
      console.error("Error saving house type:", error)
      toast({
        title: "خطأ في حفظ البيانات",
        description: error.message || "حدث خطأ أثناء محاولة حفظ نوع المنزل",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHouseTypeConfirm = async () => {
    if (!selectedHouseType) return

    try {
      const response = await api.delete(`/admin/house-types/${selectedHouseType.id}`)

      if (response.data.success) {
        toast({
          title: "تم حذف نوع المنزل",
          description: `تم حذف نوع المنزل "${selectedHouseType.name.ar}" بنجاح`,
        })

        // Refresh the list
        fetchHouseTypes(currentPage)
      } else {
        throw new Error(response.data.message || "فشل حذف نوع المنزل")
      }
    } catch (error: any) {
      console.error("Error deleting house type:", error)
      toast({
        title: "خطأ في حذف البيانات",
        description: error.message || "حدث خطأ أثناء محاولة حذف نوع المنزل",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number) => {
    fetchHouseTypes(page)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">أنواع المنازل</h2>
        <Button onClick={handleAddHouseType} className="gradient-primary hover:opacity-90">
          <Plus className="ml-2 h-4 w-4" /> إضافة نوع منزل
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة أنواع المنازل</CardTitle>
          <CardDescription>عرض وإدارة أنواع المنازل المتاحة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن نوع منزل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم النوع (عربي)</TableHead>
                    <TableHead>اسم النوع (إنجليزي)</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الأيقونة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          جاري تحميل البيانات...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredHouseTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHouseTypes.map((houseType) => (
                      <TableRow key={houseType.id}>
                        <TableCell className="font-medium">{houseType.name.ar}</TableCell>
                        <TableCell>{houseType.name.en}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={houseType.description.ar}>
                            {houseType.description.ar}
                          </div>
                        </TableCell>
                        <TableCell>
                          {houseType.icon_url && (
                            <img
                              src={houseType.icon_url || "/placeholder.svg"}
                              alt={houseType.name.ar}
                              className="h-8 w-8 object-cover rounded-md"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {houseType.is_visible ? (
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
                              onClick={() => handleEditHouseType(houseType)}
                              title="تعديل"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteHouseType(houseType)}
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

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      <HouseTypeDialog
        open={isHouseTypeDialogOpen}
        onOpenChange={setIsHouseTypeDialogOpen}
        housetype={selectedHouseType}
        onSave={handleSaveHouseType}
      />

      <HouseTypeDeleteDialog
        open={isHouseTypeDeleteDialogOpen}
        onOpenChange={setIsHouseTypeDeleteDialogOpen}
        housetype={selectedHouseType}
        onDelete={handleDeleteHouseTypeConfirm}
      />
    </div>
  )
}
