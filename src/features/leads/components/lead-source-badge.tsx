import { Badge } from '@/components/ui/badge'
import { LeadSourceCode } from '@/core/contracts'
import {
  Megaphone,
  Users,
  Share2,
  Handshake,
  Newspaper,
  GraduationCap,
  Store,
  Globe,
  MessageCircle,
  HelpCircle
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface LeadSourceBadgeProps {
  source: LeadSourceCode
}

const sourceKeyMap: Record<number, string> = {
  [LeadSourceCode.Advertisement]: 'advertisement',
  [LeadSourceCode.Employee_Referral]: 'employeeReferral',
  [LeadSourceCode.External_Referral]: 'externalReferral',
  [LeadSourceCode.Partner]: 'partner',
  [LeadSourceCode.Public_Relations]: 'publicRelations',
  [LeadSourceCode.Seminar]: 'seminar',
  [LeadSourceCode.Trade_Show]: 'tradeShow',
  [LeadSourceCode.Web]: 'web',
  [LeadSourceCode.Word_of_Mouth]: 'wordOfMouth',
  [LeadSourceCode.Other]: 'other',
}

export function LeadSourceBadge({ source }: LeadSourceBadgeProps) {
  const { t } = useTranslation('leads')

  const getSourceConfig = () => {
    const key = sourceKeyMap[source] || 'other'
    const label = t(`sources.${key}`)
    switch (source) {
      case LeadSourceCode.Advertisement:
        return { label, icon: Megaphone, color: 'bg-purple-100 text-purple-800' }
      case LeadSourceCode.Employee_Referral:
        return { label, icon: Users, color: 'bg-indigo-100 text-indigo-800' }
      case LeadSourceCode.External_Referral:
        return { label, icon: Share2, color: 'bg-cyan-100 text-cyan-800' }
      case LeadSourceCode.Partner:
        return { label, icon: Handshake, color: 'bg-emerald-100 text-emerald-800' }
      case LeadSourceCode.Public_Relations:
        return { label, icon: Newspaper, color: 'bg-pink-100 text-pink-800' }
      case LeadSourceCode.Seminar:
        return { label, icon: GraduationCap, color: 'bg-amber-100 text-amber-800' }
      case LeadSourceCode.Trade_Show:
        return { label, icon: Store, color: 'bg-orange-100 text-orange-800' }
      case LeadSourceCode.Web:
        return { label, icon: Globe, color: 'bg-blue-100 text-blue-800' }
      case LeadSourceCode.Word_of_Mouth:
        return { label, icon: MessageCircle, color: 'bg-lime-100 text-lime-800' }
      case LeadSourceCode.Other:
        return { label, icon: HelpCircle, color: 'bg-gray-100 text-gray-800' }
      default:
        return { label: t('status.unknown'), icon: HelpCircle, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const config = getSourceConfig()
  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.color}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
