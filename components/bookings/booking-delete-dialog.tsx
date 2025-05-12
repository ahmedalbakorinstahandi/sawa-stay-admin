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

interface BookingDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any
  onDelete: () => void
}

export function BookingDeleteDialog({ open, onOpenChange, booking, onDelete }: BookingDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    if (!booking) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      onDelete()

      toast({
        title: "تم حذف الحجز",
        description: `تم حذف الحجز رقم #${booking.id} بنجاح`,
      })
    }, 1000)
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف الحجز</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف الحجز رقم #{booking.id}؟ هذا الإجراء لا يمكن التراجع عنه.
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
                حذف الحجز
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
