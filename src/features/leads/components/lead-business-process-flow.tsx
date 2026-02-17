"use client"

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { BusinessProcessFlow, type BPFStageWithStatus } from '@/shared/components/business-process-flow'
import { BPFAlert } from '@/shared/components/business-process-flow-alert'
import type { Lead } from '@/core/contracts'
import { LeadStateCode } from '@/core/contracts'
import { ArrowRight } from 'lucide-react'
import { useOpportunitiesByLead } from '@/features/opportunities/hooks/use-opportunities'
import { useTranslation } from '@/shared/hooks/use-translation'

interface LeadBusinessProcessFlowProps {
  lead?: Lead
  className?: string
  onStageClick?: (stageId: string) => void
  onProgressChange?: (progress: number) => void
}

/**
 * Lead Business Process Flow
 *
 * Shows the complete sales cycle with 4 stages:
 * 1. Qualify (25%) - Active for leads, complete qualification criteria
 * 2. Develop (50%) - Disabled for leads, requires conversion to Opportunity
 * 3. Propose (75%) - Disabled for leads, requires conversion to Opportunity
 * 4. Close (100%) - Disabled for leads, requires conversion to Opportunity
 *
 * This provides users with the "big picture" of the sales process while
 * clearly indicating which stages apply to leads vs opportunities.
 *
 * Real-time progress calculation based on 5 qualification fields.
 *
 * States:
 * - Lead Open (statecode: 0) → Qualify stage active, others disabled
 * - Lead Qualified (statecode: 1) → Success alert + link to opportunity
 * - Lead Disqualified (statecode: 2) → Error alert
 */
