/**
 * Price List Entity (Lista de Precios)
 *
 * Representa una lista de precios para productos/servicios.
 *
 * Usos:
 * - Precios por región
 * - Precios por tipo de cliente
 * - Precios por temporada
 * - Precios promocionales
 *
 * Relaciones:
 * - Contiene Price List Items (1:N)
 * - Price List Items vinculan a Products (N:1)
 */
export interface PriceList {
  // Primary Key
  pricelevelid: string;

  // State & Status
  statecode: number;                    // Active (0) / Inactive (1)
  statuscode?: number;

  // Basic Information
  name: string;                         // REQUIRED: Nombre de la lista de precios
  description?: string;

  // Dates
  begindate?: string;                   // ISO 8601 date - Inicio validez
  enddate?: string;                     // ISO 8601 date - Fin validez

  // Currency
  transactioncurrencyid?: string;       // Moneda de la lista

  // Shipping
  freighttermscode?: number;            // Términos de envío
  shippingmethodcode?: number;          // Método de envío

  // Payment Terms
  paymenttermscode?: number;            // Net 30, Net 60, etc.

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Price List DTO
 */
export interface CreatePriceListDto {
  name: string;                         // REQUIRED
  description?: string;
  begindate?: string;
  enddate?: string;
  transactioncurrencyid?: string;
}

/**
 * Update Price List DTO
 */
export interface UpdatePriceListDto {
  name?: string;
  description?: string;
  begindate?: string;
  enddate?: string;
}
