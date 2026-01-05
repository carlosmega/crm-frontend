import type { LeadStateCode, LeadStatusCode, LeadSourceCode, LeadQualityCode, BudgetStatusCode, PurchaseTimeframeCode } from '../enums';

/**
 * Lead Entity (Cliente Potencial)
 *
 * Representa el primer contacto con un posible cliente.
 *
 * Flujo de conversión:
 * 1. Lead creado → statecode: Open (0)
 * 2. Lead calificado → statecode: Qualified (1) + genera Opportunity
 * 3. Lead descalificado → statecode: Disqualified (2)
 *
 * ⚠️ IMPORTANTE: Lead calificado NO cambia a Inactive, cambia a Qualified (1)
 */
export interface Lead {
  // Primary Key
  leadid: string;

  // State & Status
  statecode: LeadStateCode;         // Open (0) / Qualified (1) / Disqualified (2)
  statuscode: LeadStatusCode;       // New, Contacted, Qualified, Disqualified

  // Basic Information
  firstname: string;
  lastname: string;
  fullname?: string;                // Computed: firstname + lastname
  jobtitle?: string;
  companyname?: string;             // Null en B2C scenarios

  // Contact Information
  emailaddress1?: string;
  telephone1?: string;
  mobilephone?: string;
  websiteurl?: string;

  // Address
  address1_line1?: string;
  address1_line2?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;

  // Lead Qualification
  leadsourcecode: LeadSourceCode;   // REQUIRED: Origen del lead
  leadqualitycode?: LeadQualityCode; // Hot, Warm, Cold
  description?: string;

  // Estimated Value
  estimatedvalue?: number;          // Valor estimado de la oportunidad
  estimatedclosedate?: string;      // Fecha estimada de cierre (ISO 8601)

  // ===== Business Process Flow - Qualify Stage =====
  budgetamount?: number;            // Presupuesto disponible
  budgetstatus?: BudgetStatusCode;  // Estado del presupuesto (No Budget / May Buy / Can Buy / Will Buy)
  timeframe?: string;               // Marco de tiempo de compra (deprecated - usar purchasetimeframe)
  purchasetimeframe?: PurchaseTimeframeCode; // Marco de tiempo de compra (enum)
  needanalysis?: string;            // Análisis de necesidades del cliente
  decisionmaker?: string;           // ID del tomador de decisiones (Contact)

  // Relationships (FKs)
  ownerid: string;                  // Usuario asignado
  originatingcampaignid?: string;   // Campaña de origen

  // Audit Fields
  createdon: string;                // ISO 8601 datetime
  modifiedon: string;               // ISO 8601 datetime
  createdby?: string;               // User ID
  modifiedby?: string;              // User ID
}

/**
 * Qualify Lead DTO
 *
 * Datos para calificar un Lead y generar Account/Contact/Opportunity
 *
 * Escenarios:
 * 1. B2B - Nuevo cliente: createAccount=true, existingAccountId=null
 * 2. B2B - Cliente existente: createAccount=false, existingAccountId=set
 * 3. B2C - Sin empresa: createAccount=false, existingAccountId=null
 */
export interface QualifyLeadDto {
  // Account options (B2B)
  createAccount: boolean;              // ¿Crear nuevo Account?
  existingAccountId?: string;          // O vincular Account existente

  // Contact options (siempre se crea o vincula)
  createContact: boolean;              // ¿Crear nuevo Contact?
  existingContactId?: string;          // O vincular Contact existente

  // Opportunity details (siempre se crea)
  opportunityName: string;             // REQUIRED: Nombre de la oportunidad
  estimatedValue: number;              // REQUIRED: Valor estimado
  estimatedCloseDate: string;          // REQUIRED: Fecha estimada (ISO 8601)
  description?: string;                // Descripción de la oportunidad
}

/**
 * Qualify Lead Response
 *
 * Entidades generadas durante la calificación
 */
export interface QualifyLeadResponse {
  // IDs for backward compatibility
  leadId: string;                      // Lead calificado
  accountId?: string;                  // Account creado/vinculado (null en B2C)
  contactId: string;                   // Contact creado/vinculado
  opportunityId: string;               // Opportunity creada

  // Complete objects for UI display
  account?: {
    accountid: string;
    name: string;
  };
  contact?: {
    contactid: string;
    fullname: string;
  };
  opportunity: {
    opportunityid: string;
    name: string;
  };
}

/**
 * Create Lead DTO
 *
 * Campos requeridos para crear un nuevo Lead
 */
export interface CreateLeadDto {
  firstname: string;
  lastname: string;
  leadsourcecode: LeadSourceCode;   // REQUIRED
  companyname?: string;             // Null para B2C
  jobtitle?: string;
  emailaddress1?: string;
  telephone1?: string;
  description?: string;
  estimatedvalue?: number;
  ownerid: string;
}

/**
 * Update Lead DTO
 *
 * Campos actualizables de un Lead
 */
export interface UpdateLeadDto {
  firstname?: string;
  lastname?: string;
  jobtitle?: string;
  companyname?: string;
  emailaddress1?: string;
  telephone1?: string;
  mobilephone?: string;
  websiteurl?: string;
  address1_line1?: string;
  address1_line2?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  leadqualitycode?: LeadQualityCode;
  description?: string;
  estimatedvalue?: number;
  estimatedclosedate?: string;

  // BPF Qualify Stage fields
  budgetamount?: number;
  budgetstatus?: BudgetStatusCode;
  timeframe?: string;
  needanalysis?: string;
  decisionmaker?: string;
}
