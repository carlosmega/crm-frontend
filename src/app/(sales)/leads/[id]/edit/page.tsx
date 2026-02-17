"use client"

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLead } from '@/features/leads/hooks/use-leads'
import { useLeadMutations } from '@/features/leads/hooks/use-lead-mutations'
import { LeadInfoHeader } from '@/features/leads/components/lead-info-header'
import { LeadFormTabs } from '@/features/leads/components/lead-form-tabs'
import { LeadStageDialog } from '@/features/leads/components/dialogs/lead-stage-dialog'
import { SalesBusinessProcessFlow } from '@/shared/components'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateLeadDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { lead, loading, refetch } = useLead(resolvedParams.id)
  const { updateLead, loading: mutating } = useLeadMutations()
  const [stageDialogOpen, setStageDialogOpen] = useState(false)

  const handleSubmit = async (data: UpdateLeadDto) => {
    try {
      await updateLead(resolvedParams.id, data)
      router.push(`/leads/${resolvedParams.id}`)
    } catch (error) {
      console.error('Error updating lead:', error)
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

  if (!lead) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Lead not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/leads/${lead.leadid}`}
        entityType="EDIT LEAD"
        title={lead.fullname}
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('lead-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={mutating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: lead.fullname, href: `/leads/${lead.leadid}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content - Fondo gris igual que opportunities */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY HEADER COMPLETO - Lead Info + BPF + Tabs */}
        <div className="md:sticky top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Lead Info Header & Actions - Desktop only */}
          <div className="hidden md:block px-4 pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <LeadInfoHeader lead={lead} className="border-0 p-0" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('lead-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={mutating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {mutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile - Just Info Header, buttons in top header */}
          <div className="md:hidden px-4 pt-4 pb-2">
            <LeadInfoHeader lead={lead} className="border-0 p-0" />
          </div>

          {/* Business Process Flow */}
          <SalesBusinessProcessFlow
            entityType="lead"
            entityState={{
              currentStage: 0, // Leads only have Qualify stage
              stateCode: lead.statecode,
              id: lead.leadid,
              name: lead.fullname || `${lead.firstname} ${lead.lastname}`,
            }}
            onStageClick={(stageId) => {
              // Open Qualify stage dialog (Leads only have Qualify stage)
              setStageDialogOpen(true)
            }}
          />

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="lead-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Formulario con tabs */}
        <div className="px-4 pb-4 pt-1">
          <LeadFormTabs
            lead={lead}
            onSubmit={handleSubmit}
            isLoading={mutating}
          />
        </div>
      </div>

      {/* Stage Dialog */}
      <LeadStageDialog
        lead={lead}
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        onSuccess={() => refetch()}
      />
    </>
  )
}
