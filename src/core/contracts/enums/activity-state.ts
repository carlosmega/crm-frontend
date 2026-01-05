/**
 * Activity State Code
 *
 * Estados de Activity (base para Email, PhoneCall, Task, Appointment)
 * Basado en Microsoft Dynamics 365 CDS
 */
export enum ActivityStateCode {
  /**
   * Open - Actividad abierta (pendiente)
   */
  Open = 0,

  /**
   * Completed - Actividad completada
   */
  Completed = 1,

  /**
   * Canceled - Actividad cancelada
   */
  Canceled = 2,

  /**
   * Scheduled - Actividad programada (para Appointments)
   */
  Scheduled = 3,
}

/**
 * Helper function para obtener label de Activity State
 */
export function getActivityStateLabel(statecode: ActivityStateCode): string {
  switch (statecode) {
    case ActivityStateCode.Open:
      return 'Open'
    case ActivityStateCode.Completed:
      return 'Completed'
    case ActivityStateCode.Canceled:
      return 'Canceled'
    case ActivityStateCode.Scheduled:
      return 'Scheduled'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener color de badge
 */
export function getActivityStateColor(statecode: ActivityStateCode): string {
  switch (statecode) {
    case ActivityStateCode.Open:
      return 'text-blue-700 bg-blue-100'
    case ActivityStateCode.Completed:
      return 'text-green-700 bg-green-100'
    case ActivityStateCode.Canceled:
      return 'text-gray-700 bg-gray-100'
    case ActivityStateCode.Scheduled:
      return 'text-purple-700 bg-purple-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}
