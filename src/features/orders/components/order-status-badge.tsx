'use client'

import { Badge } from '@/components/ui/badge'
import { OrderStateCode } from '@/core/contracts/enums'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'

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
  const { t } = useTranslation('orders')

  const getStatusConfig = (state: OrderStateCode) => {
    switch (state) {
      case OrderStateCode.Active:
        return {
          label: t('statusBadge.active'),
          variant: 'default' as const,
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:bg-blue-900 dark:text-blue-300',
        }
      case OrderStateCode.Submitted:
        return {
          label: t('statusBadge.submitted'),
          variant: 'default' as const,
          className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 dark:bg-purple-900 dark:text-purple-300',
        }
      case OrderStateCode.Canceled:
        return {
          label: t('statusBadge.canceled'),
          variant: 'destructive' as const,
          className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 dark:bg-red-900 dark:text-red-300',
        }
      case OrderStateCode.Fulfilled:
        return {
          label: t('statusBadge.fulfilled'),
          variant: 'default' as const,
          className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 dark:bg-green-900 dark:text-green-300',
        }
      case OrderStateCode.Invoiced:
        return {
          label: t('statusBadge.invoiced'),
          variant: 'default' as const,
          className: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 dark:bg-teal-900 dark:text-teal-300',
        }
      default:
        return {
          label: t('statusBadge.unknown'),
          variant: 'secondary' as const,
          className: '',
        }
    }
  }

  const config = getStatusConfig(statecode)

  // Generate testid based on status code for language-independent testing
  const getTestId = () => {
    switch (statecode) {
      case OrderStateCode.Active:
        return 'order-status-active'
      case OrderStateCode.Submitted:
        return 'order-status-submitted'
      case OrderStateCode.Canceled:
        return 'order-status-canceled'
      case OrderStateCode.Fulfilled:
        return 'order-status-fulfilled'
      case OrderStateCode.Invoiced:
        return 'order-status-invoiced'
      default:
        return 'order-status-unknown'
    }
  }

  return (
    <Badge
      data-testid={getTestId()}
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
