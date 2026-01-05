'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateOrderDetail, useUpdateOrderDetail } from '../hooks/use-order-details'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import type { Product } from '@/features/products/types'
import { ProductSelector } from '@/features/products/components/product-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Save, Package } from 'lucide-react'
import { toast } from 'sonner'

interface AddOrderLineDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: OrderDetail | null
}

interface OrderLineFormData {
  productid?: string
  productdescription: string
  quantity: number
  priceperunit: number
  manualdiscountamount?: number
  tax?: number
}

/**
 * Add/Edit Order Line Dialog Component
 *
 * Modal para agregar o editar líneas de productos en un Order
 *
 * Features:
 * - Add new line item
 * - Edit existing line item
 * - Validation (quantity > 0, price >= 0)
 * - Real-time totals preview
 */
export function AddOrderLineDialog({
  orderId,
  open,
  onOpenChange,
  editItem,
}: AddOrderLineDialogProps) {
  const isEdit = !!editItem
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [inputMode, setInputMode] = useState<'product' | 'manual'>('product')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrderLineFormData>({
    defaultValues: {
      productid: editItem?.productid,
      productdescription: editItem?.productdescription || '',
      quantity: editItem?.quantity || 1,
      priceperunit: editItem?.priceperunit || 0,
      manualdiscountamount: editItem?.manualdiscountamount || 0,
      tax: editItem?.tax || 0,
    },
  })

  const createMutation = useCreateOrderDetail()
  const updateMutation = useUpdateOrderDetail()

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setValue('productid', product.productid)
    setValue('productdescription', product.name)
    setValue('priceperunit', product.price || 0)
    // Optional: Auto-calculate tax based on product
    if (product.price) {
      const taxAmount = product.price * 0.1 // 10% tax example
      setValue('tax', taxAmount)
    }
  }

  // Watch form values for preview
  const quantity = watch('quantity') || 0
  const priceperunit = watch('priceperunit') || 0
  const manualdiscountamount = watch('manualdiscountamount') || 0
  const tax = watch('tax') || 0

  // Calculate preview amounts
  const baseAmount = quantity * priceperunit
  const afterDiscount = baseAmount - manualdiscountamount
  const totalAmount = afterDiscount + tax

  const onSubmit = async (data: OrderLineFormData) => {
    try {
      if (isEdit && editItem) {
        // Update existing line
        await updateMutation.mutateAsync({
          id: editItem.salesorderdetailid,
          dto: {
            quantity: data.quantity,
            // Note: price and description updates could be added if needed
          },
        })
        toast.success('Order line item updated successfully')
      } else {
        // Create new line
        await createMutation.mutateAsync({
          salesorderid: orderId,
          productid: data.productid,
          productdescription: data.productdescription,
          quantity: data.quantity,
          priceperunit: data.priceperunit,
          manualdiscountamount: data.manualdiscountamount,
          tax: data.tax,
        })
        toast.success('Order line item added successfully')
      }

      reset()
      setSelectedProduct(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving order line:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEdit ? 'update' : 'add'} order line item`
      )
    }
  }

  const handleClose = () => {
    reset()
    setSelectedProduct(null)
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Order Line Item' : 'Add Order Line Item'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the line item details below'
              : 'Select a product from catalog or enter custom details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'product' | 'manual')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="product">
                  <Package className="h-4 w-4 mr-2" />
                  Select Product
                </TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="product" className="space-y-4 mt-4">
                {/* Product Selector */}
                {!selectedProduct ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-2">No product selected</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Select a product from your catalog
                    </p>
                    <ProductSelector onSelect={handleProductSelect} />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedProduct.name}</p>
                        </div>
                        {selectedProduct.productnumber && (
                          <p className="text-xs text-muted-foreground font-mono mb-2">
                            SKU: {selectedProduct.productnumber}
                          </p>
                        )}
                        {selectedProduct.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProduct(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4 mt-4">
                {/* Product Description */}
                <div className="space-y-2">
                  <Label htmlFor="productdescription">
                    Product/Service Description *
                  </Label>
                  <Textarea
                    id="productdescription"
                    placeholder="Enter product or service description"
                    {...register('productdescription', {
                      required: inputMode === 'manual' ? 'Product description is required' : false,
                    })}
                    rows={2}
                  />
                  {errors.productdescription && (
                    <p className="text-sm text-destructive">
                      {errors.productdescription.message}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="productdescription">Product/Service Description</Label>
              <Textarea
                id="productdescription"
                {...register('productdescription')}
                disabled={true}
                rows={2}
              />
            </div>
          )}

          {/* Quantity and Unit Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' },
                  valueAsNumber: true,
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceperunit">Unit Price *</Label>
              <Input
                id="priceperunit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('priceperunit', {
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Price cannot be negative' },
                  valueAsNumber: true,
                })}
                disabled={isEdit} // Can't change price in edit mode
              />
              {errors.priceperunit && (
                <p className="text-sm text-destructive">
                  {errors.priceperunit.message}
                </p>
              )}
            </div>
          </div>

          {/* Discount and Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manualdiscountamount">
                Discount Amount
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="manualdiscountamount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('manualdiscountamount', {
                  valueAsNumber: true,
                })}
                disabled={isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">
                Tax Amount
                <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('tax', {
                  valueAsNumber: true,
                })}
                disabled={isEdit}
              />
            </div>
          </div>

          {/* Preview Totals */}
          <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Amount:</span>
              <span className="font-mono">
                ${baseAmount.toFixed(2)}
              </span>
            </div>
            {manualdiscountamount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-mono text-red-600">
                  -${manualdiscountamount.toFixed(2)}
                </span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-mono">+${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Line Total:</span>
                <span className="text-lg font-mono">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Line Item
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
