"use client"

import type { Lead } from '@/core/contracts'
import { LeadStateCode, LeadQualityCode, LeadSourceCode, LeadSourceLabels } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Flame, Snowflake, ThermometerSun, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'

interface LeadInfoHeaderProps {
  lead: Lead
  className?: string
}

/**
 * LeadInfoHeader
 *
 * Header component similar to Dynamics 365 que muestra información clave del lead:
 * - Nombre completo
 * - Tipo (Cliente potencial / Lead)
 * - Estado (Open/Qualified/Disqualified)
 * - Clasificación (Hot/Warm/Cold)
 * - Origen (Web, Trade Show, etc.)
 * - Compañía
 * - Propietario
 *
 * Responsive design with mobile card layout
 */
export function LeadInfoHeader({ lead, className }: LeadInfoHeaderProps) {
  const { t } = useTranslation('leads')

  // Determine state badge variant and label
  const getStateBadge = () => {
    const stateCode = Number(lead.statecode)

    switch (stateCode) {
      case LeadStateCode.Open:
        return { variant: 'default' as const, label: t('status.open').toUpperCase(), color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
      case LeadStateCode.Qualified:
        return { variant: 'default' as const, label: t('status.qualified').toUpperCase(), color: 'bg-emerald-100 text-emerald-700' }
      case LeadStateCode.Disqualified:
        return { variant: 'destructive' as const, label: t('status.disqualified').toUpperCase(), color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
      default:
        return { variant: 'secondary' as const, label: t('status.unknown').toUpperCase(), color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300' }
    }
  }

  // Determine quality badge
  const getQualityBadge = () => {
    if (!lead.leadqualitycode) return { icon: Flame, text: t('quality.warm'), color: 'text-orange-500' }

    const qualityCode = Number(lead.leadqualitycode)

    switch (qualityCode) {
      case LeadQualityCode.Hot:
        return { icon: Flame, text: t('quality.hot'), color: 'text-red-500' }
      case LeadQualityCode.Warm:
        return { icon: ThermometerSun, text: t('quality.warm'), color: 'text-orange-500' }
      case LeadQualityCode.Cold:
        return { icon: Snowflake, text: t('quality.cold'), color: 'text-blue-500' }
      default:
        return { icon: Flame, text: t('quality.warm'), color: 'text-orange-500' }
    }
  }

  const stateBadge = getStateBadge()
  const qualityBadge = getQualityBadge()
  const QualityIcon = qualityBadge.icon
  const sourceLabel = LeadSourceLabels[lead.leadsourcecode as LeadSourceCode] || 'Unknown'

  return (
    <>
      {/* Desktop Layout */}
      <div className={cn("hidden md:block space-y-3", className)}>
        {/* Main Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {lead.fullname || `${lead.firstname} ${lead.lastname}`}
          </h1>
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 px-3 py-1"
          >
            {t('header.salesLead')}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-0 px-3 py-1"
          >
            {t('header.lead')}
          </Badge>
        </div>

        {/* Info Pills */}
        <div className="flex items-center gap-4 text-sm">
          {/* Quality */}
          <div className="flex items-center gap-1.5">
            <QualityIcon className={cn("w-4 h-4", qualityBadge.color)} />
            <span className="font-medium text-gray-900">{qualityBadge.text}</span>
          </div>

          {/* Origin/Source */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="font-medium">{t('header.origin')}</span>
            <span className="text-gray-900 font-medium">{sourceLabel}</span>
          </div>

          {/* State */}
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold uppercase border-0 px-3 py-1",
              stateBadge.color
            )}
          >
            {stateBadge.label}
          </Badge>

          {/* Company */}
          {lead.companyname && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-gray-900 font-medium">{lead.companyname}</span>
            </div>
          )}
        </div>

        {/* Owner */}
        {lead.ownerid && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-purple-600" />
            <span className="font-medium">{t('header.owner')}</span>
            <span className="text-gray-900 font-medium">
              {lead.ownerid.slice(0, 2)} {lead.ownerid.slice(0, 15)}...
            </span>
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <Card className="md:hidden border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Badges at top */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs font-semibold uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0 px-2.5 py-0.5"
            >
              {t('header.salesLead')}
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs font-semibold uppercase bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-0 px-2.5 py-0.5"
            >
              {t('header.lead')}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900">
            {lead.fullname || `${lead.firstname} ${lead.lastname}`}
          </h1>

          {/* Info Pills - Mobile optimized */}
          <div className="flex items-center gap-3 text-sm flex-wrap">
            {/* Quality */}
            <div className="flex items-center gap-1.5">
              <QualityIcon className={cn("w-4 h-4", qualityBadge.color)} />
              <span className="font-medium text-gray-900">{qualityBadge.text}</span>
            </div>

            {/* Origin/Source */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="font-medium">{t('header.origin')}</span>
              <span className="text-gray-900 font-medium">{sourceLabel}</span>
            </div>

            {/* State */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold uppercase border-0 px-2.5 py-0.5",
                stateBadge.color
              )}
            >
              {stateBadge.label}
            </Badge>
          </div>

          {/* Owner - Mobile */}
          {lead.ownerid && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{t('header.owner')}</span>
              <span className="text-gray-900 font-medium">
                {lead.ownerid.slice(0, 2)} {lead.ownerid.slice(0, 15)}...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
