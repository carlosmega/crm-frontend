/**
 * Invoice Detail Entity (Invoice Line Item)
 *
 * Representa una línea de producto/servicio en una Invoice.
 *
 * Generación:
 * - Copiado automáticamente desde Order Detail al crear Invoice desde Order
 */
export interface InvoiceDetail {
  // Primary Key
  invoicedetailid: string;

  // Relationships (FKs)
  invoiceid: string;                    // REQUIRED: Invoice padre
  productid?: string;                   // Producto del catálogo
  uomid?: string;                       // Unit of Measure
  salesorderdetailid?: string;          // Order Detail origen

  // Line Information
  lineitemnumber?: number;              // Número de línea (ordenamiento)
  productdescription?: string;          // Descripción del producto
  isproductoverridden?: boolean;        // true = write-in product

  // Pricing
  quantity: number;                     // REQUIRED: Cantidad
  priceperunit: number;                 // REQUIRED: Precio unitario
  baseamount?: number;                  // quantity * priceperunit

  // Discounts
  manualdiscountamount?: number;
  volumediscountamount?: number;

  // Tax
  tax?: number;

  // Extended Amount
  extendedamount: number;               // COMPUTED: total de la línea

  // Shipping (informativo)
  quantityshipped?: number;
  shippingtrackingnumber?: string;

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
}

/**
 * Create Invoice Detail DTO
 */
export interface CreateInvoiceDetailDto {
  invoiceid: string;                    // REQUIRED
  productid?: string;
  productdescription?: string;
  quantity: number;
  priceperunit: number;
  manualdiscountamount?: number;
  tax?: number;
}

/**
 * Update Invoice Detail DTO
 */
export interface UpdateInvoiceDetailDto {
  quantity?: number;
  shippingtrackingnumber?: string;
}
