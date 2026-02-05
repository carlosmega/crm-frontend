import type { Order, CreateOrderDto, UpdateOrderDto, FulfillOrderDto } from '@/core/contracts/entities/order'
import { OrderStateCode } from '@/core/contracts/enums'
import { storage } from '@/lib/storage'
import { orderDetailService } from './order-detail-service'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'
import { mockOrders } from '../data/mock-orders'

/**
 * Order Service
 *
 * Servicio para gestión de Orders (Sales Orders / Pedidos)
 * Mock implementation con localStorage
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

const STORAGE_KEY = 'crm_orders'

// Helper: Get all orders from storage
function getAllOrders(): Order[] {
  const stored = storage.get<Order[]>(STORAGE_KEY)
  if (!stored) {
    // Inicializar con mock data
    storage.set(STORAGE_KEY, mockOrders)
    return mockOrders
  }
  return stored
}

// Helper: Save orders to storage
function saveOrders(orders: Order[]): void {
  storage.set(STORAGE_KEY, orders)
}

// Helper: Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ORD-${timestamp}-${random}`
}

export const orderServiceMock = {
  /**
   * Get all orders
   */
  async getAll(): Promise<Order[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return getAllOrders()
  },

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const orders = getAllOrders()
    return orders.find((o) => o.salesorderid === id) || null
  },

  /**
   * Get orders by state
   */
  async getByState(statecode: OrderStateCode): Promise<Order[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const orders = getAllOrders()
    return orders.filter((o) => o.statecode === statecode)
  },

  /**
   * Get orders by quote
   */
  async getByQuote(quoteId: string): Promise<Order[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const orders = getAllOrders()
    return orders.filter((o) => o.quoteid === quoteId)
  },

  /**
   * Get orders by opportunity
   */
  async getByOpportunity(opportunityId: string): Promise<Order[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const orders = getAllOrders()
    return orders.filter((o) => o.opportunityid === opportunityId)
  },

  /**
   * Get orders by customer
   */
  async getByCustomer(customerId: string): Promise<Order[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const orders = getAllOrders()
    return orders.filter((o) => o.customerid === customerId)
  },

  /**
   * Create order
   */
  async create(dto: CreateOrderDto): Promise<Order> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const newOrder: Order = {
      salesorderid: `order-${Date.now()}`,
      ordernumber: generateOrderNumber(),
      statecode: OrderStateCode.Active,
      name: dto.name,
      quoteid: dto.quoteid,
      opportunityid: dto.opportunityid,
      customerid: dto.customerid,
      customeridtype: dto.customeridtype,
      ownerid: dto.ownerid,
      totalamount: 0, // Will be calculated from order lines
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const orders = getAllOrders()
    orders.push(newOrder)
    saveOrders(orders)

    return newOrder
  },

  /**
   * Update order
   */
  async update(id: string, dto: UpdateOrderDto): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const orders = getAllOrders()
    const index = orders.findIndex((o) => o.salesorderid === id)

    if (index === -1) {
      return null
    }

    orders[index] = {
      ...orders[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    saveOrders(orders)
    return orders[index]
  },

  /**
   * Submit order
   */
  async submit(id: string): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const orders = getAllOrders()
    const index = orders.findIndex((o) => o.salesorderid === id)

    if (index === -1) {
      return null
    }

    // Validate: Can only submit Active orders
    if (orders[index].statecode !== OrderStateCode.Active) {
      throw new Error('Only Active orders can be submitted')
    }

    orders[index] = {
      ...orders[index],
      statecode: OrderStateCode.Submitted,
      submitdate: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    saveOrders(orders)
    return orders[index]
  },

  /**
   * Fulfill order
   */
  async fulfill(id: string, dto: FulfillOrderDto): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const orders = getAllOrders()
    const index = orders.findIndex((o) => o.salesorderid === id)

    if (index === -1) {
      return null
    }

    // Validate: Can only fulfill Submitted orders
    if (orders[index].statecode !== OrderStateCode.Submitted) {
      throw new Error('Only Submitted orders can be fulfilled')
    }

    orders[index] = {
      ...orders[index],
      statecode: OrderStateCode.Fulfilled,
      datefulfilled: dto.datefulfilled,
      modifiedon: new Date().toISOString(),
    }

    saveOrders(orders)
    return orders[index]
  },

  /**
   * Cancel order
   */
  async cancel(id: string, reason?: string): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const orders = getAllOrders()
    const index = orders.findIndex((o) => o.salesorderid === id)

    if (index === -1) {
      return null
    }

    // Validate: Cannot cancel Fulfilled or Invoiced orders
    if (
      orders[index].statecode === OrderStateCode.Fulfilled ||
      orders[index].statecode === OrderStateCode.Invoiced
    ) {
      throw new Error('Cannot cancel Fulfilled or Invoiced orders')
    }

    orders[index] = {
      ...orders[index],
      statecode: OrderStateCode.Canceled,
      description: reason
        ? `${orders[index].description || ''}\nCancellation reason: ${reason}`.trim()
        : orders[index].description,
      modifiedon: new Date().toISOString(),
    }

    saveOrders(orders)
    return orders[index]
  },

  /**
   * Delete order
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.READ)

    const orders = getAllOrders()
    const filteredOrders = orders.filter((o) => o.salesorderid !== id)

    if (filteredOrders.length === orders.length) {
      return false
    }

    saveOrders(filteredOrders)
    return true
  },

  /**
   * Update order totals (called when order lines change)
   */
  async updateTotals(orderId: string, totals: {
    totalamount: number
    totaltax?: number
    discountamount?: number
  }): Promise<Order | null> {
    await mockDelay(MOCK_DELAYS.READ)

    const orders = getAllOrders()
    const index = orders.findIndex((o) => o.salesorderid === orderId)

    if (index === -1) {
      return null
    }

    orders[index] = {
      ...orders[index],
      ...totals,
      modifiedon: new Date().toISOString(),
    }

    saveOrders(orders)
    return orders[index]
  },

  /**
   * Create order from quote (Quote-to-Cash flow)
   *
   * Esta es la función principal para generar Orders desde Quotes Won
   *
   * Shipping info priority:
   * 1. Quote shipping fields (if available)
   * 2. Account address (if customer is account)
   * 3. Contact address (if customer is contact)
   *
   * @param quoteId - ID de la quote desde la cual crear la orden
   * @returns Order creada
   */
  async createFromQuote(quoteId: string): Promise<Order> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    // 1. Fetch quote data from storage
    const { quoteService } = await import('../../quotes/api/quote-service')
    const quote = await quoteService.getById(quoteId)

    if (!quote) {
      throw new Error(`Quote with ID ${quoteId} not found`)
    }

    // 2. Fetch quote lines
    const { quoteDetailService } = await import('../../quotes/api/quote-detail-service')
    const quoteLines = await quoteDetailService.getByQuote(quoteId)

    // 3. Get shipping info from quote, or fallback to customer (Account/Contact)
    let shippingInfo = {
      shipto_name: quote.shipto_name,
      shipto_line1: quote.shipto_line1,
      shipto_line2: quote.shipto_line2,
      shipto_city: quote.shipto_city,
      shipto_stateorprovince: quote.shipto_stateorprovince,
      shipto_postalcode: quote.shipto_postalcode,
      shipto_country: quote.shipto_country,
    }

    // If quote has no shipping, get from customer
    const hasQuoteShipping = shippingInfo.shipto_line1 || shippingInfo.shipto_city
    if (!hasQuoteShipping && quote.customerid) {
      if (quote.customeridtype === 'account') {
        const { accountService } = await import('../../accounts/api/account-service')
        const account = await accountService.getById(quote.customerid)
        if (account) {
          shippingInfo = {
            shipto_name: account.name,
            shipto_line1: account.address1_line1,
            shipto_line2: account.address1_line2,
            shipto_city: account.address1_city,
            shipto_stateorprovince: account.address1_stateorprovince,
            shipto_postalcode: account.address1_postalcode,
            shipto_country: account.address1_country,
          }
        }
      } else {
        const { contactService } = await import('../../contacts/api/contact-service')
        const contact = await contactService.getById(quote.customerid)
        if (contact) {
          shippingInfo = {
            shipto_name: contact.fullname || `${contact.firstname} ${contact.lastname}`,
            shipto_line1: contact.address1_line1,
            shipto_line2: contact.address1_line2,
            shipto_city: contact.address1_city,
            shipto_stateorprovince: contact.address1_stateorprovince,
            shipto_postalcode: contact.address1_postalcode,
            shipto_country: contact.address1_country,
          }
        }
      }
    }

    // 4. Create Order from Quote data
    const newOrder: Order = {
      salesorderid: `order-${Date.now()}`,
      ordernumber: generateOrderNumber(),
      statecode: OrderStateCode.Active,
      name: quote.name,
      quoteid: quote.quoteid,
      opportunityid: quote.opportunityid,
      customerid: quote.customerid,
      customeridtype: quote.customeridtype,
      ownerid: quote.ownerid,
      totalamount: quote.totalamount || 0,
      totaltax: quote.totaltax,
      discountamount: quote.discountamount,
      ...shippingInfo,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const orders = getAllOrders()
    orders.push(newOrder)
    saveOrders(orders)

    // 5. Copy Quote Lines to Order Lines
    if (quoteLines && quoteLines.length > 0) {
      const quoteLineData = quoteLines.map(line => ({
        productid: line.productid,
        productdescription: line.productdescription,
        quantity: line.quantity,
        priceperunit: line.priceperunit,
        manualdiscountamount: line.manualdiscountamount,
        tax: line.tax,
      }))

      await orderDetailService.copyFromQuoteLines(
        newOrder.salesorderid,
        quoteLineData
      )
    }

    return newOrder
  },

  /**
   * Get order statistics
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    submitted: number
    fulfilled: number
    invoiced: number
    canceled: number
    totalValue: number
    averageValue: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const orders = getAllOrders()

    const active = orders.filter((o) => o.statecode === OrderStateCode.Active).length
    const submitted = orders.filter((o) => o.statecode === OrderStateCode.Submitted).length
    const fulfilled = orders.filter((o) => o.statecode === OrderStateCode.Fulfilled).length
    const invoiced = orders.filter((o) => o.statecode === OrderStateCode.Invoiced).length
    const canceled = orders.filter((o) => o.statecode === OrderStateCode.Canceled).length

    const totalValue = orders
      .filter((o) => o.statecode !== OrderStateCode.Canceled)
      .reduce((sum, o) => sum + o.totalamount, 0)

    const activeOrders = orders.filter((o) => o.statecode !== OrderStateCode.Canceled)
    const averageValue = activeOrders.length > 0 ? totalValue / activeOrders.length : 0

    return {
      total: orders.length,
      active,
      submitted,
      fulfilled,
      invoiced,
      canceled,
      totalValue,
      averageValue,
    }
  },
}
