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

interface LeadSourceBadgeProps {
  source: LeadSourceCode
}

export function LeadSourceBadge({ source }: LeadSourceBadgeProps) {
  const getSourceConfig = () => {
    switch (source) {
      case LeadSourceCode.Advertisement:
        return { label: 'Advertisement', icon: Megaphone, color: 'bg-purple-100 text-purple-800' }
      case LeadSourceCode.Employee_Referral:
        return { label: 'Employee Referral', icon: Users, color: 'bg-indigo-100 text-indigo-800' }
      case LeadSourceCode.External_Referral:
        return { label: 'External Referral', icon: Share2, color: 'bg-cyan-100 text-cyan-800' }
      case LeadSourceCode.Partner:
        return { label: 'Partner', icon: Handshake, color: 'bg-emerald-100 text-emerald-800' }
      case LeadSourceCode.Public_Relations:
        return { label: 'Public Relations', icon: Newspaper, color: 'bg-pink-100 text-pink-800' }
      case LeadSourceCode.Seminar:
        return { label: 'Seminar', icon: GraduationCap, color: 'bg-amber-100 text-amber-800' }
      case LeadSourceCode.Trade_Show:
        return { label: 'Trade Show', icon: Store, color: 'bg-orange-100 text-orange-800' }
      case LeadSourceCode.Web:
        return { label: 'Web', icon: Globe, color: 'bg-blue-100 text-blue-800' }
      case LeadSourceCode.Word_of_Mouth:
        return { label: 'Word of Mouth', icon: MessageCircle, color: 'bg-lime-100 text-lime-800' }
      case LeadSourceCode.Other:
        return { label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-800' }
      default:
        return { label: 'Unknown', icon: HelpCircle, color: 'bg-gray-100 text-gray-800' }
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
