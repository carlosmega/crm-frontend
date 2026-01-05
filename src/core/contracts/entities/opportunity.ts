import type {
  OpportunityStateCode,
  OpportunityStatusCode,
  SalesStageCode,
  CustomerType
} from '../enums';

/**
 * Opportunity Entity (Oportunidad de Venta)
 *
 * Representa una posible venta en proceso.
 *
 * ⚠️ IMPORTANTE: Customer es POLIMÓRFICO
 * - customerid puede apuntar a Account (B2B) o Contact (B2C)
 * - customeridtype indica el tipo de customer
 *
 * Sales Stages con probabilidades automáticas:
 * - Qualify (0): 25%
 * - Develop (1): 50%
 * - Propose (2): 75%
 * - Close (3): 100% (Won) / 0% (Lost)
 */
export interface Opportunity {
  // Primary Key
  opportunityid: string;

  // State & Status
  statecode: OpportunityStateCode;      // Open (0) / Won (1) / Lost (2)
  statuscode: OpportunityStatusCode;    // In_Progress, On_Hold, Won, Lost, Canceled

  // Basic Information
  name: string;                         // REQUIRED: Nombre de la oportunidad
  description?: string;

  // Customer (Polimórfico) - IMPORTANTE
  customerid: string;                   // GUID de Account o Contact
  customeridtype: CustomerType;         // 'account' o 'contact'

  // Sales Information
  salesstage: SalesStageCode;           // Qualify, Develop, Propose, Close
  closeprobability: number;             // 0-100 (auto-calculado según salesstage)
  estimatedvalue: number;               // REQUIRED: Valor estimado
  estimatedclosedate: string;           // REQUIRED: Fecha estimada (ISO 8601)
  actualvalue?: number;                 // Valor real al cerrar
  actualclosedate?: string;             // Fecha real de cierre (ISO 8601)

  // Lead Origin (si proviene de Lead calificado)
  originatingleadid?: string;           // Lead que generó esta Opportunity

  // Relationships (FKs)
  ownerid: string;                      // Usuario asignado
  campaignid?: string;                  // Campaña asociada

  // Close Information
  closeprobabilitypercentage?: number;  // Redundante con closeprobability
  closestatus?: string;                 // Won/Lost reason

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Opportunity DTO
 *
 * Campos requeridos para crear una nueva Opportunity
 */
export interface CreateOpportunityDto {
  name: string;
  customerid: string;                   // Account ID o Contact ID
  customeridtype: CustomerType;         // 'account' o 'contact'
  salesstage: SalesStageCode;
  estimatedvalue: number;
  estimatedclosedate: string;           // ISO 8601
  description?: string;
  originatingleadid?: string;           // Si proviene de Lead
  ownerid: string;
}

/**
 * Update Opportunity DTO
 *
 * Campos actualizables de una Opportunity (estructura Django backend)
 *
 * ⚠️ IMPORTANTE: El backend Django usa nombres diferentes a CDS:
 * - estimatedrevenue (no estimatedvalue)
 * - probability (no closeprobability)
 * - customername (string del nombre, no customerid)
 */
export interface UpdateOpportunityDto {
  name?: string;
  description?: string;
  customername?: string;                // Nombre del cliente (Account o Contact)
  estimatedrevenue?: number;            // Valor estimado (Django usa "revenue" no "value")
  estimatedclosedate?: string;          // ISO 8601
  salesstage?: SalesStageCode;          // 0=Qualify, 1=Develop, 2=Propose, 3=Close
  probability?: number;                 // 0-100 (Django usa "probability" no "closeprobability")
  statuscode?: number;                  // Status code (1=In Progress, etc.)
}

/**
 * Close Opportunity DTO
 *
 * Datos para cerrar una Opportunity (Win o Loss)
 */
export interface CloseOpportunityDto {
  statecode: OpportunityStateCode.Won | OpportunityStateCode.Lost;
  statuscode: OpportunityStatusCode.Won | OpportunityStatusCode.Lost;
  actualvalue?: number;                 // Valor real (requerido para Won)
  actualclosedate: string;              // ISO 8601
  closestatus?: string;                 // Razón de cierre
}
