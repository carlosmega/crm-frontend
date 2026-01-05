import type { OrderDetail, CreateOrderDetailDto, UpdateOrderDetailDto } from '@/core/contracts/entities/order-detail'
import { storage } from '@/lib/storage'
import { orderService } from './order-service'

/**
 * Order Detail Service
 *
 * Servicio para gestión de Order Details (líneas de productos en Orders)
 * Mock implementation con localStorage
 */

const STORAGE_KEY = 'crm_order_details'

// Helper: Get all order details from storage
function getAllOrderDetails(): OrderDetail[] {
  return storage.get<OrderDetail[]>(STORAGE_KEY) || []
}

// Helper: Save order details to storage
function saveOrderDetails(details: OrderDetail[]): void {
  storage.set(STORAGE_KEY, details)
}

// Helper: Calculate extended amount for a line
function calculateExtendedAmount(
  quantity: number,
  priceperunit: number,
  manualdiscountamount = 0,
  volumediscountamount = 0,
  tax = 0
): number {
  const baseAmount = quantity * priceperunit
  const totalDiscount = manualdiscountamount + volumediscountamount
  const afterDiscount = baseAmount - totalDiscount
  return afterDiscount + tax
}

// Helper: Update order totals after line changes
async function updateOrderTotals(orderId: string): Promise<void> {
  const details = getAllOrderDetails().filter(d => d.salesorderid === orderId)

  const totalamount = details.reduce((sum, d) => sum + d.extendedamount, 0)
  const totaltax = details.reduce((sum, d) => sum + (d.tax || 0), 0)
  const discountamount = details.reduce(
    (sum, d) => sum + (d.manualdiscountamount || 0) + (d.volumediscountamount || 0),
    0
  )

  await orderService.updateTotals(orderId, {
    totalamount,
    totaltax,
    discountamount,
  })
}

export const orderDetailServiceMock = {
  /**
   * Get all order details for an order
   */
  async getByOrder(orderId: string): Promise<OrderDetail[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const details = getAllOrderDetails()
    return details
      .filter((d) => d.salesorderid === orderId)
      .sort((a, b) => (a.lineitemnumber || 0) - (b.lineitemnumber || 0))
  },

  /**
   * Get order detail by ID
   */
  async getById(id: string): Promise<OrderDetail | null> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const details = getAllOrderDetails()
    return details.find((d) => d.salesorderdetailid === id) || null
  },

  /**
   * Create order detail
   */
  async create(dto: CreateOrderDetailDto): Promise<OrderDetail> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Calculate extended amount
    const extendedAmount = calculateExtendedAmount(
      dto.quantity,
      dto.priceperunit,
      dto.manualdiscountamount,
      0, // volumediscountamount calculated by system
      dto.tax
    )

    const baseAmount = dto.quantity * dto.priceperunit

    // Get next line number
    const existingDetails = await this.getByOrder(dto.salesorderid)
    const nextLineNumber = existingDetails.length > 0
      ? Math.max(...existingDetails.map(d => d.lineitemnumber || 0)) + 1
      : 1

    const newDetail: OrderDetail = {
      salesorderdetailid: `orderdetail-${Date.now()}-${Math.random()}`,
      salesorderid: dto.salesorderid,
      productid: dto.productid,
      productdescription: dto.productdescription,
      quantity: dto.quantity,
      priceperunit: dto.priceperunit,
      baseamount: baseAmount,
      manualdiscountamount: dto.manualdiscountamount,
      volumediscountamount: 0,
      tax: dto.tax,
      extendedamount: extendedAmount,
      lineitemnumber: nextLineNumber,
      quantityshipped: 0,
      quantitycancelled: 0,
      quantitybackordered: 0,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const details = getAllOrderDetails()
    details.push(newDetail)
    saveOrderDetails(details)

    // Update order totals
    await updateOrderTotals(dto.salesorderid)

    return newDetail
  },

  /**
   * Update order detail
   */
  async update(id: string, dto: UpdateOrderDetailDto): Promise<OrderDetail | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const details = getAllOrderDetails()
    const index = details.findIndex((d) => d.salesorderdetailid === id)

    if (index === -1) {
      return null
    }

    const existing = details[index]

    // Recalculate extended amount if quantity changed
    let extendedAmount = existing.extendedamount
    if (dto.quantity !== undefined) {
      extendedAmount = calculateExtendedAmount(
        dto.quantity,
        existing.priceperunit,
        existing.manualdiscountamount,
        existing.volumediscountamount,
        existing.tax
      )
    }

    details[index] = {
      ...existing,
      ...dto,
      extendedamount: extendedAmount,
      modifiedon: new Date().toISOString(),
    }

    saveOrderDetails(details)

    // Update order totals
    await updateOrderTotals(existing.salesorderid)

    return details[index]
  },

  /**
   * Delete order detail
   */
  async delete(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 250))

    const details = getAllOrderDetails()
    const detail = details.find((d) => d.salesorderdetailid === id)

    if (!detail) {
      return false
    }

    const filteredDetails = details.filter((d) => d.salesorderdetailid !== id)
    saveOrderDetails(filteredDetails)

    // Update order totals
    await updateOrderTotals(detail.salesorderid)

    return true
  },

  /**
   * Bulk create order details (used when creating order from quote)
   */
  async bulkCreate(dtos: CreateOrderDetailDto[]): Promise<OrderDetail[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const createdDetails: OrderDetail[] = []

    for (const dto of dtos) {
      const detail = await this.create(dto)
      createdDetails.push(detail)
    }

    return createdDetails
  },

  /**
   * Copy quote lines to order lines
   */
  async copyFromQuoteLines(
    orderId: string,
    quoteLines: Array<{
      productid?: string
      productdescription?: string
      quantity: number
      priceperunit: number
      manualdiscountamount?: number
      tax?: number
    }>
  ): Promise<OrderDetail[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const dtos: CreateOrderDetailDto[] = quoteLines.map((line) => ({
      salesorderid: orderId,
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount,
      tax: line.tax,
    }))

    return this.bulkCreate(dtos)
  },

  /**
   * Get order line statistics
   */
  async getStatistics(orderId: string): Promise<{
    totalLines: number
    totalQuantity: number
    totalShipped: number
    totalBackordered: number
    totalCancelled: number
    averageLineValue: number
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const details = await this.getByOrder(orderId)

    const totalLines = details.length
    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0)
    const totalShipped = details.reduce((sum, d) => sum + (d.quantityshipped || 0), 0)
    const totalBackordered = details.reduce((sum, d) => sum + (d.quantitybackordered || 0), 0)
    const totalCancelled = details.reduce((sum, d) => sum + (d.quantitycancelled || 0), 0)
    const totalValue = details.reduce((sum, d) => sum + d.extendedamount, 0)
    const averageLineValue = totalLines > 0 ? totalValue / totalLines : 0

    return {
      totalLines,
      totalQuantity,
      totalShipped,
      totalBackordered,
      totalCancelled,
      averageLineValue,
    }
  },
}
