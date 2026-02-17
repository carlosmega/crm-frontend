'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Loader2 } from 'lucide-react'
import { useCreateInvoiceFromOrder } from '@/features/invoices/hooks'
import type { Order } from '@/core/contracts/entities/order'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { OrderStateCode } from '@/core/contracts/enums'
import { formatCurrency } from '@/features/invoices/utils/invoice-calculations'
import { useTranslation } from '@/shared/hooks/use-translation'

interface GenerateInvoiceButtonProps {
  order: Order
  orderLines: OrderDetail[]
}

export function GenerateInvoiceButton({
  order,
  orderLines,
}: GenerateInvoiceButtonProps) {
  const { t } = useTranslation('orders')
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const createInvoiceMutation = useCreateInvoiceFromOrder()

  // Only show for Fulfilled orders
  const canGenerateInvoice = order.statecode === OrderStateCode.Fulfilled

  if (!canGenerateInvoice) {
    return null
  }

  const handleGenerateInvoice = async () => {
    try {
      // Backend/Mock service handles fetching order data and creating invoice
      const invoice = await createInvoiceMutation.mutateAsync(order.salesorderid)

      toast({
        title: t('generateInvoice.successToast'),
        description: t('generateInvoice.invoiceCreated', { number: invoice.invoicenumber }),
      })

      setIsOpen(false)

      // Navigate to the new invoice
      router.push(`/invoices/${invoice.invoiceid}`)
    } catch (error) {
      toast({
        title: t('generateInvoice.errorTitle'),
        description:
          error instanceof Error
            ? error.message
            : t('generateInvoice.errorToast'),
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <FileText className="h-4 w-4 mr-2" />
        {t('generateInvoice.button')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('generateInvoice.dialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('generateInvoice.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{t('generateInvoice.orderLabel')}</p>
              <p className="font-medium">{order.name}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">{t('generateInvoice.totalAmount')}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(order.totalamount)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">{t('generateInvoice.lineItemsLabel')}</p>
              <p className="font-medium">{orderLines.length} {t('generateInvoice.items')}</p>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
              <p className="text-sm text-blue-800">
                {t('generateInvoice.notice', { status: t('generateInvoice.activeStatus') })}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {t('generateInvoice.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
