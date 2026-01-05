import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

/**
 * Sales Layout
 * ✅ OPTIMIZED: Uses SidebarInset pattern with stable key
 * - Sidebar component has stable "sales-sidebar" key to prevent re-mounting
 * - Only SidebarInset content changes on navigation
 * - Prevents flickering and unnecessary re-renders
 * - SidebarInset provides flex column layout with h-screen and overflow-hidden
 */
export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppSidebar key="sales-sidebar" />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {children}
      </SidebarInset>
    </>
  )
}
