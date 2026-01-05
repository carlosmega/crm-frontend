/**
 * Invoice State Code
 *
 * Estados de Invoice (Factura) en Dynamics 365
 */
export enum InvoiceStateCode {
  /**
   * Active - Factura activa (pendiente de pago)
   */
  Active = 0,

  /**
   * Closed - Factura cerrada (sin pago)
   */
  Closed = 1,

  /**
   * Paid - Factura pagada completamente
   */
  Paid = 2,

  /**
   * Canceled - Factura cancelada
   */
  Canceled = 3,

  /**
   * Corrected - Factura corregida/rectificativa
   * Se crea cuando una factura pagada necesita corrección
   */
  Corrected = 4,
}

/**
 * Helper function para obtener label de Invoice State
 */
export function getInvoiceStateLabel(statecode: InvoiceStateCode): string {
  switch (statecode) {
    case InvoiceStateCode.Active:
      return 'Active'
    case InvoiceStateCode.Closed:
      return 'Closed'
    case InvoiceStateCode.Paid:
      return 'Paid'
    case InvoiceStateCode.Canceled:
      return 'Canceled'
    case InvoiceStateCode.Corrected:
      return 'Corrected'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener color Tailwind
 */
export function getInvoiceStateColor(statecode: InvoiceStateCode): string {
  switch (statecode) {
    case InvoiceStateCode.Active:
      return 'text-yellow-600 bg-yellow-100'
    case InvoiceStateCode.Paid:
      return 'text-green-600 bg-green-100'
    case InvoiceStateCode.Closed:
      return 'text-gray-600 bg-gray-100'
    case InvoiceStateCode.Canceled:
      return 'text-red-600 bg-red-100'
    case InvoiceStateCode.Corrected:
      return 'text-purple-600 bg-purple-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
