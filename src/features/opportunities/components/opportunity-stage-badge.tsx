"use client"

import { Badge } from '@/components/ui/badge'
import { SalesStageCode } from '@/core/contracts'
import { Target, Lightbulb, FileText, Trophy } from 'lucide-react'

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
  const getStageConfig = () => {
    switch (stage) {
      case SalesStageCode.Qualify:
        return {
          label: 'Qualify',
          icon: Target,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          probability: probability ?? 25,
        }
      case SalesStageCode.Develop:
        return {
          label: 'Develop',
          icon: Lightbulb,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          probability: probability ?? 50,
        }
      case SalesStageCode.Propose:
        return {
          label: 'Propose',
          icon: FileText,
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
          probability: probability ?? 75,
        }
      case SalesStageCode.Close:
        return {
          label: 'Close',
          icon: Trophy,
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          probability: probability ?? 100,
        }
      default:
        return {
          label: 'Unknown',
          icon: Target,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
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
