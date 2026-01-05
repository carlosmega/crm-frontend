"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductForm } from '@/features/products/components/product-form'
import { useProductMutations } from '@/features/products/hooks/use-product-mutations'
import type { CreateProductDto } from '@/features/products/types'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'

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
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                NEW PRODUCT
              </p>
              <h1 className="text-sm font-semibold text-gray-900">
                Create Product
              </h1>
            </div>
          </div>
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
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>New</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

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
