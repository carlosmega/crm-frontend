"use client"

import { memo, useMemo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  Calendar,
  GripHorizontal,
  Building2,
  User,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/shared/utils/formatters'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'

interface OpportunityKanbanCardProps {
  opportunity: Opportunity
  customerName?: string
  stage: SalesStageCode
  isPending?: boolean
}

const STAGE_BORDER_COLORS: Record<SalesStageCode, string> = {
  [SalesStageCode.Qualify]: 'border-l-blue-500',
  [SalesStageCode.Develop]: 'border-l-purple-500',
  [SalesStageCode.Propose]: 'border-l-orange-500',
  [SalesStageCode.Close]: 'border-l-teal-500',
}

function getProbabilityColor(probability: number) {
  if (probability >= 75) return 'bg-emerald-500 text-white'
  if (probability >= 50) return 'bg-amber-500 text-white'
  if (probability >= 25) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

export const OpportunityKanbanCard = memo(function OpportunityKanbanCard({
  opportunity,
  customerName,
  stage,
  isPending,
}: OpportunityKanbanCardProps) {
  const { t: tc } = useTranslation('common')
  const formatCurrency = useCurrencyFormat()
  const router = useRouter()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.opportunityid })

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition])

  const isOverdue = useMemo(
    () => new Date(opportunity.estimatedclosedate) < new Date(),
    [opportunity.estimatedclosedate]
  )

  const probabilityColor = useMemo(
    () => getProbabilityColor(opportunity.closeprobability),
    [opportunity.closeprobability]
  )

  const borderColor = STAGE_BORDER_COLORS[stage]

  const handleTitleClick = useCallback(() => {
    if (!isDragging) {
      router.push(`/opportunities/${opportunity.opportunityid}`)
    }
  }, [isDragging, router, opportunity.opportunityid])

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "group mb-3 cursor-default transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md relative",
          "border-l-[3px]",
          borderColor,
          isDragging && "opacity-50 shadow-xl ring-2 ring-purple-400 scale-105"
        )}
      >
        {/* Pending overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Drag handle bar - full width, appears on hover */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center justify-center h-5 cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "border-b border-transparent group-hover:border-gray-100"
          )}
        >
          <GripHorizontal className="h-3.5 w-3.5 text-gray-300" />
        </div>

        <CardContent className="p-3.5 pt-1">
          {/* Probability Badge - Top Right */}
          <div className="flex items-start justify-between mb-2">
            {/* Title - clickable */}
            <h3
              onClick={handleTitleClick}
              className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors flex-1 mr-2"
            >
              {opportunity.name}
            </h3>

            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0",
              probabilityColor
            )}>
              <span className="text-xs font-bold">
                {opportunity.closeprobability}%
              </span>
            </div>
          </div>

          {/* Customer Badge */}
          {customerName && (
            <div className="mb-2.5">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                opportunity.customeridtype === 'account'
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300"
              )}>
                {opportunity.customeridtype === 'account' ? (
                  <Building2 className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                <span className="truncate max-w-[180px]">{customerName}</span>
              </div>
            </div>
          )}

          {/* Value */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(opportunity.estimatedvalue)}
            </span>
          </div>

          {/* Footer: Date & Status */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">
                {formatDate(opportunity.estimatedclosedate)}
              </span>
            </div>

            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] h-5 px-2 font-medium">
                {tc('states.overdue')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
