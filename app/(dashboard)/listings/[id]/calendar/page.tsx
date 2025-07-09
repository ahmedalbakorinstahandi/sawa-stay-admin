"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  parseISO,
} from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Listing {
  id: number;
  title: {
    ar: string;
    en: string;
  };
  available_dates: string[];
  not_available_dates: string[];
}

export default function ListingCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [notAvailableDates, setNotAvailableDates] = useState<Date[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [removedDates, setRemovedDates] = useState<Date[]>([]);

  // جلب بيانات العقار والتواريخ غير المتاحة
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/admin/listings/${listingId}`);
        console.log("Full Response:", response);

        if (response.data.success) {
          const listingData = response.data.data;
          setListing(listingData);
          console.log("Listing Data:", listingData);

          // تحويل التواريخ غير المتاحة إلى كائنات Date
          if (listingData.not_available_dates && listingData.not_available_dates.length > 0) {
            console.log("Raw Not Available Dates:", listingData.not_available_dates);

            const dates = listingData.not_available_dates.map((dateStr: string) =>
              parseISO(dateStr)
            );
            console.log("Parsed Not Available Dates:", dates);

            setNotAvailableDates(dates);
            setSelectedDates(dates);
          } else {
            console.log("No not available dates found");
            setNotAvailableDates([]);
            setSelectedDates([]);
          }
        } else {
          toast.error("فشل في جلب بيانات العقار");
          router.push("/admin/listings");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("حدث خطأ أثناء جلب بيانات العقار");
        router.push("/admin/listings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId, router]);

  // التعامل مع النقر على تاريخ
  const handleDateClick = (date: Date) => {
    // التأكد من أن التاريخ في المستقبل
    if (isBefore(date, new Date())) {
      return;
    }

    // التحقق مما إذا كان التاريخ محدداً بالفعل كغير متاح
    const isSelected = selectedDates.some((selectedDate) =>
      isSameDay(selectedDate, date)
    );

    if (isSelected) {
      // إزالة التاريخ من القائمة المحددة (جعله متاح)
      setSelectedDates(selectedDates.filter((d) => !isSameDay(d, date)));

      // إذا كان التاريخ غير متاح بالفعل، أضفه إلى قائمة التواريخ المحذوفة
      if (notAvailableDates.some((d) => isSameDay(d, date))) {
        setRemovedDates([...removedDates, date]);
      }
    } else {
      // إضافة التاريخ إلى القائمة المحددة (جعله غير متاح)
      setSelectedDates([...selectedDates, date]);

      // إذا كان التاريخ في قائمة التواريخ المحذوفة، قم بإزالته منها
      setRemovedDates(removedDates.filter((d) => !isSameDay(d, date)));
    }
  };

  // حفظ التغييرات
  const saveChanges = async () => {
    setIsSaving(true);

    try {
      // تحديد التواريخ الجديدة غير المتاحة (التي لم تكن غير متاحة من قبل)
      const newNotAvailableDates = selectedDates.filter(
        (date) => !notAvailableDates.some((d) => isSameDay(d, date))
      );

      // تنسيق التواريخ بالصيغة المطلوبة (YYYY-MM-DD)
      const formattedNewNotAvailableDates = newNotAvailableDates.map((date) =>
        format(date, "yyyy-MM-dd")
      );
      const formattedRemovedNotAvailableDates = removedDates.map((date) =>
        format(date, "yyyy-MM-dd")
      );

      // إرسال البيانات
      const response = await api.put(
        `/admin/listings/${listingId}/available-dates`,
        {
          not_available_dates: formattedNewNotAvailableDates,
          removed_not_available_dates: formattedRemovedNotAvailableDates,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        // تحديث قائمة التواريخ غير المتاحة
        const updatedNotAvailableDates = [
          ...notAvailableDates.filter(
            (date) => !removedDates.some((d) => isSameDay(d, date))
          ),
          ...newNotAvailableDates,
        ];

        setNotAvailableDates(updatedNotAvailableDates);
        setSelectedDates(updatedNotAvailableDates);
        setRemovedDates([]);
      } else {
        toast.error("فشل في تحديث التواريخ غير المتاحة");
      }
    } catch (error) {
      console.error("Error updating not available dates:", error);
      toast.error("حدث خطأ أثناء تحديث التواريخ غير المتاحة");
    } finally {
      setIsSaving(false);
    }
  };

  // الانتقال إلى الشهر السابق
  const previousMonth = () => {
    const previousMonthDate = new Date(
      date.getFullYear(),
      date.getMonth() - 1,
      1
    );
    setDate(previousMonthDate);
  };

  // الانتقال إلى الشهر التالي
  const nextMonth = () => {
    const nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(nextMonthDate);
  };

  // الحصول على أيام الشهر الحالي
  const getDaysInMonth = () => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/listings")}
          className="ml-2"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">إدارة التقويم</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>التقويم</CardTitle>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">الشهر السابق</span>
                    </Button>
                    <div className="text-sm font-medium">
                      {format(date, "MMMM yyyy", { locale: ar })}
                    </div>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">الشهر التالي</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500 mb-2">
                  <div>الأحد</div>
                  <div>الإثنين</div>
                  <div>الثلاثاء</div>
                  <div>الأربعاء</div>
                  <div>الخميس</div>
                  <div>الجمعة</div>
                  <div>السبت</div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* أيام فارغة قبل بداية الشهر */}
                  {Array.from({
                    length: new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      1
                    ).getDay(),
                  }).map((_, i) => (
                    <div
                      key={`empty-start-${i}`}
                      className="h-12 rounded-md"
                    ></div>
                  ))}

                  {/* أيام الشهر */}
                  {getDaysInMonth().map((day) => {
                    const isNotAvailable = selectedDates.some((d) =>
                      isSameDay(d, day)
                    );
                    const isPast =
                      isBefore(day, new Date()) && !isSameDay(day, new Date());

                    return (
                      <button
                        key={day.toString()}
                        type="button"
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={`h-12 rounded-md flex items-center justify-center text-sm transition-colors ${isPast
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isNotAvailable
                            ? "bg-red-100 text-red-800 hover:bg-red-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}

                  {/* أيام فارغة بعد نهاية الشهر */}
                  {Array.from({
                    length:
                      6 -
                      new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0
                      ).getDay(),
                  }).map((_, i) => (
                    <div
                      key={`empty-end-${i}`}
                      className="h-12 rounded-md"
                    ></div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 ml-2" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاعلان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      العنوان
                    </h3>
                    <p className="font-medium">{listing?.title?.ar}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      التواريخ غير المتاحة
                    </h3>
                    <p className="font-medium">{selectedDates.length} يوم</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      التغييرات
                    </h3>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
                        <span className="text-sm">
                          {
                            selectedDates.filter(
                              (date) =>
                                !notAvailableDates.some((d) => isSameDay(d, date))
                            ).length
                          }{" "}
                          تواريخ غير متاحة مضافة
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 ml-2"></div>
                        <span className="text-sm">
                          {removedDates.length} تواريخ عادت للإتاحة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      إرشادات
                    </h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>انقر على التاريخ لتحديده كمتاح أو غير متاح</li>
                      <li>التواريخ الخضراء متاحة للحجز</li>
                      <li>التواريخ الحمراء غير متاحة للحجز</li>
                      <li>لا يمكن تحديد التواريخ السابقة</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/listings/${listingId}/edit`}>
                        تعديل معلومات الاعلان
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
