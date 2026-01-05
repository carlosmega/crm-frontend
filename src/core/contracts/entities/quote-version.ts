/**
 * Quote Version Entity
 *
 * Representa una versión histórica de un Quote para auditoría y tracking de cambios
 * Basado en el concepto de Version Control de Microsoft Dynamics 365
 */

export interface QuoteVersion {
  /** Unique identifier for this version */
  quoteversionid: string

  /** Reference to the parent Quote */
  quoteid: string

  /** Version number (incremental) */
  versionnumber: number

  /** Snapshot of Quote data at this version */
  versiondata: {
    name: string
    description?: string
    customerid: string
    customeridtype: 'account' | 'contact'
    opportunityid?: string
    effectivefrom?: string
    effectiveto?: string
    totalamount: number
    totaldiscountamount?: number
    totaltax?: number
    statecode: number
    statuscode: number

    // Snapshot de Quote Lines
    lines: Array<{
      quotedetailid: string
      productid?: string
      productdescription: string
      quantity: number
      priceperunit: number
      manualdiscountamount?: number
      tax?: number
      baseamount: number
      extendedamount: number
    }>
  }

  /** Type of change that created this version */
  changetype: QuoteVersionChangeType

  /** Description of changes made in this version */
  changedescription?: string

  /** Fields that changed in this version (compared to previous) */
  changedfields?: string[]

  /** User who created this version */
  createdby: string

  /** When this version was created */
  createdon: string

  /** Optional: Reason for change (user-provided) */
  changereason?: string
}

/**
 * Types of changes that can create a new version
 */
export enum QuoteVersionChangeType {
  Created = 'created',           // Quote was created
  Updated = 'updated',           // General update
  Activated = 'activated',       // Quote activated (Draft → Active)
  Won = 'won',                   // Quote won
  Lost = 'lost',                 // Quote lost
  Revised = 'revised',           // Quote revised (new revision created)
  Canceled = 'canceled',         // Quote canceled
  ProductAdded = 'product_added',       // Product line added
  ProductRemoved = 'product_removed',   // Product line removed
  ProductUpdated = 'product_updated',   // Product line modified
  DiscountApplied = 'discount_applied', // Discount applied
  PriceChanged = 'price_changed',       // Pricing changed
}

/**
 * DTO for creating a new version
 */
export interface CreateQuoteVersionDto {
  quoteid: string
  versionnumber: number
  versiondata: QuoteVersion['versiondata']
  changetype: QuoteVersionChangeType
  changedescription?: string
  changedfields?: string[]
  createdby: string
  changereason?: string
}

/**
 * DTO for version comparison result
 */
export interface QuoteVersionComparison {
  fromVersion: QuoteVersion
  toVersion: QuoteVersion

  changes: {
    // Quote-level changes
    quote: {
      field: string
      oldValue: any
      newValue: any
      type: 'added' | 'removed' | 'modified'
    }[]

    // Line-level changes
    lines: {
      action: 'added' | 'removed' | 'modified'
      lineId?: string
      productDescription: string
      changes?: {
        field: string
        oldValue: any
        newValue: any
      }[]
    }[]
  }

  summary: {
    totalChanges: number
    quoteFieldsChanged: number
    linesAdded: number
    linesRemoved: number
    linesModified: number
  }
}

/**
 * Query parameters for version history
 */
export interface QuoteVersionQueryParams {
  quoteid: string
  limit?: number
  offset?: number
  changetype?: QuoteVersionChangeType
  fromDate?: string
  toDate?: string
}
