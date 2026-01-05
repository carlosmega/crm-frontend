/**
 * Order Detail Entity (Order Line Item)
 *
 * Representa una línea de producto/servicio en un Order.
 *
 * Generación:
 * - Copiado automáticamente desde Quote Detail al crear Order desde Quote
 */
export interface OrderDetail {
  // Primary Key
  salesorderdetailid: string;

  // Relationships (FKs)
  salesorderid: string;                 // REQUIRED: Order padre
  productid?: string;                   // Producto del catálogo
  uomid?: string;                       // Unit of Measure

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

  // Shipping
  requestdeliveryby?: string;           // ISO 8601 date
  quantityshipped?: number;             // Cantidad enviada
  quantitycancelled?: number;           // Cantidad cancelada
  quantitybackordered?: number;         // Cantidad pendiente

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
}

/**
 * Create Order Detail DTO
 */
export interface CreateOrderDetailDto {
  salesorderid: string;                 // REQUIRED
  productid?: string;
  productdescription?: string;
  quantity: number;
  priceperunit: number;
  manualdiscountamount?: number;
  tax?: number;
}

/**
 * Update Order Detail DTO
 */
export interface UpdateOrderDetailDto {
  quantity?: number;
  quantityshipped?: number;
  quantitycancelled?: number;
  requestdeliveryby?: string;
}
