"use client"

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { OpportunityKanbanCard } from './opportunity-kanban-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/shared/utils/formatters'
import { TrendingUp, DollarSign, Hash, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OpportunityKanbanColumnProps {
  stage: SalesStageCode
  title: string
  probability: number
  opportunities: Opportunity[]
  customerNames: Record<string, string>
}

const STAGE_COLORS: Record<SalesStageCode, { bg: string; text: string; border: string; cardBorder: string }> = {
  [SalesStageCode.Qualify]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    cardBorder: 'border-l-blue-500',
  },
  [SalesStageCode.Develop]: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    cardBorder: 'border-l-purple-500',
  },
  [SalesStageCode.Propose]: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    cardBorder: 'border-l-orange-500',
  },
  [SalesStageCode.Close]: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-200',
    cardBorder: 'border-l-teal-500',
  },
}

export function OpportunityKanbanColumn({
  stage,
  title,
  probability,
  opportunities,
  customerNames,
}: OpportunityKanbanColumnProps) {
  const { t } = useTranslation('opportunities')
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage}`,
    data: { stage },
  })

  const colors = STAGE_COLORS[stage]
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimatedvalue, 0)
  const weightedValue = opportunities.reduce(
    (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
    0
  )

  return (
    <div className="flex flex-col min-w-[320px] h-full">
      <div className={cn(
        'flex flex-col rounded-lg bg-background border h-full',
        isOver && 'ring-2 ring-purple-400 border-purple-400'
      )}>
        {/* Column Header - Fixed height */}
        <div className={cn('px-4 py-3 rounded-t-lg border-b flex-shrink-0', colors.bg)}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={cn('font-semibold text-sm', colors.text)}>
              {title}
            </h3>
            <span className={cn('text-sm font-semibold', colors.text)}>
              {probability}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('kanban.count')}</span>
              <span className="text-xs font-semibold text-foreground">{opportunities.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('kanban.total')}</span>
              <span className="text-xs font-semibold text-foreground">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('kanban.weighted')}</span>
              <span className={cn('text-xs font-bold', colors.text)}>{formatCurrency(weightedValue)}</span>
            </div>
          </div>
        </div>

        {/* Column Content - Scrollable, takes remaining space */}
        <div className="flex-1 min-h-0 p-3 overflow-y-auto bg-gray-50/50" ref={setNodeRef}>
          <SortableContext
            items={opportunities.map((opp) => opp.opportunityid)}
            strategy={verticalListSortingStrategy}
          >
            {opportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                <span>{t('kanban.noOpportunities')}</span>
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <OpportunityKanbanCard
                  key={opportunity.opportunityid}
                  opportunity={opportunity}
                  customerName={customerNames[opportunity.customerid]}
                  stage={stage}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  )
}
