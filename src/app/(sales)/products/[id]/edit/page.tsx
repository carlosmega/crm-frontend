'use client'

import { use, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProduct } from '@/features/products/hooks/use-products'
import { useProductMutations } from '@/features/products/hooks/use-product-mutations'
import { ProductInfoHeader } from '@/features/products/components/product-info-header'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateProductDto } from '@/features/products/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AutoGrowTextarea } from '@/shared/components/form'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, X, FileText, DollarSign, Warehouse, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  productnumber: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  standardcost: z.number().min(0, 'Cost cannot be negative').optional(),
  currentcost: z.number().min(0, 'Cost cannot be negative').optional(),
  quantityonhand: z.number().int().min(0, 'Quantity cannot be negative').optional(),
  vendorname: z.string().optional(),
  vendorpartnumber: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

export type ProductEditTabId = 'basic' | 'pricing' | 'inventory'

/**
 * Product Edit Page
 *
 * Edit product details with tabs layout
 */
export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const { product, loading } = useProduct(id)
  const { updateProduct } = useProductMutations()

  const [activeTab, setActiveTab] = useState<ProductEditTabId>('basic')
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [mutating, setMutating] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      productnumber: '',
      description: '',
      price: undefined,
      standardcost: undefined,
      currentcost: undefined,
      quantityonhand: undefined,
      vendorname: '',
      vendorpartnumber: '',
    },
  })

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        productnumber: product.productnumber || '',
        description: product.description || '',
        price: product.price || undefined,
        standardcost: product.standardcost || undefined,
        currentcost: product.currentcost || undefined,
        quantityonhand: product.quantityonhand || undefined,
        vendorname: product.vendorname || '',
        vendorpartnumber: product.vendorpartnumber || '',
      })
    }
  }, [product, form])

  const handleSubmit = async (data: ProductFormValues) => {
    setMutating(true)
    try {
      await updateProduct(id, data as UpdateProductDto)

      toast({
        title: 'Product Updated',
        description: 'The product has been successfully updated',
      })

      router.push(`/products/${id}`)
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      })
    } finally {
      setMutating(false)
    }
  }

  if (loading || !product) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  const priceValue = form.watch('price')
  const standardCostValue = form.watch('standardcost')

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="basic"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          Basic Info
        </TabsTrigger>

        <TabsTrigger
          value="pricing"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Pricing
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
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/products/${id}`}
        entityType="EDIT PRODUCT"
        title={product.name}
        actions={
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              const formElement = document.getElementById('product-edit-form') as HTMLFormElement
              formElement?.requestSubmit()
            }}
            disabled={mutating}
            className="h-8 shrink-0"
          >
            {mutating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Products', href: '/products' },
          { label: product.name, href: `/products/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content - Fondo gris igual que accounts */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY SECTION - Product Info + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Product Info Header & Actions - Desktop only */}
          <div className="hidden md:block px-4 pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold">Edit Product</h1>
                  <p className="text-muted-foreground mt-1">
                    {product.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" asChild className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`/products/${id}`}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Link>
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    const formElement = document.getElementById('product-edit-form') as HTMLFormElement
                    formElement?.requestSubmit()
                  }}
                  disabled={mutating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {mutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile - Just title, buttons in top header */}
          <div className="md:hidden px-4 pt-4 pb-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
              <p className="text-muted-foreground mt-1">
                {product.name}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div ref={tabsContainerRef} id="product-tabs-nav-container" />
          </div>
        </div>

        {/* SCROLLABLE CONTENT - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductEditTabId)} className="w-full">
            {/* Render tabs navigation in sticky header container via portal */}
            {tabsContainerRef.current && createPortal(tabsNavigation, tabsContainerRef.current)}

            <Form {...form}>
              <form id="product-edit-form" onSubmit={form.handleSubmit(handleSubmit)}>
                {/* BASIC INFO TAB */}
                <TabsContent value="basic" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Essential product details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Product Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Product Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., CRM Enterprise License" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Number (SKU) */}
                        <FormField
                          control={form.control}
                          name="productnumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Number (SKU)</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Hash className="size-4 text-muted-foreground" />
                                  <Input
                                    placeholder="e.g., CRM-ENT-001"
                                    className="font-mono"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>Unique identifier for this product</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Vendor Name */}
                        <FormField
                          control={form.control}
                          name="vendorname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Acme Corp" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <AutoGrowTextarea
                                placeholder="Describe the product features, specifications, and benefits..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PRICING TAB */}
                <TabsContent value="pricing" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Information</CardTitle>
                      <CardDescription>
                        Product pricing and cost details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Price */}
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>Selling price</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Standard Cost */}
                        <FormField
                          control={form.control}
                          name="standardcost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Standard Cost (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>Base cost</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Current Cost */}
                        <FormField
                          control={form.control}
                          name="currentcost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Cost (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>Current cost</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Profit Margin Calculation */}
                      {priceValue && standardCostValue && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Profit Margin</p>
                          <p className="text-2xl font-bold text-green-600">
                            {(
                              ((Number(priceValue) - Number(standardCostValue)) /
                                Number(priceValue)) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Profit: €
                            {(Number(priceValue) - Number(standardCostValue)).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* INVENTORY TAB */}
                <TabsContent value="inventory" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Management</CardTitle>
                      <CardDescription>
                        Stock quantities and availability
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quantity On Hand */}
                        <FormField
                          control={form.control}
                          name="quantityonhand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity On Hand</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>Total units in stock</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Vendor Part Number */}
                        <FormField
                          control={form.control}
                          name="vendorpartnumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Part Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Vendor's SKU or part number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </div>
      </div>
    </>
  )
}
