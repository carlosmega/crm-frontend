import { memo } from 'react'
import Link from 'next/link'
import type { Lead } from '@/core/contracts'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from './lead-status-badge'
import { LeadSourceBadge } from './lead-source-badge'
import { LeadQualityBadge } from './lead-quality-badge'
import { Building2, Mail, Phone, Calendar, DollarSign, Eye, Edit, Trash2 } from 'lucide-react'

// ✅ OPTIMIZACIÓN: Formatters compartidos (module-level)
const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR'
})

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES')

interface LeadCardProps {
  lead: Lead
  onDelete?: (id: string) => void
}

/**
 * Memoized LeadCard component
 * Prevents unnecessary re-renders when parent updates but props stay the same
 * Performance: Only re-renders if lead or onDelete change
 */
export const LeadCard = memo(function LeadCard({ lead, onDelete }: LeadCardProps) {
  const { t } = useTranslation('leads')
  const { t: tc } = useTranslation('common')
  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return CURRENCY_FORMATTER.format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {lead.fullname || `${lead.firstname} ${lead.lastname}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {lead.jobtitle && (
                <>
                  <span>{lead.jobtitle}</span>
                  {lead.companyname && <span>•</span>}
                </>
              )}
              {lead.companyname && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {lead.companyname}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <LeadStatusBadge statecode={lead.statecode} statuscode={lead.statuscode} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <LeadSourceBadge source={lead.leadsourcecode} />
          <LeadQualityBadge quality={lead.leadqualitycode} />
        </div>

        <div className="space-y-2 text-sm">
          {lead.emailaddress1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${lead.emailaddress1}`} className="hover:underline">
                {lead.emailaddress1}
              </a>
            </div>
          )}

          {lead.telephone1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${lead.telephone1}`} className="hover:underline">
                {lead.telephone1}
              </a>
            </div>
          )}

          {lead.estimatedvalue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(lead.estimatedvalue)}</span>
            </div>
          )}

          {lead.estimatedclosedate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t('card.estClose')} {formatDate(lead.estimatedclosedate)}</span>
            </div>
          )}
        </div>

        {lead.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lead.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/leads/${lead.leadid}`}>
            <Eye className="mr-2 h-4 w-4" />
            {tc('cardActions.view')}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/leads/${lead.leadid}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            {tc('cardActions.edit')}
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(lead.leadid)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
