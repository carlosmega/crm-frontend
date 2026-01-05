/**
 * Orders Feature Types
 *
 * Re-export types from core contracts (Single Source of Truth)
 */

export type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  FulfillOrderDto,
} from '@/core/contracts/entities/order'

export { OrderStateCode } from '@/core/contracts/enums/order-state'
