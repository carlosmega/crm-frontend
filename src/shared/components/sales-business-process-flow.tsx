"use client"

import { BusinessProcessFlow, type BPFStageWithStatus } from '@/shared/components/business-process-flow'
import { BPFAlert } from '@/shared/components/business-process-flow-alert'
import { ArrowRight, FileText } from 'lucide-react'

export type SalesEntityType = 'lead' | 'opportunity'

export interface SalesStage {
  id: string
  name: string
  description: string
  requiredFields: string[]
  probability: number
  status?: BPFStageWithStatus['status']
  completedFields?: number
  totalFields?: number
}

export interface SalesEntityState {
  /** Current stage (0-3 for sales stages) */
  currentStage: number
  /** State code (0=Open/Active, 1=Won/Qualified, 2=Lost/Disqualified) */
  stateCode: number
  /** Entity ID */
  id: string
  /** Entity name */
  name: string
  /** Optional related entity (e.g., opportunity from lead) */
  relatedEntityId?: string
  /** Optional close reason */
  closeReason?: string
}

interface SalesBusinessProcessFlowProps {
  /** Type of entity (lead or opportunity) */
  entityType: SalesEntityType
  /** Current entity state */
  entityState: SalesEntityState
  /** Custom stages configuration (optional, will use defaults based on entity type) */
  stages?: SalesStage[]
  /** Callback when a stage is clicked */
  onStageClick?: (stageId: string) => void
  /** Custom className */
  className?: string
}

/**
 * Shared Sales Business Process Flow Component
 *
 * Displays the complete sales cycle with 4 stages for both Leads and Opportunities:
 * 1. Qualify (25%) - Initial qualification
 * 2. Develop (50%) - Solution development
 * 3. Propose (75%) - Formal proposal
 * 4. Close (100%) - Final closure
 *
 * Features:
 * - Entity-agnostic (works for leads, opportunities, etc.)
 * - Configurable stages and progress
 * - Success/Error alerts for completed states
 * - White card container with horizontal scrolling
 * - Consistent design across all entities
 *
 * @example
 * // Lead usage
 * <SalesBusinessProcessFlow
 *   entityType="lead"
 *   entityState={{
 *     currentStage: 0,
 *     stateCode: 0,
 *     id: 'lead-123',
 *     name: 'John Doe - Acme Corp'
 *   }}
 *   onStageClick={(stageId) => console.log('Clicked:', stageId)}
 * />
 *
 * @example
 * // Opportunity usage
 * <SalesBusinessProcessFlow
 *   entityType="opportunity"
 *   entityState={{
 *     currentStage: 2,
 *     stateCode: 0,
 *     id: 'opp-456',
 *     name: 'Q1 2025 Deal'
 *   }}
 * />
 */
