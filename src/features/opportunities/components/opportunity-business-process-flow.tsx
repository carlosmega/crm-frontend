"use client"

import type { Opportunity } from '@/core/contracts'
import { OpportunityStateCode, SalesStageCode } from '@/core/contracts'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface OpportunityBusinessProcessFlowProps {
  opportunity?: Opportunity
  className?: string
  onStageClick?: (stageId: string) => void
}

const STAGES = [
  { id: 'qualify', name: 'Qualify', code: SalesStageCode.Qualify, probability: 25 },
  { id: 'develop', name: 'Develop', code: SalesStageCode.Develop, probability: 50 },
  { id: 'propose', name: 'Propose', code: SalesStageCode.Propose, probability: 75 },
  { id: 'close', name: 'Close', code: SalesStageCode.Close, probability: 100 },
]

export function OpportunityBusinessProcessFlow({
  opportunity,
  className,
  onStageClick,
}: OpportunityBusinessProcessFlowProps) {
  const currentStage = opportunity?.salesstage ?? SalesStageCode.Qualify
  const isWon = opportunity?.statecode === OpportunityStateCode.Won
  const isLost = opportunity?.statecode === OpportunityStateCode.Lost

  const getStageStatus = (stageCode: SalesStageCode) => {
    if (isWon) return 'completed'
    if (isLost && stageCode === currentStage) return 'failed'
    if (stageCode < currentStage) return 'completed'
    if (stageCode === currentStage) return 'active'
    return 'pending'
  }

  return (
    <div className={cn("bg-gray-50/50 py-3", className)}>
      <div className="px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700 py-4 px-8">
          <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => {
            const status = getStageStatus(stage.code)
            const isActive = status === 'active'
            const isCompleted = status === 'completed'
            const isPending = status === 'pending'

            return (
              <div key={stage.id} className="flex items-center flex-1">
                {/* Left connector line (except for first item) */}
                {index > 0 && (
                  <div
                    className={cn(
                      "h-[2px] flex-1",
                      isCompleted && "bg-purple-600",
                      isActive && "bg-gray-300",
                      isPending && "bg-gray-300"
                    )}
                  />
                )}

                {/* Stage */}
                <div className="flex flex-col items-center gap-1.5 px-3 relative">
                  {/* Circle */}
                  <button
                    onClick={() => onStageClick?.(stage.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all border-[2.5px] relative shrink-0",
                      isActive && "bg-purple-600 border-purple-600 shadow-md shadow-purple-200",
                      isCompleted && "bg-purple-600 border-purple-600",
                      isPending && "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
                      onStageClick && "cursor-pointer hover:scale-110 hover:shadow-lg"
                    )}
                  >
                    {/* Badge with percentage - Overlaid on circle (only for active stage) */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white min-w-[28px] flex items-center justify-center">
                        {stage.probability}%
                      </div>
                    )}

                    {/* Checkmark for completed */}
                    {isCompleted && (
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    )}

                    {/* Empty for pending */}
                    {isPending && null}
                  </button>

                  {/* Stage name and link */}
                  <div className="text-center mt-0.5">
                    <div className={cn(
                      "font-semibold text-[13px] mb-0.5 whitespace-nowrap",
                      (isActive || isCompleted) && "text-gray-900",
                      isPending && "text-gray-500"
                    )}>
                      {stage.name}
                    </div>
                    <button
                      onClick={() => onStageClick?.(stage.id)}
                      className="text-[11px] text-gray-500 hover:text-purple-600 transition-colors underline decoration-transparent hover:decoration-purple-600"
                    >
                      View details
                    </button>
                  </div>
                </div>

                {/* Right connector line (except for last item) */}
                {index < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] flex-1",
                      isCompleted && "bg-purple-600",
                      isActive && "bg-gray-300",
                      isPending && "bg-gray-300"
                    )}
                  />
                )}
              </div>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
