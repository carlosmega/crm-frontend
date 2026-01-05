/**
 * Activity Type Code
 *
 * Tipos de actividades disponibles en CRM
 * Basado en Microsoft Dynamics 365 CDS
 */
export enum ActivityTypeCode {
  Email = 1,
  PhoneCall = 2,
  Task = 3,
  Appointment = 4,
  Meeting = 5,
  Note = 6,
}

/**
 * Helper function para obtener label de Activity Type
 */
export function getActivityTypeLabel(typecode: ActivityTypeCode): string {
  switch (typecode) {
    case ActivityTypeCode.Email:
      return 'Email'
    case ActivityTypeCode.PhoneCall:
      return 'Phone Call'
    case ActivityTypeCode.Task:
      return 'Task'
    case ActivityTypeCode.Appointment:
      return 'Appointment'
    case ActivityTypeCode.Meeting:
      return 'Meeting'
    case ActivityTypeCode.Note:
      return 'Note'
    default:
      return 'Unknown'
  }
}

/**
 * Helper function para obtener icon name de Activity Type
 */
export function getActivityTypeIcon(typecode: ActivityTypeCode): string {
  switch (typecode) {
    case ActivityTypeCode.Email:
      return 'Mail'
    case ActivityTypeCode.PhoneCall:
      return 'Phone'
    case ActivityTypeCode.Task:
      return 'CheckSquare'
    case ActivityTypeCode.Appointment:
      return 'Calendar'
    case ActivityTypeCode.Meeting:
      return 'Users'
    case ActivityTypeCode.Note:
      return 'StickyNote'
    default:
      return 'Circle'
  }
}

/**
 * Helper function para obtener color de Activity Type
 */
export function getActivityTypeColor(typecode: ActivityTypeCode): string {
  switch (typecode) {
    case ActivityTypeCode.Email:
      return 'text-blue-600'
    case ActivityTypeCode.PhoneCall:
      return 'text-green-600'
    case ActivityTypeCode.Task:
      return 'text-orange-600'
    case ActivityTypeCode.Appointment:
      return 'text-purple-600'
    case ActivityTypeCode.Meeting:
      return 'text-indigo-600'
    case ActivityTypeCode.Note:
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}
