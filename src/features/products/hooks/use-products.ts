"use client"

import { useState, useEffect } from 'react'
import type { Product } from '../types'
import { productService } from '../api/product-service'

/**
 * Hook for fetching products
 * Follows the pattern from opportunities/leads features
 */

export function useProducts(filterActive?: boolean) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = filterActive
        ? await productService.getActive()
        : await productService.getAll()

      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filterActive])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await productService.getById(id)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  }
}

/**
 * Hook for searching products
 */
export function useProductSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (searchQuery: string) => {
    setQuery(searchQuery)

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await productService.search(searchQuery)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      console.error('Error searching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [])

  return {
    query,
    results,
    loading,
    error,
    search,
  }
}

/**
 * Hook for product statistics
 */
export function useProductStatistics() {
  const [statistics, setStatistics] = useState<{
    total: number
    active: number
    inactive: number
    totalValue: number
    averagePrice: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await productService.getStatistics()
      setStatistics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      console.error('Error fetching statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  }
}
