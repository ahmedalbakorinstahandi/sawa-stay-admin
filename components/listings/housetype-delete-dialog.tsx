"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface HouseTypeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  housetype: any
  onDelete: () => void
}

export function HouseTypeDeleteDialog({ open, onOpenChange, housetype, onDelete }: HouseTypeDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = () => {
    setIsLoading(true)

    // Call the delete function
    onDelete()

    // Close the dialog
    setIsLoading(false)
    onOpenChange(false)
  }

  if (!housetype) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف نوع المنزل؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف نوع المنزل &quot;{housetype.name?.ar || housetype.name}&quot; بشكل نهائي. هذا الإجراء لا يمكن
            التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "جاري الحذف..." : "حذف"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
