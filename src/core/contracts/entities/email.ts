import type { ActivityStateCode } from '../enums';

/**
 * Email Activity Entity
 *
 * Representa una actividad de Email.
 *
 * Hereda de Activity y agrega campos específicos de email.
 */
export interface Email {
  // Primary Key
  activityid: string;

  // State & Status
  statecode: ActivityStateCode;
  statuscode?: number;

  // Email Information
  subject: string;                      // REQUIRED
  description?: string;                 // Cuerpo del email (texto plano)

  // Recipients
  to?: string;                          // Destinatarios (separados por ;)
  cc?: string;                          // Copia (separados por ;)
  bcc?: string;                         // Copia oculta (separados por ;)
  from?: string;                        // Remitente

  // Email Specific
  sender?: string;                      // Email del remitente
  directioncode?: boolean;              // true = Outgoing, false = Incoming
  messageid?: string;                   // Message-ID del email

  // Regarding (Polimórfico)
  regardingobjectid?: string;           // Lead/Opportunity/Account/Contact ID
  regardingobjectidtype?: string;

  // Scheduling
  scheduledstart?: string;              // Fecha de envío
  scheduledend?: string;
  actualstart?: string;
  actualend?: string;

  // Tracking
  opencount?: number;                   // Veces que se abrió el email
  lastopenedon?: string;                // Última vez que se abrió

  // Priority
  prioritycode?: number;

  // Ownership
  ownerid: string;

  // Audit Fields
  createdon: string;
  modifiedon: string;
  createdby?: string;
  modifiedby?: string;
}

/**
 * Create Email DTO
 */
export interface CreateEmailDto {
  subject: string;
  description?: string;                 // Cuerpo del email
  to?: string;
  cc?: string;
  from?: string;
  directioncode?: boolean;              // true = Outgoing
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  ownerid: string;
}

/**
 * Send Email DTO
 */
export interface SendEmailDto {
  emailid: string;
  issuedirect?: boolean;                // Enviar inmediatamente
}
