"use client"

import { Badge } from '@/components/ui/badge'
import { SalesStageCode } from '@/core/contracts'
import { Target, Lightbulb, FileText, Trophy } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OpportunityStageBadgeProps {
  stage: SalesStageCode
  probability?: number
  className?: string
  showProbability?: boolean
}

export function OpportunityStageBadge({
  stage,
  probability,
  className,
  showProbability = true,
}: OpportunityStageBadgeProps) {
  const { t } = useTranslation('opportunities')

  const getStageConfig = () => {
    switch (stage) {
      case SalesStageCode.Qualify:
        return {
          label: t('stages.qualify'),
          icon: Target,
          className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200',
          probability: probability ?? 25,
        }
      case SalesStageCode.Develop:
        return {
          label: t('stages.develop'),
          icon: Lightbulb,
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200',
          probability: probability ?? 50,
        }
      case SalesStageCode.Propose:
        return {
          label: t('stages.propose'),
          icon: FileText,
          className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200',
          probability: probability ?? 75,
        }
      case SalesStageCode.Close:
        return {
          label: t('stages.close'),
          icon: Trophy,
          className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200',
          probability: probability ?? 100,
        }
      default:
        return {
          label: t('stages.unknown'),
          icon: Target,
          className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 hover:bg-gray-200',
          probability: 0,
        }
    }
  }

  const config = getStageConfig()
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      <Icon className="mr-1 size-3" />
      {config.label}
      {showProbability && (
        <span className="ml-1 text-xs font-normal">({config.probability}%)</span>
      )}
    </Badge>
  )
}
