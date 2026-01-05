/**
 * Shipping Method Code Enum
 *
 * Métodos de envío disponibles según Dynamics 365 Sales
 * Define el tipo de servicio de entrega
 */

export enum ShippingMethodCode {
  /**
   * Ground - Envío terrestre estándar (3-7 días)
   */
  Ground = 1,

  /**
   * Overnight - Envío overnight (1 día)
   */
  Overnight = 2,

  /**
   * Two Day - Envío en 2 días
   */
  TwoDay = 3,

  /**
   * International - Envío internacional (5-15 días)
   */
  International = 4,

  /**
   * Express - Envío express (2-3 días)
   */
  Express = 5,

  /**
   * Economy - Envío económico (7-14 días)
   */
  Economy = 6,

  /**
   * Same Day - Envío el mismo día
   */
  SameDay = 7,

  /**
   * Freight - Carga pesada/pallets
   */
  Freight = 8,

  /**
   * Will Call - El cliente recoge en sitio
   */
  WillCall = 9,
}

/**
 * Helper function para obtener label de Shipping Method
 */
export function getShippingMethodLabel(code: ShippingMethodCode): string {
  switch (code) {
    case ShippingMethodCode.Ground:
      return 'Ground (3-7 days)'
    case ShippingMethodCode.Overnight:
      return 'Overnight'
    case ShippingMethodCode.TwoDay:
      return 'Two Day'
    case ShippingMethodCode.International:
      return 'International (5-15 days)'
    case ShippingMethodCode.Express:
      return 'Express (2-3 days)'
    case ShippingMethodCode.Economy:
      return 'Economy (7-14 days)'
    case ShippingMethodCode.SameDay:
      return 'Same Day'
    case ShippingMethodCode.Freight:
      return 'Freight'
    case ShippingMethodCode.WillCall:
      return 'Will Call (Customer Pickup)'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener días estimados de entrega
 */
export function getShippingMethodDays(code: ShippingMethodCode): number {
  switch (code) {
    case ShippingMethodCode.SameDay:
      return 0
    case ShippingMethodCode.Overnight:
      return 1
    case ShippingMethodCode.TwoDay:
      return 2
    case ShippingMethodCode.Express:
      return 3
    case ShippingMethodCode.Ground:
      return 5
    case ShippingMethodCode.Economy:
      return 10
    case ShippingMethodCode.International:
      return 10
    case ShippingMethodCode.Freight:
      return 7
    case ShippingMethodCode.WillCall:
      return 0
    default:
      return 5
  }
}

/**
 * Helper function para determinar si requiere tracking
 */
export function requiresTracking(code: ShippingMethodCode): boolean {
  return code !== ShippingMethodCode.WillCall
}
