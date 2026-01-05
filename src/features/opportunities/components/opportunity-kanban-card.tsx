"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  Calendar,
  GripVertical,
  Building2,
  User,
  Check,
  ArrowRight
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { cn } from '@/lib/utils'

interface OpportunityKanbanCardProps {
  opportunity: Opportunity
  customerName?: string
  stage: SalesStageCode
}

const STAGE_BORDER_COLORS: Record<SalesStageCode, string> = {
  [SalesStageCode.Qualify]: 'border-l-blue-500',
  [SalesStageCode.Develop]: 'border-l-purple-500',
  [SalesStageCode.Propose]: 'border-l-orange-500',
  [SalesStageCode.Close]: 'border-l-teal-500',
}

export function OpportunityKanbanCard({ opportunity, customerName, stage }: OpportunityKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.opportunityid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = new Date(opportunity.estimatedclosedate) < new Date()
  const borderColor = STAGE_BORDER_COLORS[stage]

  return (
    <div ref={setNodeRef} style={style}>
      <Link href={`/opportunities/${opportunity.opportunityid}`}>
        <Card
          className={cn(
            "group mb-3 cursor-move transition-all duration-200 bg-white shadow-sm hover:shadow-md",
            "border-l-[3px]",
            borderColor,
            isDragging && "opacity-50 shadow-xl ring-2 ring-purple-400 scale-105"
          )}
        >
          <CardContent className="p-3.5">
            {/* Probability Badge - Top Right */}
            <div className="flex items-start justify-between mb-2.5">
              {/* Drag Handle - Hidden, but functional */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500 text-white rounded-full">
                <Check className="h-3 w-3" />
                <span className="text-xs font-bold">
                  {opportunity.closeprobability}%
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-sm text-gray-900 mb-2.5 line-clamp-2 leading-tight">
              {opportunity.name}
            </h3>

            {/* Customer Badge */}
            {customerName && (
              <div className="mb-3">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                  opportunity.customeridtype === 'account'
                    ? "bg-blue-100 text-blue-700"
                    : "bg-pink-100 text-pink-700"
                )}>
                  {opportunity.customeridtype === 'account' ? (
                    <Building2 className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate max-w-[200px]">{customerName}</span>
                </div>
              </div>
            )}

            {/* Estimated Value */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                    Estimated Value
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {formatCurrency(opportunity.estimatedvalue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer: Date & Status */}
            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {formatDate(opportunity.estimatedclosedate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isOverdue && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-2 font-medium">
                    Overdue
                  </Badge>
                )}
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
