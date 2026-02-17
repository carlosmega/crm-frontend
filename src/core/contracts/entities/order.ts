import type {
  OrderStateCode,
  OrderStatusCode,
  PaymentTermsCode,
  PaymentMethodCode,
  FreightTermsCode,
  ShippingMethodCode,
  PriorityCode,
} from '../enums';

/**
 * Order Entity (Sales Order / Pedido)
 *
 * Representa una orden de compra confirmada (post-venta ganada).
 *
 * Generación:
 * - Creado automáticamente desde Quote Won
 * - Copia Quote Lines → Order Lines
 *
 * Flujo:
 * 1. Active (0) → orden creada
 * 2. Submitted (1) → orden enviada a cumplimiento
 * 3. Fulfilled (3) → orden cumplida → puede generar Invoice
 * 4. Invoiced (4) → facturada
 * 5. Canceled (2) → orden cancelada
 */
export interface Order {
  // Primary Key
  salesorderid: string;

  // State & Status
  statecode: OrderStateCode;            // Active, Submitted, Canceled, Fulfilled, Invoiced
  statuscode?: OrderStatusCode;         // Status granular (New, Pending, InProgress, etc.)

  // Basic Information
  name: string;                         // REQUIRED
  ordernumber?: string;                 // Número de orden (auto-generado)
  description?: string;

  // Customer (Polimórfico - heredado de Quote/Opportunity)
  customerid: string;                   // Account ID o Contact ID
  customeridtype: 'account' | 'contact';

  // Relationships (FKs)
  quoteid?: string;                     // Quote que generó este Order
  opportunityid?: string;               // Opportunity vinculada
  ownerid: string;                      // Usuario asignado

  // Pricing
  totalamount: number;                  // COMPUTED: Suma de Order Lines
  totalamountlessfreight?: number;
  freightamount?: number;
  discountamount?: number;
  discountpercentage?: number;

  // Tax
  totaltax?: number;

  // Dates
  datefulfilled?: string;               // ISO 8601 date - Fecha de cumplimiento
  requestdeliveryby?: string;           // ISO 8601 date - Fecha entrega solicitada
  submitdate?: string;                  // ISO 8601 date - Fecha de envío

  // Shipping
  shipto_name?: string;
  shipto_line1?: string;
  shipto_line2?: string;
  shipto_city?: string;
  shipto_stateorprovince?: string;
  shipto_postalcode?: string;
  shipto_country?: string;
  shippingmethodcode?: ShippingMethodCode;  // Ground, Overnight, etc.

  // Billing
  billto_name?: string;
  billto_line1?: string;
  billto_line2?: string;
  billto_city?: string;
  billto_stateorprovince?: string;
  billto_postalcode?: string;
  billto_country?: string;

  // Payment Terms
  paymenttermscode?: PaymentTermsCode;  // Net 30, Net 60, etc.
  paymentmethodcode?: PaymentMethodCode; // Credit Card, Bank Transfer, etc.
  freighttermscode?: FreightTermsCode;  // FOB, CIF, etc.

  // Priority
  prioritycode?: PriorityCode;          // Low, Normal, High, Urgent

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Order DTO
 *
 * Generalmente creado automáticamente desde Quote
 */
export interface CreateOrderDto {
  name: string;
  quoteid?: string;                     // Quote origen
  opportunityid?: string;
  customerid: string;
  customeridtype: 'account' | 'contact';
  ownerid: string;
}

/**
 * Update Order DTO
 */
export interface UpdateOrderDto {
  name?: string;
  description?: string;
  requestdeliveryby?: string;
  prioritycode?: PriorityCode;
  paymenttermscode?: PaymentTermsCode;
  paymentmethodcode?: PaymentMethodCode;
  freighttermscode?: FreightTermsCode;
  freightamount?: number;
  shippingmethodcode?: ShippingMethodCode;
  shipto_name?: string;
  shipto_line1?: string;
  shipto_line2?: string;
  shipto_city?: string;
  shipto_stateorprovince?: string;
  shipto_postalcode?: string;
  shipto_country?: string;
  billto_name?: string;
  billto_line1?: string;
  billto_line2?: string;
  billto_city?: string;
  billto_stateorprovince?: string;
  billto_postalcode?: string;
  billto_country?: string;
}

/**
 * Fulfill Order DTO
 *
 * Marcar orden como cumplida
 */
export interface FulfillOrderDto {
  statecode: OrderStateCode.Fulfilled;
  datefulfilled: string;                // ISO 8601 date
}
