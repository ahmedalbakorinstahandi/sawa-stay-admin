"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AsyncSelectComponent from "@/components/ui/async-select"
import { api } from "@/lib/api"

const bookingFormSchema = z.object({
  listing_id: z.coerce.number().positive(),
  guest_id: z.coerce.number().positive(),
  start_date: z.string().min(1, {
    message: "يرجى اختيار تاريخ البدء",
  }),
  end_date: z.string().min(1, {
    message: "يرجى اختيار تاريخ الانتهاء",
  }),
  message: z.string().optional(),
  adults_count: z.coerce.number().min(0),
  children_count: z.coerce.number().min(0),
  infants_count: z.coerce.number().min(0),
  pets_count: z.coerce.number().min(0),
  status: z.enum(["pending", "waiting_payment", "accepted", "confirmed", "completed", "cancelled", "rejected"]).optional(),
  admin_notes: z.string().optional(),
})

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: any
  onSave: (booking: any) => void
}

export function BookingDialog({ open, onOpenChange, booking, onSave }: BookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // حالة لحفظ بيانات الإعلان والضيف المحددين
  const [selectedListing, setSelectedListing] = useState<string>("")
  const [selectedGuest, setSelectedGuest] = useState<string>("")

  // دوال البحث للـ AsyncSelect
  const loadListings = async (inputValue: string) => {
    try {
      const response = await api.get(`/admin/listings?search=${inputValue}&per_page=10`)
      if (response.data.success) {
        return response.data.data.map((listing: any) => ({
          value: listing.id.toString(),
          label: `#${listing.id} - ${listing.title?.ar || listing.title?.en || 'بدون عنوان'}`
        }))
      }
      return []
    } catch (error) {
      console.error('Error loading listings:', error)
      return []
    }
  }

  const loadGuests = async (inputValue: string) => {
    try {
      const response = await api.get(`/admin/users?search=${inputValue}&per_page=10&role=user`)
      if (response.data.success) {
        return response.data.data.map((user: any) => ({
          value: user.id.toString(),
          label: `#${user.id} - ${user.first_name} ${user.last_name} (${user.country_code}${user.phone_number})`
        }))
      }
      return []
    } catch (error) {
      console.error('Error loading guests:', error)
      return []
    }
  }

  // دالة لجلب بيانات الإعلان والضيف للعرض
  const fetchInitialData = async () => {
    if (booking) {
      // جلب بيانات الإعلان
      if (booking.listing_id) {
        try {
          const listingResponse = await api.get(`/admin/listings/${booking.listing_id}`)
          if (listingResponse.data.success) {
            const listing = listingResponse.data.data
            setSelectedListing(`#${listing.id} - ${listing.title?.ar || listing.title?.en || 'بدون عنوان'}`)
          }
        } catch (error) {
          console.error('Error fetching listing:', error)
        }
      }

      // جلب بيانات الضيف
      if (booking.guest_id) {
        try {
          const guestResponse = await api.get(`/admin/users/${booking.guest_id}`)
          if (guestResponse.data.success) {
            const guest = guestResponse.data.data
            setSelectedGuest(`#${guest.id} - ${guest.first_name} ${guest.last_name} (${guest.country_code}${guest.phone_number})`)
          }
        } catch (error) {
          console.error('Error fetching guest:', error)
        }
      }
    }
  }

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      listing_id: 1,
      guest_id: 1,
      start_date: "",
      end_date: "",
      message: "",
      adults_count: 1,
      children_count: 0,
      infants_count: 0,
      pets_count: 0,
      status: "pending",
      admin_notes: "",
    },
  })

  // تحديث القيم عند تغيير الـ booking
  useEffect(() => {
    if (booking) {
      form.reset({
        listing_id: booking.listing_id,
        guest_id: booking.guest_id,
        start_date: booking.start_date ? new Date(booking.start_date).toISOString().split("T")[0] : "",
        end_date: booking.end_date ? new Date(booking.end_date).toISOString().split("T")[0] : "",
        message: booking.message || "",
        adults_count: booking.adults_count,
        children_count: booking.children_count,
        infants_count: booking.infants_count,
        pets_count: booking.pets_count,
        status: booking.status,
        admin_notes: booking.admin_notes || "",
      })
      // جلب البيانات الأولية للعرض
      fetchInitialData()
    } else {
      form.reset({
        listing_id: 1,
        guest_id: 1,
        start_date: "",
        end_date: "",
        message: "",
        adults_count: 1,
        children_count: 0,
        infants_count: 0,
        pets_count: 0,
        status: "pending",
        admin_notes: "",
      })
      setSelectedListing("")
      setSelectedGuest("")
    }
  }, [booking, form])

  function onSubmit(values: z.infer<typeof bookingFormSchema>) {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)

      const savedBooking = {
        id: booking?.id || Math.floor(Math.random() * 1000),
        ...values,
        host_id: booking?.host_id || 1,
        host_name: booking?.host_name || "أحمد محمد",
        guest_name: booking?.guest_name || "سارة أحمد",
        listing_title: booking?.listing_title || "شقة فاخرة في وسط دمشق",
        created_at: booking?.created_at || new Date().toISOString(),
        currency: booking?.currency || "USD",
      }

      onSave(savedBooking)

      toast({
        title: booking ? "تم تحديث الحجز" : "تم إضافة الحجز",
        description: booking ? `تم تحديث الحجز رقم #${booking.id} بنجاح` : `تم إضافة الحجز الجديد بنجاح`,
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? "تعديل حجز" : "إضافة حجز جديد"}</DialogTitle>
          <DialogDescription>
            {booking ? "قم بتعديل بيانات الحجز أدناه" : "قم بإدخال بيانات الحجز الجديد"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {booking ? (
              // عند التعديل: إظهار الحالة والملاحظات فقط
              <>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حالة الحجز</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر حالة الحجز" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* عرض الحالة الحالية */}
                          <SelectItem value={booking.status}>
                            {booking.status === "pending" && "قيد الانتظار (الحالة الحالية)"}
                            {booking.status === "waiting_payment" && "انتظار الدفع (الحالة الحالية)"}
                            {booking.status === "accepted" && "تأكيد الإتاحية (الحالة الحالية)"}
                            {booking.status === "confirmed" && "مؤكد (الحالة الحالية)"}
                            {booking.status === "completed" && "مكتمل (الحالة الحالية)"}
                            {booking.status === "cancelled" && "ملغى (الحالة الحالية)"}
                            {booking.status === "rejected" && "مرفوض (الحالة الحالية)"}
                          </SelectItem>

                          {/* عرض الحالات المتاحة للتحديث */}
                          {booking.status === "pending" && (
                            <>
                              <SelectItem value="accepted">تأكيد الإتاحية</SelectItem>
                              <SelectItem value="rejected">رفض</SelectItem>
                            </>
                          )}
                          {booking.status === "waiting_payment" && (
                            <>
                              <SelectItem value="confirmed">تأكيد الدفع</SelectItem>
                              <SelectItem value="cancelled">إلغاء</SelectItem>
                            </>
                          )}
                          {booking.status === "accepted" && (
                            <>
                              <SelectItem value="confirmed">تأكيد الدفع</SelectItem>
                              <SelectItem value="cancelled">إلغاء</SelectItem>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <SelectItem value="completed">إكمال</SelectItem>
                              <SelectItem value="cancelled">إلغاء</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات الإدارة</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              // عند الإضافة: إظهار جميع الحقول المطلوبة
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="listing_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الإعلان *</FormLabel>
                        <FormControl>
                          <AsyncSelectComponent
                            placeholder="ابحث عن إعلان..."
                            value={field.value?.toString()}
                            onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                            loadOptions={loadListings}
                            defaultLabel={selectedListing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guest_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الضيف *</FormLabel>
                        <FormControl>
                          <AsyncSelectComponent
                            placeholder="ابحث عن ضيف..."
                            value={field.value?.toString()}
                            onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                            loadOptions={loadGuests}
                            defaultLabel={selectedGuest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ البدء</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الانتهاء</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} min={
                            form.getValues("start_date") ? new Date(form.getValues("start_date")).toISOString().split("T")[0] : ""
                          } />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="adults_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البالغين</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="children_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأطفال</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="infants_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرضع</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pets_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحيوانات الأليفة</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رسالة الضيف</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات الإدارة</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {booking ? "تحديث الحجز" : "إضافة حجز"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
