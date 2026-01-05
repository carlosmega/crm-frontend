/**
 * Quote Template Entity
 *
 * Representa una plantilla de cotización reutilizable
 * Basado en estructura de Quote + QuoteDetails para rápida creación
 */

export interface QuoteTemplate {
  // Primary Key
  quotetemplateid: string

  // Basic Information
  name: string
  description?: string
  category?: QuoteTemplateCategory

  // Template Content (estructura de Quote)
  templatedata: {
    // Quote fields a copiar
    name: string
    description?: string
    effectivefrom?: string
    effectiveto?: string

    // Quote Lines
    lines: Array<{
      productid?: string
      productdescription: string
      quantity: number
      priceperunit: number
      manualdiscountamount?: number
      tax?: number
    }>
  }

  // Metadata
  ownerid: string
  isshared: boolean // Si es compartido con otros usuarios
  usagecount: number // Contador de veces usado

  // Audit
  createdon: string
  createdby?: string
  modifiedon: string
  modifiedby?: string
}

/**
 * Quote Template Category
 */
export enum QuoteTemplateCategory {
  Standard = 'standard',
  Custom = 'custom',
  Industry = 'industry', // Por industria específica
  Service = 'service',
  Product = 'product',
  Bundle = 'bundle',
}

/**
 * DTO for creating quote template
 */
export interface CreateQuoteTemplateDto {
  name: string
  description?: string
  category?: QuoteTemplateCategory
  templatedata: QuoteTemplate['templatedata']
  ownerid: string
  isshared?: boolean
}

/**
 * DTO for updating quote template
 */
export interface UpdateQuoteTemplateDto {
  name?: string
  description?: string
  category?: QuoteTemplateCategory
  templatedata?: QuoteTemplate['templatedata']
  isshared?: boolean
}

/**
 * DTO for applying template to new quote
 */
export interface ApplyTemplateDto {
  templateid: string
  // Override fields (opcional)
  overrides?: {
    name?: string
    description?: string
    customerid?: string
    customeridtype?: 'account' | 'contact'
    opportunityid?: string
  }
}
