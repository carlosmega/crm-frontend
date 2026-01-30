import { Badge } from '@/components/ui/badge'
import { CaseOriginCode, getCaseOriginLabel } from '@/core/contracts'
import { Phone, Mail, Globe, Facebook, Twitter, Cpu } from 'lucide-react'

interface CaseOriginBadgeProps {
  origin: CaseOriginCode
}

export function CaseOriginBadge({ origin }: CaseOriginBadgeProps) {
  const getConfig = () => {
    switch (origin) {
      case CaseOriginCode.Phone:
        return {
          label: getCaseOriginLabel(origin),
          icon: Phone,
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        }
      case CaseOriginCode.Email:
        return {
          label: getCaseOriginLabel(origin),
          icon: Mail,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        }
      case CaseOriginCode.Web:
        return {
          label: getCaseOriginLabel(origin),
          icon: Globe,
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
        }
      case CaseOriginCode.Facebook:
        return {
          label: getCaseOriginLabel(origin),
          icon: Facebook,
          className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
        }
      case CaseOriginCode.Twitter:
        return {
          label: getCaseOriginLabel(origin),
          icon: Twitter,
          className: 'bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400',
        }
      case CaseOriginCode.IoT:
        return {
          label: getCaseOriginLabel(origin),
          icon: Cpu,
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
        }
      default:
        return {
          label: 'Unknown',
          icon: Globe,
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
