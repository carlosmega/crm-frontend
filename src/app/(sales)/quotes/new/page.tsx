'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCreateQuote } from '@/features/quotes/hooks/use-quote-mutations'
import type { CreateQuoteDto } from '@/features/quotes/types'
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
import { toast } from 'sonner'

// Dynamic import for QuoteFormTabs
const QuoteFormTabs = dynamic(
  () => import('@/features/quotes/components/quote-form-tabs').then(m => ({ default: m.QuoteFormTabs })),
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
 * Quote New Page
 *
 * Create a new quote with tabbed interface
 */
export default function QuoteNewPage() {
  const router = useRouter()
  const { mutate: createQuote, isPending: isCreating } = useCreateQuote()

  const handleSubmit = (data: CreateQuoteDto) => {
    createQuote(data, {
      onSuccess: (newQuote) => {
        toast.success('Quote created successfully', {
          description: `${data.name} has been created. You can now add products.`
        })
        router.push(`/quotes/${newQuote.quoteid}`)
      },
      onError: (error) => {
        toast.error('Failed to create quote', {
          description: error.message || 'Please try again'
        })
      }
    })
  }

  const handleCancel = () => {
    router.push('/quotes')
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
                NEW QUOTE
              </p>
              <h1 className="text-sm font-semibold text-gray-900">
                Create Quote
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('quote-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={isCreating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
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
                  <h1 className="text-2xl font-bold tracking-tight">Create New Quote</h1>
                  <p className="text-muted-foreground mt-1">
                    Add a new sales quotation. Products can be added after creation.
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
                    const form = document.getElementById('quote-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Quote
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Quote</h1>
              <p className="text-muted-foreground mt-1">
                Add a new sales quotation
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="quote-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <QuoteFormTabs
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isCreating}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
