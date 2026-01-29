"use client"

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useOpportunity } from '@/features/opportunities/hooks/use-opportunities'
import { useOpportunityMutations } from '@/features/opportunities/hooks/use-opportunity-mutations'
import { OpportunityInfoHeader } from '@/features/opportunities/components/opportunity-info-header'
import { OpportunityStageDialog } from '@/features/opportunities/components/dialogs/opportunity-stage-dialog'
import { SalesBusinessProcessFlow } from '@/shared/components'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateOpportunityDto } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'

// ✅ PERFORMANCE CRÍTICO: Dynamic imports para componentes pesados
// Reducen el bundle de 242KB a ~175KB (-60-70KB!)
// El formulario y BPF solo se cargan cuando realmente se necesitan

const OpportunityFormTabs = dynamic(
  () => import('@/features/opportunities/components/opportunity-form-tabs').then(m => ({ default: m.OpportunityFormTabs })),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false
  }
)

export default function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()

  const { opportunity, loading, refetch } = useOpportunity(resolvedParams.id)
  const { updateOpportunity, loading: updating } = useOpportunityMutations()

  // Stage Dialog state
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<SalesStageCode | null>(null)

  const handleSubmit = async (data: UpdateOpportunityDto) => {
    try {
      console.log('Submitting opportunity update:', data)
      const result = await updateOpportunity(resolvedParams.id, data)
      console.log('Update successful:', result)
      router.push(`/opportunities/${resolvedParams.id}`)
    } catch (error: any) {
      console.error('Error updating opportunity:', error)
      const errorMessage = error?.message || 'Failed to update opportunity. Please try again.'
      alert(errorMessage)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!opportunity) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Opportunity not found</p>
        </div>
      </>
    )
  }

  // ⚠️ VALIDACIÓN: No permitir editar oportunidades cerradas (Won/Lost)
  // statecode: 0=Open, 1=Won, 2=Lost
  if (opportunity.statecode === 1 || opportunity.statecode === 2) {
    const statusText = opportunity.statecode === 1 ? 'Won' : 'Lost'
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className="text-center space-y-4">
            <div className="text-destructive">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold">Cannot Edit Closed Opportunity</p>
              <p className="text-sm text-muted-foreground mt-2">
                This opportunity is already closed as <strong>{statusText}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Closed opportunities cannot be edited to preserve sales history integrity.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href={`/opportunities/${resolvedParams.id}`}>View Details</Link>
              </Button>
              <Button asChild>
                <Link href="/opportunities">Back to Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/opportunities/${resolvedParams.id}`}
        entityType="EDIT OPPORTUNITY"
        title={opportunity.name}
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('opportunity-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={updating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Opportunities', href: '/opportunities' },
          { label: opportunity.name, href: `/opportunities/${resolvedParams.id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER COMPLETO - Info Header + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Opportunity Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <OpportunityInfoHeader opportunity={opportunity} />
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
                  disabled={updating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Info header only (buttons in top header) */}
            <div className="md:hidden">
              <OpportunityInfoHeader opportunity={opportunity} />
            </div>
          </div>

          {/* Business Process Flow */}
          <SalesBusinessProcessFlow
            entityType="opportunity"
            entityState={{
              currentStage: opportunity.salesstage,
              stateCode: opportunity.statecode,
              id: opportunity.opportunityid,
              name: opportunity.name,
              closeReason: opportunity.closestatus,
            }}
            onStageClick={(stageId) => {
              // Map stage ID to SalesStageCode and open dialog
              const stageMap: Record<string, SalesStageCode> = {
                qualify: SalesStageCode.Qualify,
                develop: SalesStageCode.Develop,
                propose: SalesStageCode.Propose,
                close: SalesStageCode.Close,
              }
              setSelectedStage(stageMap[stageId] ?? null)
              setStageDialogOpen(true)
            }}
          />

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="opportunity-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form */}
        <div className="px-4 pb-4 pt-1">
          <OpportunityFormTabs
            opportunity={opportunity}
            onSubmit={handleSubmit}
            isLoading={updating}
          />
        </div>
      </div>

      {/* Stage Dialog */}
      <OpportunityStageDialog
        opportunity={opportunity}
        stage={selectedStage}
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        onSuccess={() => refetch()}
      />
    </>
  )
}
