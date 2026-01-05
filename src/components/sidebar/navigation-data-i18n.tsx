'use client'

/**
 * i18n Navigation Data
 * Provides translated navigation labels based on user locale
 */

import { useMemo } from 'react'
import {
  BarChart3,
  Building2,
  FileText,
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

// ✅ Define navigation data type explicitly to avoid circular reference
type NavigationItem = {
  title: string
  url: string
  icon: LucideIcon
}

type NavigationData = {
  dashboard: NavigationItem[]
  sales: NavigationItem[]
  customers: NavigationItem[]
  quoteToCash: NavigationItem[]
  catalogActivities: NavigationItem[]
  settings: NavigationItem[]
  labels: {
    sales: string
    customers: string
    quoteToCash: string
    catalogActivities: string
    settings: string
  }
}

// ✅ Cache for stable navigation data (prevents re-creation on re-renders)
let cachedNavigationData: NavigationData | null = null

export function useNavigationData() {
  const { t, isLoading } = useTranslation('navigation')

  const navigationData = useMemo(
    () => {
      // If still loading, return cached data if available
      if (isLoading && cachedNavigationData) {
        return cachedNavigationData
      }

      const data = {
        dashboard: [
          {
            title: t('main.dashboard'),
            url: '/dashboard',
            icon: LayoutDashboard,
          },
        ],

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

        settings: [
          {
            title: t('user.settings'),
            url: '/settings',
            icon: Settings,
          },
        ],

        // Section labels (translated)
        labels: {
          sales: t('main.sales'),
          customers: t('main.customers'),
          quoteToCash: 'Quote-to-Cash', // Technical term, usually not translated
          catalogActivities: t('main.sales') + ' & Activities',
          settings: t('main.settings'),
        },
      }

      // ✅ Cache for future renders
      if (!isLoading) {
        cachedNavigationData = data
      }

      return data
    },
    [t, isLoading]
  )

  return { navigationData, isLoading }
}
