import type {
  InvoiceDetail,
  CreateInvoiceDetailDto,
  UpdateInvoiceDetailDto,
} from '@/core/contracts/entities/invoice-detail'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'
import { mockInvoiceDetails } from '../data/mock-invoices'

/**
 * Invoice Detail Service - Mock Implementation
 *
 * Servicio para gestión de Invoice Lines (Líneas de factura)
 * Mock implementation con localStorage
 *
 * ✅ CRÍTICO: copyFromOrderLines() copia Order Lines → Invoice Lines
 * ✅ Actualiza totales del Invoice automáticamente
 */

const STORAGE_KEY = 'crm_invoice_details'

// Helper: Get all invoice details from storage
function getAllInvoiceDetails(): InvoiceDetail[] {
  const stored = storage.get<InvoiceDetail[]>(STORAGE_KEY)
  if (!stored) {
    // Inicializar con mock data
    storage.set(STORAGE_KEY, mockInvoiceDetails)
    return mockInvoiceDetails
  }
  return stored
}

// Helper: Save invoice details to storage
function saveInvoiceDetails(details: InvoiceDetail[]): void {
  storage.set(STORAGE_KEY, details)
}

// Helper: Calculate extended amount for a line
function calculateExtendedAmount(
  quantity: number,
  pricePerUnit: number,
  manualDiscount: number = 0,
  volumeDiscount: number = 0,
  tax: number = 0
): number {
  const baseAmount = quantity * pricePerUnit
  const totalDiscount = manualDiscount + volumeDiscount
  const amountAfterDiscount = baseAmount - totalDiscount
  return amountAfterDiscount + tax
}

// Helper: Calculate invoice totals from lines
async function updateInvoiceTotals(invoiceId: string): Promise<void> {
  const lines = getAllInvoiceDetails().filter((d) => d.invoiceid === invoiceId)

  const totalLineItems = lines.reduce(
    (sum, line) => sum + (line.baseamount || 0),
    0
  )
  const totalDiscount = lines.reduce(
    (sum, line) =>
      sum + (line.manualdiscountamount || 0) + (line.volumediscountamount || 0),
    0
  )
  const totalTax = lines.reduce((sum, line) => sum + (line.tax || 0), 0)
  const totalAmount = lines.reduce((sum, line) => sum + line.extendedamount, 0)

  const { invoiceService } = await import('./invoice-service')
  await invoiceService.updateTotals(invoiceId, {
    totalamount: totalAmount,
    totalamountlessfreight: totalLineItems,
    discountamount: totalDiscount,
    totaltax: totalTax,
  })
}

