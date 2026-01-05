/**
 * Product Entity (Producto/Servicio)
 *
 * Representa un producto o servicio en el catálogo vendible.
 *
 * Relaciones:
 * - Pertenece a Price Lists (N:N vía PriceListItem)
 * - Usado en Quote/Order/Invoice Lines
 */
export interface Product {
  // Primary Key
  productid: string;

  // State & Status
  statecode: number;                    // Active (0) / Inactive (1)
  statuscode?: number;

  // Basic Information
  name: string;                         // REQUIRED: Nombre del producto
  productnumber?: string;               // SKU / Código de producto
  description?: string;

  // Product Type
  productstructure?: number;            // 1 = Product, 2 = Product Family, 3 = Product Bundle
  producttypecode?: number;             // 1 = Sales Inventory, 2 = Miscellaneous Charges, etc.

  // Pricing (default)
  price?: number;                       // Precio por defecto
  standardcost?: number;                // Costo estándar

  // Inventory
  currentcost?: number;                 // Costo actual
  stockvolume?: number;                 // Volumen en stock
  stockweight?: number;                 // Peso en stock
  quantityonhand?: number;              // Cantidad disponible
  quantityallocated?: number;           // Cantidad asignada

  // Unit of Measure
  defaultuomid?: string;                // Unidad de medida por defecto
  defaultuomscheduleid?: string;        // Esquema de unidades de medida

  // Vendor
  vendorid?: string;                    // Proveedor
  vendorpartnumber?: string;            // Número de parte del proveedor
  vendorname?: string;

  // Dimensions
  size?: string;                        // Tamaño
  color?: string;                       // Color
  style?: string;                       // Estilo

  // Supplier Information
  suppliername?: string;

  // Hierarchy
  parentproductid?: string;             // Producto padre (para bundles/familias)

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Product DTO
 */
export interface CreateProductDto {
  name: string;                         // REQUIRED
  productnumber?: string;
  description?: string;
  productstructure?: number;
  producttypecode?: number;
  price?: number;
  standardcost?: number;
  defaultuomid?: string;
  quantityonhand?: number;
}

/**
 * Update Product DTO
 */
export interface UpdateProductDto {
  name?: string;
  productnumber?: string;
  description?: string;
  price?: number;
  standardcost?: number;
  currentcost?: number;
  quantityonhand?: number;
  quantityallocated?: number;
  size?: string;
  color?: string;
  style?: string;
  vendorid?: string;
  vendorpartnumber?: string;
}
