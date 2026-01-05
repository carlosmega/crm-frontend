/**
 * Invoice Detail Service - Backend Implementation
 *
 * Implementación del servicio de invoice details usando Django REST API
 * Maneja las líneas de productos (Invoice Lines) de una factura
 */

import apiClient from '@/core/api/client'
import type {
  InvoiceDetail,
  CreateInvoiceDetailDto,
  UpdateInvoiceDetailDto,
} from '@/core/contracts/entities/invoice-detail'

/**
 * Invoice Detail Service Backend
 *
 * IMPORTANTE: El backend Django calcula los totales automáticamente
 * cuando se agregan/actualizan/eliminan líneas
 */
class InvoiceDetailServiceBackend {
  private readonly basePath = '/invoices'

  /**
   * Obtener todas las líneas de una factura
   *
   * @param invoiceId - ID de la factura
   * @returns Lista de invoice lines
   */
  async getByInvoice(invoiceId: string): Promise<InvoiceDetail[]> {
    try {
      const response = await apiClient.get<InvoiceDetail[]>(
        `${this.basePath}/${invoiceId}/details`
      )

      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return []
      }
      throw error
    }
  }

  /**
   * Obtener una invoice line por ID
   *
   * @param id - ID de la invoice line
   * @returns Invoice line o null si no existe
   */
  async getById(id: string): Promise<InvoiceDetail | null> {
    try {
      const response = await apiClient.get<InvoiceDetail>(
        `${this.basePath}/details/${id}`
      )

      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Crear nueva línea de producto en la factura
   *
   * El backend calcula automáticamente:
   * - baseamount
   * - extendedamount
   * - totales de la Invoice
   *
   * @param dto - Datos de la línea de producto
   * @returns Invoice line creada
   */
  async create(dto: CreateInvoiceDetailDto): Promise<InvoiceDetail> {
    const response = await apiClient.post<InvoiceDetail>(
      `${this.basePath}/${dto.invoiceid}/details`,
      {
        productname: dto.productid,
        productdescription: dto.productdescription,
        quantity: dto.quantity.toString(),
        priceperunit: dto.priceperunit.toString(),
        tax: dto.tax?.toString() || '0',
        manualdiscountamount: dto.manualdiscountamount?.toString() || '0',
      }
    )

    return response.data
  }

  /**
   * Actualizar línea de producto existente
   *
   * El backend recalcula automáticamente:
   * - baseamount
   * - extendedamount
   * - totales de la Invoice
   *
   * @param id - ID de la invoice line
   * @param dto - Campos a actualizar
   * @returns Invoice line actualizada
   */
  async update(
    id: string,
    dto: UpdateInvoiceDetailDto
  ): Promise<InvoiceDetail | null> {
    try {
      const response = await apiClient.patch<InvoiceDetail>(
        `${this.basePath}/details/${id}`,
        dto
      )

      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Eliminar línea de producto
   *
   * El backend recalcula automáticamente los totales de la Invoice
   *
   * @param id - ID de la invoice line
   * @returns true si se eliminó
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/details/${id}`)
      return true
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Crear múltiples líneas a la vez
   *
   * @param dtos - Lista de líneas a crear
   * @returns Lista de invoice lines creadas
   */
  async bulkCreate(dtos: CreateInvoiceDetailDto[]): Promise<InvoiceDetail[]> {
    if (dtos.length === 0) return []

    // Crear todas las líneas en paralelo
    const promises = dtos.map((dto) => this.create(dto))
    const results = await Promise.all(promises)

    return results
  }

  /**
   * Eliminar todas las líneas de una factura
   *
   * @param invoiceId - ID de la factura
   * @returns Número de líneas eliminadas
   */
  async deleteByInvoice(invoiceId: string): Promise<number> {
    // Obtener todas las líneas de la invoice
    const details = await this.getByInvoice(invoiceId)

    // Eliminar todas en paralelo
    const promises = details.map((detail) => this.delete(detail.invoicedetailid))
    const results = await Promise.all(promises)

    // Contar cuántas se eliminaron exitosamente
    return results.filter((success) => success).length
  }

  /**
   * Copiar líneas de order a invoice
   *
   * Se usa cuando se crea una Invoice desde una Order
   *
   * @param invoiceId - ID de la factura
   * @param orderLines - Líneas de la orden
   * @returns Líneas de factura creadas
   */
  async copyFromOrderLines(
    invoiceId: string,
    orderLines: Array<{
      productid?: string
      productdescription?: string
      quantity: number
      priceperunit: number
      manualdiscountamount?: number
      tax?: number
    }>
  ): Promise<InvoiceDetail[]> {
    // Convertir order lines a DTOs de invoice details
    const dtos: CreateInvoiceDetailDto[] = orderLines.map((line) => ({
      invoiceid: invoiceId,
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount,
      tax: line.tax,
    }))

    // Crear todas las líneas usando bulkCreate
    return this.bulkCreate(dtos)
  }

  /**
   * Obtener estadísticas de invoice lines
   *
   * Calcula estadísticas en el frontend (debe coincidir con mock)
   *
   * @param invoiceId - ID de la factura
   * @returns Estadísticas de las líneas
   */
  async getStatistics(invoiceId: string): Promise<{
    totalLines: number
    totalQuantity: number
    totalBeforeDiscount: number
    totalDiscount: number
    totalTax: number
    totalAmount: number
  }> {
    const details = await this.getByInvoice(invoiceId)

    const totalLines = details.length
    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0)
    const totalBeforeDiscount = details.reduce(
      (sum, d) => sum + d.baseamount,
      0
    )
    const totalDiscount = details.reduce(
      (sum, d) => sum + (d.manualdiscountamount || 0) + (d.volumediscountamount || 0),
      0
    )
    const totalTax = details.reduce((sum, d) => sum + (d.tax || 0), 0)
    const totalAmount = details.reduce((sum, d) => sum + d.extendedamount, 0)

    return {
      totalLines,
      totalQuantity,
      totalBeforeDiscount,
      totalDiscount,
      totalTax,
      totalAmount,
    }
  }
}

/**
 * Instancia singleton del servicio de invoice details (backend)
 */
export const invoiceDetailServiceBackend = new InvoiceDetailServiceBackend()
