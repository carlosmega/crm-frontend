"use client"

import { Badge } from '@/components/ui/badge'
import { OpportunityStateCode, OpportunityStatusCode } from '@/core/contracts'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

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
  const getStatusConfig = () => {
    switch (statecode) {
      case OpportunityStateCode.Open:
        return {
          label: 'Open',
          variant: 'default' as const,
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        }
      case OpportunityStateCode.Won:
        return {
          label: 'Won',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
        }
      case OpportunityStateCode.Lost:
        return {
          label: 'Lost',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
        }
      default:
        return {
          label: 'Unknown',
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
