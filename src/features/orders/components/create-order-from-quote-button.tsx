'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreateOrderFromQuote, useOrdersByQuote } from '../hooks/use-orders'
import { OrderStateCode } from '@/core/contracts/enums'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Loader2, Package, CheckCircle2, Info, AlertTriangle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/hooks/use-translation'

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
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const router = useRouter()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const createOrderMutation = useCreateOrderFromQuote()

  // ✅ DYNAMICS 365 STANDARD: Check for existing orders from this quote
  const { data: existingOrders = [], isLoading: isCheckingOrders } = useOrdersByQuote(quote.quoteid)

  // Validation: Quote must be Won (state = 2)
  const QuoteStateCode = {
    Draft: 0,
    Active: 1,
    Won: 2,
    Closed: 3,
  }
  const isWon = quote.statecode === QuoteStateCode.Won
  const hasLines = quoteLines.length > 0

  // ✅ DYNAMICS 365 STANDARD: Prevent duplicate orders (1 Quote → 1 Order)
  // Active orders are those NOT in Canceled state
  const activeOrders = existingOrders.filter(
    (order) => order.statecode !== OrderStateCode.Canceled
  )
  const cancelledOrders = existingOrders.filter(
    (order) => order.statecode === OrderStateCode.Canceled
  )

  const hasActiveOrders = activeOrders.length > 0
  const hasCancelledOrders = cancelledOrders.length > 0

  const canCreateOrder = isWon && hasLines && !hasActiveOrders

  const handleCreateOrder = async () => {
    try {
      // Backend/Mock service will fetch quote data and create order automatically
      const order = await createOrderMutation.mutateAsync(quote.quoteid)

      toast.success(t('createFromQuote.successToast'), {
        description: t('createFromQuote.orderCreated', { number: order.ordernumber || order.salesorderid }),
        action: {
          label: t('createFromQuote.viewOrder'),
          onClick: () => router.push(`/orders/${order.salesorderid}`),
        },
      })

      setShowConfirmDialog(false)

      // Navigate to new order
      router.push(`/orders/${order.salesorderid}`)
    } catch (error) {
      console.error('Error creating order from quote:', error)
      toast.error(
        error instanceof Error ? error.message : t('createFromQuote.errorToast')
      )
    }
  }

  // Show tooltip if not available
  let disabledReason = ''
  if (!isWon) disabledReason = t('createFromQuote.disabledReasons.mustBeWon')
  else if (!hasLines) disabledReason = t('createFromQuote.disabledReasons.needsLineItems')
  else if (hasActiveOrders) disabledReason = t('createFromQuote.disabledReasons.orderExists')

  // Show loading state while checking for existing orders
  if (isCheckingOrders) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('createFromQuote.checkingOrders')}
      </Button>
    )
  }

  // ✅ SCENARIO 1: Active order exists - prevent duplicate order creation
  if (hasActiveOrders) {
    const order = activeOrders[0]
    return (
      <div className="space-y-3">
        <Button
          variant="outline"
          size={size}
          className={className}
          disabled
          title={disabledReason}
        >
          <Package className="mr-2 h-4 w-4" />
          {t('createFromQuote.button')}
        </Button>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t('createFromQuote.alerts.orderExists.title')}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{t('createFromQuote.alerts.orderExists.description')}</p>
            <Link
              href={`/orders/${order.salesorderid}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {order.ordernumber || order.name}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ✅ SCENARIO 2: No active orders (may have cancelled orders)
  return (
    <div className="space-y-3">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowConfirmDialog(true)}
        disabled={!canCreateOrder || createOrderMutation.isPending}
        title={disabledReason || t('createFromQuote.tooltip')}
      >
        {createOrderMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('createFromQuote.creating')}
          </>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            {t('createFromQuote.button')}
          </>
        )}
      </Button>

      {/* ✅ SCENARIO 3: Warn if cancelled orders exist */}
      {hasCancelledOrders && (
        <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            {t('createFromQuote.alerts.cancelledOrder.description')}
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {t('createFromQuote.dialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {t('createFromQuote.description')}
                </p>
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('createFromQuote.bulletPoints.activeStatus')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('createFromQuote.bulletPoints.copyLineItems')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t('createFromQuote.bulletPoints.linkedToQuote')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      {t('createFromQuote.bulletPoints.submitAfterReview')}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('createFromQuote.quoteLabel')} <span className="font-medium">{quote.name}</span>
                  <br />
                  {t('createFromQuote.totalAmount')}{' '}
                  <span className="font-medium">
                    ${quote.totalamount.toFixed(2)}
                  </span>
                  <br />
                  {t('createFromQuote.lineItemsLabel')} <span className="font-medium">{quoteLines.length}</span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createOrderMutation.isPending}>
              {tc('buttons.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('createFromQuote.creatingOrder')}
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  {t('createFromQuote.button')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
