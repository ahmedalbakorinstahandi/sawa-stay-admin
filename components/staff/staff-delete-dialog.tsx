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
import { usersAPI } from "@/lib/api"

interface StaffDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: any
  onSuccess: () => void
}

export function StaffDeleteDialog({ open, onOpenChange, staff, onSuccess }: StaffDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!staff?.id) return

    setIsLoading(true)

    try {
      const response = await usersAPI.delete(staff.id)

      if (response.success) {
        toast({
          title: "تم حذف الموظف",
          description: `تم حذف الموظف ${staff.first_name || ""} ${staff.last_name || ""} بنجاح`,
        })
        onSuccess()
      } else {
        toast({
          title: "حدث خطأ",
          description: response.message || "فشلت عملية الحذف، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "فشلت عملية الحذف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">حذف الموظف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف الموظف <span className="font-bold">{staff.first_name || ""} {staff.last_name || ""}</span>؟ 
            <br />هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
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
                <Trash2 className="ml-2 h-4 w-4" />
                حذف الموظف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
