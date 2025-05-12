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

interface UserDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onSuccess: () => void
}

export function UserDeleteDialog({ open, onOpenChange, user, onSuccess }: UserDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!user?.id) return

    setIsLoading(true)

    try {
      const response = await usersAPI.delete(user.id)

      if (response.success) {
        toast({
          title: "تم حذف المستخدم",
          description: `تم حذف المستخدم ${user.first_name || ""} ${user.last_name || ""} بنجاح`,
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

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف المستخدم</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف المستخدم {user.first_name || ""} {user.last_name || ""}؟ هذا الإجراء لا يمكن
            التراجع عنه.
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
                حذف المستخدم
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
