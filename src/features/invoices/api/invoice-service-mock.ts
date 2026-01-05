import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  MarkInvoicePaidDto,
} from '@/core/contracts/entities/invoice'
import { InvoiceStateCode, OrderStateCode, getPaymentTermsDays } from '@/core/contracts/enums'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'
import { mockInvoices } from '../data/mock-invoices'

/**
 * Invoice Service - Mock Implementation
 *
 * Servicio para gestión de Invoices (Facturas)
 * Mock implementation con localStorage
 *
 * ✅ CRÍTICO: createFromOrder() implementa flujo Order → Invoice
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

const STORAGE_KEY = 'crm_invoices'

// Helper: Get all invoices from storage
function getAllInvoices(): Invoice[] {
  const stored = storage.get<Invoice[]>(STORAGE_KEY)
  if (!stored) {
    // Inicializar con mock data
    storage.set(STORAGE_KEY, mockInvoices)
    return mockInvoices
  }
  return stored
}

// Helper: Save invoices to storage
function saveInvoices(invoices: Invoice[]): void {
  storage.set(STORAGE_KEY, invoices)
}

// Helper: Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `INV-${year}${month}${day}-${random}`
}

// Helper: Calculate due date based on payment terms
function calculateDueDate(paymentTermsCode?: number): string {
  const days = paymentTermsCode ? getPaymentTermsDays(paymentTermsCode) : 30
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + days)
  return dueDate.toISOString().split('T')[0] // YYYY-MM-DD
}

export const invoiceServiceMock = {
  /**
   * Get all invoices
   */
  async getAll(): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return getAllInvoices()
  },

  /**
   * Get invoice by ID
   */
  async getById(id: string): Promise<Invoice | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    return invoices.find((inv) => inv.invoiceid === id) || null
  },

  /**
   * Get invoices by state
   */
  async getByState(statecode: InvoiceStateCode): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    return invoices.filter((inv) => inv.statecode === statecode)
  },

  /**
   * Get invoices by order
   */
  async getByOrder(orderId: string): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    return invoices.filter((inv) => inv.salesorderid === orderId)
  },

  /**
   * Get invoices by opportunity
   */
  async getByOpportunity(opportunityId: string): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    return invoices.filter((inv) => inv.opportunityid === opportunityId)
  },

  /**
   * Get invoices by customer
   */
  async getByCustomer(customerId: string): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    return invoices.filter((inv) => inv.customerid === customerId)
  },

  /**
   * Get overdue invoices
   */
  async getOverdue(): Promise<Invoice[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const invoices = getAllInvoices()
    const today = new Date().toISOString().split('T')[0]

    return invoices.filter(
      (inv) =>
        inv.statecode === InvoiceStateCode.Active &&
        inv.duedate < today
    )
  },

  /**
   * Create invoice (manual creation)
   */
  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const newInvoice: Invoice = {
      invoiceid: `invoice-${Date.now()}`,
      invoicenumber: generateInvoiceNumber(),
      statecode: InvoiceStateCode.Active,
      name: dto.name,
      description: undefined,
      salesorderid: dto.salesorderid,
      opportunityid: dto.opportunityid,
      customerid: dto.customerid,
      customeridtype: dto.customeridtype,
      ownerid: dto.ownerid,
      totalamount: 0, // Will be calculated from invoice lines
      totalpaid: 0,
      totalbalance: 0,
      duedate: dto.duedate,
      paymenttermscode: undefined,
      prioritycode: undefined,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const invoices = getAllInvoices()
    invoices.push(newInvoice)
    saveInvoices(invoices)

    return newInvoice
  },

  /**
   * 🔥 CRÍTICO: Create invoice from Order (Quote-to-Cash flow)
   *
   * Genera Invoice automáticamente desde Order Fulfilled
   * Copia datos de Order y vincula con Order Lines
   *
   * @param orderId - ID de la orden desde la cual crear la factura
   * @returns Invoice creada
   */
  async createFromOrder(orderId: string): Promise<Invoice> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    // 1. Fetch order data from storage
    const { orderService } = await import('../../orders/api/order-service')
    const order = await orderService.getById(orderId)

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`)
    }

    // Validación: Order debe estar Fulfilled
    if (order.statecode !== OrderStateCode.Fulfilled) {
      throw new Error('Cannot create invoice from order that is not fulfilled')
    }

    // 2. Fetch order lines
    const { orderDetailService } = await import('../../orders/api/order-detail-service')
    const orderLines = await orderDetailService.getByOrder(orderId)

    // Validación: Order debe tener líneas
    if (!orderLines || orderLines.length === 0) {
      throw new Error('Cannot create invoice from order without lines')
    }

    // Calcular due date desde payment terms del Order
    const dueDate = calculateDueDate(order.paymenttermscode)

    const newInvoice: Invoice = {
      invoiceid: `invoice-${Date.now()}`,
      invoicenumber: generateInvoiceNumber(),
      statecode: InvoiceStateCode.Active, // Active = pendiente de pago
      name: `Invoice for ${order.name}`,
      description: order.description,

      // Relaciones
      salesorderid: order.salesorderid, // ✅ Vincular a Order
      opportunityid: order.opportunityid,
      customerid: order.customerid,
      customeridtype: order.customeridtype,
      ownerid: order.ownerid,

      // Pricing (copiado desde Order)
      totalamount: order.totalamount,
      totalamountlessfreight: order.totalamountlessfreight,
      freightamount: order.freightamount,
      discountamount: order.discountamount,
      discountpercentage: order.discountpercentage,
      totaltax: order.totaltax,

      // Payment tracking
      totalpaid: 0, // No pagado aún
      totalbalance: order.totalamount, // Balance = total

      // Fechas
      duedate: dueDate,
      datedelivered: order.datefulfilled, // Fecha de entrega = fecha fulfilled

      // Payment terms
      paymenttermscode: order.paymenttermscode,
      prioritycode: order.prioritycode,

      // Billing address (copiado desde Order)
      billto_name: order.billto_name,
      billto_line1: order.billto_line1,
      billto_line2: order.billto_line2,
      billto_city: order.billto_city,
      billto_stateorprovince: order.billto_stateorprovince,
      billto_postalcode: order.billto_postalcode,
      billto_country: order.billto_country,

      // Shipping address (informativo)
      shipto_name: order.shipto_name,
      shipto_line1: order.shipto_line1,
      shipto_line2: order.shipto_line2,
      shipto_city: order.shipto_city,
      shipto_stateorprovince: order.shipto_stateorprovince,
      shipto_postalcode: order.shipto_postalcode,
      shipto_country: order.shipto_country,

      // Audit
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
      createdby: order.ownerid,
    }

    const invoices = getAllInvoices()
    invoices.push(newInvoice)
    saveInvoices(invoices)

    return newInvoice
  },

  /**
   * Update invoice (solo si Active)
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const invoices = getAllInvoices()
    const index = invoices.findIndex((inv) => inv.invoiceid === id)

    if (index === -1) {
      return null
    }

    const invoice = invoices[index]

    // Validación: Solo Active invoices pueden editarse
    if (invoice.statecode !== InvoiceStateCode.Active) {
      throw new Error('Cannot update invoice that is not active')
    }

    invoices[index] = {
      ...invoice,
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    saveInvoices(invoices)
    return invoices[index]
  },

  /**
   * Update invoice totals (called by invoice-detail-service)
   */
  async updateTotals(
    id: string,
    totals: {
      totalamount: number
      totalamountlessfreight?: number
      freightamount?: number
      discountamount?: number
      totaltax?: number
    }
  ): Promise<Invoice | null> {
    await mockDelay(MOCK_DELAYS.READ)

    const invoices = getAllInvoices()
    const index = invoices.findIndex((inv) => inv.invoiceid === id)

    if (index === -1) {
      return null
    }

    const invoice = invoices[index]

    // Actualizar totales y balance
    const newTotalAmount = totals.totalamount
    const paid = invoice.totalpaid || 0

    invoices[index] = {
      ...invoice,
      ...totals,
      totalbalance: newTotalAmount - paid, // Recalcular balance
      modifiedon: new Date().toISOString(),
    }

    saveInvoices(invoices)
    return invoices[index]
  },

  /**
   * 🔥 CRÍTICO: Mark invoice as paid (debe coincidir con backend)
   *
   * Atajo para pagar el balance completo de la factura
   *
   * @param id - ID de la factura
   * @param paymentdate - Fecha del pago (opcional)
   * @returns Factura marcada como pagada
   */
  async markAsPaid(
    id: string,
    paymentdate?: string
  ): Promise<Invoice | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const invoices = getAllInvoices()
    const index = invoices.findIndex((inv) => inv.invoiceid === id)

    if (index === -1) {
      return null
    }

    const invoice = invoices[index]

    // Validación: Solo Active/Closed invoices pueden marcarse como pagadas
    if (
      invoice.statecode !== InvoiceStateCode.Active &&
      invoice.statecode !== InvoiceStateCode.Closed
    ) {
      throw new Error('Cannot mark invoice as paid - invalid state')
    }

    // Pagar el balance completo
    const newTotalPaid = invoice.totalamount
    const newBalance = 0

    invoices[index] = {
      ...invoice,
      statecode: InvoiceStateCode.Paid,
      totalpaid: newTotalPaid,
      totalbalance: newBalance,
      modifiedon: new Date().toISOString(),
    }

    saveInvoices(invoices)
    return invoices[index]
  },

  /**
   * Cancel invoice
   */
  async cancel(id: string, reason?: string): Promise<Invoice | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const invoices = getAllInvoices()
    const index = invoices.findIndex((inv) => inv.invoiceid === id)

    if (index === -1) {
      return null
    }

    const invoice = invoices[index]

    // Validación: Solo Active/Closed invoices pueden cancelarse
    if (invoice.statecode === InvoiceStateCode.Paid) {
      throw new Error('Cannot cancel paid invoice')
    }

    invoices[index] = {
      ...invoice,
      statecode: InvoiceStateCode.Canceled,
      description: invoice.description
        ? `${invoice.description}\n\nCanceled: ${reason || 'No reason provided'}`
        : `Canceled: ${reason || 'No reason provided'}`,
      modifiedon: new Date().toISOString(),
    }

    saveInvoices(invoices)
    return invoices[index]
  },

  /**
   * Delete invoice (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const invoices = getAllInvoices()
    const index = invoices.findIndex((inv) => inv.invoiceid === id)

    if (index === -1) {
      return false
    }

    // Soft delete: cambiar a Canceled
    return (await this.cancel(id, 'Deleted by user')) !== null
  },

  /**
   * Hard delete invoice (remove from storage)
   */
  async hardDelete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const invoices = getAllInvoices()
    const filtered = invoices.filter((inv) => inv.invoiceid !== id)

    if (filtered.length === invoices.length) {
      return false // Not found
    }

    saveInvoices(filtered)
    return true
  },

  /**
   * Get statistics (debe coincidir con backend)
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    paid: number
    canceled: number
    overdue: number
    totalAmount: number
    totalPaid: number
    totalDue: number
    averageValue: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const invoices = getAllInvoices()
    const today = new Date().toISOString().split('T')[0]

    const active = invoices.filter((inv) => inv.statecode === InvoiceStateCode.Active)
    const paid = invoices.filter((inv) => inv.statecode === InvoiceStateCode.Paid)
    const overdue = invoices.filter(
      (inv) =>
        inv.statecode === InvoiceStateCode.Active &&
        inv.duedate < today
    )
    const canceled = invoices.filter((inv) => inv.statecode === InvoiceStateCode.Canceled)

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalamount, 0)
    const totalPaid = paid.reduce((sum, inv) => sum + inv.totalamount, 0)
    const totalDue = active.reduce((sum, inv) => sum + (inv.totalbalance || inv.totalamount), 0)

    return {
      total: invoices.length,
      active: active.length,
      paid: paid.length,
      canceled: canceled.length,
      overdue: overdue.length,
      totalAmount,
      totalPaid,
      totalDue,
      averageValue: paid.length > 0 ? totalPaid / paid.length : 0,
    }
  },
}
