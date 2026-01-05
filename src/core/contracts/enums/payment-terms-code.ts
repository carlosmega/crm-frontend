/**
 * Payment Terms Code Enum
 *
 * Términos de pago estándar según Dynamics 365 Sales
 * Usado en Orders e Invoices para especificar condiciones de pago
 */

export enum PaymentTermsCode {
  /**
   * Net 30 - Pago dentro de 30 días
   */
  Net30 = 1,

  /**
   * Net 45 - Pago dentro de 45 días
   */
  Net45 = 2,

  /**
   * Net 60 - Pago dentro de 60 días
   */
  Net60 = 3,

  /**
   * Net 90 - Pago dentro de 90 días
   */
  Net90 = 4,

  /**
   * 2% 10, Net 30 - 2% descuento si se paga en 10 días, de lo contrario neto 30 días
   */
  Discount2Percent10Net30 = 5,

  /**
   * Due On Receipt - Pago al recibir
   */
  DueOnReceipt = 6,

  /**
   * Cash On Delivery (COD) - Pago contra entrega
   */
  COD = 7,

  /**
   * Prepaid - Pago anticipado
   */
  Prepaid = 8,
}

/**
 * Helper function para obtener label de Payment Terms
 */
export function getPaymentTermsLabel(code: PaymentTermsCode): string {
  switch (code) {
    case PaymentTermsCode.Net30:
      return 'Net 30'
    case PaymentTermsCode.Net45:
      return 'Net 45'
    case PaymentTermsCode.Net60:
      return 'Net 60'
    case PaymentTermsCode.Net90:
      return 'Net 90'
    case PaymentTermsCode.Discount2Percent10Net30:
      return '2% 10, Net 30'
    case PaymentTermsCode.DueOnReceipt:
      return 'Due On Receipt'
    case PaymentTermsCode.COD:
      return 'COD'
    case PaymentTermsCode.Prepaid:
      return 'Prepaid'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener días de vencimiento
 */
export function getPaymentTermsDays(code: PaymentTermsCode): number {
  switch (code) {
    case PaymentTermsCode.Net30:
    case PaymentTermsCode.Discount2Percent10Net30:
      return 30
    case PaymentTermsCode.Net45:
      return 45
    case PaymentTermsCode.Net60:
      return 60
    case PaymentTermsCode.Net90:
      return 90
    case PaymentTermsCode.DueOnReceipt:
    case PaymentTermsCode.COD:
    case PaymentTermsCode.Prepaid:
      return 0
    default:
      return 30
  }
}
