import { Skeleton } from "@/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-6 w-48" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    </SidebarInset>
  )
}
