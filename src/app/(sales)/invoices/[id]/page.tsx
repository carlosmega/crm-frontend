'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useInvoice } from '@/features/invoices/hooks/use-invoices'
import { useInvoiceDetails } from '@/features/invoices/hooks/use-invoice-details'
import { useInvoicePdfExport } from '@/features/invoices/hooks/use-invoice-pdf-export'
import { MarkInvoicePaidButton } from '@/features/invoices/components/mark-invoice-paid-button'
import { CancelInvoiceButton } from '@/features/invoices/components/cancel-invoice-button'
import { InvoiceStateCode } from '@/core/contracts/enums'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'

// ✅ PERFORMANCE: Dynamic import for tabs
const InvoiceDetailTabs = dynamic(
  () => import('@/features/invoices/components/invoice-detail-tabs').then(mod => ({ default: mod.InvoiceDetailTabs })),
  { ssr: false }
)
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  FileText,
  Loader2,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Invoice Detail Page
 *
 * Vista detallada de una factura con información completa
 */
export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: invoice, isLoading: loading, error } = useInvoice(id)
  const { data: invoiceDetails, isLoading: loadingDetails } = useInvoiceDetails(id)
  const { exportToPdf, isExporting } = useInvoicePdfExport()

  const canMarkAsPaid = invoice?.statecode === InvoiceStateCode.Active
  const canCancel = invoice?.statecode === InvoiceStateCode.Active

  const getInvoiceStatusBadge = (statecode: number) => {
    switch (statecode) {
      case InvoiceStateCode.Active:
        return <Badge variant="default">Active</Badge>
      case InvoiceStateCode.Paid:
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Paid</Badge>
      case InvoiceStateCode.Canceled:
        return <Badge variant="destructive">Canceled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-4">
            Error loading invoice: {error.message}
          </p>
          <Button asChild>
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !invoice) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Mobile actions dropdown
  const mobileActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportToPdf(id)} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </DropdownMenuItem>
        {canMarkAsPaid && invoice && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const button = document.querySelector('[data-mark-paid-button]') as HTMLButtonElement
                button?.click()
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          </>
        )}
        {canCancel && invoice && (
          <DropdownMenuItem
            onClick={() => {
              const button = document.querySelector('[data-cancel-invoice-button]') as HTMLButtonElement
              button?.click()
            }}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Invoice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/invoices"
        entityType="INVOICES"
        title={invoice.name}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.name },
        ]}
      />

      {/* Content - Fondo gris igual que contacts/accounts/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Invoice Info Header + Actions + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Invoice Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Invoice Info */}
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{invoice.name}</h1>
                  {getInvoiceStatusBadge(invoice.statecode)}
                </div>
                {invoice.invoicenumber && (
                  <p className="text-muted-foreground mt-1 font-mono">
                    Invoice #{invoice.invoicenumber}
                  </p>
                )}
                {invoice.description && (
                  <p className="text-muted-foreground mt-2">{invoice.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/invoices">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToPdf(id)}
                  disabled={isExporting}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </Button>
                {canMarkAsPaid && invoice && (
                  <div data-mark-paid-button>
                    <MarkInvoicePaidButton invoice={invoice} />
                  </div>
                )}
                {canCancel && invoice && (
                  <div data-cancel-invoice-button>
                    <CancelInvoiceButton invoice={invoice} />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
            <div className="md:hidden">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{invoice.name}</h2>
                {getInvoiceStatusBadge(invoice.statecode)}
              </div>
              {invoice.invoicenumber && (
                <p className="text-muted-foreground font-mono text-sm">
                  Invoice #{invoice.invoicenumber}
                </p>
              )}
              {invoice.description && (
                <p className="text-muted-foreground mt-2">{invoice.description}</p>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="invoice-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with invoice details */}
        <div className="px-4 pb-4 pt-1">
          <InvoiceDetailTabs
            invoice={invoice}
            invoiceLines={invoiceDetails || []}
          />
        </div>
      </div>
    </>
  )
}
