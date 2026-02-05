import type {
  QuoteDetail,
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
} from '@/core/contracts/entities/quote-detail'
import { mockQuoteDetails } from '../data/mock-quotes'
import { storage } from '@/lib/storage'
import { quoteService } from './quote-service'

const STORAGE_KEY = 'quote_details'

/**
 * Quote Detail Service (Quote Lines / Mock API)
 *
 * Maneja las líneas de productos de una Quote
 * Cada cambio recalcula los totales del Quote padre
 */

// Initialize storage with mock data if empty
function initializeQuoteDetails(): QuoteDetail[] {
  const stored = storage.get<QuoteDetail[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, mockQuoteDetails)
    return mockQuoteDetails
  }
  return stored
}

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Calculate totals for a quote from its lines
 */
function calculateQuoteTotals(quoteId: string, lines: QuoteDetail[]) {
  const quoteLines = lines.filter((line) => line.quoteid === quoteId)

  const totallineitemamount = quoteLines.reduce(
    (sum, line) => sum + line.extendedamount,
    0
  )
  const totaldiscountamount = quoteLines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )
  const totaltax = quoteLines.reduce((sum, line) => sum + (line.tax || 0), 0)

  return {
    totallineitemamount,
    totaldiscountamount,
    totaltax,
    freightamount: 0, // Se puede agregar lógica de freight
  }
}

