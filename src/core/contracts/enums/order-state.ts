/**
 * Order State Code (Sales Order)
 *
 * Estados de Order (Pedido) en Dynamics 365
 */
export enum OrderStateCode {
  Active = 0,      // Activo
  Submitted = 1,   // Enviado
  Canceled = 2,    // Cancelado
  Fulfilled = 3,   // Cumplido/Entregado
  Invoiced = 4     // Facturado
}
