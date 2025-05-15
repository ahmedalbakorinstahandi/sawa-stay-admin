"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ListingDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: any;
  onDelete: () => void;
}

export function ListingDeleteDialog({
  open,
  onOpenChange,
  listing,
  onDelete,
}: ListingDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    if (!listing) return;

    setIsLoading(true);
    onDelete();
    onOpenChange(false);
    setIsLoading(false);
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف الإعلان</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف الإعلان "{listing.title?.ar}"؟ هذا
            الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الحذف...</span>
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                حذف الإعلان
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
