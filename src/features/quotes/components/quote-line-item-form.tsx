'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import type { QuoteDetail, CreateQuoteDetailDto, UpdateQuoteDetailDto } from '../types'
import type { Product } from '@/core/contracts/entities/product'
import { useLineTotalsWithIVA } from '../hooks/use-quote-calculations'
import { formatCurrency } from '../utils/quote-calculations'
import { AlertCircle, Package, Info } from 'lucide-react'
import { ProductSelector } from '@/features/products/components/product-selector'

interface QuoteLineItemFormProps {
  quoteId: string
  quoteLine?: QuoteDetail
  preselectedProduct?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateQuoteDetailDto | UpdateQuoteDetailDto) => void
  isSubmitting?: boolean
}

/**
 * Quote Line Item Form Dialog
 *
 * Formulario para agregar o editar líneas de productos en quote
 * Incluye cálculo automático de IVA 16% (México)
 */
export function QuoteLineItemForm({
  quoteId,
  quoteLine,
  preselectedProduct,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: QuoteLineItemFormProps) {
  const isEdit = !!quoteLine
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(preselectedProduct)
  const [applyIVA, setApplyIVA] = useState(true) // IVA activado por defecto

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateQuoteDetailDto>({
    defaultValues: quoteLine
      ? {
          quoteid: quoteLine.quoteid,
          productid: quoteLine.productid,
          productdescription: quoteLine.productdescription,
          quantity: quoteLine.quantity,
          priceperunit: quoteLine.priceperunit,
          manualdiscountamount: quoteLine.manualdiscountamount || 0,
          tax: quoteLine.tax || 0,
        }
      : preselectedProduct
      ? {
          quoteid: quoteId,
          productid: preselectedProduct.productid,
          productdescription: preselectedProduct.name,
          quantity: 1,
          priceperunit: preselectedProduct.price,
          manualdiscountamount: 0,
          tax: 0,
        }
      : {
          quoteid: quoteId,
          quantity: 1,
          priceperunit: 0,
          manualdiscountamount: 0,
          tax: 0,
        },
  })

  const quantity = watch('quantity')
  const pricePerUnit = watch('priceperunit')
  const discount = watch('manualdiscountamount')

  // Calculate totals with IVA in real-time
  const {
    baseAmount,
    subtotalAfterDiscount,
    ivaAmount,
    extendedAmount,
    discountPercentage,
  } = useLineTotalsWithIVA(pricePerUnit, quantity, discount, applyIVA)

  // Sync tax to form (as number, not via DOM)
  useEffect(() => {
    setValue('tax', ivaAmount, { shouldValidate: false })
  }, [ivaAmount, setValue])

  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (quoteLine) {
        // Edit mode: populate form with existing data
        reset({
          quoteid: quoteLine.quoteid,
          productid: quoteLine.productid,
          productdescription: quoteLine.productdescription,
          quantity: quoteLine.quantity,
          priceperunit: quoteLine.priceperunit,
          manualdiscountamount: quoteLine.manualdiscountamount || 0,
          tax: quoteLine.tax || 0,
        })
        // Detect if IVA was applied: tax ≈ 16% of (base - discount)
        const calculatedSubtotal = (quoteLine.baseamount || quoteLine.quantity * quoteLine.priceperunit) - (quoteLine.manualdiscountamount || 0)
        const expectedIVA = calculatedSubtotal * 0.16
        const hasIVA = quoteLine.tax > 0 && Math.abs(quoteLine.tax - expectedIVA) < 1
        setApplyIVA(hasIVA)
      } else if (preselectedProduct) {
        // New with preselected product
        reset({
          quoteid: quoteId,
          productid: preselectedProduct.productid,
          productdescription: preselectedProduct.name,
          quantity: 1,
          priceperunit: preselectedProduct.price,
          manualdiscountamount: 0,
          tax: 0,
        })
        setSelectedProduct(preselectedProduct)
        setApplyIVA(true)
      } else {
        // New blank form
        reset({
          quoteid: quoteId,
          quantity: 1,
          priceperunit: 0,
          manualdiscountamount: 0,
          tax: 0,
        })
        setSelectedProduct(undefined)
        setApplyIVA(true)
      }
    }
  }, [open, quoteLine, preselectedProduct, quoteId, reset])

  // Handle product selection from ProductSelector
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setValue('productid', product.productid)
    setValue('productdescription', product.name)
    setValue('priceperunit', product.price)
  }

  const handleFormSubmit = (data: CreateQuoteDetailDto) => {
    // Ensure all numeric fields are numbers (hidden inputs can return strings)
    onSubmit({
      ...data,
      quantity: Number(data.quantity),
      priceperunit: Number(data.priceperunit),
      manualdiscountamount: Number(data.manualdiscountamount) || 0,
      tax: Number(ivaAmount),
    })
  }

  const handleDialogOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Quote Line' : 'Add Product to Quote'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the quantity, price, or discount for this product'
              : 'Enter the product details and pricing information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            {/* Product Selector or Display */}
            <div className="space-y-2">
              <Label>Product *</Label>
              {isEdit || selectedProduct ? (
                // Show selected product (read-only)
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Package className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {watch('productdescription')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Price: {formatCurrency(watch('priceperunit'))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Show product selector
                <ProductSelector
                  onSelect={handleProductSelect}
                  trigger={
                    <Button type="button" variant="outline" className="w-full justify-start h-auto py-3">
                      <Package className="size-4 mr-2" />
                      Select product from catalog...
                    </Button>
                  }
                />
              )}
              {!selectedProduct && !isEdit && (
                <p className="text-sm text-destructive">
                  Please select a product from the catalog
                </p>
              )}
            </div>

            {/* Product ID (Hidden) */}
            <input type="hidden" {...register('productid')} />
            <input type="hidden" {...register('quoteid')} />
            <input
              type="hidden"
              {...register('productdescription', {
                required: 'Product is required',
              })}
            />
            <input type="hidden" {...register('tax', { valueAsNumber: true })} />

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  min="1"
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: {
                      value: 1,
                      message: 'Quantity must be at least 1',
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceperunit">Price per Unit *</Label>
                <Input
                  id="priceperunit"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('priceperunit', {
                    required: 'Price is required',
                    min: {
                      value: 0,
                      message: 'Price must be 0 or greater',
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.priceperunit && (
                  <p className="text-sm text-destructive">
                    {errors.priceperunit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Base Amount (Calculated) */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Amount:</span>
                <span className="font-semibold">{formatCurrency(baseAmount)}</span>
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="manualdiscountamount">Discount</Label>
              <Input
                id="manualdiscountamount"
                type="number"
                step="0.01"
                min="0"
                {...register('manualdiscountamount', {
                  valueAsNumber: true,
                })}
              />
              {discountPercentage > 0 && (
                <p className="text-xs text-muted-foreground">
                  {discountPercentage.toFixed(2)}% discount
                </p>
              )}
            </div>

            {/* Subtotal after Discount */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (after discount):</span>
                <span className="font-semibold">{formatCurrency(subtotalAfterDiscount)}</span>
              </div>
            </div>

            {/* IVA Toggle */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    id="apply-iva"
                    checked={applyIVA}
                    onCheckedChange={setApplyIVA}
                  />
                  <div>
                    <Label htmlFor="apply-iva" className="cursor-pointer font-medium">
                      Apply IVA 16%
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mexican Value Added Tax
                    </p>
                  </div>
                </div>
                {applyIVA && (
                  <span className="text-sm font-medium text-primary">
                    +{formatCurrency(ivaAmount)}
                  </span>
                )}
              </div>

              {!applyIVA && (
                <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    IVA disabled. Use only for tax-exempt customers or international sales.
                  </p>
                </div>
              )}
            </div>

            {/* Total Amount (Calculated) */}
            <div className="rounded-lg bg-primary/10 border border-primary p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-2xl">
                  {formatCurrency(extendedAmount)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <p>Base: {formatCurrency(baseAmount)}</p>
                {discount > 0 && (
                  <p>- Discount: {formatCurrency(discount)}</p>
                )}
                <p>= Subtotal: {formatCurrency(subtotalAfterDiscount)}</p>
                {applyIVA && (
                  <p>+ IVA (16%): {formatCurrency(ivaAmount)}</p>
                )}
              </div>
            </div>

            {/* Validation Warning */}
            {discount > baseAmount && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    Discount cannot exceed base amount
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || discount > baseAmount || (!isEdit && !selectedProduct)}
            >
              {isSubmitting
                ? isEdit
                  ? 'Updating...'
                  : 'Adding...'
                : isEdit
                ? 'Update Line'
                : 'Add to Quote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
