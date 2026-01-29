'use client'

import { use } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuote } from '@/features/quotes/hooks/use-quotes'
import { useUpdateQuote } from '@/features/quotes/hooks/use-quote-mutations'
import { QuoteInfoHeader } from '@/features/quotes/components/quote-info-header'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateQuoteDto } from '@/features/quotes/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'
import { isQuoteEditable } from '@/features/quotes/utils/quote-helpers'
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

interface QuoteEditPageProps {
  params: Promise<{ id: string }>
}

/**
 * Quote Edit Page
 *
 * Edit an existing quote with tabbed interface
 */
export default function QuoteEditPage({ params }: QuoteEditPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: quote, isLoading, error } = useQuote(id)
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuote()

  const handleSubmit = (data: UpdateQuoteDto) => {
    updateQuote(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Quote updated successfully', {
            description: 'Your changes have been saved'
          })
          router.push(`/quotes/${id}`)
        },
        onError: (error) => {
          toast.error('Failed to update quote', {
            description: error.message || 'Please try again'
          })
        }
      }
    )
  }

  const handleCancel = () => {
    router.push(`/quotes/${id}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !quote) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-destructive">
          {error ? `Error: ${error.message}` : 'Quote not found'}
        </p>
        <Button asChild>
          <Link href="/quotes">Back to Quotes</Link>
        </Button>
      </div>
    )
  }

  // Not editable state
  if (!isQuoteEditable(quote)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold">Cannot Edit Quote</p>
            <p className="text-sm text-muted-foreground mt-2">
              This quote is not in Draft state and cannot be edited.
            </p>
            <p className="text-sm text-muted-foreground">
              Only quotes in Draft state can be modified.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href={`/quotes/${id}`}>View Details</Link>
            </Button>
            <Button asChild>
              <Link href="/quotes">Back to Quotes</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/quotes/${quote.quoteid}`}
        entityType="EDIT QUOTE"
        title={quote.name}
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('quote-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={isUpdating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Quotes', href: '/quotes' },
          { label: quote.name, href: `/quotes/${quote.quoteid}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER - Quote Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Quote Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <QuoteInfoHeader quote={quote} hideActions />
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
                  disabled={isUpdating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Info header only (buttons in top header) */}
            <div className="md:hidden">
              <QuoteInfoHeader quote={quote} hideActions />
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
            quote={quote}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isUpdating}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
