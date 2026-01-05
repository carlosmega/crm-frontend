import { Badge } from '@/components/ui/badge'
import { LeadStateCode, LeadStatusCode } from '@/core/contracts'
import { CheckCircle2, Circle, XCircle } from 'lucide-react'

interface LeadStatusBadgeProps {
  statecode: LeadStateCode
  statuscode?: LeadStatusCode
}

export function LeadStatusBadge({ statecode, statuscode }: LeadStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (statecode) {
      case LeadStateCode.Open:
        return {
          label: statuscode === LeadStatusCode.Contacted ? 'Contacted' : 'New',
          variant: 'default' as const,
          icon: Circle,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        }
      case LeadStateCode.Qualified:
        return {
          label: 'Qualified',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        }
      case LeadStateCode.Disqualified:
        return {
          label: 'Disqualified',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 hover:bg-red-100'
        }
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: Circle,
          className: ''
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
