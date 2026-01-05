"use client"

import { useRouter } from 'next/navigation'
import type { CreateProductDto, UpdateProductDto } from '../types'
import { productService } from '../api/product-service'
import { toast } from 'sonner'

/**
 * Hook for product mutations (create, update, delete)
 * Follows the pattern from opportunities/leads features
 */

export function useProductMutations() {
  const router = useRouter()

  /**
   * Create new product
   */
  const createProduct = async (dto: CreateProductDto) => {
    try {
      const newProduct = await productService.create(dto)

      toast.success('Product created successfully', {
        description: `${newProduct.name} (${newProduct.productnumber}) has been added to the catalog`,
      })

      // Navigate to the new product's detail page
      router.push(`/products/${newProduct.productid}`)

      return newProduct
    } catch (error) {
      toast.error('Failed to create product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Update existing product
   */
  const updateProduct = async (id: string, dto: UpdateProductDto) => {
    try {
      const updatedProduct = await productService.update(id, dto)

      toast.success('Product updated successfully', {
        description: `${updatedProduct.name} has been updated`,
      })

      return updatedProduct
    } catch (error) {
      toast.error('Failed to update product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Delete product (soft delete)
   */
  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id)

      toast.success('Product deactivated', {
        description: 'The product has been marked as inactive',
      })

      return true
    } catch (error) {
      toast.error('Failed to delete product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Hard delete product
   */
  const hardDeleteProduct = async (id: string) => {
    try {
      await productService.hardDelete(id)

      toast.success('Product deleted permanently', {
        description: 'The product has been removed from the catalog',
      })

      return true
    } catch (error) {
      toast.error('Failed to delete product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Activate product
   */
  const activateProduct = async (id: string) => {
    try {
      const product = await productService.activate(id)

      toast.success('Product activated', {
        description: `${product.name} is now active`,
      })

      return product
    } catch (error) {
      toast.error('Failed to activate product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Deactivate product
   */
  const deactivateProduct = async (id: string) => {
    try {
      const product = await productService.deactivate(id)

      toast.success('Product deactivated', {
        description: `${product.name} is now inactive`,
      })

      return product
    } catch (error) {
      toast.error('Failed to deactivate product', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Update product inventory
   */
  const updateInventory = async (
    id: string,
    quantityonhand: number
  ) => {
    try {
      const product = await productService.updateInventory(
        id,
        quantityonhand
      )

      toast.success('Inventory updated', {
        description: `${product.name} inventory has been updated`,
      })

      return product
    } catch (error) {
      toast.error('Failed to update inventory', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  /**
   * Bulk delete products
   */
  const bulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => productService.delete(id)))

      toast.success('Products deactivated', {
        description: `${ids.length} product(s) have been deactivated`,
      })

      return true
    } catch (error) {
      toast.error('Failed to delete products', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    hardDeleteProduct,
    activateProduct,
    deactivateProduct,
    updateInventory,
    bulkDelete,
  }
}