export const quoteDetailServiceMock = {
  /**
   * Get all quote details for a specific quote
   */
  async getByQuote(quoteId: string): Promise<QuoteDetail[]> {
    await delay(250)
    const details = initializeQuoteDetails()
    return details.filter((detail) => detail.quoteid === quoteId)
  },

  /**
   * Get quote detail by ID
   */
  async getById(id: string): Promise<QuoteDetail | null> {
    await delay(200)
    const details = initializeQuoteDetails()
    return details.find((detail) => detail.quotedetailid === id) || null
  },

  /**
   * Create new quote detail (add product line)
   *
   * Recalcula totales del Quote automáticamente
   */
  async create(dto: CreateQuoteDetailDto): Promise<QuoteDetail> {
    await delay(400)

    const details = initializeQuoteDetails()
    const now = new Date().toISOString()

    // Calcular line number (siguiente disponible para este quote)
    const existingLines = details.filter((d) => d.quoteid === dto.quoteid)
    const lineitemnumber =
      existingLines.length > 0
        ? Math.max(...existingLines.map((d) => d.lineitemnumber)) + 1
        : 1

    // Calcular amounts (ensure numeric types - hidden inputs may send strings)
    const quantity = Number(dto.quantity)
    const priceperunit = Number(dto.priceperunit)
    const baseamount = priceperunit * quantity
    const manualdiscountamount = Number(dto.manualdiscountamount) || 0
    const tax = Number(dto.tax) || 0
    const extendedamount = baseamount - manualdiscountamount + tax

    const newDetail: QuoteDetail = {
      quotedetailid: crypto.randomUUID(),
      quoteid: dto.quoteid,
      productid: dto.productid,
      productdescription: dto.productdescription,
      quantity,
      priceperunit,
      baseamount,
      extendedamount,
      manualdiscountamount,
      tax,
      lineitemnumber,
      createdon: now,
      modifiedon: now,
    }

    const updatedDetails = [...details, newDetail]
    storage.set(STORAGE_KEY, updatedDetails)

    // Recalcular totales del Quote
    const totals = calculateQuoteTotals(dto.quoteid, updatedDetails)
    await quoteService.updateTotals(dto.quoteid, totals)

    return newDetail
  },

  /**
   * Update existing quote detail
   *
   * Recalcula totales del Quote automáticamente
   */
  async update(
    id: string,
    dto: UpdateQuoteDetailDto
  ): Promise<QuoteDetail | null> {
    await delay(400)

    const details = initializeQuoteDetails()
    const index = details.findIndex((detail) => detail.quotedetailid === id)

    if (index === -1) return null

    const existingDetail = details[index]

    // Recalcular amounts si cambiaron price/quantity/discount (ensure numeric types)
    const quantity = Number(dto.quantity ?? existingDetail.quantity)
    const priceperunit = Number(dto.priceperunit ?? existingDetail.priceperunit)
    const manualdiscountamount =
      Number(dto.manualdiscountamount ?? existingDetail.manualdiscountamount) || 0
    const tax = Number(dto.tax ?? existingDetail.tax) || 0

    const baseamount = priceperunit * quantity
    const extendedamount = baseamount - manualdiscountamount + tax

    const updatedDetail: QuoteDetail = {
      ...existingDetail,
      ...dto,
      quantity,
      priceperunit,
      manualdiscountamount,
      tax,
      baseamount,
      extendedamount,
      modifiedon: new Date().toISOString(),
    }

    const updatedDetails = [
      ...details.slice(0, index),
      updatedDetail,
      ...details.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedDetails)

    // Recalcular totales del Quote
    const totals = calculateQuoteTotals(existingDetail.quoteid, updatedDetails)
    await quoteService.updateTotals(existingDetail.quoteid, totals)

    return updatedDetail
  },

  /**
   * Delete quote detail
   *
   * Recalcula totales del Quote automáticamente
   */
  async delete(id: string): Promise<boolean> {
    await delay(300)

    const details = initializeQuoteDetails()
    const detail = details.find((d) => d.quotedetailid === id)

    if (!detail) return false

    const filteredDetails = details.filter((d) => d.quotedetailid !== id)

    if (filteredDetails.length === details.length) {
      return false // Detail not found
    }

    storage.set(STORAGE_KEY, filteredDetails)

    // Recalcular totales del Quote
    const totals = calculateQuoteTotals(detail.quoteid, filteredDetails)
    await quoteService.updateTotals(detail.quoteid, totals)

    return true
  },

  /**
   * Bulk create quote details
   *
   * Útil para crear múltiples líneas a la vez
   */
  async bulkCreate(dtos: CreateQuoteDetailDto[]): Promise<QuoteDetail[]> {
    await delay(600)

    if (dtos.length === 0) return []

    const details = initializeQuoteDetails()
    const now = new Date().toISOString()

    // Asumir que todos son del mismo quote
    const quoteId = dtos[0].quoteid
    const existingLines = details.filter((d) => d.quoteid === quoteId)
    let nextLineNumber =
      existingLines.length > 0
        ? Math.max(...existingLines.map((d) => d.lineitemnumber)) + 1
        : 1

    const newDetails: QuoteDetail[] = dtos.map((dto) => {
      const quantity = Number(dto.quantity)
      const priceperunit = Number(dto.priceperunit)
      const baseamount = priceperunit * quantity
      const manualdiscountamount = Number(dto.manualdiscountamount) || 0
      const tax = Number(dto.tax) || 0
      const extendedamount = baseamount - manualdiscountamount + tax

      const detail: QuoteDetail = {
        quotedetailid: crypto.randomUUID(),
        quoteid: dto.quoteid,
        productid: dto.productid,
        productdescription: dto.productdescription,
        quantity,
        priceperunit,
        baseamount,
        extendedamount,
        manualdiscountamount,
        tax,
        lineitemnumber: nextLineNumber++,
        createdon: now,
        modifiedon: now,
      }

      return detail
    })

    const updatedDetails = [...details, ...newDetails]
    storage.set(STORAGE_KEY, updatedDetails)

    // Recalcular totales del Quote
    const totals = calculateQuoteTotals(quoteId, updatedDetails)
    await quoteService.updateTotals(quoteId, totals)

    return newDetails
  },

  /**
   * Delete all quote details for a quote
   *
   * Útil al eliminar un Quote completo
   */
  async deleteByQuote(quoteId: string): Promise<number> {
    await delay(300)

    const details = initializeQuoteDetails()
    const filteredDetails = details.filter((d) => d.quoteid !== quoteId)
    const deletedCount = details.length - filteredDetails.length

    if (deletedCount > 0) {
      storage.set(STORAGE_KEY, filteredDetails)

      // Resetear totales del Quote a 0
      await quoteService.updateTotals(quoteId, {
        totallineitemamount: 0,
        totaldiscountamount: 0,
        totaltax: 0,
        freightamount: 0,
      })
    }

    return deletedCount
  },

  /**
   * Reorder quote details (change line numbers)
   */
  async reorder(
    quoteId: string,
    detailIdsInOrder: string[]
  ): Promise<QuoteDetail[]> {
    await delay(300)

    const details = initializeQuoteDetails()
    const quoteDetails = details.filter((d) => d.quoteid === quoteId)
    const otherDetails = details.filter((d) => d.quoteid !== quoteId)

    // Crear mapa de ID a línea reordenada
    const reorderedDetails = detailIdsInOrder
      .map((id, index) => {
        const detail = quoteDetails.find((d) => d.quotedetailid === id)
        if (!detail) return null

        return {
          ...detail,
          lineitemnumber: index + 1,
          modifiedon: new Date().toISOString(),
        }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)

    const updatedDetails = [...otherDetails, ...reorderedDetails]
    storage.set(STORAGE_KEY, updatedDetails)

    return reorderedDetails
  },

  /**
   * Get quote detail statistics
   */
  async getStatistics(quoteId: string): Promise<{
    lineCount: number
    totalQuantity: number
    totalBeforeDiscount: number
    totalDiscount: number
    totalTax: number
    totalAmount: number
  }> {
    await delay(200)

    const details = initializeQuoteDetails()
    const quoteDetails = details.filter((d) => d.quoteid === quoteId)

    const lineCount = quoteDetails.length
    const totalQuantity = quoteDetails.reduce(
      (sum, d) => sum + d.quantity,
      0
    )
    const totalBeforeDiscount = quoteDetails.reduce(
      (sum, d) => sum + d.baseamount,
      0
    )
    const totalDiscount = quoteDetails.reduce(
      (sum, d) => sum + (d.manualdiscountamount || 0),
      0
    )
    const totalTax = quoteDetails.reduce(
      (sum, d) => sum + (d.tax || 0),
      0
    )
    const totalAmount = quoteDetails.reduce(
      (sum, d) => sum + d.extendedamount,
      0
    )

    return {
      lineCount,
      totalQuantity,
      totalBeforeDiscount,
      totalDiscount,
      totalTax,
      totalAmount,
    }
  },

  /**
   * Clone quote details from one quote to another
   *
   * Copia todas las líneas de producto de un Quote a otro
   * Útil para Quote Clone functionality
   */
  async cloneQuoteLines(
    sourceQuoteId: string,
    targetQuoteId: string
  ): Promise<QuoteDetail[]> {
    await delay(500)

    const details = initializeQuoteDetails()
    const sourceLines = details.filter((d) => d.quoteid === sourceQuoteId)

    if (sourceLines.length === 0) {
      return []
    }

    // Crear DTOs para bulk create
    const createDtos: CreateQuoteDetailDto[] = sourceLines.map((line) => ({
      quoteid: targetQuoteId,
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount,
      tax: line.tax,
    }))

    // Usar bulkCreate para crear todas las líneas
    return await this.bulkCreate(createDtos)
  },
}
