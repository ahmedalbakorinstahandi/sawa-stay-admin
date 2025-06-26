export interface NotificationMetadata {
  data: any[]
  replace: any[]
  notificationable: {
    id: number | null
    type: string
  }
}

export interface NotificationUser {
  id: number
  name: string
  email?: string
  avatar?: string
}

export interface Notification {
  id: number
  user_id: number | null
  title: string
  message: string
  read_at: string | null
  metadata: NotificationMetadata
  notificationable_id: number | null
  notificationable_type: string
  created_at: string
  updated_at?: string
  user: NotificationUser | null
}

export interface NotificationResponse {
  success: boolean
  data: Notification[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface UnreadCountResponse {
  success: boolean
  count: number
}

export interface NotificationActionResponse {
  success: boolean
  message?: string
}

// دالة مساعدة لتحويل read_at إلى boolean
export const isNotificationRead = (notification: Notification): boolean => {
  return notification.read_at !== null
}

// دالة مساعدة للحصول على نوع الإشعار
export const getNotificationType = (notificationType: string): string => {
  // يمكن استخدام notificationable_type أو metadata لتحديد النوع
  if (notificationType.includes('Booking')) return 'booking'
  if (notificationType.includes('Listing')) return 'listing'
  if (notificationType.includes('User')) return 'user'
  if (notificationType.includes('Payment')) return 'payment'
  if (notificationType.includes('Review')) return 'review'
  if (notificationType.includes('System')) return 'system'
  if (notificationType.includes('Report')) return 'report'
  return 'general'
}
