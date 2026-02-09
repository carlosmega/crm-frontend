"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { useOpportunityMutations } from '@/features/opportunities/hooks/use-opportunity-mutations'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateOpportunityDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'

// Dynamic import for performance optimization
const OpportunityFormTabs = dynamic(
  () => import('@/features/opportunities/components/opportunity-form-tabs').then(m => ({ default: m.OpportunityFormTabs })),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false
  }
)

export default function NewOpportunityPage() {
  const router = useRouter()
  const { createOpportunity, loading } = useOpportunityMutations()

  const handleSubmit = async (data: CreateOpportunityDto) => {
    try {
      const newOpportunity = await createOpportunity(data)
      router.push(`/opportunities/${newOpportunity.opportunityid}`)
    } catch (error) {
      console.error('Error creating opportunity:', error)
      toast.error('Failed to create opportunity. Please try again.')
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/opportunities"
        entityType="NEW OPPORTUNITY"
        title="New Opportunity"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('opportunity-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Opportunities', href: '/opportunities' },
          { label: 'New Opportunity' },
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
                  <h1 className="text-2xl font-bold tracking-tight">Create New Opportunity</h1>
                  <p className="text-muted-foreground mt-1">
                    Add a new opportunity to your sales pipeline
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
                    const form = document.getElementById('opportunity-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Opportunity
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Opportunity</h1>
              <p className="text-muted-foreground mt-1">
                Add a new opportunity to your sales pipeline
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="opportunity-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form */}
        <div className="px-4 pb-4 pt-1">
          <OpportunityFormTabs
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  )
}
