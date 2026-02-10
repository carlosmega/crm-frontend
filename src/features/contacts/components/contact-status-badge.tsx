import { Badge } from '@/components/ui/badge'
import { ContactStateCode } from '@/core/contracts'
import { useTranslation } from '@/shared/hooks/use-translation'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ContactStatusBadgeProps {
  statecode: ContactStateCode
}

export function ContactStatusBadge({ statecode }: ContactStatusBadgeProps) {
  const { t } = useTranslation('contacts')

  const getStatusConfig = () => {
    switch (statecode) {
      case ContactStateCode.Active:
        return {
          label: t('status.active'),
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        }
      case ContactStateCode.Inactive:
        return {
          label: t('status.inactive'),
          variant: 'secondary' as const,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        }
      default:
        return {
          label: t('status.unknown'),
          variant: 'secondary' as const,
          icon: XCircle,
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
