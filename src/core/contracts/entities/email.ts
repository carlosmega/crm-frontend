import type { ActivityStateCode } from '../enums';

/**
 * Email Match Method
 */
export type EmailMatchMethod = 'email_address' | 'tracking_token' | 'thread_correlation' | 'manual';

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

  // Matching
  inreplyto?: string;                   // In-Reply-To header
  trackingtokenid?: string;             // CRM tracking token [CRM:OPP-abc12345]
  matchconfidence?: number;             // Auto-match confidence (0-100)
  matchmethod?: EmailMatchMethod;       // Method used for matching

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

/**
 * Link Email DTO - for manually associating an email with a CRM record
 */
export interface LinkEmailDto {
  regardingobjectid: string;
  regardingobjectidtype: string;
}

/**
 * Unlinked Email - simplified email for unlinked emails list
 */
export interface UnlinkedEmail {
  activityid: string;
  subject: string;
  statecode: number;
  createdon: string;
  ownerid: string;
  to?: string;
  sender?: string;
  cc?: string;
  directioncode: boolean;
}

/**
 * Match suggestion for a single candidate
 */
export interface MatchSuggestion {
  regardingobjectid: string;
  regardingobjectidtype: string;
  matchmethod: EmailMatchMethod;
  matchconfidence: number;
}

/**
 * Matched contact from email address lookup
 */
export interface MatchedContact {
  contactid: string;
  fullname?: string;
  emailaddress1?: string;
  parentcustomerid?: string;
}

/**
 * Matched account from email address lookup
 */
export interface MatchedAccount {
  accountid: string;
  name?: string;
  emailaddress1?: string;
}

/**
 * Candidate opportunity from email matching
 */
export interface CandidateOpportunity {
  opportunityid: string;
  name?: string;
  estimatedvalue?: number;
  salesstage?: string;
  statecode?: number;
  modifiedon?: string;
}

/**
 * Match Suggestions Response - full response from match-suggestions endpoint
 */
export interface MatchSuggestionsResponse {
  activityid: string;
  matched: boolean;
  suggestion?: MatchSuggestion;
  matched_contacts: MatchedContact[];
  matched_accounts: MatchedAccount[];
  candidate_opportunities: CandidateOpportunity[];
}
