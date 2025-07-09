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
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import AsyncSelectComponent from "@/components/ui/async-select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";

interface ChangeOwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listing: any;
    onSuccess: () => void;
}

interface UserOption {
    value: string;
    label: string;
}

export function ChangeOwnerDialog({
    open,
    onOpenChange,
    listing,
    onSuccess,
}: ChangeOwnerDialogProps) {
    const { toast } = useToast();
    const [selectedHostId, setSelectedHostId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    // إعادة تعيين القيم عند فتح الحوار
    useEffect(() => {
        if (open && listing) {
            setSelectedHostId(listing.host_id?.toString());
        }
    }, [open, listing]);

    // دالة لجلب المستخدمين
    const loadUserOptions = async (inputValue: string): Promise<UserOption[]> => {
        try {
            const params: any = {
                id_verified: "approved",
                role: "user",
                limit: 20,
            };

            if (inputValue.trim()) {
                params.search = inputValue.trim();
            }

            const response = await api.get("/admin/users", { params });

            if (response.data?.success && response.data?.data) {
                return response.data.data.map((user: any) => ({
                    value: user.id.toString(),
                    label: `${user.first_name} ${user.last_name} (${listing.host.country_code}${listing.host.phone_number})`,
                }));
            }
            return [];
        } catch (error) {
            console.error("Error loading users:", error);
            return [];
        }
    };

    const handleSave = async () => {
        if (!selectedHostId) {
            toast({
                title: "خطأ",
                description: "يرجى اختيار مالك العقار الجديد",
                variant: "destructive",
            });
            return;
        }

        if (selectedHostId === listing?.host_id?.toString()) {
            toast({
                title: "تنبيه",
                description: "مالك العقار المحدد هو نفس المالك الحالي",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.put(`/admin/listings/${listing.id}`, {
                host_id: parseInt(selectedHostId),
            });

            if (response.data?.success) {
                toast({
                    title: "تم تغيير مالك العقار",
                    description: "تم تغيير مالك العقار بنجاح",
                });
                onSuccess();
                onOpenChange(false);
            } else {
                toast({
                    title: "خطأ في تغيير مالك العقار",
                    description:
                        response.data?.message ||
                        "حدث خطأ أثناء تغيير مالك العقار. يرجى المحاولة مرة أخرى.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error changing listing owner:", error);
            toast({
                title: "خطأ في تغيير مالك العقار",
                description:
                    error.response?.data?.message ||
                    "حدث خطأ أثناء تغيير مالك العقار. يرجى المحاولة مرة أخرى.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedHostId(listing?.host_id?.toString());
        onOpenChange(false);
    };

    // الحصول على اسم المالك الحالي
    const getCurrentOwnerLabel = () => {
        if (listing?.host) {
            return `${listing.host.first_name} ${listing.host.last_name} (${listing.host.country_code}${listing.host.phone_number})`;
        }
        return "";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        تغيير مالك العقار
                    </DialogTitle>
                    <DialogDescription>
                        تغيير مالك العقار "{listing?.title?.ar}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-owner">المالك الحالي</Label>
                        <div className="p-2 bg-muted rounded-md text-sm">
                            {getCurrentOwnerLabel() || "غير محدد"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-owner">المالك الجديد *</Label>
                        <AsyncSelectComponent
                            placeholder="ابحث عن مستخدم..."
                            value={selectedHostId}
                            onChange={setSelectedHostId}
                            loadOptions={loadUserOptions}
                            defaultLabel={getCurrentOwnerLabel()}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        إلغاء
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        حفظ التغييرات
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
