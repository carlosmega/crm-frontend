/**
 * Product Service - Backend Implementation
 *
 * Implementación del servicio de products usando Django REST API
 * Endpoints: /api/products/
 */

import apiClient from '@/core/api/client'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '@/core/contracts/entities/product'

/**
 * Product Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 */
class ProductServiceBackend {
  private readonly basePath = '/products'

  /**
   * Obtener todos los productos
   *
   * @returns Lista de productos
   */
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(this.basePath)
    return response.data
  }

  /**
   * Obtener solo productos activos
   *
   * @returns Productos activos (statecode = 0)
   */
  async getActive(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      this.basePath,
      { params: { statecode: 0 } }
    )
    return response.data
  }

  /**
   * Obtener producto por ID
   *
   * @param id - ID del producto
   * @returns Producto o null si no existe
   */
  async getById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(
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
   * Obtener productos por IDs (para Quote/Order/Invoice Lines)
   *
   * @param ids - Lista de IDs de productos
   * @returns Lista de productos
   */
  async getByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return []

    // Obtener todos y filtrar en el frontend
    // (alternativa: enviar como query params si el backend lo soporta)
    const allProducts = await this.getAll()
    return allProducts.filter((p) => ids.includes(p.productid))
  }

  /**
   * Buscar productos por nombre o número de producto
   *
   * @param query - Texto a buscar
   * @returns Productos que coinciden con la búsqueda
   */
  async search(query: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      this.basePath,
      { params: { search: query } }
    )
    return response.data
  }

  /**
   * Crear nuevo producto
   *
   * @param dto - Datos del producto
   * @returns Producto creado
   */
  async create(dto: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>(
      this.basePath,
      dto
    )
    return response.data
  }

  /**
   * Actualizar producto existente
   *
   * @param id - ID del producto
   * @param dto - Campos a actualizar
   * @returns Producto actualizado
   */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const response = await apiClient.patch<Product>(
      `${this.basePath}/${id}`,
      dto
    )
    return response.data
  }

  /**
   * Eliminar producto (soft delete - cambia statecode a Inactive)
   *
   * @param id - ID del producto
   */
  async delete(id: string): Promise<void> {
    await this.deactivate(id)
  }

  /**
   * Hard delete producto (eliminar permanentemente)
   *
   * @param id - ID del producto
   */
  async hardDelete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  /**
   * Activar producto (statecode = 0)
   *
   * @param id - ID del producto
   * @returns Producto activado
   */
  async activate(id: string): Promise<Product> {
    const response = await apiClient.post<Product>(
      `${this.basePath}/${id}/activate`
    )
    return response.data
  }

  /**
   * Desactivar producto (statecode = 1)
   *
   * @param id - ID del producto
   * @returns Producto desactivado
   */
  async deactivate(id: string): Promise<Product> {
    const response = await apiClient.post<Product>(
      `${this.basePath}/${id}/deactivate`
    )
    return response.data
  }

  /**
   * Actualizar inventario del producto
   *
   * @param id - ID del producto
   * @param quantityonhand - Cantidad en stock
   * @returns Producto actualizado
   */
  async updateInventory(
    id: string,
    quantityonhand: number
  ): Promise<Product> {
    const response = await apiClient.patch<Product>(
      `${this.basePath}/${id}`,
      { quantityonhand }
    )
    return response.data
  }

  /**
   * Obtener productos con inventario bajo
   *
   * @param threshold - Umbral de cantidad (default: 10)
   * @returns Productos con inventario bajo el umbral
   */
  async getLowInventory(threshold: number = 10): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      this.basePath,
      { params: { low_inventory: threshold } }
    )
    return response.data
  }

  /**
   * Obtener productos por rango de precio
   *
   * @param minPrice - Precio mínimo
   * @param maxPrice - Precio máximo
   * @returns Productos en el rango de precio
   */
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(
      this.basePath,
      { params: { min_price: minPrice, max_price: maxPrice } }
    )
    return response.data
  }

  /**
   * Obtener estadísticas de productos
   *
   * @returns Estadísticas
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    totalValue: number
    averagePrice: number
  }> {
    const response = await apiClient.get<{
      total_products: number
      active_count: number
      inactive_count: number
      total_value: number
      average_price: number
    }>(`${this.basePath}/stats/summary`)

    const stats = response.data

    // Transformar nombres de Django a nuestro formato
    return {
      total: stats.total_products,
      active: stats.active_count,
      inactive: stats.inactive_count,
      totalValue: stats.total_value,
      averagePrice: stats.average_price,
    }
  }
}

/**
 * Instancia singleton del servicio de productos (backend)
 */
export const productServiceBackend = new ProductServiceBackend()
