"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Lead } from '@/core/contracts'
import { useTranslation } from '@/shared/hooks/use-translation'
import { leadService } from '@/features/leads/api/lead-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCircle, ExternalLink, Loader2, Building2, Mail, Phone } from 'lucide-react'
import { LeadStateCode } from '@/core/contracts'

interface OpportunityOriginatingLeadProps {
  leadId: string
}

export function OpportunityOriginatingLead({ leadId }: OpportunityOriginatingLeadProps) {
  const { t } = useTranslation('opportunities')
  const { t: tl } = useTranslation('leads')
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLead() {
      try {
        const fetchedLead = await leadService.getById(leadId)
        setLead(fetchedLead)
      } catch (error) {
        console.error('Error fetching originating lead:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [leadId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            {t('originating.title')}
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

  if (!lead) {
    return null // Don't show the card if no lead exists
  }

  const getStateBadgeVariant = (state: LeadStateCode) => {
    switch (state) {
      case LeadStateCode.Open:
        return 'default'
      case LeadStateCode.Qualified:
        return 'default'
      case LeadStateCode.Disqualified:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStateName = (state: LeadStateCode) => {
    switch (state) {
      case LeadStateCode.Open:
        return tl('status.open')
      case LeadStateCode.Qualified:
        return tl('status.qualified')
      case LeadStateCode.Disqualified:
        return tl('status.disqualified')
      default:
        return tl('status.unknown')
    }
  }

  return (
    <Card className="border-blue-500/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-blue-500" />
          {t('originating.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{lead.fullname || `${lead.firstname} ${lead.lastname}`}</h3>
            {lead.jobtitle && (
              <p className="text-sm text-muted-foreground">{lead.jobtitle}</p>
            )}
          </div>
          <Badge variant={getStateBadgeVariant(lead.statecode)}>
            {getStateName(lead.statecode)}
          </Badge>
        </div>

        <div className="space-y-2">
          {lead.companyname && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{lead.companyname}</span>
            </div>
          )}
          {lead.emailaddress1 && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${lead.emailaddress1}`}
                className="text-blue-500 hover:underline"
              >
                {lead.emailaddress1}
              </a>
            </div>
          )}
          {lead.telephone1 && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${lead.telephone1}`}
                className="text-blue-500 hover:underline"
              >
                {lead.telephone1}
              </a>
            </div>
          )}
        </div>

        {lead.description && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">{t('originating.originalNotes')}</p>
            <p className="text-sm mt-1">{lead.description}</p>
          </div>
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href={`/leads/${lead.leadid}`}>
            {t('originating.viewOriginalLead')}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
