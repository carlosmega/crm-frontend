/**
 * Priority Code Enum
 *
 * Código de prioridad para Orders, Invoices y Activities
 * según Dynamics 365 Sales
 */

export enum PriorityCode {
  /**
   * Low - Prioridad baja
   * Puede procesarse sin urgencia
   */
  Low = 1,

  /**
   * Normal - Prioridad normal (default)
   * Procesamiento estándar
   */
  Normal = 2,

  /**
   * High - Prioridad alta
   * Requiere atención prioritaria
   */
  High = 3,

  /**
   * Urgent - Urgente
   * Requiere atención inmediata
   */
  Urgent = 4,
}

/**
 * Helper function para obtener label de Priority
 */
export function getPriorityLabel(code: PriorityCode): string {
  switch (code) {
    case PriorityCode.Low:
      return 'Low'
    case PriorityCode.Normal:
      return 'Normal'
    case PriorityCode.High:
      return 'High'
    case PriorityCode.Urgent:
      return 'Urgent'
    default:
      return 'Normal'
  }
}

/**
 * Helper function para obtener color Tailwind
 */
export function getPriorityColor(code: PriorityCode): string {
  switch (code) {
    case PriorityCode.Low:
      return 'text-gray-500 bg-gray-100'
    case PriorityCode.Normal:
      return 'text-blue-600 bg-blue-100'
    case PriorityCode.High:
      return 'text-orange-600 bg-orange-100'
    case PriorityCode.Urgent:
      return 'text-red-600 bg-red-100'
    default:
      return 'text-blue-600 bg-blue-100'
  }
}

/**
 * Helper function para determinar si requiere alerta
 */
export function requiresAlert(code: PriorityCode): boolean {
  return code === PriorityCode.High || code === PriorityCode.Urgent
}
