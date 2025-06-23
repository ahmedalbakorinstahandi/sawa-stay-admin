"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Trash2 } from "lucide-react";
import Image from "next/image";
import { featuresAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/features";

interface FeatureDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
  onFeatureDeleted: (featureId: number) => void;
}

export function FeatureDeleteDialog({
  open,
  onOpenChange,
  feature,
  onFeatureDeleted,
}: FeatureDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleDelete = async () => {
    if (!feature) return;

    setLoading(true);
    try {
      const response = await featuresAPI.delete(feature.id);
        if (response.success) {
        onFeatureDeleted(feature.id);
        onOpenChange(false);
        toast({
          title: "تم حذف الميزة بنجاح",
          description: `تم حذف الميزة "${feature.name.ar}" من النظام`,
        });
      } else {
        console.error("Failed to delete feature:", response.message);
        toast({
          title: "خطأ في حذف الميزة",
          description: response.message || "فشل في حذف الميزة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!feature) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold text-destructive">
                حذف الميزة
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground mt-1">
                هذا الإجراء لا يمكن التراجع عنه
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Feature Preview */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-muted flex-shrink-0">
                <Image
                  src={feature.icon_url}
                  alt={feature.name.ar}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 bg-muted flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{feature.name.ar}</h3>
                  {feature.name.en && (
                    <p className="text-sm text-muted-foreground">
                      {feature.name.en}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description.ar}
                </p>
                <Badge
                  variant={feature.is_visible ? "default" : "secondary"}
                  className={
                    feature.is_visible
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }
                >
                  {feature.is_visible ? "مرئي" : "مخفي"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                تحذير مهم
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                سيتم حذف هذه الميزة نهائياً من النظام. قد يؤثر هذا على الإعلانات التي تستخدم هذه الميزة.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={loading} className="font-medium">
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                حذف الميزة
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
