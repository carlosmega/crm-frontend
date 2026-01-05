import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface ListPageLoadingProps {
  breadcrumbParent?: string
  breadcrumbCurrent: string
}

export function ListPageLoading({ breadcrumbParent = "Sales", breadcrumbCurrent }: ListPageLoadingProps) {
  return (
    <SidebarInset className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header Section */}
      <div className="shrink-0 bg-background">
        {/* Breadcrumb Header */}
        <header className="flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">{breadcrumbParent}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbCurrent}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Page Header */}
        <div className="flex flex-col gap-4 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>

        {/* Filters and Search Card */}
        <div className="bg-muted/30 rounded-lg border border-border p-4 mx-4 mb-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col">
        <div className="rounded-lg border bg-card">
          {/* Table Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-[100px]" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[200px]" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
