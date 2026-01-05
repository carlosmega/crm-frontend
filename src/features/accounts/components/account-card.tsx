import { memo } from 'react'
import Link from 'next/link'
import type { Account } from '@/core/contracts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountStatusBadge } from './account-status-badge'
import { AccountCategoryBadge } from './account-category-badge'
import { Mail, Phone, Globe, MapPin, Users, DollarSign, Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/shared/utils/formatters'

interface AccountCardProps {
  account: Account
  onDelete?: (id: string) => void
}

/**
 * Memoized AccountCard component
 * Performance:
 * - Only re-renders if account or onDelete change
 * - Uses shared formatters (module-level) to avoid recreating on every render
 */
export const AccountCard = memo(function AccountCard({ account, onDelete }: AccountCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {account.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {account.accountnumber && (
                <span className="font-mono text-xs">{account.accountnumber}</span>
              )}
              {account.accountnumber && account.address1_city && <span>•</span>}
              {account.address1_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {account.address1_city}
                  {account.address1_country && `, ${account.address1_country}`}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <AccountStatusBadge statecode={account.statecode} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <AccountCategoryBadge categorycode={account.accountcategorycode} />
        </div>

        <div className="space-y-2 text-sm">
          {account.emailaddress1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${account.emailaddress1}`} className="hover:underline">
                {account.emailaddress1}
              </a>
            </div>
          )}

          {account.telephone1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${account.telephone1}`} className="hover:underline">
                {account.telephone1}
              </a>
            </div>
          )}

          {account.websiteurl && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a href={account.websiteurl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {account.websiteurl}
              </a>
            </div>
          )}

          {account.revenue && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Revenue: {formatCurrency(account.revenue)}</span>
            </div>
          )}

          {account.numberofemployees && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{formatNumber(account.numberofemployees)} employees</span>
            </div>
          )}
        </div>

        {account.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {account.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/accounts/${account.accountid}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/accounts/${account.accountid}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(account.accountid)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
