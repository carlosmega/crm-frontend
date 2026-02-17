"use client"

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode, OpportunityStateCode } from '@/core/contracts'
import { OpportunityKanbanColumn } from './opportunity-kanban-column'
import { OpportunityKanbanCard } from './opportunity-kanban-card'
import { OpportunityPipelineSummary } from './opportunity-pipeline-summary'
import { useOpportunityMutations } from '../hooks/use-opportunity-mutations'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OpportunityKanbanProps {
  opportunities: Opportunity[]
  customerNames: Record<string, string>
  onRefetch?: () => void
}

export function OpportunityKanban({
  opportunities,
  customerNames,
  onRefetch,
}: OpportunityKanbanProps) {
  const { t } = useTranslation('opportunities')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null)
  const { updateOpportunity } = useOpportunityMutations()
  const { toast } = useToast()

  // Local optimistic state - syncs from props
  const [localOpportunities, setLocalOpportunities] = useState<Opportunity[]>(opportunities)

  useEffect(() => {
    setLocalOpportunities(opportunities)
  }, [opportunities])

  const STAGES = useMemo(() => [
    { code: SalesStageCode.Qualify, title: t('stages.qualify'), probability: 25 },
    { code: SalesStageCode.Develop, title: t('stages.develop'), probability: 50 },
    { code: SalesStageCode.Propose, title: t('stages.propose'), probability: 75 },
    { code: SalesStageCode.Close, title: t('stages.close'), probability: 100 },
  ], [t])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter only Open opportunities from local state
  const openOpportunities = useMemo(
    () => localOpportunities.filter((opp) => opp.statecode === OpportunityStateCode.Open),
    [localOpportunities]
  )

  // Group opportunities by stage
  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<SalesStageCode, Opportunity[]> = {
      [SalesStageCode.Qualify]: [],
      [SalesStageCode.Develop]: [],
      [SalesStageCode.Propose]: [],
      [SalesStageCode.Close]: [],
    }

    openOpportunities.forEach((opp) => {
      if (grouped[opp.salesstage]) {
        grouped[opp.salesstage].push(opp)
      }
    })

    return grouped
  }, [openOpportunities])

  const activeOpportunity = useMemo(
    () => openOpportunities.find((opp) => opp.opportunityid === activeId),
    [activeId, openOpportunities]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeOpp = openOpportunities.find((opp) => opp.opportunityid === active.id)
    if (!activeOpp) return

    // Extract stage from droppable id (format: "stage-{stageCode}")
    const overStageStr = String(over.id).replace('stage-', '')
    const overStage = parseInt(overStageStr) as SalesStageCode

    // If dropped in same stage, no action needed
    if (activeOpp.salesstage === overStage) return

    const previousStage = activeOpp.salesstage

    // Optimistic update - move card instantly
    setLocalOpportunities(prev =>
      prev.map(opp =>
        opp.opportunityid === activeOpp.opportunityid
          ? { ...opp, salesstage: overStage }
          : opp
      )
    )
    setPendingMoveId(activeOpp.opportunityid)

    // API call in background
    try {
      await updateOpportunity(activeOpp.opportunityid, {
        salesstage: overStage,
      })

      toast({
        title: t('kanban.stageUpdated'),
        description: t('kanban.movedTo', { stage: STAGES.find((s) => s.code === overStage)?.title }),
      })

      if (onRefetch) {
        onRefetch()
      }
    } catch (error) {
      // Rollback on error
      setLocalOpportunities(prev =>
        prev.map(opp =>
          opp.opportunityid === activeOpp.opportunityid
            ? { ...opp, salesstage: previousStage }
            : opp
        )
      )

      toast({
        title: t('kanban.updateError'),
        description: t('kanban.updateErrorDesc'),
        variant: 'destructive',
      })
    } finally {
      setPendingMoveId(null)
    }
  }, [openOpportunities, updateOpportunity, toast, t, STAGES, onRefetch])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <OpportunityPipelineSummary
        opportunities={openOpportunities}
        stages={STAGES}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0 mt-4">
          {STAGES.map((stage) => (
            <OpportunityKanbanColumn
              key={stage.code}
              stage={stage.code}
              title={stage.title}
              probability={stage.probability}
              opportunities={opportunitiesByStage[stage.code]}
              customerNames={customerNames}
              pendingMoveId={pendingMoveId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOpportunity ? (
            <OpportunityKanbanCard
              opportunity={activeOpportunity}
              customerName={customerNames[activeOpportunity.customerid]}
              stage={activeOpportunity.salesstage}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
