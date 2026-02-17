'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateQuote } from '@/features/quotes/hooks/use-quote-mutations'
import { useBulkCreateQuoteDetails } from '@/features/quotes/hooks/use-quote-details'
import { useQuoteTemplate } from '@/features/quotes/hooks/use-quote-templates'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateQuoteDto } from '@/features/quotes/types'
import type { CreateQuoteDetailDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X, Package } from 'lucide-react'
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
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')

  const { mutate: createQuote, isPending: isCreating } = useCreateQuote()
  const { mutate: bulkCreateDetails, isPending: isCreatingLines } = useBulkCreateQuoteDetails()
  const { data: template, isLoading: isLoadingTemplate } = useQuoteTemplate(templateId || '')

  // Store template lines to create after quote is created
  const templateLinesRef = useRef<any[] | null>(null)

  // Set template lines when template loads
  if (template && !templateLinesRef.current) {
    templateLinesRef.current = template.templatedata.lines
  }

  const isPending = isCreating || isCreatingLines

  const handleSubmit = (data: CreateQuoteDto) => {
    createQuote(data, {
      onSuccess: (newQuote) => {
        const lines = templateLinesRef.current
        if (lines && lines.length > 0) {
          // Create line items from template
          const lineItems: CreateQuoteDetailDto[] = lines.map((line) => ({
            quoteid: newQuote.quoteid,
            productid: line.productid,
            productdescription: line.productdescription,
            quantity: line.quantity,
            priceperunit: line.priceperunit,
            manualdiscountamount: line.manualdiscountamount || 0,
            tax: line.tax || 0,
          }))

          bulkCreateDetails(lineItems, {
            onSuccess: () => {
              toast.success('Quote created from template', {
                description: `${data.name} has been created with ${lineItems.length} products.`
              })
              router.push(`/quotes/${newQuote.quoteid}`)
            },
            onError: () => {
              // Quote was created but lines failed - still navigate
              toast.warning('Quote created but some products failed to add', {
                description: 'You can add products manually.'
              })
              router.push(`/quotes/${newQuote.quoteid}`)
            }
          })
        } else {
          toast.success('Quote created successfully', {
            description: `${data.name} has been created. You can now add products.`
          })
          router.push(`/quotes/${newQuote.quoteid}`)
        }
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
      <MobileDetailHeader
        backHref="/quotes"
        entityType="NEW QUOTE"
        title="New Quote"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('quote-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Quotes', href: '/quotes' },
          { label: 'New Quote' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Quote</h1>
                  {template ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-muted-foreground">
                        From template:
                      </p>
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {template.name} ({template.templatedata.lines.length} products)
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      Add a new sales quotation. Products can be added after creation.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('quote-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          {(templateId && isLoadingTemplate) ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            <QuoteFormTabs
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
              hideActions
              defaultData={template ? {
                name: template.templatedata.name,
                description: template.templatedata.description,
                effectivefrom: template.templatedata.effectivefrom,
                effectiveto: template.templatedata.effectiveto,
              } : undefined}
            />
          )}
        </div>
      </div>
    </>
  )
}