export function LeadBusinessProcessFlow({
  lead,
  className,
  onStageClick,
  onProgressChange,
}: LeadBusinessProcessFlowProps) {
  const { t } = useTranslation('leads')
  // Get opportunities created from this lead
  const { opportunities } = useOpportunitiesByLead(lead?.leadid)
  const relatedOpportunity = opportunities[0] // Get first opportunity (should only be one)

  // Access form context to watch field values (if used within a form)
  let form: ReturnType<typeof useFormContext> | null = null
  try {
    form = useFormContext()
  } catch {
    // Not within form context, use lead data only
  }

  // Watch form values or use lead values for progress calculation
  const budgetamount = form?.watch?.('budgetamount') ?? lead?.budgetamount
  const budgetstatus = form?.watch?.('budgetstatus') ?? lead?.budgetstatus
  const timeframe = form?.watch?.('timeframe') ?? lead?.timeframe
  const needanalysis = form?.watch?.('needanalysis') ?? lead?.needanalysis
  const decisionmaker = form?.watch?.('decisionmaker') ?? lead?.decisionmaker

  // Calculate progress
  const qualifyFieldsCompleted = [
    !!budgetamount && Number(budgetamount) > 0,
    budgetstatus !== undefined && budgetstatus !== null,
    !!timeframe && timeframe.trim().length > 0,
    !!needanalysis && needanalysis.trim().length > 0,
    !!decisionmaker && decisionmaker.trim().length > 0,
  ].filter(Boolean).length

  const qualifyProgress = Math.round((qualifyFieldsCompleted / 5) * 100)

  // Notify parent of progress changes (via useEffect to avoid setState during render)
  useEffect(() => {
    if (onProgressChange && qualifyProgress !== undefined) {
      onProgressChange(qualifyProgress)
    }
  }, [qualifyProgress, onProgressChange])

  // Determine stage statuses
  // Nota: usamos Number() para manejar casos donde statecode viene como string desde localStorage
  const isQualified = lead && Number(lead.statecode) === LeadStateCode.Qualified
  const isDisqualified = lead && Number(lead.statecode) === LeadStateCode.Disqualified
  const isOpen = !lead || Number(lead.statecode) === LeadStateCode.Open

  // Define required fields for Qualify stage
  const qualifyRequiredFields = [
    t('bpf.fields.budgetAmount'),
    t('bpf.fields.budgetStatus'),
    t('bpf.fields.purchaseTimeframe'),
    t('bpf.fields.needAnalysis'),
    t('bpf.fields.decisionMaker'),
  ]

  // Define full sales cycle BPF (same as opportunities but with disabled stages for leads)
  // This shows the complete picture of the sales process
  const stages: BPFStageWithStatus[] = [
    {
      id: 'qualify',
      name: t('bpf.qualify'),
      description: t('bpf.qualifyDesc'),
      status: isQualified ? 'completed' : isOpen ? 'active' : 'pending',
      requiredFields: qualifyRequiredFields,
      completedFields: qualifyFieldsCompleted,
      totalFields: 5,
      probability: 25,
    },
    {
      id: 'develop',
      name: t('bpf.develop'),
      description: t('bpf.developDesc'),
      status: 'disabled',
      requiredFields: [
        t('bpf.fields.proposedSolution'),
        t('bpf.fields.implementationTimeline'),
        t('bpf.fields.identifyCompetitors'),
        t('bpf.fields.customerNeeds'),
        t('bpf.fields.currentSituation'),
        t('bpf.fields.stakeholders'),
      ],
      completedFields: 0,
      totalFields: 6,
      probability: 50,
    },
    {
      id: 'propose',
      name: t('bpf.propose'),
      description: t('bpf.proposeDesc'),
      status: 'disabled',
      requiredFields: [
        t('bpf.fields.presentationDate'),
        t('bpf.fields.finalDecisionDate'),
        t('bpf.fields.customerContacts'),
        t('bpf.fields.pursuitTeam'),
        t('bpf.fields.quoteWithProducts'),
        t('bpf.fields.thankYouNote'),
      ],
      completedFields: 0,
      totalFields: 6,
      probability: 75,
    },
    {
      id: 'close',
      name: t('bpf.close'),
      description: t('bpf.closeDesc'),
      status: 'disabled',
      requiredFields: [
        t('bpf.fields.actualValue'),
        t('bpf.fields.actualCloseDate'),
        t('bpf.fields.activeQuote'),
        t('bpf.fields.winLossReason'),
        t('bpf.fields.competitorWon'),
      ],
      completedFields: 0,
      totalFields: 5,
      probability: 100,
    },
  ]

  // Show alert for disqualified leads
  if (isDisqualified) {
    return (
      <div className="px-4 pb-2">
        {/* Error Alert */}
        <div className="mb-4">
          <BPFAlert
            variant="error"
            title={t('bpf.leadDisqualified')}
            compact
          />
        </div>
        {/* BPF Container - White card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto">
          <BusinessProcessFlow
            stages={stages}
            onStageClick={onStageClick}
            fullWidth
          />
        </div>
      </div>
    )
  }

  // Show success alert for qualified leads
  if (isQualified && relatedOpportunity) {
    return (
      <div className="px-4 pb-2">
        {/* Success Alert */}
        <div className="mb-4">
          <BPFAlert
            variant="success"
            title={t('bpf.qualifiedSuccessfully')}
            actionLabel={t('bpf.viewOpportunity')}
            actionHref={`/opportunities/${relatedOpportunity.opportunityid}`}
            actionIcon={ArrowRight}
            compact
          />
        </div>
        {/* BPF Container - White card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto">
          <BusinessProcessFlow
            stages={stages}
            onStageClick={onStageClick}
            fullWidth
          />
        </div>
      </div>
    )
  }

  // If qualified but no opportunity found yet, show simple success
  if (isQualified) {
    return (
      <div className="px-4 pb-2">
        {/* Success Alert */}
        <div className="mb-4">
          <BPFAlert
            variant="success"
            title={t('bpf.qualifiedSuccessfully')}
            compact
          />
        </div>
        {/* BPF Container - White card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto">
          <BusinessProcessFlow
            stages={stages}
            onStageClick={onStageClick}
            fullWidth
          />
        </div>
      </div>
    )
  }

  // Active lead - show BPF using shared component
  return (
    <div className="px-4 pb-2">
      {/* BPF Container - White card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto">
        <BusinessProcessFlow
          stages={stages}
          onStageClick={onStageClick}
          fullWidth
        />
      </div>
    </div>
  )
}
