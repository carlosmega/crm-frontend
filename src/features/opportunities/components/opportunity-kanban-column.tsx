"use client"

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { OpportunityKanbanCard } from './opportunity-kanban-card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, DollarSign, Inbox, ArrowDownToLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'

interface OpportunityKanbanColumnProps {
  stage: SalesStageCode
  title: string
  probability: number
  opportunities: Opportunity[]
  customerNames: Record<string, string>
  pendingMoveId?: string | null
}

const STAGE_COLORS: Record<SalesStageCode, { bg: string; text: string; border: string; accent: string; dropBg: string }> = {
  [SalesStageCode.Qualify]: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-100 dark:bg-blue-900/40',
    dropBg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  [SalesStageCode.Develop]: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-100 dark:bg-purple-900/40',
    dropBg: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  [SalesStageCode.Propose]: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    accent: 'bg-orange-100 dark:bg-orange-900/40',
    dropBg: 'bg-orange-50/50 dark:bg-orange-950/20',
  },
  [SalesStageCode.Close]: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    accent: 'bg-teal-100 dark:bg-teal-900/40',
    dropBg: 'bg-teal-50/50 dark:bg-teal-950/20',
  },
}

export function OpportunityKanbanColumn({
  stage,
  title,
  probability,
  opportunities,
  customerNames,
  pendingMoveId,
}: OpportunityKanbanColumnProps) {
  const { t } = useTranslation('opportunities')
  const formatCurrency = useCurrencyFormat()
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
    <div className="flex flex-col flex-1 min-w-[280px] h-full">
      <div className={cn(
        'flex flex-col rounded-lg bg-background border h-full transition-colors duration-200',
        isOver && `border-dashed border-2 ${colors.border} ${colors.dropBg}`
      )}>
        {/* Column Header */}
        <div className={cn('px-4 py-3 rounded-t-lg border-b flex-shrink-0', colors.bg)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-semibold text-sm', colors.text)}>
                {title}
              </h3>
              <Badge variant="secondary" className={cn('h-5 px-1.5 text-xs font-bold', colors.accent, colors.text)}>
                {opportunities.length}
              </Badge>
            </div>
            <span className={cn('text-xs font-medium', colors.text)}>
              {probability}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className={cn('h-3.5 w-3.5', colors.text)} />
              <span className="text-xs font-semibold text-foreground">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={cn('h-3.5 w-3.5', colors.text)} />
              <span className={cn('text-xs font-bold', colors.text)}>{formatCurrency(weightedValue)}</span>
            </div>
          </div>
        </div>

        {/* Column Content - Scrollable */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3" ref={setNodeRef}>
            <SortableContext
              items={opportunities.map((opp) => opp.opportunityid)}
              strategy={verticalListSortingStrategy}
            >
              {opportunities.length === 0 ? (
                <div className={cn(
                  "flex flex-col items-center justify-center h-32 text-sm text-muted-foreground rounded-lg transition-all duration-200",
                  isOver && `border-2 border-dashed ${colors.border} ${colors.dropBg}`
                )}>
                  {isOver ? (
                    <>
                      <ArrowDownToLine className={cn("h-8 w-8 mb-2 animate-bounce", colors.text)} />
                      <span className={cn("font-medium", colors.text)}>{t('kanban.dropHere')}</span>
                    </>
                  ) : (
                    <>
                      <div className={cn("rounded-full p-3 mb-2", colors.bg)}>
                        <Inbox className={cn("h-6 w-6", colors.text)} />
                      </div>
                      <span className="text-xs text-center px-4">{t('kanban.emptyHint')}</span>
                    </>
                  )}
                </div>
              ) : (
                opportunities.map((opportunity) => (
                  <OpportunityKanbanCard
                    key={opportunity.opportunityid}
                    opportunity={opportunity}
                    customerName={customerNames[opportunity.customerid]}
                    stage={stage}
                    isPending={pendingMoveId === opportunity.opportunityid}
                  />
                ))
              )}
            </SortableContext>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
