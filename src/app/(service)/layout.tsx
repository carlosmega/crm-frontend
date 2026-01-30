import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

/**
 * Service Layout
 *
 * Layout for Service module (Cases, Support, etc.)
 * Uses the same pattern as Sales layout with shared AppSidebar.
 */
export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppSidebar key="service-sidebar" />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {children}
      </SidebarInset>
    </>
  )
}
