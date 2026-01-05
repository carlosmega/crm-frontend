import { Badge } from '@/components/ui/badge'
import { QuoteStateCode } from '@/core/contracts/enums'
import {
  getQuoteStateLabel,
  getQuoteStateColor,
} from '../utils/quote-helpers'

interface QuoteStateBadgeProps {
  statecode: QuoteStateCode
  className?: string
}

/**
 * Quote State Badge
 *
 * Muestra el statecode del Quote (Draft, Active, Won, Closed)
 */
export function QuoteStateBadge({
  statecode,
  className,
}: QuoteStateBadgeProps) {
  const label = getQuoteStateLabel(statecode)
  const variant = getQuoteStateColor(statecode)

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
