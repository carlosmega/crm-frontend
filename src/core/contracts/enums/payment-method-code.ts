/**
 * Payment Method Code Enum
 *
 * Métodos de pago disponibles
 * Usado en Orders e Invoices para tracking de método de pago
 */

export enum PaymentMethodCode {
  /**
   * Credit Card - Tarjeta de crédito
   */
  CreditCard = 1,

  /**
   * Debit Card - Tarjeta de débito
   */
  DebitCard = 2,

  /**
   * Bank Transfer - Transferencia bancaria
   */
  BankTransfer = 3,

  /**
   * Check - Cheque
   */
  Check = 4,

  /**
   * Cash - Efectivo
   */
  Cash = 5,

  /**
   * PayPal - Pago por PayPal
   */
  PayPal = 6,

  /**
   * Wire Transfer - Transferencia cablegráfica
   */
  WireTransfer = 7,

  /**
   * ACH - Automated Clearing House
   */
  ACH = 8,

  /**
   * Other - Otro método
   */
  Other = 99,
}

/**
 * Helper function para obtener label de Payment Method
 */
export function getPaymentMethodLabel(code: PaymentMethodCode): string {
  switch (code) {
    case PaymentMethodCode.CreditCard:
      return 'Credit Card'
    case PaymentMethodCode.DebitCard:
      return 'Debit Card'
    case PaymentMethodCode.BankTransfer:
      return 'Bank Transfer'
    case PaymentMethodCode.Check:
      return 'Check'
    case PaymentMethodCode.Cash:
      return 'Cash'
    case PaymentMethodCode.PayPal:
      return 'PayPal'
    case PaymentMethodCode.WireTransfer:
      return 'Wire Transfer'
    case PaymentMethodCode.ACH:
      return 'ACH'
    case PaymentMethodCode.Other:
      return 'Other'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener descripción de Payment Method
 */
export function getPaymentMethodDescription(code: PaymentMethodCode): string {
  switch (code) {
    case PaymentMethodCode.CreditCard:
      return 'Pay with credit card (Visa, Mastercard, Amex)'
    case PaymentMethodCode.DebitCard:
      return 'Pay with debit card'
    case PaymentMethodCode.BankTransfer:
      return 'Direct bank transfer (1-3 business days)'
    case PaymentMethodCode.Check:
      return 'Payment by check'
    case PaymentMethodCode.Cash:
      return 'Cash payment'
    case PaymentMethodCode.PayPal:
      return 'Pay with PayPal account'
    case PaymentMethodCode.WireTransfer:
      return 'Wire transfer (same day)'
    case PaymentMethodCode.ACH:
      return 'ACH electronic transfer'
    case PaymentMethodCode.Other:
      return 'Other payment method'
    default:
      return ''
  }
}
