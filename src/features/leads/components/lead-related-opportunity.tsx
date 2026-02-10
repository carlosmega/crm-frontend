"use client"

import Link from 'next/link'
import { useOpportunitiesByLead } from '@/features/opportunities/hooks/use-opportunities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ExternalLink, Loader2 } from 'lucide-react'
import { SalesStageCode } from '@/core/contracts'
import { useTranslation } from '@/shared/hooks/use-translation'

interface LeadRelatedOpportunityProps {
  leadId: string
}

export function LeadRelatedOpportunity({ leadId }: LeadRelatedOpportunityProps) {
  const { t } = useTranslation('leads')
  const { opportunities, loading } = useOpportunitiesByLead(leadId)
  const opportunity = opportunities[0] || null

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('related.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!opportunity) {
    return null // Don't show the card if no opportunity exists
  }

  const getStageBadgeVariant = (stage: SalesStageCode) => {
    switch (stage) {
      case SalesStageCode.Qualify:
        return 'secondary'
      case SalesStageCode.Develop:
        return 'default'
      case SalesStageCode.Propose:
        return 'default'
      case SalesStageCode.Close:
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStageName = (stage: SalesStageCode) => {
    switch (stage) {
      case SalesStageCode.Qualify:
        return t('related.stages.qualify')
      case SalesStageCode.Develop:
        return t('related.stages.develop')
      case SalesStageCode.Propose:
        return t('related.stages.propose')
      case SalesStageCode.Close:
        return t('related.stages.close')
      default:
        return t('related.stages.unknown')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          {t('related.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">{opportunity.name}</h3>
          {opportunity.description && (
            <p className="text-sm text-muted-foreground mt-1">{opportunity.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={getStageBadgeVariant(opportunity.salesstage)}>
            {getStageName(opportunity.salesstage)}
          </Badge>
          <Badge variant="outline">{formatCurrency(opportunity.estimatedvalue)}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('related.closeProbability')}</p>
            <p className="font-medium">{opportunity.closeprobability}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('related.estCloseDate')}</p>
            <p className="font-medium">{formatDate(opportunity.estimatedclosedate)}</p>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/opportunities/${opportunity.opportunityid}`}>
            {t('related.viewOpportunity')}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
