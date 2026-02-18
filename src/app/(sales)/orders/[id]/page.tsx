'use client'

import { use, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useOrder, useCancelOrder, useSubmitOrder } from '@/features/orders/hooks/use-orders'
import { useOrderDetails } from '@/features/orders/hooks/use-order-details'
import { useOrderPdfExport } from '@/features/orders/hooks/use-order-pdf-export'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useContact } from '@/features/contacts/hooks/use-contacts'
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'
import { GenerateInvoiceButton } from '@/features/orders/components/generate-invoice-button'
import { OrderStateCode } from '@/core/contracts/enums'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import { useTranslation } from '@/shared/hooks/use-translation'

// ✅ PERFORMANCE: Dynamic imports for tabs and dialogs
const OrderDetailTabs = dynamic(
  () => import('@/features/orders/components/order-detail-tabs').then(mod => ({ default: mod.OrderDetailTabs })),
  { ssr: false }
)

const AddOrderLineDialog = dynamic(
  () => import('@/features/orders/components/add-order-line-dialog').then(mod => ({ default: mod.AddOrderLineDialog })),
  { ssr: false }
)

const SendDocumentEmailDialog = dynamic(
  () => import('@/shared/components/send-document-email').then(mod => ({ default: mod.SendDocumentEmailDialog })),
  { ssr: false }
)

import { useToast } from '@/components/ui/use-toast'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  MoreVertical,
  XCircle,
  FileDown,
  Package,
  Pencil,
  Send,
  Mail,
} from 'lucide-react'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Order Detail Page
 *
 * Vista detallada de una orden con información completa
 */
export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')

  const { data: order, isLoading: loading, error } = useOrder(id)
  const { data: orderDetails, isLoading: loadingDetails } = useOrderDetails(id)
  const cancelMutation = useCancelOrder()
  const submitMutation = useSubmitOrder()
  const { exportToPdf, generatePdfBlob, isExporting } = useOrderPdfExport()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showAddLineDialog, setShowAddLineDialog] = useState(false)
  const [editingLine, setEditingLine] = useState<OrderDetail | null>(null)

  const canSubmit = order?.statecode === OrderStateCode.Active
  const canFulfill = order?.statecode === OrderStateCode.Submitted
  const canCancel = order?.statecode === OrderStateCode.Active || order?.statecode === OrderStateCode.Submitted
  const canEditLines = order?.statecode === OrderStateCode.Active
  const canGenerateInvoice = order?.statecode === OrderStateCode.Fulfilled

  // Resolve customer email
  const isAccountCustomer = order?.customeridtype === 'account'
  const { account } = useAccount(isAccountCustomer ? (order?.customerid || '') : '')
  const { contact } = useContact(!isAccountCustomer ? (order?.customerid || '') : '')
  const customerEmail = isAccountCustomer ? account?.emailaddress1 : contact?.emailaddress1
  const customerName = isAccountCustomer ? account?.name : (contact?.fullname || `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim())

  const handleCancelOrder = async () => {
    try {
      await cancelMutation.mutateAsync({ id })

      toast({
        title: 'Order Canceled',
        description: 'The order has been successfully canceled.',
      })

      setShowCancelDialog(false)
    } catch (error) {
      console.error('Error canceling order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitOrder = async () => {
    try {
      await submitMutation.mutateAsync(id)

      toast({
        title: 'Order Submitted',
        description: 'The order has been submitted and is ready for fulfillment.',
      })

      setShowSubmitDialog(false)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit order. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-4">
            Error loading order: {error.message}
          </p>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !order) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Mobile actions dropdown
  const mobileActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => exportToPdf(id, order, orderDetails || [])}
          disabled={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? tc('actions.exporting') : tc('actions.exportPdf')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowSendEmailDialog(true)}>
          <Mail className="mr-2 h-4 w-4" />
          {tc('actions.sendEmail')}
        </DropdownMenuItem>
        {canEditLines && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/orders/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Order
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {canSubmit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSubmitDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Submit Order
            </DropdownMenuItem>
          </>
        )}
        {canFulfill && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/orders/${id}/fulfill`}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Fulfill Order
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {canGenerateInvoice && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const button = document.querySelector('[data-generate-invoice-button]') as HTMLButtonElement
                button?.click()
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Invoice
            </DropdownMenuItem>
          </>
        )}
        {canCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowCancelDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/orders"
        entityType="ORDERS"
        title={order.name}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: tc('breadcrumbs.sales'), href: '/dashboard' },
          { label: tc('breadcrumbs.orders'), href: '/orders' },
          { label: order.name },
        ]}
      />

      {/* Content - Fondo gris igual que contacts/accounts/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY SECTION - Order Info Header + Actions + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Order Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Order Info */}
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{order.name}</h1>
                  <OrderStatusBadge statecode={order.statecode} />
                </div>
                {order.ordernumber && (
                  <p className="text-muted-foreground mt-1 font-mono">
                    Order #{order.ordernumber}
                  </p>
                )}
                {order.description && (
                  <p className="text-muted-foreground mt-2">{order.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                {canEditLines && (
                  <Button variant="outline" asChild>
                    <Link href={`/orders/${id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Order
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => exportToPdf(id, order, orderDetails || [])}
                  disabled={isExporting}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isExporting ? tc('actions.exporting') : tc('actions.exportPdf')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSendEmailDialog(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {tc('actions.sendEmail')}
                </Button>
                {canSubmit && (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Order
                  </Button>
                )}
                {canFulfill && (
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                    <Link href={`/orders/${id}/fulfill`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Fulfill Order
                    </Link>
                  </Button>
                )}
                {canGenerateInvoice && order && orderDetails && (
                  <div data-generate-invoice-button>
                    <GenerateInvoiceButton order={order} orderLines={orderDetails} />
                  </div>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
            <div className="md:hidden">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{order.name}</h2>
                <OrderStatusBadge statecode={order.statecode} />
              </div>
              {order.ordernumber && (
                <p className="text-muted-foreground font-mono text-sm">
                  Order #{order.ordernumber}
                </p>
              )}
              {order.description && (
                <p className="text-muted-foreground mt-2">{order.description}</p>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="order-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with order details */}
        <div className="px-4 pb-4 pt-1">
          <OrderDetailTabs
            order={order}
            orderLines={orderDetails || []}
          />
        </div>
      </div>

      {/* Submit Order Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, the order will be locked for editing and ready for fulfillment.
              Make sure all order lines are correct before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-submit-order-button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitOrder}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                tc('actions.submitOrder')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              No, Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleCancelOrder}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Order Line Dialog */}
      <AddOrderLineDialog
        orderId={id}
        open={showAddLineDialog}
        onOpenChange={(open) => {
          setShowAddLineDialog(open)
          if (!open) setEditingLine(null)
        }}
        editItem={editingLine}
      />

      {/* Send Email Dialog */}
      {order && (
        <SendDocumentEmailDialog
          open={showSendEmailDialog}
          onOpenChange={setShowSendEmailDialog}
          documentType="order"
          documentId={id}
          documentNumber={order.ordernumber || id}
          documentName={order.name}
          customerEmail={customerEmail}
          customerName={customerName}
          totalAmount={order.totalamount != null ? `$${order.totalamount.toLocaleString()}` : undefined}
          onGeneratePdf={() => generatePdfBlob(id, order, orderDetails || [])}
        />
      )}
    </>
  )
}
