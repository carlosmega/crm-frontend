import { User, Briefcase, FileText, CheckSquare, AtSign, AlertCircle } from 'lucide-react'
import type { NotificationType } from './types'

export function getNotificationIcon(type: NotificationType) {
  const iconMap = {
    lead: User,
    opportunity: Briefcase,
    quote: FileText,
    task: CheckSquare,
    mention: AtSign,
    system: AlertCircle,
  }

  return iconMap[type] || AlertCircle
}

export function getNotificationIconColor(type: NotificationType): string {
  const colorMap = {
    lead: 'text-blue-600',
    opportunity: 'text-purple-600',
    quote: 'text-green-600',
    task: 'text-orange-600',
    mention: 'text-pink-600',
    system: 'text-gray-600',
  }

  return colorMap[type] || 'text-gray-600'
}

export function getNotificationBgColor(type: NotificationType): string {
  const bgMap = {
    lead: 'bg-blue-100',
    opportunity: 'bg-purple-100',
    quote: 'bg-green-100',
    task: 'bg-orange-100',
    mention: 'bg-pink-100',
    system: 'bg-gray-100',
  }

  return bgMap[type] || 'bg-gray-100'
}
