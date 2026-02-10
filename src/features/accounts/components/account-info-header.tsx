"use client"

import type { Account } from '@/core/contracts'
import { AccountStateCode, AccountCategoryCode, IndustryCode } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Building2, MapPin, Star, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountInfoHeaderProps {
  account: Account
  className?: string
}

/**
 * AccountInfoHeader
 *
 * Header component similar to Dynamics 365 que muestra información clave de la cuenta:
 * - Nombre de la cuenta
 * - Tipo (Cuenta)
 * - Estado (Active/Inactive)
 * - Categoría (Preferred Customer/Standard)
 * - Ubicación
 * - Propietario
 */
export function AccountInfoHeader({ account, className }: AccountInfoHeaderProps) {
  const { t } = useTranslation('accounts')

  // Determine state badge variant and label
  const getStateBadge = () => {
    const stateCode = Number(account.statecode)

    switch (stateCode) {
      case AccountStateCode.Active:
        return { variant: 'default' as const, label: t('status.active'), color: 'bg-green-500' }
      case AccountStateCode.Inactive:
        return { variant: 'secondary' as const, label: t('status.inactive'), color: 'bg-gray-500' }
      default:
        return { variant: 'secondary' as const, label: t('status.unknown'), color: 'bg-gray-500' }
    }
  }

  // Determine category badge
  const getCategoryBadge = () => {
    if (!account.accountcategorycode) return null

    const categoryCode = Number(account.accountcategorycode)

    switch (categoryCode) {
      case AccountCategoryCode.Preferred_Customer:
        return { icon: Star, label: t('category.preferredCustomer'), color: 'text-purple-600 bg-purple-50 border-purple-200' }
      case AccountCategoryCode.Standard:
        return { icon: User, label: t('category.standard'), color: 'text-gray-600 bg-gray-50 border-gray-200' }
      default:
        return null
    }
  }

  const stateBadge = getStateBadge()
  const categoryBadge = getCategoryBadge()

  return (
    <div className={cn("border-b py-4", className)}>
      <div className="space-y-3">
        {/* Row 1: Name, Type Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">
            {account.name}
          </h1>
          <Badge variant="secondary" className="text-xs font-semibold uppercase bg-purple-100 text-purple-700 border-0 px-3 py-1">
            {t('header.account')}
          </Badge>
          <Badge variant="secondary" className="text-xs font-semibold uppercase bg-gray-100 text-gray-700 border-0 px-3 py-1">
            {t('header.accountLabel')}
          </Badge>
        </div>

        {/* Row 2: Category, Account Number, State, Location */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {/* Category Badge */}
          {categoryBadge && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border",
              categoryBadge.color
            )}>
              <categoryBadge.icon className="w-3.5 h-3.5" />
              <span className="font-medium">{categoryBadge.label}</span>
            </div>
          )}

          {/* Account Number */}
          {account.accountnumber && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium">{t('header.accountNumber')}</span>
              <span className="font-mono">{account.accountnumber}</span>
            </div>
          )}

          {/* State Badge */}
          <Badge
            variant={stateBadge.variant}
            className={cn("text-xs", stateBadge.color, "text-white")}
          >
            {stateBadge.label}
          </Badge>

          {/* Location */}
          {(account.address1_city || account.address1_country) && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">
                {account.address1_city}
                {account.address1_country && `, ${account.address1_country}`}
              </span>
            </div>
          )}
        </div>

        {/* Row 3: Owner */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium">{t('header.owner')}</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {account.ownerid?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{account.ownerid || t('header.unassigned')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