export const invoiceDetailServiceMock = {
  /**
   * Get invoice lines by invoice ID
   */
  async getByInvoice(invoiceId: string): Promise<InvoiceDetail[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const details = getAllInvoiceDetails()
    return details
      .filter((d) => d.invoiceid === invoiceId)
      .sort((a, b) => (a.lineitemnumber || 0) - (b.lineitemnumber || 0))
  },

  /**
   * Get invoice line by ID
   */
  async getById(id: string): Promise<InvoiceDetail | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const details = getAllInvoiceDetails()
    return details.find((d) => d.invoicedetailid === id) || null
  },

  /**
   * Create invoice line
   */
  async create(dto: CreateInvoiceDetailDto): Promise<InvoiceDetail> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const baseAmount = dto.quantity * dto.priceperunit
    const extendedAmount = calculateExtendedAmount(
      dto.quantity,
      dto.priceperunit,
      dto.manualdiscountamount,
      0, // volumediscountamount not in DTO
      dto.tax
    )

    const newDetail: InvoiceDetail = {
      invoicedetailid: `invoicedetail-${Date.now()}`,
      invoiceid: dto.invoiceid,
      productid: dto.productid,
      salesorderdetailid: undefined,
      uomid: undefined,
      lineitemnumber: undefined,
      productdescription: dto.productdescription || '',
      isproductoverridden: false,
      quantity: dto.quantity,
      priceperunit: dto.priceperunit,
      baseamount: baseAmount,
      manualdiscountamount: dto.manualdiscountamount || 0,
      volumediscountamount: 0,
      tax: dto.tax || 0,
      extendedamount: extendedAmount,
      quantityshipped: undefined,
      shippingtrackingnumber: undefined,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const details = getAllInvoiceDetails()
    details.push(newDetail)
    saveInvoiceDetails(details)

    // Update invoice totals
    await updateInvoiceTotals(dto.invoiceid)

    return newDetail
  },

  /**
   * 🔥 CRÍTICO: Copy Order Lines → Invoice Lines
   *
   * Copia todas las líneas de Order a Invoice automáticamente
   * Usado en createFromOrder()
   */
  async copyFromOrderLines(
    invoiceId: string,
    orderLines: OrderDetail[]
  ): Promise<InvoiceDetail[]> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    const invoiceLines: InvoiceDetail[] = []

    for (const orderLine of orderLines) {
      const invoiceLine: InvoiceDetail = {
        invoicedetailid: `invoicedetail-${Date.now()}-${orderLine.salesorderdetailid}`,
        invoiceid: invoiceId,

        // Producto
        productid: orderLine.productid,
        uomid: orderLine.uomid,
        productdescription: orderLine.productdescription,
        isproductoverridden: orderLine.isproductoverridden,

        // Relación con Order Line
        salesorderdetailid: orderLine.salesorderdetailid, // ✅ Vincular a Order Line

        // Pricing (copiado exacto)
        quantity: orderLine.quantity,
        priceperunit: orderLine.priceperunit,
        baseamount: orderLine.baseamount,
        manualdiscountamount: orderLine.manualdiscountamount,
        volumediscountamount: orderLine.volumediscountamount,
        tax: orderLine.tax,
        extendedamount: orderLine.extendedamount,

        // Line number
        lineitemnumber: orderLine.lineitemnumber,

        // Shipping info (not in OrderDetail)
        quantityshipped: undefined,
        shippingtrackingnumber: undefined,

        // Audit
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }

      invoiceLines.push(invoiceLine)
    }

    // Guardar todas las líneas
    const details = getAllInvoiceDetails()
    details.push(...invoiceLines)
    saveInvoiceDetails(details)

    // Actualizar totales del Invoice
    await updateInvoiceTotals(invoiceId)

    return invoiceLines
  },

  /**
   * Bulk create invoice lines
   */
  async bulkCreate(dtos: CreateInvoiceDetailDto[]): Promise<InvoiceDetail[]> {
    await mockDelay(MOCK_DELAYS.COMPLEX)

    const newDetails: InvoiceDetail[] = []

    for (const dto of dtos) {
      const detail = await this.create(dto)
      newDetails.push(detail)
    }

    return newDetails
  },

  /**
   * Update invoice line
   */
  async update(
    id: string,
    dto: UpdateInvoiceDetailDto
  ): Promise<InvoiceDetail | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const details = getAllInvoiceDetails()
    const index = details.findIndex((d) => d.invoicedetailid === id)

    if (index === -1) {
      return null
    }

    const existingDetail = details[index]

    // Recalcular amounts si cambió quantity
    const quantity = dto.quantity ?? existingDetail.quantity
    const pricePerUnit = existingDetail.priceperunit
    const manualDiscount = existingDetail.manualdiscountamount ?? 0
    const volumeDiscount = existingDetail.volumediscountamount ?? 0
    const tax = existingDetail.tax ?? 0

    const baseAmount = quantity * pricePerUnit
    const extendedAmount = calculateExtendedAmount(
      quantity,
      pricePerUnit,
      manualDiscount,
      volumeDiscount,
      tax
    )

    details[index] = {
      ...existingDetail,
      quantity,
      shippingtrackingnumber: dto.shippingtrackingnumber ?? existingDetail.shippingtrackingnumber,
      baseamount: baseAmount,
      extendedamount: extendedAmount,
      modifiedon: new Date().toISOString(),
    }

    saveInvoiceDetails(details)

    // Update invoice totals
    await updateInvoiceTotals(existingDetail.invoiceid)

    return details[index]
  },

  /**
   * Delete invoice line
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const details = getAllInvoiceDetails()
    const detail = details.find((d) => d.invoicedetailid === id)

    if (!detail) {
      return false
    }

    const filtered = details.filter((d) => d.invoicedetailid !== id)
    saveInvoiceDetails(filtered)

    // Update invoice totals
    await updateInvoiceTotals(detail.invoiceid)

    return true
  },

  /**
   * Get statistics for invoice lines (debe coincidir con backend)
   */
  async getStatistics(invoiceId: string): Promise<{
    totalLines: number
    totalQuantity: number
    totalBeforeDiscount: number
    totalDiscount: number
    totalTax: number
    totalAmount: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const lines = await this.getByInvoice(invoiceId)

    return {
      totalLines: lines.length,
      totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
      totalBeforeDiscount: lines.reduce((sum, line) => sum + (line.baseamount || 0), 0),
      totalDiscount: lines.reduce(
        (sum, line) =>
          sum +
          (line.manualdiscountamount || 0) +
          (line.volumediscountamount || 0),
        0
      ),
      totalTax: lines.reduce((sum, line) => sum + (line.tax || 0), 0),
      totalAmount: lines.reduce((sum, line) => sum + line.extendedamount, 0),
    }
  },
}
