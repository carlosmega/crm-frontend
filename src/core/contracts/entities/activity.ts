import type { ActivityStateCode, ActivityTypeCode } from '../enums';

/**
 * Activity Entity (Base)
 *
 * Base para todas las actividades (Email, PhoneCall, Task, Appointment, Meeting).
 *
 * Relaciones "Regarding":
 * - Vinculada a Lead/Opportunity/Account/Contact vía regardingobjectid
 *
 * ⚠️ IMPORTANTE: Este es el contrato base. Para tipos específicos
 * usar Email, PhoneCall, Task, Appointment.
 */
export interface Activity {
  // Primary Key
  activityid: string;

  // Activity Type
  activitytypecode: ActivityTypeCode;   // Email, Phone_Call, Task, Appointment, Meeting

  // State & Status
  statecode: ActivityStateCode;         // Open, Completed, Canceled, Scheduled
  statuscode?: number;

  // Basic Information
  subject: string;                      // REQUIRED: Asunto de la actividad
  description?: string;                 // Descripción detallada

  // Regarding (Polimórfico)
  regardingobjectid?: string;           // Lead/Opportunity/Account/Contact ID
  regardingobjectidtype?: string;       // 'lead', 'opportunity', 'account', 'contact'

  // Scheduling
  scheduledstart?: string;              // ISO 8601 datetime - Inicio programado
  scheduledend?: string;                // ISO 8601 datetime - Fin programado
  actualdurationminutes?: number;       // Duración real en minutos

  // Completion
  actualstart?: string;                 // ISO 8601 datetime - Inicio real
  actualend?: string;                   // ISO 8601 datetime - Fin real

  // Priority
  prioritycode?: number;                // Low (0), Normal (1), High (2)

  // Ownership
  ownerid: string;                      // Usuario asignado

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Base Activity DTO
 */
export interface CreateActivityDto {
  activitytypecode: ActivityTypeCode;
  subject: string;
  description?: string;
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  scheduledstart?: string;
  scheduledend?: string;
  prioritycode?: number;
  ownerid: string;
}

/**
 * Update Activity DTO
 */
export interface UpdateActivityDto {
  subject?: string;
  description?: string;
  scheduledstart?: string;
  scheduledend?: string;
  prioritycode?: number;
}

/**
 * Complete Activity DTO
 */
export interface CompleteActivityDto {
  statecode: ActivityStateCode.Completed;
  actualstart?: string;
  actualend: string;
  actualdurationminutes?: number;
}

/**
 * Activity Backend Response
 *
 * El backend Django devuelve una estructura anidada con el objeto activity
 * y objetos específicos del tipo (email, phonecall, task, appointment)
 */
export interface ActivityBackendResponse {
  activity: Activity;
  email: any | null;
  phonecall: any | null;
  task: {
    percentcomplete?: number;
  } | null;
  appointment: any | null;
}
