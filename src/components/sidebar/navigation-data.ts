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
} from "lucide-react"
import type { ModuleId } from "@/core/providers/module-provider"

/**
 * Static navigation data for the CRM sidebar
 *
 * Organized by module (shared, sales, service) to enable
 * module-aware navigation filtering.
 */

// Navigation item type
export interface NavigationItem {
  title: string
  url: string
  icon: typeof LayoutDashboard
}

// Section with label and items
export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

/**
 * Navigation data organized by module
 *
 * - shared: Always visible regardless of active module
 * - sales: Only visible when Sales module is active
 * - service: Only visible when Service module is active
 */
export const NAVIGATION_DATA = {
  // ===== SHARED (Always visible) =====
  shared: {
    // Dashboard - No section label
    dashboard: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],

    // Notifications - Standalone (high priority)
    notifications: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
      },
    ],

    // Customers Section - Shared between Sales and Service
    customers: [
      {
        title: "Accounts",
        url: "/accounts",
        icon: Building2,
      },
      {
        title: "Contacts",
        url: "/contacts",
        icon: Users,
      },
    ],

    // Settings Section
    settings: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },

  // ===== SALES MODULE =====
  sales: {
    // Sales Pipeline
    pipeline: [
      {
        title: "Leads",
        url: "/leads",
        icon: Inbox,
      },
      {
        title: "Opportunities",
        url: "/opportunities",
        icon: BarChart3,
      },
    ],

    // Quote-to-Cash Process
    quoteToCash: [
      {
        title: "Quotes",
        url: "/quotes",
        icon: FileText,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: Receipt,
      },
    ],

    // Catalog & Activities
    catalogActivities: [
      {
        title: "Products",
        url: "/products",
        icon: Package,
      },
      {
        title: "Activities",
        url: "/activities",
        icon: UserCircle,
      },
    ],
  },

  // ===== SERVICE MODULE =====
  service: {
    // Support Section
    support: [
      {
        title: "Cases",
        url: "/cases",
        icon: Headphones,
      },
    ],

    // Service Activities
    activities: [
      {
        title: "Activities",
        url: "/activities",
        icon: UserCircle,
      },
    ],
  },
}

/**
 * Section labels - to be translated via i18n
 */
export const SECTION_LABELS = {
  sales: "Sales",
  customers: "Customers",
  quoteToCash: "Quote-to-Cash",
  catalogActivities: "Catalog & Activities",
  settings: "Settings",
  support: "Support",
  serviceActivities: "Activities",
}

/**
 * User data (can be dynamic in real implementation)
 */
export const USER_DATA = {
  name: "Usuario Demo",
  email: "demo@crm.com",
  avatar: "", // Avatar vacío - se mostrará las iniciales en AvatarFallback
}
