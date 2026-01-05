import type { InvoiceStateCode } from '../enums';

/**
 * Invoice Entity (Factura)
 *
 * Representa una factura generada desde un Order.
 *
 * Generación:
 * - Creado desde Order Fulfilled
 * - Copia Order Lines → Invoice Lines
 *
 * Flujo:
 * 1. Active (0) → factura activa (pendiente de pago)
 * 2. Paid (2) → factura pagada
 * 3. Canceled (3) → factura cancelada
 */
export interface Invoice {
  // Primary Key
  invoiceid: string;

  // State & Status
  statecode: InvoiceStateCode;          // Active, Closed, Paid, Canceled
  statuscode?: number;

  // Basic Information
  name: string;                         // REQUIRED
  invoicenumber?: string;               // Número de factura (auto-generado)
  description?: string;

  // Customer (Polimórfico - heredado de Order)
  customerid: string;                   // Account ID o Contact ID
  customeridtype: 'account' | 'contact';

  // Relationships (FKs)
  salesorderid?: string;                // Order que generó esta Invoice
  opportunityid?: string;               // Opportunity vinculada
  ownerid: string;                      // Usuario asignado

  // Pricing
  totalamount: number;                  // COMPUTED: Suma de Invoice Lines
  totalamountlessfreight?: number;
  freightamount?: number;
  discountamount?: number;
  discountpercentage?: number;

  // Tax
  totaltax?: number;

  // Dates
  datedelivered?: string;               // ISO 8601 date - Fecha de entrega
  duedate: string;                      // ISO 8601 date - Fecha de vencimiento

  // Payment
  totalpaid?: number;                   // Total pagado
  totalbalance?: number;                // Balance pendiente

  // Billing
  billto_name?: string;
  billto_line1?: string;
  billto_line2?: string;
  billto_city?: string;
  billto_stateorprovince?: string;
  billto_postalcode?: string;
  billto_country?: string;

  // Shipping (informativo)
  shipto_name?: string;
  shipto_line1?: string;
  shipto_line2?: string;
  shipto_city?: string;
  shipto_stateorprovince?: string;
  shipto_postalcode?: string;
  shipto_country?: string;

  // Payment Terms
  paymenttermscode?: number;            // Net 30, Net 60, etc.

  // Priority
  prioritycode?: number;

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Invoice DTO
 *
 * Generalmente creado automáticamente desde Order Fulfilled
 */
export interface CreateInvoiceDto {
  name: string;
  salesorderid?: string;                // Order origen
  opportunityid?: string;
  customerid: string;
  customeridtype: 'account' | 'contact';
  duedate: string;                      // ISO 8601 date
  ownerid: string;
}

/**
 * Update Invoice DTO
 */
export interface UpdateInvoiceDto {
  name?: string;
  description?: string;
  duedate?: string;

  // Billing Address
  billto_name?: string;
  billto_line1?: string;
  billto_line2?: string;
  billto_city?: string;
  billto_stateorprovince?: string;
  billto_postalcode?: string;
  billto_country?: string;
}

/**
 * Mark Invoice as Paid DTO
 */
export interface MarkInvoicePaidDto {
  statecode: InvoiceStateCode.Paid;
  totalpaid: number;
  paymentdate?: string;                 // ISO 8601 date
}

/**
 * Record Payment DTO
 *
 * Para registrar pagos parciales o totales en una factura
 */
export interface RecordPaymentDto {
  paymentamount: number;                // Monto del pago
  paymentdate: string;                  // ISO 8601 date - Fecha del pago
}
