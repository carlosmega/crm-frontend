import type { ActivityStateCode } from '../enums';

/**
 * Phone Call Activity Entity
 *
 * Representa una actividad de llamada telefónica.
 */
export interface PhoneCall {
  // Primary Key
  activityid: string;

  // State & Status
  statecode: ActivityStateCode;
  statuscode?: number;

  // Phone Call Information
  subject: string;                      // REQUIRED: Asunto de la llamada
  description?: string;                 // Notas de la llamada
  phonenumber?: string;                 // Número telefónico

  // Call Details
  directioncode?: boolean;              // true = Outgoing, false = Incoming
  actualdurationminutes?: number;       // Duración real en minutos

  // Regarding (Polimórfico)
  regardingobjectid?: string;           // Lead/Opportunity/Account/Contact ID
  regardingobjectidtype?: string;

  // Scheduling
  scheduledstart?: string;              // Fecha/hora programada
  scheduledend?: string;
  actualstart?: string;                 // Fecha/hora real de inicio
  actualend?: string;                   // Fecha/hora real de fin

  // Priority
  prioritycode?: number;

  // Ownership
  ownerid: string;

  // Participants
  from?: string;                        // Quien llamó
  to?: string;                          // A quien llamó

  // Audit Fields
  createdon: string;
  modifiedon: string;
  createdby?: string;
  modifiedby?: string;
}

/**
 * Create Phone Call DTO
 */
export interface CreatePhoneCallDto {
  subject: string;
  description?: string;
  phonenumber?: string;
  directioncode?: boolean;              // true = Outgoing
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  scheduledstart?: string;
  scheduledend?: string;
  ownerid: string;
}

/**
 * Log Completed Phone Call DTO
 */
export interface LogCompletedPhoneCallDto {
  subject: string;
  description?: string;
  phonenumber?: string;
  directioncode: boolean;
  actualstart: string;
  actualend: string;
  actualdurationminutes: number;
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  ownerid: string;
}
