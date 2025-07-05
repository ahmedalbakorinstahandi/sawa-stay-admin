import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  User,
  Home,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Bed,
  Bath,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { Review } from "@/types/review";
import { reviewsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onReviewUpdated: (review: Review) => void;
}

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  onReviewUpdated,
}: ReviewDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!review) return null;

  const handleToggleBlock = async () => {
    setLoading(true);
    try {
      const response = review.blocked_at 
        ? await reviewsAPI.unblock(review.id)
        : await reviewsAPI.block(review.id);
        
      if (response.success) {
        const updatedReview = { 
          ...review, 
          blocked_at: review.blocked_at ? null : new Date().toISOString() 
        };
        onReviewUpdated(updatedReview);
        toast({
          title: review.blocked_at ? "تم إلغاء حظر التقييم" : "تم حظر التقييم",
          description: `تم ${review.blocked_at ? 'إلغاء حظر' : 'حظر'} التقييم بنجاح`,
        });
      } else {
        toast({
          title: "خطأ في تعديل حالة التقييم",
          description: response.message || "فشل في تعديل حالة التقييم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling review block:", error);
      toast({
        title: "خطأ في تعديل حالة التقييم",
        description: "حدث خطأ أثناء تعديل حالة التقييم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            تفاصيل التقييم
          </DialogTitle>
          <DialogDescription>
            عرض تفاصيل التقييم وإدارته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Status and Actions */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge
                variant={review.blocked_at ? "destructive" : "default"}
                className="text-sm"
              >
                {review.blocked_at ? (
                  <>
                    <Ban className="mr-1 h-4 w-4" />
                    محظور
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    نشط
                  </>
                )}
              </Badge>
              <span className="text-sm text-muted-foreground">
                تاريخ الإنشاء: {formatDate(review.created_at)}
              </span>
            </div>
            <Button
              variant={review.blocked_at ? "outline" : "destructive"}
              size="sm"
              onClick={handleToggleBlock}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : review.blocked_at ? (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  إلغاء الحظر
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  حظر التقييم
                </>
              )}
            </Button>
          </div>

          {/* Review Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Review Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  تفاصيل التقييم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">التقييم:</span>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">التعليق:</span>
                  {review.comment ? (
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      لم يترك المستخدم تعليقاً
                    </p>
                  )}
                </div>

                {review.blocked_at && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <Ban className="h-4 w-4" />
                      <span className="text-sm font-medium">تم حظر هذا التقييم</span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      تاريخ الحظر: {formatDate(review.blocked_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-muted">
                    {review.user.avatar_url ? (
                      <Image
                        src={review.user.avatar_url}
                        alt={`${review.user.first_name} ${review.user.last_name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {review.user.first_name} {review.user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.user.role === 'user' ? 'مستخدم' : 'مضيف'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {review.user.country_code} {review.user.phone_number}
                    </span>
                    <Badge variant={review.user.phone_verified ? "default" : "secondary"} className="text-xs">
                      {review.user.phone_verified ? "موثق" : "غير موثق"}
                    </Badge>
                  </div>
                  
                  {review.user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{review.user.email}</span>
                      <Badge variant={review.user.email_verified ? "default" : "secondary"} className="text-xs">
                        {review.user.email_verified ? "موثق" : "غير موثق"}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">الحالة:</span>
                    <Badge variant={review.user.status === 'active' ? "default" : "secondary"}>
                      {review.user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                تفاصيل الإقامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-muted">
                  {review.booking.listing.first_image?.url ? (
                    <Image
                      src={review.booking.listing.first_image.url}
                      alt={review.booking.listing.title.ar}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Home className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {review.booking.listing.title.ar}
                  </h3>
                  {review.booking.listing.title.en && (
                    <p className="text-sm text-muted-foreground">
                      {review.booking.listing.title.en}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.booking.listing.property_type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{review.booking.listing.guests_count} ضيف</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{review.booking.listing.bedrooms_count} غرفة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{review.booking.listing.bathrooms_count} حمام</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{review.booking.listing.price} {review.booking.listing.currency}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  {review.booking.listing.average_rating} ({review.booking.listing.reviews_count} تقييم)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                تفاصيل الحجز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">تاريخ الوصول:</span>
                  <p className="text-sm font-medium">
                    {new Date(review.booking.start_date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">تاريخ المغادرة:</span>
                  <p className="text-sm font-medium">
                    {new Date(review.booking.end_date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">حالة الحجز:</span>
                  <Badge variant={review.booking.status === 'completed' ? "default" : "secondary"}>
                    {review.booking.status === 'completed' ? 'مكتمل' : 
                     review.booking.status === 'pending' ? 'في الانتظار' : 
                     review.booking.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">إجمالي المبلغ:</span>
                  <p className="text-sm font-medium">
                    {review.booking.final_total_price} {review.booking.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">البالغين:</span>
                  <p className="text-sm">{review.booking.adults_count}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">الأطفال:</span>
                  <p className="text-sm">{review.booking.children_count}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">الرضع:</span>
                  <p className="text-sm">{review.booking.infants_count}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">الحيوانات:</span>
                  <p className="text-sm">{review.booking.pets_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
