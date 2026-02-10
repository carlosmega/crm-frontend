import { Badge } from '@/components/ui/badge'
import { LeadQualityCode } from '@/core/contracts'
import { Flame, Sun, Snowflake } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface LeadQualityBadgeProps {
  quality?: LeadQualityCode
}

export function LeadQualityBadge({ quality }: LeadQualityBadgeProps) {
  const { t } = useTranslation('leads')
  if (!quality) return null

  const qualityKeyMap: Record<number, string> = {
    [LeadQualityCode.Hot]: 'hot',
    [LeadQualityCode.Warm]: 'warm',
    [LeadQualityCode.Cold]: 'cold',
  }

  const getQualityConfig = () => {
    switch (quality) {
      case LeadQualityCode.Hot:
        return {
          label: t(`quality.${qualityKeyMap[quality]}`),
          icon: Flame,
          className: 'bg-red-100 text-red-800 hover:bg-red-100'
        }
      case LeadQualityCode.Warm:
        return {
          label: t(`quality.${qualityKeyMap[quality]}`),
          icon: Sun,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
        }
      case LeadQualityCode.Cold:
        return {
          label: t(`quality.${qualityKeyMap[quality]}`),
          icon: Snowflake,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        }
      default:
        return null
    }
  }

  const config = getQualityConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
