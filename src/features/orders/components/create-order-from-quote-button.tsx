'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateOrderFromQuote } from '../hooks/use-orders'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Package, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateOrderFromQuoteButtonProps {
  quote: {
    quoteid: string
    name: string
    statecode: number
    opportunityid?: string
    customerid: string
    customeridtype: 'account' | 'contact'
    ownerid: string
    totalamount: number
    totaltax?: number
    discountamount?: number
    shipto_name?: string
    shipto_line1?: string
    shipto_line2?: string
    shipto_city?: string
    shipto_stateorprovince?: string
    shipto_postalcode?: string
    shipto_country?: string
  }
  quoteLines: Array<{
    productid?: string
    productdescription?: string
    quantity: number
    priceperunit: number
    manualdiscountamount?: number
    tax?: number
  }>
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

/**
 * Create Order from Quote Button
 *
 * Botón para generar Order desde Quote Won
 * Implementa el flujo Quote-to-Cash
 *
 * Requisitos:
 * - Quote debe estar en estado Won (2)
 * - Quote debe tener al menos 1 línea
 *
 * Proceso:
 * 1. Validar estado y líneas
 * 2. Confirmar con usuario
 * 3. Crear Order copiando datos de Quote
 * 4. Copiar Quote Lines → Order Lines
 * 5. Navegar a nuevo Order
 */
export function CreateOrderFromQuoteButton({
  quote,
  quoteLines,
  variant = 'default',
  size = 'default',
  className,
}: CreateOrderFromQuoteButtonProps) {
  const router = useRouter()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const createOrderMutation = useCreateOrderFromQuote()

  // Validation: Quote must be Won (state = 2)
  const QuoteStateCode = {
    Draft: 0,
    Active: 1,
    Won: 2,
    Closed: 3,
  }
  const isWon = quote.statecode === QuoteStateCode.Won
  const hasLines = quoteLines.length > 0

  const canCreateOrder = isWon && hasLines

  const handleCreateOrder = async () => {
    try {
      // Backend/Mock service will fetch quote data and create order automatically
      const order = await createOrderMutation.mutateAsync(quote.quoteid)

      toast.success('Order created successfully from quote', {
        description: `Order ${order.ordernumber || order.salesorderid} has been created`,
        action: {
          label: 'View Order',
          onClick: () => router.push(`/orders/${order.salesorderid}`),
        },
      })

      setShowConfirmDialog(false)

      // Navigate to new order
      router.push(`/orders/${order.salesorderid}`)
    } catch (error) {
      console.error('Error creating order from quote:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create order from quote'
      )
    }
  }

  // Show tooltip if not available
  let disabledReason = ''
  if (!isWon) disabledReason = 'Quote must be Won to create an order'
  else if (!hasLines) disabledReason = 'Quote must have at least one line item'

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowConfirmDialog(true)}
        disabled={!canCreateOrder || createOrderMutation.isPending}
        title={disabledReason || 'Create order from this quote'}
      >
        {createOrderMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            Create Order
          </>
        )}
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Create Order from Quote?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will create a new sales order based on this quote with all its line
                  items.
                </p>
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Order will be created in "Active" status</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>All quote line items will be copied to the order</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Order will be linked to this quote and opportunity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Order can be submitted for fulfillment after review
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quote: <span className="font-medium">{quote.name}</span>
                  <br />
                  Total Amount:{' '}
                  <span className="font-medium">
                    ${quote.totalamount.toFixed(2)}
                  </span>
                  <br />
                  Line Items: <span className="font-medium">{quoteLines.length}</span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createOrderMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Create Order
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
