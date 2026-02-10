"use client"

import { useOpportunities } from '@/features/opportunities/hooks/use-opportunities'
import { OpportunityList } from '@/features/opportunities/components/opportunity-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Plus, Briefcase, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AccountOpportunitiesSubGridProps {
  accountId: string
}

/**
 * AccountOpportunitiesSubGrid
 *
 * Displays all opportunities associated with a specific account.
 * Wraps OpportunityList component with filtered data fetching.
 */
export function AccountOpportunitiesSubGrid({ accountId }: AccountOpportunitiesSubGridProps) {
  const { t } = useTranslation('accounts')
  const { opportunities, loading, error } = useOpportunities()

  // Filter opportunities by account (customerid + customeridtype)
  const accountOpportunities = opportunities.filter(
    (opp) => opp.customerid === accountId && opp.customeridtype === 'account'
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">{t('subgrid.opportunities.errorLoading')} {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t('subgrid.opportunities.title', { count: accountOpportunities.length })}
          </CardTitle>
          <Button asChild size="sm">
            <Link href={`/opportunities/new?accountId=${accountId}`}>
              <Plus className="mr-2 h-4 w-4" />
              {t('subgrid.opportunities.newOpportunity')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {accountOpportunities.length > 0 ? (
          <div className="px-6 pb-6">
            <OpportunityList
              opportunities={accountOpportunities}
              hasLoadedData={!loading}
            />
          </div>
        ) : (
          <div className="py-12 text-center px-6">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {t('subgrid.opportunities.noOpportunities')}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/opportunities/new?accountId=${accountId}`}>
                <Plus className="mr-2 h-4 w-4" />
                {t('subgrid.opportunities.addFirst')}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