export function SalesBusinessProcessFlow({
  entityType,
  entityState,
  stages: customStages,
  onStageClick,
  className,
}: SalesBusinessProcessFlowProps) {
  const { currentStage, stateCode, id, name, relatedEntityId, closeReason } = entityState

  // Determine state based on entity type
  const isActive = stateCode === 0 // Open (Lead) or Open (Opportunity)
  const isWon = stateCode === 1 // Qualified (Lead) or Won (Opportunity)
  const isLost = stateCode === 2 // Disqualified (Lead) or Lost (Opportunity)

  // Default stages configuration
  const defaultStages: SalesStage[] = [
    {
      id: 'qualify',
      name: 'Qualify',
      description: 'Validate budget, authority, need, and timeline',
      requiredFields: [
        'Budget Amount',
        'Budget Status (No Budget / May Buy / Can Buy / Will Buy)',
        'Purchase Timeframe',
        'Need Analysis',
        'Decision Maker Contact',
      ],
      probability: 25,
    },
    {
      id: 'develop',
      name: 'Develop',
      description: entityType === 'lead'
        ? 'Research opportunity and identify stakeholders'
        : 'Develop solution and identify stakeholders',
      requiredFields: [
        'Proposed Solution',
        'Implementation Timeline',
        'Identify Competitors',
        'Customer Needs Analysis',
        'Current Situation Documentation',
        'Stakeholders (Decision Makers, Influencers, Champions)',
      ],
      probability: 50,
    },
    {
      id: 'propose',
      name: 'Propose',
      description: 'Present proposal, pricing, and quote',
      requiredFields: [
        'Presentation Date',
        'Final Decision Date',
        'Customer Contacts Identified',
        'Pursuit Team Assigned',
        'Quote with Product Lines',
        'Thank You Note Sent',
      ],
      probability: 75,
    },
    {
      id: 'close',
      name: 'Close',
      description: 'Finalize as Won or Lost',
      requiredFields: [
        'Actual Value (if Won)',
        'Actual Close Date',
        'Active Quote (if Won)',
        'Win/Loss Reason',
        'Competitor Who Won (if Lost)',
      ],
      probability: 100,
    },
  ]

  // Use custom stages or defaults
  const stages = customStages || defaultStages

  // Determine stage status
  const getStageStatus = (stageIndex: number): BPFStageWithStatus['status'] => {
    if (isWon) return 'completed'
    if (isLost) {
      if (stageIndex === currentStage) return 'completed'
      if (stageIndex < currentStage) return 'completed'
      return 'pending'
    }
    if (stageIndex < currentStage) return 'completed'
    if (stageIndex === currentStage) return 'active'

    // For leads, disable stages after Qualify
    if (entityType === 'lead' && stageIndex > 0) return 'disabled'

    return 'pending'
  }

  // Map stages to BPF format
  const bpfStages: BPFStageWithStatus[] = stages.map((stage, index) => ({
    id: stage.id,
    name: stage.name,
    description: stage.description,
    status: stage.status || getStageStatus(index),
    requiredFields: stage.requiredFields,
    completedFields: stage.completedFields,
    totalFields: stage.totalFields || stage.requiredFields.length,
    probability: stage.probability,
  }))

  // Alert labels based on entity type
  const wonLabel = entityType === 'lead' ? 'Qualified successfully' : 'Opportunity won!'
  const lostLabel = entityType === 'lead' ? 'Lead disqualified' : 'Opportunity lost'
  const wonActionLabel = entityType === 'lead' ? 'View opportunity' : 'View order'
  const wonActionHref = entityType === 'lead'
    ? `/opportunities/${relatedEntityId}`
    : `/orders?opportunityid=${id}`

  // Show alert for won/qualified state
  if (isWon) {
    return (
      <div className="px-4 pb-2">
        {/* Success Alert */}
        <div className="mb-4">
          <BPFAlert
            variant="success"
            title={wonLabel}
            actionLabel={relatedEntityId ? wonActionLabel : undefined}
            actionHref={relatedEntityId ? wonActionHref : undefined}
            actionIcon={relatedEntityId ? ArrowRight : undefined}
            compact
          />
        </div>
        {/* BPF Container - White card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <BusinessProcessFlow
            stages={bpfStages}
            onStageClick={onStageClick}
            fullWidth
          />
        </div>
      </div>
    )
  }

  // Show alert for lost/disqualified state
  if (isLost) {
    return (
      <div className="px-4 pb-2">
        {/* Error Alert */}
        <div className="mb-4">
          <BPFAlert
            variant="error"
            title={lostLabel}
            description={closeReason ? `Reason: ${closeReason}` : undefined}
            compact
          />
        </div>
        {/* BPF Container - White card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <BusinessProcessFlow
            stages={bpfStages}
            onStageClick={onStageClick}
            fullWidth
          />
        </div>
      </div>
    )
  }

  // Active state - show BPF
  return (
    <div className="px-4 pb-2">
      {/* BPF Container - White card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <BusinessProcessFlow
          stages={bpfStages}
          onStageClick={onStageClick}
          fullWidth
        />
      </div>
    </div>
  )
}
