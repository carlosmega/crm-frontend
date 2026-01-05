import { OrderStateCode } from '../types'

export function getOrderStateLabel(statecode: OrderStateCode): string {
  const labels: Record<OrderStateCode, string> = {
    [OrderStateCode.Active]: 'Active',
    [OrderStateCode.Submitted]: 'Submitted',
    [OrderStateCode.Canceled]: 'Canceled',
    [OrderStateCode.Fulfilled]: 'Fulfilled',
    [OrderStateCode.Invoiced]: 'Invoiced',
  }
  return labels[statecode] || 'Unknown'
}

export function getOrderStateColor(statecode: OrderStateCode): 'default' | 'secondary' | 'success' | 'destructive' | 'outline' {
  const colors: Record<OrderStateCode, 'default' | 'secondary' | 'success' | 'destructive' | 'outline'> = {
    [OrderStateCode.Active]: 'default',
    [OrderStateCode.Submitted]: 'secondary',
    [OrderStateCode.Fulfilled]: 'success',
    [OrderStateCode.Invoiced]: 'outline',
    [OrderStateCode.Canceled]: 'destructive',
  }
  return colors[statecode] || 'default'
}

export function canEditOrder(statecode: OrderStateCode): boolean {
  return statecode === OrderStateCode.Active
}

export function canSubmitOrder(statecode: OrderStateCode): boolean {
  return statecode === OrderStateCode.Active
}

export function canFulfillOrder(statecode: OrderStateCode): boolean {
  return statecode === OrderStateCode.Submitted
}

export function canCancelOrder(statecode: OrderStateCode): boolean {
  return statecode === OrderStateCode.Active || statecode === OrderStateCode.Submitted
}
