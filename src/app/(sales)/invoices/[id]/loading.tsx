import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvoiceDetailLoading() {
  return (
    <SidebarInset>
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Skeleton className="h-4 w-32" />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-64" />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Lines Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            {/* Related Records Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
