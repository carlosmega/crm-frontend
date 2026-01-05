"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Product } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import {
  Package,
  DollarSign,
  Warehouse,
  Link2,
  History,
} from 'lucide-react'

export type ProductTabId = 'general' | 'related' | 'activities'

interface ProductDetailTabsProps {
  product: Product
}

/**
 * ProductDetailTabs
 *
 * Tabbed view for Product details.
 *
 * Tabs:
 * - General: Basic info, Pricing info, Inventory info
 * - Related: Related quotes/orders (disabled)
 * - Activities: Activity timeline
 */
export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ProductTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('product-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Format helpers
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const hasInventory = product.quantityonhand !== undefined

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
          value="related"
          disabled
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "text-gray-400 cursor-not-allowed"
          )}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Related Records
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          Activities
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              )}
              {product.vendorname && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vendor
                  </p>
                  <p className="text-sm mt-1">{product.vendorname}</p>
                </div>
              )}
              {product.vendorpartnumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vendor Part Number
                  </p>
                  <p className="text-sm mt-1 font-mono">
                    {product.vendorpartnumber}
                  </p>
                </div>
              )}
              {!product.description && !product.vendorname && !product.vendorpartnumber && (
                <p className="text-sm text-muted-foreground">No basic information available</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Price
                  </p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Standard Cost
                  </p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(product.standardcost)}
                  </p>
                </div>
              </div>
              {product.price && product.standardcost && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">
                    Profit Margin
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {(
                      ((product.price - product.standardcost) / product.price) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profit: {formatCurrency(product.price - product.standardcost)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Inventory Information */}
        {hasInventory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quantity On Hand
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {product.quantityonhand}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quantity Available
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {product.quantityonhand || 0}
                  </p>
                </div>
                {product.quantityonhand! < 10 && product.quantityonhand! > 0 && (
                  <div className="md:col-span-2 flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-900 rounded-lg">
                    <Package className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Low Stock Warning
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                        Consider reordering soon
                      </p>
                    </div>
                  </div>
                )}
                {product.quantityonhand! === 0 && (
                  <div className="md:col-span-2 flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <Package className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Out of Stock
                      </p>
                      <p className="text-xs text-destructive/80 mt-0.5">
                        Reorder immediately
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* RELATED TAB */}
      <TabsContent value="related" className="mt-0">
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Related records will be displayed here</p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={product.productid}
          regardingType="product"
          regardingName={product.name}
        />
      </TabsContent>
    </Tabs>
  )
}
