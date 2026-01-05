import type { AccountStateCode, AccountCategoryCode, IndustryCode } from '../enums';

/**
 * Account Entity (Cuenta/Empresa)
 *
 * Representa una empresa u organización cliente (B2B).
 *
 * Relaciones:
 * - 1 Account → N Contacts
 * - 1 Account → N Opportunities
 * - Jerarquía: parentaccountid para cuentas corporativas
 */
export interface Account {
  // Primary Key
  accountid: string;

  // State & Status
  statecode: AccountStateCode;          // Active (0) / Inactive (1)
  statuscode?: number;

  // Basic Information
  name: string;                         // REQUIRED: Nombre de la empresa
  accountnumber?: string;               // Código/número de cuenta
  description?: string;

  // Contact Information
  emailaddress1?: string;
  telephone1?: string;
  telephone2?: string;
  fax?: string;
  websiteurl?: string;

  // Address (Primary)
  address1_line1?: string;
  address1_line2?: string;
  address1_line3?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;

  // Address (Secondary)
  address2_line1?: string;
  address2_line2?: string;
  address2_line3?: string;
  address2_city?: string;
  address2_stateorprovince?: string;
  address2_postalcode?: string;
  address2_country?: string;

  // Business Information
  industrycode?: IndustryCode;          // Industria/Sector
  accountcategorycode?: AccountCategoryCode; // Preferred_Customer, Standard
  revenue?: number;                     // Ingresos anuales
  numberofemployees?: number;           // Número de empleados
  ownershipcode?: number;               // Tipo de propiedad (Público, Privado, etc.)

  // Hierarchy
  parentaccountid?: string;             // Cuenta padre (para jerarquías)

  // Relationships (FKs)
  ownerid: string;                      // Usuario asignado
  primarycontactid?: string;            // Contacto principal

  // Credit Information
  creditonhold?: boolean;
  creditlimit?: number;

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Account DTO
 *
 * Campos requeridos para crear un nuevo Account
 */
export interface CreateAccountDto {
  name: string;                         // REQUIRED
  accountnumber?: string;
  emailaddress1?: string;
  telephone1?: string;
  websiteurl?: string;
  address1_line1?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  industrycode?: IndustryCode;
  revenue?: number;
  numberofemployees?: number;
  parentaccountid?: string;
  ownerid: string;
}

/**
 * Update Account DTO
 *
 * Campos actualizables de un Account
 */
export interface UpdateAccountDto {
  name?: string;
  accountnumber?: string;
  description?: string;
  emailaddress1?: string;
  telephone1?: string;
  telephone2?: string;
  fax?: string;
  websiteurl?: string;
  address1_line1?: string;
  address1_line2?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  industrycode?: IndustryCode;
  accountcategorycode?: AccountCategoryCode;
  revenue?: number;
  numberofemployees?: number;
  parentaccountid?: string;
  primarycontactid?: string;
  creditonhold?: boolean;
  creditlimit?: number;
}
