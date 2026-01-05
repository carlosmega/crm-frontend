import type { QuoteStateCode, QuoteStatusCode } from '../enums';

/**
 * Quote Entity (Cotización)
 *
 * Representa una propuesta formal de productos/servicios con precios.
 *
 * Flujo:
 * 1. Draft (0) → editable
 * 2. Active (1) → enviada al cliente (no editable)
 * 3. Won (2) → aceptada por el cliente → genera Order
 * 4. Closed (3) → perdida o cancelada
 *
 * ⚠️ IMPORTANTE: Quote debe tener al menos 1 Quote Line (producto)
 */
export interface Quote {
  // Primary Key
  quoteid: string;

  // State & Status
  statecode: QuoteStateCode;            // Draft, Active, Won, Closed
  statuscode: QuoteStatusCode;

  // Basic Information
  name: string;                         // REQUIRED: Nombre de la cotización
  quotenumber?: string;                 // Número de cotización (auto-generado)
  description?: string;

  // Customer (Polimórfico - heredado de Opportunity)
  customerid: string;                   // Account ID o Contact ID
  customeridtype: 'account' | 'contact';

  // Relationships (FKs)
  opportunityid: string;                // REQUIRED: Opportunity vinculada
  ownerid: string;                      // Usuario asignado

  // Pricing
  totalamount: number;                  // COMPUTED: Suma de Quote Lines
  totallineitemamount?: number;         // COMPUTED: Suma de líneas antes de freight/tax
  totaldiscountamount?: number;         // COMPUTED: Suma de descuentos
  totalamountlessfreight?: number;
  freightamount?: number;
  discountamount?: number;
  discountpercentage?: number;

  // Tax
  totaltax?: number;

  // Dates
  effectivefrom: string;                // ISO 8601 date - Fecha inicio validez
  effectiveto: string;                  // ISO 8601 date - Fecha fin validez
  requestdeliveryby?: string;           // ISO 8601 date - Fecha entrega solicitada
  closedon?: string;                    // ISO 8601 datetime - Fecha de cierre (Won/Lost)

  // Shipping
  shipto_name?: string;
  shipto_line1?: string;
  shipto_line2?: string;
  shipto_city?: string;
  shipto_stateorprovince?: string;
  shipto_postalcode?: string;
  shipto_country?: string;

  // Billing
  billto_name?: string;
  billto_line1?: string;
  billto_line2?: string;
  billto_city?: string;
  billto_stateorprovince?: string;
  billto_postalcode?: string;
  billto_country?: string;

  // Payment Terms
  paymenttermscode?: number;            // Net 30, Net 60, etc.
  freighttermscode?: number;            // FOB, etc.

  // Close Information
  closingnotes?: string;                // Notas del cierre (Win/Lose reasons)

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Quote DTO
 */
export interface CreateQuoteDto {
  name: string;
  opportunityid: string;                // REQUIRED
  customerid: string;                   // REQUIRED (heredado de Opportunity)
  customeridtype: 'account' | 'contact'; // REQUIRED (heredado de Opportunity)
  effectivefrom: string;
  effectiveto: string;
  description?: string;
  ownerid: string;
}

/**
 * Update Quote DTO
 *
 * Solo editable si statecode = Draft
 */
export interface UpdateQuoteDto {
  name?: string;
  description?: string;
  effectivefrom?: string;
  effectiveto?: string;
  discountpercentage?: number;
  freightamount?: number;
  requestdeliveryby?: string;
  shipto_name?: string;
  shipto_line1?: string;
  shipto_city?: string;
  shipto_stateorprovince?: string;
  shipto_postalcode?: string;
  shipto_country?: string;
}

/**
 * Activate Quote DTO
 *
 * Cambiar de Draft a Active
 */
export interface ActivateQuoteDto {
  statecode: QuoteStateCode.Active;
  statuscode: QuoteStatusCode.Open;
  effectivefrom?: string;               // Opcional: actualizar fecha inicio validez
  effectiveto?: string;                 // Opcional: actualizar fecha fin validez
}

/**
 * Close Quote DTO
 *
 * Cerrar Quote (Won o Lost)
 */
export interface CloseQuoteDto {
  statecode: QuoteStateCode.Closed;
  statuscode: QuoteStatusCode;
  closedreasoncode?: number;
  closingnotes?: string;                // Notas del cierre
}
