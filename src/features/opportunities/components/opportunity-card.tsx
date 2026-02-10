"use client"

import { memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Opportunity } from '@/core/contracts'
import { OpportunityStatusBadge } from './opportunity-status-badge'
import { OpportunityStageBadge } from './opportunity-stage-badge'
import { Eye, Edit, Trash2, User, Calendar, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OpportunityCardProps {
  opportunity: Opportunity
  onDelete?: (id: string) => void
}

/**
 * Memoized OpportunityCard component
 * Performance:
 * - Only re-renders if opportunity or onDelete change
 * - Uses shared formatters (module-level) to avoid recreating on every render
 */
export const OpportunityCard = memo(function OpportunityCard({ opportunity, onDelete }: OpportunityCardProps) {
  const { t } = useTranslation('opportunities')
  const { t: tc } = useTranslation('common')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              <Link
                href={`/opportunities/${opportunity.opportunityid}`}
                className="hover:underline"
              >
                {opportunity.name}
              </Link>
            </CardTitle>
            {opportunity.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {opportunity.description}
              </CardDescription>
            )}
          </div>
          <OpportunityStatusBadge
            statecode={opportunity.statecode}
            statuscode={opportunity.statuscode}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sales Stage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('card.salesStage')}</span>
          <OpportunityStageBadge
            stage={opportunity.salesstage}
            probability={opportunity.closeprobability}
          />
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{t('card.customer')}</p>
            <p className="text-sm font-medium truncate">{opportunity.customerid}</p>
            <p className="text-xs text-muted-foreground capitalize">{opportunity.customeridtype}</p>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t('card.estValue')}</p>
            <p className="text-sm font-semibold">{formatCurrency(opportunity.estimatedvalue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('card.probability')}</p>
            <p className="text-sm font-semibold">{opportunity.closeprobability}%</p>
          </div>
        </div>

        {/* Close Date */}
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t('card.estCloseDate')}</p>
            <p className="text-sm">{formatDate(opportunity.estimatedclosedate)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/opportunities/${opportunity.opportunityid}`}>
              <Eye className="size-4 mr-2" />
              {tc('cardActions.view')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/opportunities/${opportunity.opportunityid}/edit`}>
              <Edit className="size-4 mr-2" />
              {tc('cardActions.edit')}
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(opportunity.opportunityid)}
              title={t('card.deleteOpportunity')}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
