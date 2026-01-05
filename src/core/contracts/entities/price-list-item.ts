/**
 * Price List Item Entity (Producto en Lista de Precios)
 *
 * Representa el precio de un producto específico dentro de una Price List.
 *
 * Relaciones:
 * - Pertenece a Price List (N:1)
 * - Vinculado a Product (N:1)
 * - Vinculado a Unit of Measure (N:1)
 */
export interface PriceListItem {
  // Primary Key
  productpricelevelid: string;

  // Relationships (FKs)
  pricelevelid: string;                 // REQUIRED: Price List padre
  productid: string;                    // REQUIRED: Producto
  uomid?: string;                       // Unit of Measure

  // Pricing
  amount: number;                       // REQUIRED: Precio del producto en esta lista

  // Percentage
  percentage?: number;                  // Porcentaje sobre precio base

  // Pricing Method
  pricingmethodcode?: number;           // 1 = Currency Amount, 2 = Percent of List, etc.

  // Quantity
  quantitysellingcode?: number;         // Código de cantidad de venta

  // Rounding
  roundingoptionamount?: number;
  roundingoptioncode?: number;
  roundingpolicycode?: number;

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
}

/**
 * Create Price List Item DTO
 */
export interface CreatePriceListItemDto {
  pricelevelid: string;                 // REQUIRED
  productid: string;                    // REQUIRED
  amount: number;                       // REQUIRED
  uomid?: string;
  pricingmethodcode?: number;
}

/**
 * Update Price List Item DTO
 */
export interface UpdatePriceListItemDto {
  amount?: number;
  percentage?: number;
  pricingmethodcode?: number;
}
