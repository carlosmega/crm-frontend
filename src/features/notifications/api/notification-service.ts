/**
 * Notification Service - Backend Implementation
 *
 * Endpoints: /api/notifications/
 */

import apiClient from '@/core/api/client'
import type { Notification } from '@/components/layout/notification-menu'

/** Backend notification response shape */
interface NotificationBackendResponse {
  notificationid: string
  typecode: string
  prioritycode: number
  priority: string
  title: string
  description: string
  isread: boolean
  isarchived: boolean
  readon: string | null
  relatedentityid: string | null
  relatedentitytype: string | null
  relatedentityname: string | null
  actionurl: string | null
  ownerid: string
  actorid: string | null
  actor_name: string | null
  createdon: string
}

/** Transform backend response to frontend Notification type */
function toNotification(raw: NotificationBackendResponse): Notification {
  return {
    id: raw.notificationid,
    type: raw.typecode as Notification['type'],
    title: raw.title,
    description: raw.description,
    timestamp: new Date(raw.createdon),
    isRead: raw.isread,
    priority: raw.priority as Notification['priority'],
    relatedEntityId: raw.relatedentityid ?? undefined,
    relatedEntityType: raw.relatedentitytype as Notification['relatedEntityType'],
    relatedEntityName: raw.relatedentityname ?? undefined,
    actionUrl: raw.actionurl ?? undefined,
    actor: raw.actor_name ? { name: raw.actor_name } : undefined,
  }
}

class NotificationServiceBackend {
  private readonly basePath = '/notifications'

  async getAll(filters?: {
    is_read?: boolean
    typecode?: string
    search?: string
  }): Promise<Notification[]> {
    const response = await apiClient.get<NotificationBackendResponse[]>(
      this.basePath,
      { params: filters }
    )
    return response.data.map(toNotification)
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      `${this.basePath}/unread-count`
    )
    return response.data.count
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/read`)
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${this.basePath}/read-all`)
  }

  async archiveNotifications(ids: string[]): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk-archive`, { ids })
  }

  async deleteNotifications(ids: string[]): Promise<void> {
    await apiClient.delete(`${this.basePath}/bulk-delete`, {
      data: { ids },
    })
  }
}

export const notificationService = new NotificationServiceBackend()
