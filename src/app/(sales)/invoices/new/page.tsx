'use client'

import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateInvoiceDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'

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
        toast.error('Authentication required. Please sign in to create an invoice.')
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

      toast.info('Invoice creation is pending backend implementation.')
      router.push('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/invoices')
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/invoices"
        entityType="NEW INVOICE"
        title="New Invoice"
        actions={
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
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: 'New Invoice' },
        ]}
      />

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
