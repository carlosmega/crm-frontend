import {
  BarChart3,
  Bell,
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
} from "lucide-react"

/**
 * Static navigation data for the CRM sidebar
 * Extracted outside component to prevent recreation on every render
 */
export const NAVIGATION_DATA = {
  // Dashboard - Sin sección
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

  // Sección Sales - Pipeline de ventas
  sales: [
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

  // Sección Customers - Gestión de clientes
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

  // Sección Quote-to-Cash - Proceso de cotización a facturación
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

  // Sección Catalog & Activities - Catálogo y actividades
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

  // Sección Settings - Configuración
  settings: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

/**
 * User data (can be dynamic in real implementation)
 */
export const USER_DATA = {
  name: "Usuario Demo",
  email: "demo@crm.com",
  avatar: "", // Avatar vacío - se mostrará las iniciales en AvatarFallback
}

/**
 * Companies/tenants data (can be dynamic in real implementation)
 */
export const COMPANIES_DATA = [
  {
    name: "Acme Inc",
    logo: Building2,
    plan: "Enterprise",
  },
  {
    name: "TechCorp",
    logo: Building2,
    plan: "Professional",
  },
]
