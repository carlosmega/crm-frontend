"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Product } from '../types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductForm } from './product-form'
import { cn } from '@/lib/utils'
import { Package, Warehouse } from 'lucide-react'

export type ProductFormTabId = 'general' | 'inventory'

interface ProductFormTabsProps {
  product?: Product
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  hideActions?: boolean
}

/**
 * ProductFormTabs
 *
 * Form with tabbed interface for product editing.
 *
 * Tabs:
 * - General: Basic information (name, SKU, description) + Pricing (price, costs)
 * - Inventory: Stock management (quantity, vendor info)
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Each tab shows only relevant fields (filtered by section prop)
 * - Consistent naming with detail view tabs
 */
export function ProductFormTabs({ product, onSubmit, isLoading, hideActions }: ProductFormTabsProps) {
  const [activeTab, setActiveTab] = useState<ProductFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('product-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Package className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="inventory"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Warehouse className="w-4 h-4 mr-2" />
          Inventory
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic Information + Pricing */}
      <TabsContent value="general" className="mt-0">
        <ProductForm
          product={product}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="general"
        />
      </TabsContent>

      {/* Inventory Tab - Inventory Management */}
      <TabsContent value="inventory" className="mt-0">
        <ProductForm
          product={product}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="inventory"
        />
      </TabsContent>
    </Tabs>
  )
}
