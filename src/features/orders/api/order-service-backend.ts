/**
 * Order Service - Backend Implementation
 *
 * Implementación del servicio de orders usando Django REST API
 * Endpoints: /api/orders/
 */

import apiClient from '@/core/api/client'
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  FulfillOrderDto,
} from '@/core/contracts/entities/order'
import { OrderStateCode } from '@/core/contracts/enums'

/**
 * Order Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 */
class OrderServiceBackend {
  private readonly basePath = '/orders'

  /**
   * Obtener todas las órdenes
   *
   * @param filters - Filtros opcionales (statecode)
   * @returns Lista de órdenes
   */
  async getAll(filters?: { statecode?: OrderStateCode }): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      this.basePath,
      { params: filters }
    )

    return response.data
  }

  /**
   * Obtener órdenes por estado
   *
   * @param statecode - Estado de la orden (0=Active, 1=Submitted, 2=Canceled, 3=Fulfilled, 4=Invoiced)
   * @returns Órdenes filtradas por estado
   */
  async getOrders(statecode?: OrderStateCode): Promise<Order[]> {
    return this.getAll(statecode !== undefined ? { statecode } : undefined)
  }

  /**
   * Obtener órdenes por estado
   *
   * @param statecode - Estado de la orden
   * @returns Órdenes filtradas por estado
   */
  async getByState(statecode: OrderStateCode): Promise<Order[]> {
    return this.getAll({ statecode })
  }

  /**
   * Obtener órdenes por quote
   *
   * @param quoteId - ID de la quote
   * @returns Órdenes vinculadas a la quote
   */
  async getByQuote(quoteId: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      this.basePath,
      { params: { quoteid: quoteId } }
    )
    return response.data
  }

  /**
   * Obtener órdenes por opportunity
   *
   * @param opportunityId - ID de la opportunity
   * @returns Órdenes vinculadas a la opportunity
   */
  async getByOpportunity(opportunityId: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      this.basePath,
      { params: { opportunityid: opportunityId } }
    )
    return response.data
  }

  /**
   * Obtener órdenes por customer
   *
   * @param customerId - ID del customer (Account o Contact)
   * @returns Órdenes del customer
   */
  async getByCustomer(customerId: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(
      this.basePath,
      { params: { customerid: customerId } }
    )
    return response.data
  }

  /**
   * Obtener orden por ID
   *
   * @param id - ID de la orden (salesorderid)
   * @returns Orden o null si no existe
   */
  async getById(id: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(
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
   * Crear nueva orden
   *
   * @param dto - Datos de la orden
   * @returns Orden creada con ID asignado
   */
  async create(dto: CreateOrderDto): Promise<Order> {
    const response = await apiClient.post<Order>(
      this.basePath,
      dto
    )

    return response.data
  }

  /**
   * Crear orden desde quote ganada
   *
   * Este endpoint automáticamente:
   * - Copia datos del Quote (customer, products, amounts, etc.)
   * - Crea Order en estado Active
   * - Genera ordernumber automáticamente
   * - Copia Quote Lines → Order Lines
   *
   * @param quoteId - ID de la quote
   * @returns Orden creada
   */
  async createFromQuote(quoteId: string): Promise<Order> {
    const response = await apiClient.post<Order>(
      `${this.basePath}/from-quote/${quoteId}`
    )

    return response.data
  }

  /**
   * Actualizar orden existente
   *
   * Solo se puede editar si está en estado Active
   *
   * @param id - ID de la orden
   * @param dto - Campos a actualizar
   * @returns Orden actualizada o null si no existe
   */
  async update(id: string, dto: UpdateOrderDto): Promise<Order | null> {
    try {
      const response = await apiClient.patch<Order>(
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
   * Actualizar totales de la orden
   *
   * El backend calcula automáticamente los totales al agregar/eliminar líneas
   *
   * @param id - ID de la orden
   * @param totals - Totales calculados
   * @returns Orden actualizada
   */
  async updateTotals(
    id: string,
    totals: {
      totalamount: number
      totaltax: number
      discountamount: number
    }
  ): Promise<Order | null> {
    // El backend calcula los totales automáticamente
    // Por ahora, devolvemos la orden actualizada
    return this.getById(id)
  }

  /**
   * Eliminar orden (hard delete)
   *
   * Solo se puede eliminar si está en estado Active
   *
   * @param id - ID de la orden
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
   * Enviar orden
   *
   * Cambia de Active → Submitted
   *
   * @param id - ID de la orden
   * @returns Orden enviada
   */
  async submit(id: string): Promise<Order | null> {
    try {
      const response = await apiClient.post<Order>(
        `${this.basePath}/${id}/submit`
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
   * Marcar orden como entregada (fulfilled)
   *
   * Cambia de Submitted → Fulfilled
   *
   * @param id - ID de la orden
   * @param dto - Fecha de entrega (opcional)
   * @returns Orden entregada
   */
  async fulfill(id: string, dto?: FulfillOrderDto): Promise<Order | null> {
    try {
      const response = await apiClient.post<Order>(
        `${this.basePath}/${id}/fulfill`,
        {
          datefulfilled: dto?.datefulfilled || new Date().toISOString().split('T')[0]
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
   * Cancelar orden
   *
   * Cambia a Canceled state
   *
   * @param id - ID de la orden
   * @param reason - Motivo de cancelación (opcional)
   * @returns Orden cancelada
   */
  async cancel(id: string, reason?: string): Promise<Order | null> {
    try {
      const response = await apiClient.post<Order>(
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
   * Buscar órdenes por texto
   *
   * @param query - Texto a buscar
   * @returns Órdenes que coinciden con la búsqueda
   */
  async search(query: string): Promise<Order[]> {
    const allOrders = await this.getAll()
    const lowerQuery = query.toLowerCase()

    return allOrders.filter(
      (order) =>
        order.name?.toLowerCase().includes(lowerQuery) ||
        order.ordernumber?.toLowerCase().includes(lowerQuery) ||
        order.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Obtener estadísticas de órdenes
   *
   * @returns Estadísticas (total, por estado, valores, etc.)
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    submitted: number
    fulfilled: number
    canceled: number
    invoiced: number
    totalValue: number
    averageValue: number
    fulfillmentRate: number
  }> {
    const response = await apiClient.get<{
      total_orders: number
      total_amount: number
      active_count: number
      submitted_count: number
      fulfilled_count: number
      canceled_count: number
      invoiced_count: number
      average_value: number
      fulfillment_rate: number
    }>(`${this.basePath}/stats/summary`)

    const stats = response.data

    // Transformar nombres de Django a nuestro formato
    return {
      total: stats.total_orders,
      active: stats.active_count,
      submitted: stats.submitted_count,
      fulfilled: stats.fulfilled_count,
      canceled: stats.canceled_count,
      invoiced: stats.invoiced_count,
      totalValue: stats.total_amount,
      averageValue: stats.average_value,
      fulfillmentRate: stats.fulfillment_rate,
    }
  }
}

/**
 * Instancia singleton del servicio de órdenes (backend)
 */
export const orderServiceBackend = new OrderServiceBackend()
