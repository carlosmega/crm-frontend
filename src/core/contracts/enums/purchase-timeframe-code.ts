/**
 * Purchase Timeframe Code
 *
 * CDS Standard: purchasetimeframe
 * Indica cuándo planea comprar el prospecto
 */

export enum PurchaseTimeframeCode {
  Immediate = 0,
  This_Quarter = 1,
  Next_Quarter = 2,
  This_Year = 3,
  Unknown = 4,
}

export const PurchaseTimeframeLabels: Record<PurchaseTimeframeCode, string> = {
  [PurchaseTimeframeCode.Immediate]: 'Immediate',
  [PurchaseTimeframeCode.This_Quarter]: 'This Quarter',
  [PurchaseTimeframeCode.Next_Quarter]: 'Next Quarter',
  [PurchaseTimeframeCode.This_Year]: 'This Year',
  [PurchaseTimeframeCode.Unknown]: 'Unknown',
}

export function getPurchaseTimeframeLabel(code: PurchaseTimeframeCode): string {
  return PurchaseTimeframeLabels[code] || 'Unknown'
}
