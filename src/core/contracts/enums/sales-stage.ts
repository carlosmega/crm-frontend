/**
 * Sales Stage Code
 *
 * Etapas del pipeline de ventas con probabilidades implícitas:
 * - Qualify (0): 25% de probabilidad de cierre
 * - Develop (1): 50% de probabilidad de cierre
 * - Propose (2): 75% de probabilidad de cierre
 * - Close (3): 100% (Won) / 0% (Lost)
 *
 * ⚠️ IMPORTANTE: closeprobability debe actualizarse automáticamente
 * según el salesstage actual
 */
export enum SalesStageCode {
  Qualify = 0,
  Develop = 1,
  Propose = 2,
  Close = 3
}

/**
 * Mapeo de Sales Stage a Close Probability
 */
export const SALES_STAGE_PROBABILITY: Record<SalesStageCode, number> = {
  [SalesStageCode.Qualify]: 25,
  [SalesStageCode.Develop]: 50,
  [SalesStageCode.Propose]: 75,
  [SalesStageCode.Close]: 0 // Se define en 0 o 100 al cerrar
};
