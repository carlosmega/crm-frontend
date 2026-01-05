'use client'

import { useState, useMemo } from 'react'
import type { Notification, NotificationFilters } from '../types'

export function useNotificationFilters(notifications: Notification[]) {
  const [filters, setFilters] = useState<NotificationFilters>({})

  const filteredNotifications = useMemo(() => {
    let result = [...notifications]

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query)
      )
    }

    // Filter by types
    if (filters.types && filters.types.length > 0) {
      result = result.filter((n) => filters.types!.includes(n.type))
    }

    // Filter by priorities
    if (filters.priorities && filters.priorities.length > 0) {
      result = result.filter((n) => filters.priorities!.includes(n.priority))
    }

    // Filter by read status
    if (filters.isRead !== undefined) {
      result = result.filter((n) => n.isRead === filters.isRead)
    }

    // Filter by date range
    if (filters.dateRange) {
      result = result.filter(
        (n) =>
          n.timestamp >= filters.dateRange!.from &&
          n.timestamp <= filters.dateRange!.to
      )
    }

    return result
  }, [notifications, filters])

  const clearFilters = () => setFilters({})

  return {
    filters,
    setFilters,
    clearFilters,
    filteredNotifications,
  }
}
