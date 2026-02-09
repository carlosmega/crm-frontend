import { Skeleton } from '@/components/ui/skeleton'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

/**
 * Order Edit Loading State
 *
 * Skeleton UI for order edit page with:
 * - Header with breadcrumbs
 * - Title and action buttons
 * - Tabs navigation
 * - Form cards
 */
export default function Loading() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Tabs Navigation */}
        <Skeleton className="h-10 w-72" />

        {/* Form Card */}
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </SidebarInset>
  )
}
