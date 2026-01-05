import type { ContactStateCode } from '../enums';

/**
 * Contact Entity (Contacto/Persona)
 *
 * Representa una persona individual (tomador de decisiones).
 *
 * ⚠️ IMPORTANTE: Relación con Account es OPCIONAL
 * - B2B: Contact.parentcustomerid = Account ID (REQUIRED)
 * - B2C: Contact.parentcustomerid = null (contacto independiente)
 *
 * Relaciones:
 * - Pertenece a Account (B2B) vía parentcustomerid
 * - Vinculado a Opportunities vía customerid (B2C) o como contacto secundario (B2B)
 */
export interface Contact {
  // Primary Key
  contactid: string;

  // State & Status
  statecode: ContactStateCode;          // Active (0) / Inactive (1)
  statuscode?: number;

  // Basic Information
  firstname: string;                    // REQUIRED
  lastname: string;                     // REQUIRED
  fullname?: string;                    // Computed: firstname + lastname
  middlename?: string;
  salutation?: string;                  // Mr., Mrs., Dr., etc.
  jobtitle?: string;
  department?: string;

  // Contact Information
  emailaddress1?: string;
  emailaddress2?: string;
  telephone1?: string;
  telephone2?: string;
  mobilephone?: string;
  fax?: string;

  // Address
  address1_line1?: string;
  address1_line2?: string;
  address1_line3?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;

  // Relationships (FKs)
  parentcustomerid?: string;            // Account ID (null en B2C)
  ownerid: string;                      // Usuario asignado

  // Additional Information
  birthdate?: string;                   // ISO 8601 date
  gendercode?: number;                  // 1 = Male, 2 = Female
  familystatuscode?: number;            // 1 = Single, 2 = Married, etc.
  spousesname?: string;
  preferredcontactmethodcode?: number;  // Email, Phone, etc.
  donotbulkemail?: boolean;
  donotphone?: boolean;
  donotemail?: boolean;

  // Audit Fields
  createdon: string;                    // ISO 8601 datetime
  modifiedon: string;                   // ISO 8601 datetime
  createdby?: string;                   // User ID
  modifiedby?: string;                  // User ID
}

/**
 * Create Contact DTO
 *
 * Campos requeridos para crear un nuevo Contact
 */
export interface CreateContactDto {
  firstname: string;                    // REQUIRED
  lastname: string;                     // REQUIRED
  parentcustomerid?: string;            // Account ID (null para B2C)
  jobtitle?: string;
  emailaddress1?: string;
  telephone1?: string;
  mobilephone?: string;
  address1_line1?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  ownerid: string;
}

/**
 * Update Contact DTO
 *
 * Campos actualizables de un Contact
 */
export interface UpdateContactDto {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  salutation?: string;
  jobtitle?: string;
  department?: string;
  emailaddress1?: string;
  emailaddress2?: string;
  telephone1?: string;
  telephone2?: string;
  mobilephone?: string;
  fax?: string;
  address1_line1?: string;
  address1_line2?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_country?: string;
  parentcustomerid?: string;
  birthdate?: string;
  gendercode?: number;
  preferredcontactmethodcode?: number;
  donotbulkemail?: boolean;
  donotphone?: boolean;
  donotemail?: boolean;
}
