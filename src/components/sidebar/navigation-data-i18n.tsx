'use client'

/**
 * i18n Navigation Data
 * Provides translated navigation labels based on user locale
 * Supports module-based filtering (Sales, Service)
 */

import { useMemo } from 'react'
import {
  BarChart3,
  Bell,
  Building2,
  FileText,
  Headphones,
  Inbox,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { useModule, type ModuleId } from '@/core/providers/module-provider'

// ===== TYPES =====

type NavigationItem = {
  title: string
  url: string
  icon: LucideIcon
  badge?: number
}

type ModuleNavigationData = {
  // Shared sections (always visible)
  dashboard: NavigationItem[]
  notifications: NavigationItem[]
  customers: NavigationItem[]
  settings: NavigationItem[]

  // Sales-specific sections
  sales: NavigationItem[]
  quoteToCash: NavigationItem[]
  catalogActivities: NavigationItem[]

  // Service-specific sections
  support: NavigationItem[]

  // Section labels (translated)
  labels: {
    sales: string
    customers: string
    quoteToCash: string
    catalogActivities: string
    settings: string
    support: string
  }
}

// ===== CACHE =====

let cachedNavigationData: ModuleNavigationData | null = null

// ===== HOOK =====

export function useNavigationData() {
  const { t, isLoading } = useTranslation('navigation')
  const { notifications } = useNotifications()
  const { activeModule } = useModule()

  // Calculate unread notification count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const navigationData = useMemo(
    () => {
      // If still loading, return cached data if available
      if (isLoading && cachedNavigationData) {
        return cachedNavigationData
      }

      const data: ModuleNavigationData = {
        // ===== SHARED SECTIONS =====
        dashboard: [
          {
            title: t('main.dashboard'),
            url: '/dashboard',
            icon: LayoutDashboard,
          },
        ],

        notifications: [
          {
            title: t('main.notifications'),
            url: '/notifications',
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : undefined,
          },
        ],

        customers: [
          {
            title: t('customers.accounts'),
            url: '/accounts',
            icon: Building2,
          },
          {
            title: t('customers.contacts'),
            url: '/contacts',
            icon: Users,
          },
        ],

        settings: [
          {
            title: t('user.settings'),
            url: '/settings',
            icon: Settings,
          },
        ],

        // ===== SALES MODULE SECTIONS =====
        sales: [
          {
            title: t('sales.leads'),
            url: '/leads',
            icon: Inbox,
          },
          {
            title: t('sales.opportunities'),
            url: '/opportunities',
            icon: BarChart3,
          },
        ],

        quoteToCash: [
          {
            title: t('sales.quotes'),
            url: '/quotes',
            icon: FileText,
          },
          {
            title: t('sales.orders'),
            url: '/orders',
            icon: ShoppingCart,
          },
          {
            title: t('sales.invoices'),
            url: '/invoices',
            icon: Receipt,
          },
        ],

        catalogActivities: [
          {
            title: t('sales.products'),
            url: '/products',
            icon: Package,
          },
          {
            title: t('customers.activities'),
            url: '/activities',
            icon: UserCircle,
          },
        ],

        // ===== SERVICE MODULE SECTIONS =====
        support: [
          {
            title: t('service.cases') || 'Cases',
            url: '/cases',
            icon: Headphones,
          },
        ],

        // Section labels (translated)
        labels: {
          sales: t('main.sales'),
          customers: t('main.customers'),
          quoteToCash: 'Quote-to-Cash', // Technical term, usually not translated
          catalogActivities: t('main.sales') + ' & Activities',
          settings: t('main.settings'),
          support: t('main.service') || 'Service',
        },
      }

      // Cache for future renders
      if (!isLoading) {
        cachedNavigationData = data
      }

      return data
    },
    [t, isLoading, unreadCount]
  )

  return { navigationData, isLoading, activeModule }
}
