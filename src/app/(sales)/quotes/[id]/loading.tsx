import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset } from "@/components/ui/sidebar"

export default function Loading() {
  return (
    <SidebarInset>
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-6xl space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
