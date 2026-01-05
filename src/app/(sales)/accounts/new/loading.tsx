import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-6 w-48" />
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    </SidebarInset>
  )
}
