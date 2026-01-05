'use client'

import Link from 'next/link'
import { InvoiceAgingReport } from '@/features/invoices/components/invoice-aging-report'
import { useInvoices } from '@/features/invoices/hooks/use-invoices'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * Invoice Aging Report Page
 *
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useInvoices() maneja la autenticación correctamente
 */
export default function InvoiceAgingPage() {
  const { data: invoices, isLoading, error } = useInvoices()

  return (
    <>
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <BreadcrumbPage>Aging Report</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <div className="px-4 pb-6 pt-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Invoice Aging Report</h2>
              <p className="text-muted-foreground">
                Analyze outstanding invoices by aging period (Current, 30, 60, 90+ days)
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Link>
            </Button>
          </div>

          {/* Content */}
          {isLoading && (
            <div className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
              <Skeleton className="h-96" />
              <Skeleton className="h-64" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading invoices</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load invoice data'}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && invoices && (
            <InvoiceAgingReport invoices={invoices} />
          )}
        </div>
      </div>
    </>
  )
}
