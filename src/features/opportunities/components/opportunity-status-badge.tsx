"use client"

import { Badge } from '@/components/ui/badge'
import { OpportunityStateCode, OpportunityStatusCode } from '@/core/contracts'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OpportunityStatusBadgeProps {
  statecode: OpportunityStateCode
  statuscode: OpportunityStatusCode
  className?: string
}

export function OpportunityStatusBadge({
  statecode,
  statuscode,
  className,
}: OpportunityStatusBadgeProps) {
  const { t } = useTranslation('opportunities')

  const getStatusConfig = () => {
    switch (statecode) {
      case OpportunityStateCode.Open:
        return {
          label: t('status.open'),
          variant: 'default' as const,
          icon: Clock,
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200',
        }
      case OpportunityStateCode.Won:
        return {
          label: t('status.won'),
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200',
        }
      case OpportunityStateCode.Lost:
        return {
          label: t('status.lost'),
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200',
        }
      default:
        return {
          label: t('status.unknown'),
          variant: 'outline' as const,
          icon: Clock,
          className: '',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="mr-1 size-3" />
      {config.label}
    </Badge>
  )
}
