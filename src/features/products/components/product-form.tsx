"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Product, CreateProductDto, UpdateProductDto } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormFieldGroup, AutoGrowTextarea } from '@/shared/components/form'
import { Package, DollarSign, Hash, FileText, Loader2, Warehouse } from 'lucide-react'

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

export type ProductFormSection = 'general' | 'inventory' | 'all'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
  section?: ProductFormSection // Which section to show (default: 'all')
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
  hideActions,
  section = 'all',
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          productnumber: product.productnumber || '',
          description: product.description || '',
          price: product.price || undefined,
          standardcost: product.standardcost || undefined,
          currentcost: product.currentcost || undefined,
          quantityonhand: product.quantityonhand || undefined,
          vendorname: product.vendorname || '',
          vendorpartnumber: product.vendorpartnumber || '',
        }
      : {
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

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await onSubmit(values as CreateProductDto | UpdateProductDto)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const showGeneral = section === 'all' || section === 'general'
  const showInventory = section === 'all' || section === 'inventory'

  return (
    <Form {...form}>
      <form id="product-edit-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* GENERAL SECTION - Basic Information + Pricing */}
        {showGeneral && (
          <>
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Product Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., CRM Enterprise License"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormFieldGroup columns={2}>
              {/* Product Number (SKU) */}
              <FormField
                control={form.control}
                name="productnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Product Number (SKU)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CRM-ENT-001"
                        className="h-10 font-mono"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Unique identifier for this product
                    </p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Vendor Name */}
              <FormField
                control={form.control}
                name="vendorname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Vendor Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Acme Corp"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <AutoGrowTextarea
                      placeholder="Describe the product features, specifications, and benefits..."
                      className=""
                      minRows={3}
                      maxRows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={3}>
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Price (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Selling price</p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Standard Cost */}
              <FormField
                control={form.control}
                name="standardcost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Standard Cost (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Base cost</p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Current Cost */}
              <FormField
                control={form.control}
                name="currentcost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Current Cost (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Current cost</p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            {/* Profit Margin Calculation */}
            {form.watch('price') && form.watch('standardcost') && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">
                  {(
                    ((Number(form.watch('price')) - Number(form.watch('standardcost'))) /
                      Number(form.watch('price'))) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Profit: €
                  {(Number(form.watch('price')) - Number(form.watch('standardcost'))).toFixed(
                    2
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}

        {/* INVENTORY SECTION - Inventory Management */}
        {showInventory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Inventory Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              {/* Quantity On Hand */}
              <FormField
                control={form.control}
                name="quantityonhand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Quantity On Hand
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        className="h-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Total units in stock</p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Vendor Part Number */}
              <FormField
                control={form.control}
                name="vendorpartnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Vendor Part Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vendor's SKU or part number"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
          </CardContent>
        </Card>
        )}

        {/* Actions */}
        {!hideActions && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[120px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
