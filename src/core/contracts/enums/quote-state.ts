/**
 * Quote State Code
 *
 * Estados de Quote (Cotización) en Dynamics 365
 */
export enum QuoteStateCode {
  Draft = 0,      // Borrador (editable)
  Active = 1,     // Activa (enviada al cliente)
  Won = 2,        // Ganada (aceptada)
  Closed = 3      // Cerrada (perdida o cancelada)
}
