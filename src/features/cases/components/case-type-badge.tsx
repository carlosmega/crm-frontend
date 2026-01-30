import { Badge } from '@/components/ui/badge'
import { CaseTypeCode, getCaseTypeLabel } from '@/core/contracts'
import { HelpCircle, AlertTriangle, FileText } from 'lucide-react'

interface CaseTypeBadgeProps {
  type?: CaseTypeCode
}

export function CaseTypeBadge({ type }: CaseTypeBadgeProps) {
  if (type === undefined) {
    return null
  }

  const getConfig = () => {
    switch (type) {
      case CaseTypeCode.Question:
        return {
          label: getCaseTypeLabel(type),
          icon: HelpCircle,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        }
      case CaseTypeCode.Problem:
        return {
          label: getCaseTypeLabel(type),
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        }
      case CaseTypeCode.Request:
        return {
          label: getCaseTypeLabel(type),
          icon: FileText,
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        }
      default:
        return {
          label: 'Unknown',
          icon: HelpCircle,
          className: 'bg-gray-100 text-gray-800',
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <Badge variant="default" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
