import type {
  QuoteTemplate,
  CreateQuoteTemplateDto,
  UpdateQuoteTemplateDto,
  Quote,
  CreateQuoteDto,
} from '@/core/contracts'
import { QuoteStateCode, QuoteStatusCode } from '@/core/contracts'
import { MOCK_QUOTE_TEMPLATES } from '../data/mock-quote-templates'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

const STORAGE_KEY = 'quote-templates'

/**
 * Quote Template Service (Mock API)
 *
 * Gestiona templates de cotizaciones para reutilización rápida
 */

// Initialize storage with mock data if empty
function initializeTemplates(): QuoteTemplate[] {
  const stored = storage.get<QuoteTemplate[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, MOCK_QUOTE_TEMPLATES)
    return MOCK_QUOTE_TEMPLATES
  }
  return stored
}

export const quoteTemplateService = {
  /**
   * Get all quote templates
   */
  async getAll(): Promise<QuoteTemplate[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return initializeTemplates()
  },

  /**
   * Get shared templates only (available to all users)
   */
  async getShared(): Promise<QuoteTemplate[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const templates = initializeTemplates()
    return templates.filter((t) => t.isshared)
  },

  /**
   * Get templates by owner
   */
  async getByOwner(ownerId: string): Promise<QuoteTemplate[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const templates = initializeTemplates()
    return templates.filter((t) => t.ownerid === ownerId)
  },

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<QuoteTemplate | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const templates = initializeTemplates()
    return templates.find((t) => t.quotetemplateid === id) || null
  },

  /**
   * Create new template
   */
  async create(dto: CreateQuoteTemplateDto): Promise<QuoteTemplate> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const templates = initializeTemplates()
    const now = new Date().toISOString()

    const newTemplate: QuoteTemplate = {
      quotetemplateid: crypto.randomUUID(),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      templatedata: dto.templatedata,
      ownerid: dto.ownerid,
      isshared: dto.isshared ?? false,
      usagecount: 0,
      createdon: now,
      modifiedon: now,
    }

    const updatedTemplates = [...templates, newTemplate]
    storage.set(STORAGE_KEY, updatedTemplates)

    return newTemplate
  },

  /**
   * Update existing template
   */
  async update(
    id: string,
    dto: UpdateQuoteTemplateDto
  ): Promise<QuoteTemplate | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const templates = initializeTemplates()
    const index = templates.findIndex((t) => t.quotetemplateid === id)

    if (index === -1) return null

    const updatedTemplate: QuoteTemplate = {
      ...templates[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    const updatedTemplates = [
      ...templates.slice(0, index),
      updatedTemplate,
      ...templates.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedTemplates)

    return updatedTemplate
  },

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const templates = initializeTemplates()
    const filteredTemplates = templates.filter(
      (t) => t.quotetemplateid !== id
    )

    if (filteredTemplates.length === templates.length) {
      return false // Template not found
    }

    storage.set(STORAGE_KEY, filteredTemplates)
    return true
  },

  /**
   * Create Quote from Template
   *
   * Genera un nuevo Quote (Draft) usando template data
   * Incrementa usage count del template
   */
  async createQuoteFromTemplate(
    templateId: string,
    overrides?: {
      name?: string
      description?: string
      customerid?: string
      customeridtype?: 'account' | 'contact'
      opportunityid?: string
      ownerid?: string
    }
  ): Promise<{ quote: CreateQuoteDto; templateLines: any[] }> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    const templates = initializeTemplates()
    const template = templates.find((t) => t.quotetemplateid === templateId)

    if (!template) {
      throw new Error('Template not found')
    }

    // Increment usage count
    const templateIndex = templates.findIndex(
      (t) => t.quotetemplateid === templateId
    )
    templates[templateIndex].usagecount += 1
    storage.set(STORAGE_KEY, templates)

    // Create Quote DTO from template
    const quoteDto: CreateQuoteDto = {
      name: overrides?.name || template.templatedata.name,
      description:
        overrides?.description || template.templatedata.description,
      customerid: overrides?.customerid!,
      customeridtype: overrides?.customeridtype!,
      opportunityid: overrides?.opportunityid,
      ownerid: overrides?.ownerid || template.ownerid,
      effectivefrom: template.templatedata.effectivefrom,
      effectiveto: template.templatedata.effectiveto,
    }

    // Return quote DTO + template lines (caller will create quote + lines)
    return {
      quote: quoteDto,
      templateLines: template.templatedata.lines,
    }
  },

  /**
   * Save Quote as Template
   *
   * Crea un template desde un Quote existente
   */
  async createFromQuote(
    quote: Quote,
    quoteLines: any[],
    templateData: {
      name: string
      description?: string
      category?: any
      isshared?: boolean
    }
  ): Promise<QuoteTemplate> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const templates = initializeTemplates()
    const now = new Date().toISOString()

    // Convert Quote Lines to template format
    const templateLines = quoteLines.map((line) => ({
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount || 0,
      tax: line.tax || 0,
    }))

    const newTemplate: QuoteTemplate = {
      quotetemplateid: crypto.randomUUID(),
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      templatedata: {
        name: quote.name,
        description: quote.description,
        effectivefrom: quote.effectivefrom,
        effectiveto: quote.effectiveto,
        lines: templateLines,
      },
      ownerid: quote.ownerid,
      isshared: templateData.isshared ?? false,
      usagecount: 0,
      createdon: now,
      modifiedon: now,
    }

    const updatedTemplates = [...templates, newTemplate]
    storage.set(STORAGE_KEY, updatedTemplates)

    return newTemplate
  },
}
