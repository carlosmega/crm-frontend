'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { CreateInvoiceDto } from '@/core/contracts'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'

// Dynamic import for InvoiceFormTabs
const InvoiceFormTabs = dynamic(
  () => import('@/features/invoices/components/invoice-form-tabs').then(m => ({ default: m.InvoiceFormTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    ),
    ssr: false
  }
)

/**
 * Invoice New Page
 *
 * Create a new invoice with tabbed interface
 */
export default function InvoiceNewPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // TODO: Replace with actual mutation hook when available
  const handleSubmit = async (data: CreateInvoiceDto) => {
    try {
      // Get ownerid from authenticated user
      const ownerid = session?.user?.id

      if (!ownerid) {
        console.error('No authenticated user found')
        alert('Authentication required. Please sign in to create an invoice.')
        return
      }

      // Add ownerid to the data
      const invoiceData = {
        ...data,
        ownerid,
      }

      console.log('Creating invoice:', invoiceData)

      // TODO: Call actual API when backend is ready
      // const response = await fetch('/api/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoiceData),
      // })
      // const newInvoice = await response.json()
      // router.push(`/invoices/${newInvoice.invoiceid}`)

      alert('Invoice creation is pending backend implementation. Data logged to console.')
      router.push('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/invoices')
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                NEW INVOICE
              </p>
              <h1 className="text-sm font-semibold text-gray-900">
                Create Invoice
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('invoice-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <BreadcrumbPage>New</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
                  <p className="text-muted-foreground mt-1">
                    Generate a new invoice for a customer
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('invoice-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
              <p className="text-muted-foreground mt-1">
                Generate a new invoice
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="invoice-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <InvoiceFormTabs
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
