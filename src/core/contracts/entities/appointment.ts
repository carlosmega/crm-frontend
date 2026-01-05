import type { ActivityStateCode } from '../enums';

/**
 * Appointment Activity Entity
 *
 * Representa una cita o reunión programada.
 */
export interface Appointment {
  // Primary Key
  activityid: string;

  // State & Status
  statecode: ActivityStateCode;
  statuscode?: number;

  // Appointment Information
  subject: string;                      // REQUIRED: Asunto de la cita
  description?: string;                 // Descripción/Agenda
  location?: string;                    // Ubicación de la cita

  // Regarding (Polimórfico)
  regardingobjectid?: string;           // Lead/Opportunity/Account/Contact ID
  regardingobjectidtype?: string;

  // Scheduling
  scheduledstart: string;               // REQUIRED: Inicio programado (ISO 8601)
  scheduledend: string;                 // REQUIRED: Fin programado (ISO 8601)
  actualdurationminutes?: number;
  actualstart?: string;
  actualend?: string;

  // All-day event
  isalldayevent?: boolean;

  // Priority
  prioritycode?: number;

  // Ownership
  ownerid: string;

  // Organizer
  organizer?: string;

  // Required Attendees
  requiredattendees?: string;           // Emails separados por ;

  // Optional Attendees
  optionalattendees?: string;           // Emails separados por ;

  // Audit Fields
  createdon: string;
  modifiedon: string;
  createdby?: string;
  modifiedby?: string;
}

/**
 * Create Appointment DTO
 */
export interface CreateAppointmentDto {
  subject: string;
  description?: string;
  location?: string;
  scheduledstart: string;               // REQUIRED
  scheduledend: string;                 // REQUIRED
  isalldayevent?: boolean;
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  requiredattendees?: string;
  optionalattendees?: string;
  prioritycode?: number;
  ownerid: string;
}

/**
 * Update Appointment DTO
 */
export interface UpdateAppointmentDto {
  subject?: string;
  description?: string;
  location?: string;
  scheduledstart?: string;
  scheduledend?: string;
  isalldayevent?: boolean;
  requiredattendees?: string;
  optionalattendees?: string;
}
