/**
 * Invoice Service - Backend Implementation
 *
 * Implementación del servicio de invoices usando Django REST API
 * Endpoints: /api/invoices/
 */

import apiClient from '@/core/api/client'
import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  RecordPaymentDto,
} from '@/core/contracts/entities/invoice'
import { InvoiceStateCode } from '@/core/contracts/enums'

/**
 * Invoice Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 */
class InvoiceServiceBackend {
  private readonly basePath = '/invoices'

  /**
   * Obtener todas las facturas
   *
   * @param filters - Filtros opcionales (statecode, overdue)
   * @returns Lista de facturas
   */
  async getAll(filters?: {
    statecode?: InvoiceStateCode
    overdue?: boolean
  }): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      this.basePath,
      { params: filters }
    )

    return response.data
  }

  /**
   * Obtener facturas por estado
   *
   * @param statecode - Estado de la factura (0=Active, 1=Paid, 2=Canceled)
   * @returns Facturas filtradas por estado
   */
  async getByState(statecode: InvoiceStateCode): Promise<Invoice[]> {
    return this.getAll({ statecode })
  }

  /**
   * Obtener facturas vencidas
   *
   * @returns Facturas con fecha de vencimiento pasada y no pagadas
   */
  async getOverdue(): Promise<Invoice[]> {
    return this.getAll({ overdue: true })
  }

  /**
   * Obtener facturas por order
   *
   * @param orderId - ID de la orden
   * @returns Facturas vinculadas a la orden
   */
  async getByOrder(orderId: string): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      this.basePath,
      { params: { salesorderid: orderId } }
    )
    return response.data
  }

  /**
   * Obtener facturas por opportunity
   *
   * @param opportunityId - ID de la oportunidad
   * @returns Facturas vinculadas a la oportunidad
   */
  async getByOpportunity(opportunityId: string): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      this.basePath,
      { params: { opportunityid: opportunityId } }
    )
    return response.data
  }

  /**
   * Obtener facturas por customer
   *
   * @param customerId - ID del customer (Account o Contact)
   * @returns Facturas del customer
   */
  async getByCustomer(customerId: string): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      this.basePath,
      { params: { customerid: customerId } }
    )
    return response.data
  }

  /**
   * Obtener factura por ID
   *
   * @param id - ID de la factura (invoiceid)
   * @returns Factura o null si no existe
   */
  async getById(id: string): Promise<Invoice | null> {
    try {
      const response = await apiClient.get<Invoice>(
        `${this.basePath}/${id}`
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
   * Crear nueva factura
   *
   * @param dto - Datos de la factura
   * @returns Factura creada con ID asignado
   */
  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(
      this.basePath,
      dto
    )

    return response.data
  }

  /**
   * Crear factura desde orden entregada
   *
   * Este endpoint automáticamente:
   * - Copia datos del Order (customer, products, amounts, etc.)
   * - Crea Invoice en estado Active
   * - Genera invoicenumber automáticamente
   * - Copia Order Lines → Invoice Lines
   * - Calcula due date según payment terms
   *
   * @param orderId - ID de la orden (debe estar en estado Fulfilled)
   * @returns Factura creada
   */
  async createFromOrder(orderId: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(
      `${this.basePath}/from-order/${orderId}`
    )

    return response.data
  }

  /**
   * Actualizar factura existente
   *
   * Solo se puede editar si está en estado Active
   *
   * @param id - ID de la factura
   * @param dto - Campos a actualizar
   * @returns Factura actualizada o null si no existe
   */
  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice | null> {
    try {
      const response = await apiClient.patch<Invoice>(
        `${this.basePath}/${id}`,
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
   * Actualizar totales de la factura
   *
   * El backend calcula automáticamente los totales al agregar/eliminar líneas
   *
   * @param id - ID de la factura
   * @param totals - Totales calculados
   * @returns Factura actualizada
   */
  async updateTotals(
    id: string,
    totals: {
      totalamount: number
      totaltax: number
      discountamount: number
    }
  ): Promise<Invoice | null> {
    // El backend calcula los totales automáticamente
    // Por ahora, devolvemos la factura actualizada
    return this.getById(id)
  }

  /**
   * Eliminar factura (hard delete)
   *
   * Solo se puede eliminar si está en estado Active y no tiene pagos
   *
   * @param id - ID de la factura
   * @returns true si se eliminó
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      return true
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Registrar pago de factura (parcial o total)
   *
   * La factura se marca automáticamente como PAID cuando:
   * totalamountdue === 0
   *
   * @param id - ID de la factura
   * @param dto - Datos del pago (monto y fecha)
   * @returns Factura actualizada
   */
  async recordPayment(
    id: string,
    dto: RecordPaymentDto
  ): Promise<Invoice | null> {
    try {
      const response = await apiClient.post<Invoice>(
        `${this.basePath}/${id}/record-payment`,
        {
          payment_amount: dto.paymentamount.toString(),
          payment_date: dto.paymentdate
        }
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
   * Cancelar factura
   *
   * Cambia a Canceled state
   * No se puede cancelar si ya está Paid
   *
   * @param id - ID de la factura
   * @param reason - Motivo de cancelación (opcional)
   * @returns Factura cancelada
   */
  async cancel(id: string, reason?: string): Promise<Invoice | null> {
    try {
      const response = await apiClient.post<Invoice>(
        `${this.basePath}/${id}/cancel`,
        { reason }
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
   * Marcar factura como pagada (pago completo)
   *
   * Atajo para recordPayment con el monto total
   *
   * @param id - ID de la factura
   * @param paymentdate - Fecha del pago
   * @returns Factura marcada como pagada
   */
  async markAsPaid(
    id: string,
    paymentdate?: string
  ): Promise<Invoice | null> {
    const invoice = await this.getById(id)
    if (!invoice) return null

    return this.recordPayment(id, {
      paymentamount: invoice.totalbalance || invoice.totalamount,
      paymentdate: paymentdate || new Date().toISOString().split('T')[0]
    })
  }

  /**
   * Buscar facturas por texto
   *
   * @param query - Texto a buscar
   * @returns Facturas que coinciden con la búsqueda
   */
  async search(query: string): Promise<Invoice[]> {
    const allInvoices = await this.getAll()
    const lowerQuery = query.toLowerCase()

    return allInvoices.filter(
      (invoice) =>
        invoice.name?.toLowerCase().includes(lowerQuery) ||
        invoice.invoicenumber?.toLowerCase().includes(lowerQuery) ||
        invoice.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Obtener estadísticas de facturas
   *
   * @returns Estadísticas (total, por estado, montos, vencidas, etc.)
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
    const response = await apiClient.get<{
      total_invoices: number
      total_amount: number
      total_paid: number
      total_due: number
      active_count: number
      paid_count: number
      canceled_count: number
      overdue_count: number
      average_value: number
    }>(`${this.basePath}/stats/summary`)

    const stats = response.data

    // Transformar nombres de Django a nuestro formato
    return {
      total: stats.total_invoices,
      active: stats.active_count,
      paid: stats.paid_count,
      canceled: stats.canceled_count,
      overdue: stats.overdue_count,
      totalAmount: stats.total_amount,
      totalPaid: stats.total_paid,
      totalDue: stats.total_due,
      averageValue: stats.average_value,
    }
  }
}

/**
 * Instancia singleton del servicio de facturas (backend)
 */
export const invoiceServiceBackend = new InvoiceServiceBackend()
