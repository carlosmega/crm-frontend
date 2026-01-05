/**
 * Order Status Code Enum
 *
 * Status codes granulares para Orders según Dynamics 365 Sales
 * Cada OrderStateCode puede tener múltiples status codes
 */

export enum OrderStatusCode {
  // Active (statecode: 0)
  /**
   * New - Order recién creada
   */
  New = 1,

  /**
   * Pending - Order pendiente de aprobación/procesamiento
   */
  Pending = 2,

  // Submitted (statecode: 1)
  /**
   * In Progress - Order en proceso de preparación
   */
  InProgress = 3,

  /**
   * Ready To Ship - Order lista para enviar
   */
  ReadyToShip = 4,

  // Fulfilled (statecode: 3)
  /**
   * Complete - Order completamente cumplida
   */
  Complete = 5,

  /**
   * Partial - Order parcialmente cumplida
   */
  Partial = 6,

  /**
   * Shipped - Order enviada al cliente
   */
  Shipped = 7,

  // Invoiced (statecode: 4)
  /**
   * Invoiced - Order facturada
   */
  Invoiced = 8,

  // Canceled (statecode: 2)
  /**
   * Canceled - Order cancelada
   */
  Canceled = 9,

  /**
   * No Money - Cancelada por falta de pago
   */
  NoMoney = 10,

  /**
   * No Inventory - Cancelada por falta de stock
   */
  NoInventory = 11,
}

/**
 * Helper function para obtener label de Order Status
 */
export function getOrderStatusLabel(statuscode: OrderStatusCode): string {
  switch (statuscode) {
    case OrderStatusCode.New:
      return 'New'
    case OrderStatusCode.Pending:
      return 'Pending'
    case OrderStatusCode.InProgress:
      return 'In Progress'
    case OrderStatusCode.ReadyToShip:
      return 'Ready To Ship'
    case OrderStatusCode.Complete:
      return 'Complete'
    case OrderStatusCode.Partial:
      return 'Partial'
    case OrderStatusCode.Shipped:
      return 'Shipped'
    case OrderStatusCode.Invoiced:
      return 'Invoiced'
    case OrderStatusCode.Canceled:
      return 'Canceled'
    case OrderStatusCode.NoMoney:
      return 'No Money'
    case OrderStatusCode.NoInventory:
      return 'No Inventory'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener status code apropiado según statecode
 */
export function getDefaultStatusCode(statecode: number): OrderStatusCode {
  switch (statecode) {
    case 0: // Active
      return OrderStatusCode.New
    case 1: // Submitted
      return OrderStatusCode.InProgress
    case 2: // Canceled
      return OrderStatusCode.Canceled
    case 3: // Fulfilled
      return OrderStatusCode.Complete
    case 4: // Invoiced
      return OrderStatusCode.Invoiced
    default:
      return OrderStatusCode.New
  }
}

/**
 * Helper function para obtener color Tailwind
 */
export function getOrderStatusColor(statuscode: OrderStatusCode): string {
  switch (statuscode) {
    case OrderStatusCode.New:
    case OrderStatusCode.Pending:
      return 'text-blue-600 bg-blue-100'
    case OrderStatusCode.InProgress:
    case OrderStatusCode.ReadyToShip:
      return 'text-purple-600 bg-purple-100'
    case OrderStatusCode.Complete:
    case OrderStatusCode.Shipped:
    case OrderStatusCode.Invoiced:
      return 'text-green-600 bg-green-100'
    case OrderStatusCode.Partial:
      return 'text-orange-600 bg-orange-100'
    case OrderStatusCode.Canceled:
    case OrderStatusCode.NoMoney:
    case OrderStatusCode.NoInventory:
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
