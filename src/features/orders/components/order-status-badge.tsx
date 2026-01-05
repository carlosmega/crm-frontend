import { Badge } from '@/components/ui/badge'
import { OrderStateCode } from '@/core/contracts/enums'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  statecode: OrderStateCode
  className?: string
}

/**
 * Order Status Badge Component
 *
 * Displays the current state of an order with appropriate styling
 *
 * States:
 * - Active (0): New order, blue
 * - Submitted (1): Submitted for fulfillment, purple
 * - Canceled (2): Canceled, red
 * - Fulfilled (3): Order fulfilled, green
 * - Invoiced (4): Invoice generated, teal
 */
export function OrderStatusBadge({ statecode, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (state: OrderStateCode) => {
    switch (state) {
      case OrderStateCode.Active:
        return {
          label: 'Active',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        }
      case OrderStateCode.Submitted:
        return {
          label: 'Submitted',
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        }
      case OrderStateCode.Canceled:
        return {
          label: 'Canceled',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        }
      case OrderStateCode.Fulfilled:
        return {
          label: 'Fulfilled',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        }
      case OrderStateCode.Invoiced:
        return {
          label: 'Invoiced',
          variant: 'default' as const,
          className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
        }
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          className: '',
        }
    }
  }

  const config = getStatusConfig(statecode)

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
