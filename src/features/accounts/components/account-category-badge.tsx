import { Badge } from '@/components/ui/badge'
import { AccountCategoryCode } from '@/core/contracts'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Star, User } from 'lucide-react'

interface AccountCategoryBadgeProps {
  categorycode?: AccountCategoryCode
}

export function AccountCategoryBadge({ categorycode }: AccountCategoryBadgeProps) {
  const { t } = useTranslation('accounts')

  if (!categorycode) return null

  const getCategoryConfig = () => {
    switch (categorycode) {
      case AccountCategoryCode.Preferred_Customer:
        return {
          label: t('category.preferredCustomer'),
          variant: 'default' as const,
          icon: Star,
          className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
        }
      case AccountCategoryCode.Standard:
        return {
          label: t('category.standard'),
          variant: 'secondary' as const,
          icon: User,
          className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 hover:bg-gray-100'
        }
      default:
        return {
          label: t('category.standard'),
          variant: 'secondary' as const,
          icon: User,
          className: ''
        }
    }
  }

  const config = getCategoryConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
