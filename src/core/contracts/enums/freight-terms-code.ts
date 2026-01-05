/**
 * Freight Terms Code Enum
 *
 * Términos de flete según Dynamics 365 Sales
 * Define quién paga los costos de transporte
 */

export enum FreightTermsCode {
  /**
   * FOB (Free On Board) - El comprador paga el flete
   * El vendedor es responsable hasta que la mercancía está en el transporte
   */
  FOB = 1,

  /**
   * No Charge - Sin cargo de flete
   */
  NoCharge = 2,

  /**
   * CIF (Cost, Insurance and Freight) - El vendedor paga el flete
   * El vendedor es responsable del costo, seguro y flete hasta el destino
   */
  CIF = 3,

  /**
   * Prepaid - Flete prepagado por el vendedor
   */
  Prepaid = 4,

  /**
   * Collect - Flete pagado por el comprador al recibir
   */
  Collect = 5,

  /**
   * Third Party - Flete pagado por un tercero
   */
  ThirdParty = 6,
}

/**
 * Helper function para obtener label de Freight Terms
 */
export function getFreightTermsLabel(code: FreightTermsCode): string {
  switch (code) {
    case FreightTermsCode.FOB:
      return 'FOB (Free On Board)'
    case FreightTermsCode.NoCharge:
      return 'No Charge'
    case FreightTermsCode.CIF:
      return 'CIF (Cost, Insurance, Freight)'
    case FreightTermsCode.Prepaid:
      return 'Prepaid'
    case FreightTermsCode.Collect:
      return 'Collect'
    case FreightTermsCode.ThirdParty:
      return 'Third Party'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para determinar quién paga el flete
 */
export function getFreightPaidBy(code: FreightTermsCode): 'Seller' | 'Buyer' | 'Third Party' | 'None' {
  switch (code) {
    case FreightTermsCode.FOB:
    case FreightTermsCode.Collect:
      return 'Buyer'
    case FreightTermsCode.CIF:
    case FreightTermsCode.Prepaid:
      return 'Seller'
    case FreightTermsCode.ThirdParty:
      return 'Third Party'
    case FreightTermsCode.NoCharge:
      return 'None'
    default:
      return 'Buyer'
  }
}
