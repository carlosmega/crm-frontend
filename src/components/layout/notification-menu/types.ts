export type NotificationType = 'lead' | 'opportunity' | 'quote' | 'task' | 'mention' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  priority: NotificationPriority

  // Optional context
  relatedEntityId?: string
  relatedEntityType?: 'lead' | 'opportunity' | 'quote' | 'order'
  relatedEntityName?: string
  actionUrl?: string
  actor?: {
    name: string
    avatarUrl?: string
  }
}
