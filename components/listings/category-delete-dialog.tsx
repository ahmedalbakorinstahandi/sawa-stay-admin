"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: any
  onDelete: () => void
}

export function CategoryDeleteDialog({ open, onOpenChange, category, onDelete }: CategoryDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    if (!category) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      onDelete()

      toast({
        title: "تم حذف التصنيف",
        description: `تم حذف التصنيف "${category.name}" بنجاح`,
      })
    }, 1000)
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف التصنيف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف التصنيف "{category.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>جاري الحذف...</span>
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                حذف التصنيف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
