import type { CaseStateCode, CaseStatusCode } from '../enums/case-state'
import type { CasePriorityCode } from '../enums/case-priority'
import type { CaseOriginCode } from '../enums/case-origin'
import type { CaseTypeCode } from '../enums/case-type'

/**
 * Case Entity (CDS: incident)
 *
 * Represents a customer service request or support ticket.
 * Cases track customer issues from creation through resolution.
 *
 * Workflow:
 * 1. Case created → statecode: Active (0), statuscode: In Progress (1)
 * 2. Case resolved → statecode: Resolved (1), statuscode: Problem Solved (5)
 * 3. Case cancelled → statecode: Cancelled (2), statuscode: Cancelled (6)
 *
 * Customer Association:
 * - customerid is polymorphic: can reference Account (B2B) or Contact (B2C)
 * - primarycontactid links to the specific contact person for the case
 */
export interface Case {
  // Primary Key
  incidentid: string               // CDS uses "incident" internally for cases

  // State & Status
  statecode: CaseStateCode         // Active (0) / Resolved (1) / Cancelled (2)
  statuscode: CaseStatusCode       // Detailed status within state

  // Basic Information
  title: string                    // Case title/subject (required)
  description?: string             // Detailed description of the issue
  ticketnumber?: string            // Auto-generated ticket number

  // Classification
  casetypecode?: CaseTypeCode      // Question / Problem / Request
  prioritycode: CasePriorityCode   // High / Normal / Low
  caseorigincode: CaseOriginCode   // Phone / Email / Web / etc.

  // Customer Association (Polymorphic)
  customerid: string               // FK to Account or Contact
  customerid_type: 'account' | 'contact'  // Determines customer entity type
  customername?: string            // Denormalized customer name for display

  // Primary Contact (specific person handling the case)
  primarycontactid?: string        // FK to Contact
  primarycontactname?: string      // Denormalized contact name

  // Product Association
  productid?: string               // FK to Product (if case is product-related)
  productname?: string             // Denormalized product name

  // SLA Information
  firstresponsesent?: boolean      // Whether first response has been sent
  firstresponseslastatus?: number  // SLA status for first response
  resolvebyslastatus?: number      // SLA status for resolution

  // Resolution
  resolutiontype?: string          // Type of resolution
  resolutionsummary?: string       // Summary of how the case was resolved

  // Relationships (FKs)
  ownerid: string                  // User/team assigned to the case
  ownername?: string               // Denormalized owner name

  // Audit Fields
  createdon: string                // ISO 8601 datetime
  modifiedon: string               // ISO 8601 datetime
  createdby?: string               // User ID who created
  modifiedby?: string              // User ID who last modified
  resolvedon?: string              // ISO 8601 datetime when resolved
}

/**
 * Create Case DTO
 *
 * Required fields for creating a new Case
 */
export interface CreateCaseDto {
  title: string                    // Required: Case subject
  description?: string
  customerid: string               // Required: Customer (Account or Contact)
  customerid_type: 'account' | 'contact'  // Required: Customer entity type
  primarycontactid?: string
  casetypecode?: CaseTypeCode
  prioritycode: CasePriorityCode   // Required: Priority level
  caseorigincode: CaseOriginCode   // Required: Origin channel
  productid?: string
  ownerid: string                  // Required: Assigned user/team
}

/**
 * Update Case DTO
 *
 * Fields that can be updated on an existing Case
 */
export interface UpdateCaseDto {
  title?: string
  description?: string
  casetypecode?: CaseTypeCode
  prioritycode?: CasePriorityCode
  primarycontactid?: string
  productid?: string
  ownerid?: string
}

/**
 * Resolve Case DTO
 *
 * Data required to resolve/close a case
 */
export interface ResolveCaseDto {
  resolutiontype: string           // Type of resolution
  resolutionsummary: string        // Summary of resolution
  billabletime?: number            // Billable time in minutes (if applicable)
}

/**
 * Cancel Case DTO
 *
 * Data for cancelling a case
 */
export interface CancelCaseDto {
  reason?: string                  // Reason for cancellation
}
