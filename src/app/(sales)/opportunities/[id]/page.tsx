"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useOpportunity } from '@/features/opportunities/hooks/use-opportunities'
import { useSalesStage } from '@/features/opportunities/hooks/use-sales-stage'
import { OpportunityInfoHeader } from '@/features/opportunities/components/opportunity-info-header'
import { OpportunityStageDialog } from '@/features/opportunities/components/dialogs/opportunity-stage-dialog'
import { LogActivityButton } from '@/features/activities/components'
import { OpportunityStateCode, SalesStageCode } from '@/core/contracts'
import { SalesBusinessProcessFlow } from '@/shared/components'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Loader2,
  Edit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MoreVertical,
  FileText,
  Trash2,
} from 'lucide-react'

// Dynamic imports for performance
const OpportunityDetailTabs = dynamic(
  () => import('@/features/opportunities/components/opportunity-detail-tabs').then(mod => ({ default: mod.OpportunityDetailTabs })),
  { ssr: false }
)

export default function OpportunityDetailPageFinal() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { opportunity, loading, refetch } = useOpportunity(id)
  const { moveToNextStage, moveToPreviousStage, loading: stageLoading } = useSalesStage()

  // Stage Dialog state
  const [stageDialogOpen, setStageDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<SalesStageCode | null>(null)

  const handleNextStage = async () => {
    try {
      await moveToNextStage(id)
      refetch()
    } catch (error) {
      console.error('Error moving to next stage:', error)
      alert('Failed to move to next stage. Please try again.')
    }
  }

  const handlePreviousStage = async () => {
    try {
      await moveToPreviousStage(id)
      refetch()
    } catch (error) {
      console.error('Error moving to previous stage:', error)
      alert('Failed to move to previous stage. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">Opportunity not found</p>
        <Button asChild>
          <Link href="/opportunities">Back to Opportunities</Link>
        </Button>
      </div>
    )
  }

  // Determine available actions
  const isOpen = opportunity.statecode === OpportunityStateCode.Open
  const canEdit = isOpen
  const canMoveNext = isOpen && opportunity.salesstage < SalesStageCode.Close
  const canMovePrevious = isOpen && opportunity.salesstage > SalesStageCode.Qualify
  const canClose = isOpen && opportunity.salesstage === SalesStageCode.Close

  return (
    <>
      {/* Header - Desktop Only */}
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
                <BreadcrumbLink href="/opportunities">Opportunities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{opportunity.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Back Button + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <Link href="/opportunities">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                OPPORTUNITIES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {opportunity.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Hamburger + Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Navigation Menu */}
            <SidebarTrigger className="h-8 w-8" />

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 mx-1" />

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={`/opportunities/${id}/edit`} className="flex items-center cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Log Activity
                </DropdownMenuItem>
                {isOpen && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${id}/close`} className="flex items-center cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Win Opportunity
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${id}/close`} className="flex items-center cursor-pointer">
                        <XCircle className="mr-2 h-4 w-4" />
                        Lose Opportunity
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER COMPLETO - Info Header + BPF + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              {/* Left: Info Header */}
              <div className="flex-1 min-w-0">
                <OpportunityInfoHeader opportunity={opportunity} />
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Win/Lose Buttons */}
                {isOpen && (
                  <Button asChild size="default" className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                    <Link href={`/opportunities/${id}/close`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Win Opportunity
                    </Link>
                  </Button>
                )}

                {isOpen && (
                  <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Link href={`/opportunities/${id}/close`}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Lose Opportunity
                    </Link>
                  </Button>
                )}

                {/* Log Activity */}
                <LogActivityButton
                  regardingId={opportunity.opportunityid}
                  regardingType="opportunity"
                  regardingName={opportunity.name}
                  showQuickActions
                />

                {/* Edit */}
                {canEdit && (
                  <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Link href={`/opportunities/${id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Layout: Stacked */}
            <div className="md:hidden space-y-4">
              {/* Info Header */}
              <OpportunityInfoHeader opportunity={opportunity} />

              {/* Action Buttons - Stacked on mobile */}
              {isOpen && (
                <div className="flex flex-col gap-2">
                  <Button asChild size="default" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium">
                    <Link href={`/opportunities/${id}/close`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Win Opportunity
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Link href={`/opportunities/${id}/close`}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Lose Opportunity
                    </Link>
                  </Button>
                </div>
              )}
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
              // Map stage ID to SalesStageCode
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

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="opportunity-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with opportunity details */}
        <div className="px-4 pb-4 pt-1">
          <OpportunityDetailTabs
            opportunity={opportunity}
            originatingLeadId={opportunity.originatingleadid}
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
