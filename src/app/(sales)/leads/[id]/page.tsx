"use client"

import { use, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useLead } from '@/features/leads/hooks/use-leads'
import { useLeadMutations } from '@/features/leads/hooks/use-lead-mutations'
import { LeadInfoHeader } from '@/features/leads/components/lead-info-header'
import { LeadRelatedOpportunity } from '@/features/leads/components/lead-related-opportunity'
import { LeadStageDialog } from '@/features/leads/components/dialogs/lead-stage-dialog'
import { LogActivityButton } from '@/features/activities/components'
import { CreateActivityDialog } from '@/features/activities/components/create-activity-dialog'
import { SalesBusinessProcessFlow } from '@/shared/components'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'

// ✅ PERFORMANCE: Dynamic import for wizard (reduces initial bundle by ~15-20KB)
const LeadQualificationWizard = dynamic(
  () => import('@/features/leads/components/qualification-wizard').then(mod => ({ default: mod.LeadQualificationWizard })),
  { ssr: false }
)

// ✅ PERFORMANCE: Dynamic import for detail tabs
const LeadDetailTabs = dynamic(
  () => import('@/features/leads/components/lead-detail-tabs').then(mod => ({ default: mod.LeadDetailTabs })),
  { ssr: false }
)
import { LeadStateCode } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreVertical,
  FileText,
} from 'lucide-react'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { lead, loading, refetch } = useLead(resolvedParams.id)
  const { deleteLead, disqualifyLead, loading: mutating } = useLeadMutations()
  const [qualifyDialogOpen, setQualifyDialogOpen] = useState(false)
  const [createActivityDialogOpen, setCreateActivityDialogOpen] = useState(false)
  const [stageDialogOpen, setStageDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(resolvedParams.id)
        router.push('/leads')
      } catch (error) {
        console.error('Error deleting lead:', error)
      }
    }
  }

  const handleDisqualify = async () => {
    if (confirm('Are you sure you want to disqualify this lead?')) {
      try {
        await disqualifyLead(resolvedParams.id)
        window.location.reload()
      } catch (error) {
        console.error('Error disqualifying lead:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">Lead not found</p>
        <Button asChild>
          <Link href="/leads">Back to Leads</Link>
        </Button>
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
        <DropdownMenuItem asChild>
          <Link href={`/leads/${lead.leadid}/edit`} className="flex items-center cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCreateActivityDialogOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Log Activity
        </DropdownMenuItem>
        {lead.statecode === LeadStateCode.Open && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setQualifyDialogOpen(true)} disabled={mutating}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Qualify Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisqualify} disabled={mutating}>
              <XCircle className="mr-2 h-4 w-4" />
              Disqualify
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} disabled={mutating} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/leads"
        entityType="LEADS"
        title={lead.fullname || `${lead.firstname} ${lead.lastname}`}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: lead.fullname || `${lead.firstname} ${lead.lastname}` },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER COMPLETO - Lead Info + Badges + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Lead Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <LeadInfoHeader lead={lead} className="border-0 p-0" />
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.statecode === LeadStateCode.Open && (
                  <>
                    <Button onClick={() => setQualifyDialogOpen(true)} disabled={mutating} className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Qualify Lead
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisqualify}
                      disabled={mutating}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Disqualify
                    </Button>
                  </>
                )}
                <LogActivityButton
                  regardingId={lead.leadid}
                  regardingType="lead"
                  regardingName={lead.fullname || `${lead.firstname} ${lead.lastname}`}
                  showQuickActions
                />
                <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Link href={`/leads/${lead.leadid}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={mutating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
            <div className="md:hidden">
              <LeadInfoHeader lead={lead} className="border-0 p-0" />
            </div>
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

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="lead-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with lead details */}
        <div className="px-4 pb-4 pt-1">
          <LeadDetailTabs
            lead={lead}
            activityCount={{
              emails: 0, // TODO: Get from activity service
              phoneCalls: 0,
              meetings: 0,
              formSubmissions: 0,
            }}
          />

          {/* Related Opportunity (only shown if lead is qualified) */}
          {lead.statecode === LeadStateCode.Qualified && (
            <div className="mt-4">
              <LeadRelatedOpportunity leadId={lead.leadid} />
            </div>
          )}
        </div>
      </div>

      {/* Qualification Wizard */}
      <LeadQualificationWizard
        lead={lead}
        open={qualifyDialogOpen}
        onOpenChange={setQualifyDialogOpen}
      />

      {/* Create Activity Dialog for mobile menu */}
      <CreateActivityDialog
        open={createActivityDialogOpen}
        onOpenChange={setCreateActivityDialogOpen}
        regardingId={lead.leadid}
        regardingType="lead"
        regardingName={lead.fullname || `${lead.firstname} ${lead.lastname}`}
      />

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
