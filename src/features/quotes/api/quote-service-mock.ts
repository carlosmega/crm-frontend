import type {
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto,
  CloseQuoteDto,
} from '@/core/contracts/entities/quote'
import { QuoteStateCode, QuoteStatusCode } from '@/core/contracts/enums'
import { mockQuotes } from '../data/mock-quotes'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

const STORAGE_KEY = 'quotes'

/**
 * Quote Service (Mock API)
 *
 * Simula llamadas a backend usando localStorage para persistencia
 * Implementa el ciclo de vida completo de Quote según CDS:
 * Draft → Active → Won/Lost/Closed
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

// Initialize storage with mock data if empty
function initializeQuotes(): Quote[] {
  const stored = storage.get<Quote[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, mockQuotes)
    return mockQuotes
  }
  return stored
}

export const quoteServiceMock = {
  /**
   * Get all quotes
   */
  async getAll(): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return initializeQuotes()
  },

  /**
   * Get quotes with optional state filter
   */
  async getQuotes(statecode?: QuoteStateCode): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const quotes = initializeQuotes()
    if (statecode === undefined) {
      return quotes
    }
    return quotes.filter((quote) => quote.statecode === statecode)
  },

  /**
   * Get quotes filtered by state
   */
  async getByState(statecode: QuoteStateCode): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const quotes = initializeQuotes()
    return quotes.filter((quote) => quote.statecode === statecode)
  },

  /**
   * Get quotes by opportunity ID
   */
  async getByOpportunity(opportunityId: string): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const quotes = initializeQuotes()
    return quotes.filter((quote) => quote.opportunityid === opportunityId)
  },

  /**
   * Get quotes by customer ID
   */
  async getByCustomer(customerId: string): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const quotes = initializeQuotes()
    return quotes.filter((quote) => quote.customerid === customerId)
  },

  /**
   * Get quote by ID
   */
  async getById(id: string): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const quotes = initializeQuotes()
    return quotes.find((quote) => quote.quoteid === id) || null
  },

  /**
   * Create new quote
   *
   * Quote se crea en estado Draft por defecto
   */
  async create(dto: CreateQuoteDto): Promise<Quote> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const now = new Date().toISOString()

    // Generate quote number (QU-YYYYMMDD-XXX)
    const dateStr = now.slice(0, 10).replace(/-/g, '')
    const quotesCount = quotes.length + 1
    const quotenumber = `QU-${dateStr}-${String(quotesCount).padStart(3, '0')}`

    const newQuote: Quote = {
      quoteid: crypto.randomUUID(),
      statecode: QuoteStateCode.Draft,
      statuscode: QuoteStatusCode.In_Progress,
      name: dto.name,
      quotenumber,
      opportunityid: dto.opportunityid,
      customerid: dto.customerid,
      customeridtype: dto.customeridtype,
      description: dto.description,
      effectivefrom: dto.effectivefrom,
      effectiveto: dto.effectiveto,
      // Amounts inicializados en 0 (se calculan con Quote Lines)
      totalamount: 0,
      totallineitemamount: 0,
      totaltax: 0,
      totalamountlessfreight: 0,
      freightamount: 0,
      discountamount: 0,
      totaldiscountamount: 0,
      ownerid: dto.ownerid,
      createdon: now,
      modifiedon: now,
    }

    const updatedQuotes = [...quotes, newQuote]
    storage.set(STORAGE_KEY, updatedQuotes)

    return newQuote
  },

  /**
   * Update existing quote
   *
   * Solo se puede editar si está en estado Draft
   */
  async update(id: string, dto: UpdateQuoteDto): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: No se puede editar Quote Active/Won/Closed
    if (existingQuote.statecode !== QuoteStateCode.Draft) {
      throw new Error('Cannot edit quote that is not in Draft state')
    }

    const updatedQuote: Quote = {
      ...existingQuote,
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      updatedQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return updatedQuote
  },

  /**
   * Update quote totals
   *
   * Actualiza los totales calculados desde Quote Lines
   * Usado internamente por quote-detail-service
   */
  async updateTotals(
    id: string,
    totals: {
      totallineitemamount: number
      totaldiscountamount: number
      totaltax: number
      freightamount: number
    }
  ): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.READ)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const totalamount =
      totals.totallineitemamount +
      totals.totaltax +
      totals.freightamount -
      totals.totaldiscountamount

    const totalamountlessfreight = totalamount - totals.freightamount

    const updatedQuote: Quote = {
      ...quotes[index],
      totallineitemamount: totals.totallineitemamount,
      totaldiscountamount: totals.totaldiscountamount,
      totaltax: totals.totaltax,
      freightamount: totals.freightamount,
      totalamount,
      totalamountlessfreight,
      modifiedon: new Date().toISOString(),
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      updatedQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return updatedQuote
  },

  /**
   * Delete quote
   *
   * Solo se puede eliminar si está en estado Draft
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.READ)

    const quotes = initializeQuotes()
    const quote = quotes.find((q) => q.quoteid === id)

    if (!quote) return false

    // Validación: Solo se puede eliminar Draft
    if (quote.statecode !== QuoteStateCode.Draft) {
      throw new Error('Can only delete quotes in Draft state')
    }

    const filteredQuotes = quotes.filter((q) => q.quoteid !== id)

    if (filteredQuotes.length === quotes.length) {
      return false // Quote not found
    }

    storage.set(STORAGE_KEY, filteredQuotes)
    return true
  },

  /**
   * Activate quote
   *
   * Cambia de Draft → Active
   * Requiere: al menos 1 Quote Line
   */
  async activate(id: string, dto?: ActivateQuoteDto): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: Debe estar en Draft
    if (existingQuote.statecode !== QuoteStateCode.Draft) {
      throw new Error('Quote must be in Draft state to activate')
    }

    // Validación: Debe tener totalamount > 0 (al menos 1 Quote Line)
    if (existingQuote.totalamount <= 0) {
      throw new Error('Quote must have at least one Quote Line to activate')
    }

    const activatedQuote: Quote = {
      ...existingQuote,
      statecode: QuoteStateCode.Active,
      statuscode: QuoteStatusCode.In_Review,
      effectivefrom: dto?.effectivefrom || existingQuote.effectivefrom,
      effectiveto: dto?.effectiveto || existingQuote.effectiveto,
      modifiedon: new Date().toISOString(),
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      activatedQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return activatedQuote
  },

  /**
   * Win quote
   *
   * Cambia a Won state
   * Esto debería:
   * 1. Cerrar Quote como Won
   * 2. Ganar Opportunity vinculada
   * 3. Generar Order (implementado en order-service)
   */
  async win(id: string, dto?: CloseQuoteDto): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: Debe estar en Active
    if (existingQuote.statecode !== QuoteStateCode.Active) {
      throw new Error('Quote must be Active to win')
    }

    const now = new Date().toISOString()

    const wonQuote: Quote = {
      ...existingQuote,
      statecode: QuoteStateCode.Won,
      statuscode: QuoteStatusCode.Won,
      closedon: now,
      closingnotes: dto?.closingnotes,
      modifiedon: now,
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      wonQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return wonQuote
  },

  /**
   * Lose quote
   *
   * Cambia a Closed/Lost state
   */
  async lose(id: string, dto?: CloseQuoteDto): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: Debe estar en Active o Draft
    if (
      existingQuote.statecode !== QuoteStateCode.Active &&
      existingQuote.statecode !== QuoteStateCode.Draft
    ) {
      throw new Error('Quote must be Active or Draft to lose')
    }

    const now = new Date().toISOString()

    const lostQuote: Quote = {
      ...existingQuote,
      statecode: QuoteStateCode.Closed,
      statuscode: QuoteStatusCode.Lost,
      closedon: now,
      closingnotes: dto?.closingnotes,
      modifiedon: now,
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      lostQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return lostQuote
  },

  /**
   * Cancel quote
   *
   * Cambia a Closed/Canceled state
   */
  async cancel(id: string, reason?: string): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: No se puede cancelar si ya está Won
    if (existingQuote.statecode === QuoteStateCode.Won) {
      throw new Error('Cannot cancel a Won quote')
    }

    const now = new Date().toISOString()

    const canceledQuote: Quote = {
      ...existingQuote,
      statecode: QuoteStateCode.Closed,
      statuscode: QuoteStatusCode.Canceled,
      closedon: now,
      closingnotes: reason,
      modifiedon: now,
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      canceledQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return canceledQuote
  },

  /**
   * Revise quote (reopen)
   *
   * Cambia Active/Closed → Draft para revisión
   */
  async revise(id: string): Promise<Quote | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const quotes = initializeQuotes()
    const index = quotes.findIndex((quote) => quote.quoteid === id)

    if (index === -1) return null

    const existingQuote = quotes[index]

    // Validación: No se puede revisar si está Won
    if (existingQuote.statecode === QuoteStateCode.Won) {
      throw new Error('Cannot revise a Won quote')
    }

    const revisedQuote: Quote = {
      ...existingQuote,
      statecode: QuoteStateCode.Draft,
      statuscode: QuoteStatusCode.In_Progress,
      closedon: undefined,
      modifiedon: new Date().toISOString(),
    }

    const updatedQuotes = [
      ...quotes.slice(0, index),
      revisedQuote,
      ...quotes.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedQuotes)

    return revisedQuote
  },

  /**
   * Clone quote
   *
   * Crea una copia del Quote con todas sus líneas de producto
   * El nuevo Quote se crea en estado Draft con:
   * - Nuevo ID y número de Quote
   * - Nombre con sufijo " (Copy)"
   * - Fechas de validez reseteadas (usuario debe definir)
   * - Todas las Quote Lines copiadas
   */
  async clone(id: string): Promise<Quote> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    const quotes = initializeQuotes()
    const originalQuote = quotes.find((quote) => quote.quoteid === id)

    if (!originalQuote) {
      throw new Error('Quote not found')
    }

    // Crear nuevo Quote (copia de datos)
    const now = new Date().toISOString()
    const dateStr = now.slice(0, 10).replace(/-/g, '')
    const quotesCount = quotes.length + 1
    const quotenumber = `QU-${dateStr}-${String(quotesCount).padStart(3, '0')}`

    const clonedQuote: Quote = {
      ...originalQuote,
      quoteid: crypto.randomUUID(),
      quotenumber,
      name: `${originalQuote.name} (Copy)`,
      statecode: QuoteStateCode.Draft,
      statuscode: QuoteStatusCode.In_Progress,
      // Resetear fechas de validez (usuario debe definir)
      effectivefrom: undefined,
      effectiveto: undefined,
      // Resetear fechas de cierre
      closedon: undefined,
      closingnotes: undefined,
      // Mantener totales (se actualizarán al copiar líneas)
      totalamount: 0,
      totallineitemamount: 0,
      totaltax: 0,
      totalamountlessfreight: 0,
      freightamount: 0,
      discountamount: 0,
      totaldiscountamount: 0,
      // Nuevas fechas de creación/modificación
      createdon: now,
      modifiedon: now,
    }

    const updatedQuotes = [...quotes, clonedQuote]
    storage.set(STORAGE_KEY, updatedQuotes)

    // Clonar todas las Quote Lines (dynamic import para evitar circular dependency)
    const { quoteDetailService } = await import('./quote-detail-service')
    await quoteDetailService.cloneQuoteLines(id, clonedQuote.quoteid)

    // Obtener el Quote actualizado con los totales recalculados
    const finalQuote = await this.getById(clonedQuote.quoteid)
    return finalQuote || clonedQuote
  },

  /**
   * Search quotes by text
   */
  async search(query: string): Promise<Quote[]> {
    await mockDelay(MOCK_DELAYS.SEARCH)

    const quotes = initializeQuotes()
    const lowerQuery = query.toLowerCase()

    return quotes.filter(
      (quote) =>
        quote.name?.toLowerCase().includes(lowerQuery) ||
        quote.quotenumber?.toLowerCase().includes(lowerQuery) ||
        quote.description?.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Get quote statistics
   */
  async getStatistics(): Promise<{
    total: number
    draft: number
    active: number
    won: number
    lost: number
    wonValue: number
    totalValue: number
    averageValue: number
    winRate: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const quotes = initializeQuotes()

    const draft = quotes.filter((q) => q.statecode === QuoteStateCode.Draft)
    const active = quotes.filter((q) => q.statecode === QuoteStateCode.Active)
    const won = quotes.filter((q) => q.statecode === QuoteStateCode.Won)
    const lost = quotes.filter(
      (q) =>
        q.statecode === QuoteStateCode.Closed &&
        q.statuscode === QuoteStatusCode.Lost
    )

    const wonValue = won.reduce((sum, q) => sum + q.totalamount, 0)
    const totalValue = quotes.reduce((sum, q) => sum + q.totalamount, 0)
    const averageValue = wonValue / (won.length || 1)
    const totalClosed = won.length + lost.length
    const winRate = totalClosed > 0 ? (won.length / totalClosed) * 100 : 0

    return {
      total: quotes.length,
      draft: draft.length,
      active: active.length,
      won: won.length,
      lost: lost.length,
      wonValue,
      totalValue,
      averageValue,
      winRate,
    }
  },
}
