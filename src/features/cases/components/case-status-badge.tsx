import { Badge } from '@/components/ui/badge'
import {
  CaseStateCode,
  CaseStatusCode,
  getCaseStatusLabel,
} from '@/core/contracts'
import { CheckCircle2, Circle, XCircle, Clock, Search, Pause } from 'lucide-react'

interface CaseStatusBadgeProps {
  statecode: CaseStateCode
  statuscode?: CaseStatusCode
}

export function CaseStatusBadge({ statecode, statuscode }: CaseStatusBadgeProps) {
  const getStatusConfig = () => {
    // First check by statuscode for more specific status
    if (statuscode !== undefined) {
      switch (statuscode) {
        case CaseStatusCode.InProgress:
          return {
            label: 'In Progress',
            variant: 'default' as const,
            icon: Circle,
            className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
          }
        case CaseStatusCode.OnHold:
          return {
            label: 'On Hold',
            variant: 'default' as const,
            icon: Pause,
            className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
          }
        case CaseStatusCode.WaitingForDetails:
          return {
            label: 'Waiting for Details',
            variant: 'default' as const,
            icon: Clock,
            className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
          }
        case CaseStatusCode.Researching:
          return {
            label: 'Researching',
            variant: 'default' as const,
            icon: Search,
            className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
          }
        case CaseStatusCode.ProblemSolved:
        case CaseStatusCode.InformationProvided:
          return {
            label: getCaseStatusLabel(statuscode),
            variant: 'default' as const,
            icon: CheckCircle2,
            className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
          }
        case CaseStatusCode.Cancelled:
        case CaseStatusCode.Merged:
          return {
            label: getCaseStatusLabel(statuscode),
            variant: 'default' as const,
            icon: XCircle,
            className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
          }
      }
    }

    // Fallback to statecode
    switch (statecode) {
      case CaseStateCode.Active:
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: Circle,
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        }
      case CaseStateCode.Resolved:
        return {
          label: 'Resolved',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        }
      case CaseStateCode.Cancelled:
        return {
          label: 'Cancelled',
          variant: 'default' as const,
          icon: XCircle,
          className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
        }
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          icon: Circle,
          className: '',
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
