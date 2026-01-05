/**
 * Quote Detail Entity (Quote Line Item)
 *
 * Representa una línea de producto/servicio en una Quote.
 *
 * Cálculo de precios:
 * - extendedamount = quantity * priceperunit * (1 - manualdiscountamount)
 * - tax calculado sobre extendedamount
 */
export interface QuoteDetail {
  // Primary Key
  quotedetailid: string;

  // Relationships (FKs)
  quoteid: string;                      // REQUIRED: Quote padre
  productid?: string;                   // Producto del catálogo (opcional si es write-in)
  uomid?: string;                       // Unit of Measure

  // Line Information
  lineitemnumber?: number;              // Número de línea (ordenamiento)
  productdescription?: string;          // Descripción del producto
  isproductoverridden?: boolean;        // true = write-in product (no del catálogo)

  // Pricing
  quantity: number;                     // REQUIRED: Cantidad
  priceperunit: number;                 // REQUIRED: Precio unitario
  baseamount?: number;                  // quantity * priceperunit (antes de descuentos)

  // Discounts
  manualdiscountamount?: number;        // Descuento en valor absoluto
  volumediscountamount?: number;        // Descuento por volumen

  // Tax
  tax?: number;                         // Impuestos aplicados

  // Extended Amount (Total de la línea)
  extendedamount: number;               // COMPUTED: cantidad final después de descuentos e impuestos

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
}

/**
 * Create Quote Detail DTO
 */
export interface CreateQuoteDetailDto {
  quoteid: string;                      // REQUIRED
  productid?: string;                   // Null para write-in products
  productdescription?: string;
  quantity: number;                     // REQUIRED
  priceperunit: number;                 // REQUIRED
  manualdiscountamount?: number;
  tax?: number;
}

/**
 * Update Quote Detail DTO
 */
export interface UpdateQuoteDetailDto {
  productdescription?: string;
  quantity?: number;
  priceperunit?: number;
  manualdiscountamount?: number;
  tax?: number;
}
