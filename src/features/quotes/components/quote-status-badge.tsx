import { Badge } from '@/components/ui/badge'
import { QuoteStatusCode } from '@/core/contracts/enums'
import {
  getQuoteStatusLabel,
  getQuoteStatusColor,
} from '../utils/quote-helpers'

interface QuoteStatusBadgeProps {
  statuscode: QuoteStatusCode
  className?: string
}

/**
 * Quote Status Badge
 *
 * Muestra el statuscode del Quote (In Progress, In Review, Won, Lost, etc.)
 */
export function QuoteStatusBadge({
  statuscode,
  className,
}: QuoteStatusBadgeProps) {
  const label = getQuoteStatusLabel(statuscode)
  const variant = getQuoteStatusColor(statuscode)

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
