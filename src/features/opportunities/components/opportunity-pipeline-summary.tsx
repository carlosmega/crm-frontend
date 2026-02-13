"use client"

import { memo, useMemo } from 'react'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode } from '@/core/contracts'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Hash, DollarSign, TrendingUp, Target } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'

interface StageInfo {
  code: SalesStageCode
  title: string
  probability: number
}

interface OpportunityPipelineSummaryProps {
  opportunities: Opportunity[]
  stages: StageInfo[]
}

const STAGE_BAR_COLORS: Record<SalesStageCode, string> = {
  [SalesStageCode.Qualify]: 'bg-blue-500',
  [SalesStageCode.Develop]: 'bg-purple-500',
  [SalesStageCode.Propose]: 'bg-orange-500',
  [SalesStageCode.Close]: 'bg-teal-500',
}

export const OpportunityPipelineSummary = memo(function OpportunityPipelineSummary({
  opportunities,
  stages,
}: OpportunityPipelineSummaryProps) {
  const { t } = useTranslation('opportunities')
  const formatCurrency = useCurrencyFormat()

  const stats = useMemo(() => {
    const totalDeals = opportunities.length
    const pipelineValue = opportunities.reduce((sum, opp) => sum + opp.estimatedvalue, 0)
    const weightedValue = opportunities.reduce(
      (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
      0
    )
    const avgDealSize = totalDeals > 0 ? pipelineValue / totalDeals : 0

    return { totalDeals, pipelineValue, weightedValue, avgDealSize }
  }, [opportunities])

  const stageDistribution = useMemo(() => {
    const distribution = stages.map((stage) => {
      const stageOpps = opportunities.filter((opp) => opp.salesstage === stage.code)
      const value = stageOpps.reduce((sum, opp) => sum + opp.estimatedvalue, 0)
      return {
        code: stage.code,
        title: stage.title,
        count: stageOpps.length,
        value,
      }
    })

    const totalValue = distribution.reduce((sum, d) => sum + d.value, 0)

    return distribution.map((d) => ({
      ...d,
      percentage: totalValue > 0 ? (d.value / totalValue) * 100 : 0,
    }))
  }, [opportunities, stages])

  return (
    <Card className="p-4 border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <Hash className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('kanban.deals')}</p>
            <p className="text-lg font-bold">{stats.totalDeals}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('kanban.pipelineValue')}</p>
            <p className="text-lg font-bold">{formatCurrency(stats.pipelineValue)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('kanban.weightedValue')}</p>
            <p className="text-lg font-bold">{formatCurrency(stats.weightedValue)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Target className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('kanban.avgDealSize')}</p>
            <p className="text-lg font-bold">{formatCurrency(stats.avgDealSize)}</p>
          </div>
        </div>
      </div>

      {/* Funnel bar */}
      {stats.pipelineValue > 0 && (
        <TooltipProvider>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {stageDistribution.map((stage) =>
              stage.percentage > 0 ? (
                <Tooltip key={stage.code}>
                  <TooltipTrigger asChild>
                    <div
                      className={`${STAGE_BAR_COLORS[stage.code]} transition-all duration-300 rounded-sm cursor-default`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{stage.title}</p>
                    <p className="text-xs">{stage.count} {t('kanban.deals').toLowerCase()} &middot; {formatCurrency(stage.value)}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null
            )}
          </div>
        </TooltipProvider>
      )}
    </Card>
  )
})
