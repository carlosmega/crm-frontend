'use client'

import { useState, useEffect } from 'react'
import type { Notification } from '../types'
import { MOCK_NOTIFICATIONS } from '@/components/layout/notification-menu'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // PENDING: Replace with real API call when backend is ready
      // const response = await fetch('/api/notifications')
      // const data = await response.json()

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setNotifications(MOCK_NOTIFICATIONS)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
  }
}
