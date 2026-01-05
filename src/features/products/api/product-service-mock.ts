import type { Product, CreateProductDto, UpdateProductDto } from '@/core/contracts/entities/product'
import { mockProducts } from '../data/mock-products'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

/**
 * Product Service - Mock Implementation
 * Handles all product-related API operations with mock data
 * Following the pattern from opportunities/leads features
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

class ProductService {
  // In-memory storage (mock data)
  private products: Product[] = [...mockProducts]

  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return [...this.products]
  }

  /**
   * Get active products only
   */
  async getActive(): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return this.products.filter((p) => p.statecode === 0)
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const product = this.products.find((p) => p.productid === id)
    return product ? { ...product } : null
  }

  /**
   * Get products by IDs (for Quote/Order/Invoice Lines)
   */
  async getByIds(ids: string[]): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return this.products.filter((p) => ids.includes(p.productid))
  }

  /**
   * Search products by name or product number
   */
  async search(query: string): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.SEARCH)
    const lowerQuery = query.toLowerCase()
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.productnumber?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Create new product
   */
  async create(dto: CreateProductDto): Promise<Product> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const newProduct: Product = {
      productid: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dto,
      statecode: 0, // Active by default
      statuscode: 1, // Available by default
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    this.products.push(newProduct)
    return { ...newProduct }
  }

  /**
   * Update existing product
   */
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const index = this.products.findIndex((p) => p.productid === id)
    if (index === -1) {
      throw new Error('Product not found')
    }

    const updatedProduct: Product = {
      ...this.products[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    this.products[index] = updatedProduct
    return { ...updatedProduct }
  }

  /**
   * Delete product (soft delete - set state to Inactive)
   */
  async delete(id: string): Promise<void> {
    await mockDelay(MOCK_DELAYS.READ)

    const index = this.products.findIndex((p) => p.productid === id)
    if (index === -1) {
      throw new Error('Product not found')
    }

    // Soft delete: set statecode to Inactive (1)
    this.products[index] = {
      ...this.products[index],
      statecode: 1,
      modifiedon: new Date().toISOString(),
    }
  }

  /**
   * Hard delete product (remove from array - for testing)
   */
  async hardDelete(id: string): Promise<void> {
    await mockDelay(MOCK_DELAYS.READ)

    const index = this.products.findIndex((p) => p.productid === id)
    if (index === -1) {
      throw new Error('Product not found')
    }

    this.products.splice(index, 1)
  }

  /**
   * Activate product
   */
  async activate(id: string): Promise<Product> {
    await mockDelay(MOCK_DELAYS.WRITE)
    const product = this.products.find(p => p.productid === id)
    if (!product) {
      throw new Error('Product not found')
    }
    product.statecode = 0
    product.statuscode = 1
    product.modifiedon = new Date().toISOString()
    return { ...product }
  }

  /**
   * Deactivate product
   */
  async deactivate(id: string): Promise<Product> {
    await mockDelay(MOCK_DELAYS.WRITE)
    const product = this.products.find(p => p.productid === id)
    if (!product) {
      throw new Error('Product not found')
    }
    product.statecode = 1
    product.statuscode = 2
    product.modifiedon = new Date().toISOString()
    return { ...product }
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    id: string,
    quantityonhand: number
  ): Promise<Product> {
    await mockDelay(MOCK_DELAYS.WRITE)
    const product = this.products.find(p => p.productid === id)
    if (!product) {
      throw new Error('Product not found')
    }
    product.quantityonhand = quantityonhand
    product.modifiedon = new Date().toISOString()
    return { ...product }
  }

  /**
   * Get products with low inventory (less than threshold)
   */
  async getLowInventory(threshold: number = 10): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return this.products.filter(
      (p) =>
        p.quantityonhand !== undefined &&
        p.quantityonhand < threshold &&
        p.statecode === 0
    )
  }

  /**
   * Get products by price range
   */
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return this.products.filter(
      (p) =>
        p.price !== undefined &&
        p.price >= minPrice &&
        p.price <= maxPrice &&
        p.statecode === 0
    )
  }

  /**
   * Reset mock data (for testing)
   */
  async resetMockData(): Promise<void> {
    this.products = [...mockProducts]
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    totalValue: number
    averagePrice: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const active = this.products.filter((p) => p.statecode === 0)
    const inactive = this.products.filter((p) => p.statecode === 1)

    const totalValue = active.reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantityonhand || 1),
      0
    )
    const averagePrice =
      active.reduce((sum, p) => sum + (p.price || 0), 0) / (active.length || 1)

    return {
      total: this.products.length,
      active: active.length,
      inactive: inactive.length,
      totalValue,
      averagePrice,
    }
  }
}

// Export singleton instance (Mock)
export const productServiceMock = new ProductService()
