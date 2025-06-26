"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ListingReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: any;
  totalCount: number;
  onReorder: (listingId: number, newIndex: number) => Promise<void>;
}

export function ListingReorderDialog({
  open,
  onOpenChange,
  listing,
  totalCount,
  onReorder,
}: ListingReorderDialogProps) {
  const [newIndex, setNewIndex] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (listing && open) {
      setNewIndex(1);
    }
  }, [listing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!listing || newIndex < 1 || newIndex > totalCount) {
      return;
    }

    setIsLoading(true);
    try {
      await onReorder(listing.id, newIndex);
      onOpenChange(false);
    } catch (error) {
      console.error("Error reordering listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndexChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setNewIndex(Math.max(1, Math.min(totalCount, numValue)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ترتيب الإعلان</DialogTitle>
          <DialogDescription>
            تحديد الترتيب الجديد للإعلان "{listing?.title?.ar}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listing-index">
              الترتيب الجديد (من 1 إلى {totalCount})
            </Label>
            <Input
              id="listing-index"
              type="number"
              min={1}
              max={totalCount}
              value={newIndex}
              onChange={(e) => handleIndexChange(e.target.value)}
              placeholder={`أدخل رقم من 1 إلى ${totalCount}`}
              required
            />
            <p className="text-sm text-muted-foreground">
              العدد الكلي للإعلانات: {totalCount}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading || newIndex < 1 || newIndex > totalCount}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الترتيب"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
