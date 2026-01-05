// Extend core notification types if needed
import type {
  Notification as CoreNotification,
  NotificationType,
  NotificationPriority,
} from '@/components/layout/notification-menu'

export type {
  Notification,
  NotificationType,
  NotificationPriority,
} from '@/components/layout/notification-menu'

// Extended types for the full page
export interface NotificationFilters {
  types?: NotificationType[]
  priorities?: NotificationPriority[]
  dateRange?: {
    from: Date
    to: Date
  }
  isRead?: boolean
  searchQuery?: string
}

export type NotificationSortBy = 'timestamp' | 'priority' | 'type'
export type NotificationSortOrder = 'asc' | 'desc'

export interface NotificationListState {
  filters: NotificationFilters
  sortBy: NotificationSortBy
  sortOrder: NotificationSortOrder
  page: number
  pageSize: number
}
