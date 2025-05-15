"use client"

import { useState } from "react"
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

const bookingFormSchema = z.object({
  listing_id: z.coerce.number().positive(),
  guest_id: z.coerce.number().positive(),
  start_date: z.string().min(1, {
    message: "يرجى اختيار تاريخ البدء",
  }),
  end_date: z.string().min(1, {
    message: "يرجى اختيار تاريخ الانتهاء",
  }),
  status: z.enum(["draft", "waiting_payment", "paid", "confirmed", "completed", "cancelled", "rejected"]),
  payment_method: z.enum(["wallet", "shamcash", "alharam", "cash", "crypto"]),
  price: z.coerce.number().positive(),
  service_fees: z.coerce.number().nonnegative(),
  commission: z.coerce.number().nonnegative(),
  message: z.string().optional(),
  adults_count: z.coerce.number().nonnegative(),
  children_count: z.coerce.number().nonnegative(),
  infants_count: z.coerce.number().nonnegative(),
  pets_count: z.coerce.number().nonnegative(),
  host_notes: z.string().optional(),
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

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: booking
      ? {
          listing_id: booking.listing_id,
          guest_id: booking.guest_id,
          start_date: booking.start_date ? new Date(booking.start_date).toISOString().split("T")[0] : "",
          end_date: booking.end_date ? new Date(booking.end_date).toISOString().split("T")[0] : "",
          status: booking.status,
          payment_method: booking.payment_method,
          price: booking.price,
          service_fees: booking.service_fees,
          commission: booking.commission,
          message: booking.message || "",
          adults_count: booking.adults_count,
          children_count: booking.children_count,
          infants_count: booking.infants_count,
          pets_count: booking.pets_count,
          host_notes: booking.host_notes || "",
          admin_notes: booking.admin_notes || "",
        }
      : {
          listing_id: 1,
          guest_id: 1,
          start_date: "",
          end_date: "",
          status: "draft",
          payment_method: "wallet",
          price: 0,
          service_fees: 0,
          commission: 0,
          message: "",
          adults_count: 1,
          children_count: 0,
          infants_count: 0,
          pets_count: 0,
          host_notes: "",
          admin_notes: "",
        },
  })

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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة الحجز</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة الحجز" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="waiting_payment">بانتظار الدفع</SelectItem>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="confirmed">مؤكد</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wallet">محفظة</SelectItem>
                        <SelectItem value="shamcash">شام كاش</SelectItem>
                        <SelectItem value="alharam">الهرم</SelectItem>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="crypto">عملات رقمية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service_fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسوم الخدمة</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العمولة</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
