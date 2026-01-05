"use client"

import { useState, useMemo } from 'react'
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
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode, OpportunityStateCode } from '@/core/contracts'
import { OpportunityKanbanColumn } from './opportunity-kanban-column'
import { OpportunityKanbanCard } from './opportunity-kanban-card'
import { useOpportunityMutations } from '../hooks/use-opportunity-mutations'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface OpportunityKanbanProps {
  opportunities: Opportunity[]
  customerNames: Record<string, string>
  onRefetch?: () => void
}

const STAGES = [
  { code: SalesStageCode.Qualify, title: 'Qualify', probability: 25 },
  { code: SalesStageCode.Develop, title: 'Develop', probability: 50 },
  { code: SalesStageCode.Propose, title: 'Propose', probability: 75 },
  { code: SalesStageCode.Close, title: 'Close', probability: 100 },
]

export function OpportunityKanban({
  opportunities,
  customerNames,
  onRefetch,
}: OpportunityKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { updateOpportunity, loading: updating } = useOpportunityMutations()
  const { toast } = useToast()

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

  // Filter only Open opportunities
  const openOpportunities = useMemo(
    () => opportunities.filter((opp) => opp.statecode === OpportunityStateCode.Open),
    [opportunities]
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
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

    // Update opportunity stage
    try {
      await updateOpportunity(activeOpp.opportunityid, {
        salesstage: overStage,
      })

      toast({
        title: 'Stage updated',
        description: `Opportunity moved to ${STAGES.find((s) => s.code === overStage)?.title}`,
      })

      // Refetch to get updated data
      if (onRefetch) {
        onRefetch()
      }
    } catch (error) {
      console.error('Error updating opportunity stage:', error)
      toast({
        title: 'Error',
        description: 'Failed to update opportunity stage. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  if (updating) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {STAGES.map((stage) => (
          <OpportunityKanbanColumn
            key={stage.code}
            stage={stage.code}
            title={stage.title}
            probability={stage.probability}
            opportunities={opportunitiesByStage[stage.code]}
            customerNames={customerNames}
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
  )
}
