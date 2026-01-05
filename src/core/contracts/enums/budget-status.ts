/**
 * Budget Status (BudgetStatusCode)
 *
 * Indica la capacidad presupuestaria del Lead durante la calificación
 */
export enum BudgetStatusCode {
  No_Budget = 0,      // Sin presupuesto aprobado
  May_Buy = 1,        // Podría comprar (presupuesto posible)
  Can_Buy = 2,        // Puede comprar (presupuesto disponible)
  Will_Buy = 3        // Va a comprar (presupuesto confirmado)
}

/**
 * Mapeo de Budget Status a labels legibles
 */
export const BudgetStatusLabels: Record<BudgetStatusCode, string> = {
  [BudgetStatusCode.No_Budget]: 'No Budget',
  [BudgetStatusCode.May_Buy]: 'May Buy',
  [BudgetStatusCode.Can_Buy]: 'Can Buy',
  [BudgetStatusCode.Will_Buy]: 'Will Buy',
}
