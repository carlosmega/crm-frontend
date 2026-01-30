import { Badge } from '@/components/ui/badge'
import { CasePriorityCode, getCasePriorityLabel } from '@/core/contracts'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

interface CasePriorityBadgeProps {
  priority: CasePriorityCode
}

export function CasePriorityBadge({ priority }: CasePriorityBadgeProps) {
  const getConfig = () => {
    switch (priority) {
      case CasePriorityCode.High:
        return {
          label: getCasePriorityLabel(priority),
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
        }
      case CasePriorityCode.Normal:
        return {
          label: getCasePriorityLabel(priority),
          icon: Minus,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
        }
      case CasePriorityCode.Low:
        return {
          label: getCasePriorityLabel(priority),
          icon: ArrowDown,
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        }
      default:
        return {
          label: 'Unknown',
          icon: Minus,
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
