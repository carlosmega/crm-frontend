"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductForm } from '@/features/products/components/product-form'
import { useProductMutations } from '@/features/products/hooks/use-product-mutations'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateProductDto } from '@/features/products/types'
import { Button } from '@/components/ui/button'
import { Loader2, Save, X } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const { createProduct } = useProductMutations()
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (data: CreateProductDto) => {
    setIsCreating(true)
    try {
      const newProduct = await createProduct(data)
      // Redirigir al detalle del registro creado
      router.push(`/products/${newProduct.productid}`)
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/products"
        entityType="NEW PRODUCT"
        title="New Product"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('product-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={isCreating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Products', href: '/products' },
          { label: 'New Product' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Product</h1>
                  <p className="text-muted-foreground mt-1">
                    Add a new product or service to your catalog
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('product-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={isCreating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Product</h1>
              <p className="text-muted-foreground mt-1">
                Add a new product or service to your catalog
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Form */}
        <div className="px-4 pb-4 pt-1">
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={isCreating}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
