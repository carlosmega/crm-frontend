'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { returnRequestService } from '../api/return-request-service'
import type { Order } from '@/core/contracts/entities/order'
import {
  ReturnReasonCode,
  ReturnTypeCode,
} from '@/core/contracts/entities/return-request'
import { CustomerType } from '@/core/contracts/enums'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/shared/hooks/use-translation'

/**
 * Request Return Dialog Component
 *
 * Dialog para crear solicitudes de devolución (RMA)
 */

interface RequestReturnDialogProps {
  order: Order
  children?: React.ReactNode
}

const RETURN_REASON_KEYS: Record<ReturnReasonCode, string> = {
  [ReturnReasonCode.Defective]: 'defective',
  [ReturnReasonCode.WrongItem]: 'wrongItem',
  [ReturnReasonCode.Damaged]: 'damaged',
  [ReturnReasonCode.NotAsDescribed]: 'notAsDescribed',
  [ReturnReasonCode.ChangedMind]: 'changedMind',
  [ReturnReasonCode.BetterPrice]: 'betterPrice',
  [ReturnReasonCode.OrderError]: 'orderError',
  [ReturnReasonCode.LateDelivery]: 'lateDelivery',
  [ReturnReasonCode.NoLongerNeeded]: 'noLongerNeeded',
  [ReturnReasonCode.Other]: 'other',
}

const RETURN_TYPE_KEYS: Record<ReturnTypeCode, string> = {
  [ReturnTypeCode.FullRefund]: 'fullRefund',
  [ReturnTypeCode.PartialRefund]: 'partialRefund',
  [ReturnTypeCode.Exchange]: 'exchange',
  [ReturnTypeCode.StoreCredit]: 'storeCredit',
  [ReturnTypeCode.Replacement]: 'replacement',
}

export function RequestReturnDialog({ order, children }: RequestReturnDialogProps) {
  const { t } = useTranslation('orders')
  const formatCurrency = useCurrencyFormat()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [returnReason, setReturnReason] = useState<ReturnReasonCode>()
  const [returnType, setReturnType] = useState<ReturnTypeCode>()
  const [reasonDetails, setReasonDetails] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')

  const handleSubmit = async () => {
    if (!returnReason || !returnType) return

    setIsSubmitting(true)
    try {
      await returnRequestService.create({
        name: `Return Request for ${order.name}`,
        salesorderid: order.salesorderid,
        customerid: order.customerid,
        customeridtype: order.customeridtype as CustomerType,
        ownerid: order.ownerid,
        returnreason: returnReason,
        returnreasondetails: reasonDetails,
        returntypecode: returnType,
        totalamount: order.totalamount,
        customernotes: customerNotes,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating return request:', error)
      toast.error('Failed to create return request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('requestReturn.button')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('requestReturn.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('requestReturn.description', { number: order.ordernumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">{t('requestReturn.orderDetails')}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('requestReturn.orderNumber')}</span>
                <span className="font-medium">{order.ordernumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('requestReturn.totalAmount')}</span>
                <span className="font-semibold">{formatCurrency(order.totalamount)}</span>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div className="space-y-2">
            <Label htmlFor="return-reason">
              {t('requestReturn.returnReason')}
            </Label>
            <Select
              value={returnReason?.toString()}
              onValueChange={(val) => setReturnReason(Number(val) as ReturnReasonCode)}
            >
              <SelectTrigger id="return-reason">
                <SelectValue placeholder={t('requestReturn.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RETURN_REASON_KEYS).map(([code, key]) => (
                  <SelectItem key={code} value={code.toString()}>
                    {t(`requestReturn.reasons.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Return Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reason-details">{t('requestReturn.reasonDetails')}</Label>
            <Textarea
              id="reason-details"
              placeholder={t('requestReturn.reasonPlaceholder')}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Return Type */}
          <div className="space-y-2">
            <Label htmlFor="return-type">
              {t('requestReturn.resolutionType')}
            </Label>
            <Select
              value={returnType?.toString()}
              onValueChange={(val) => setReturnType(Number(val) as ReturnTypeCode)}
            >
              <SelectTrigger id="return-type">
                <SelectValue placeholder={t('requestReturn.selectResolution')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RETURN_TYPE_KEYS).map(([code, key]) => (
                  <SelectItem key={code} value={code.toString()}>
                    <div>
                      <div className="font-medium">{t(`requestReturn.types.${key}`)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(`requestReturn.types.${key}Desc`)}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Notes */}
          <div className="space-y-2">
            <Label htmlFor="customer-notes">{t('requestReturn.comments')}</Label>
            <Textarea
              id="customer-notes"
              placeholder={t('requestReturn.commentsPlaceholder')}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {t('requestReturn.noticeTitle')}
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>{t('requestReturn.noticeItems.reviewTime')}</li>
                  <li>{t('requestReturn.noticeItems.restockingFee')}</li>
                  <li>{t('requestReturn.noticeItems.shippingNonRefundable')}</li>
                  <li>{t('requestReturn.noticeItems.rmaNumber')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!returnReason || !returnType || isSubmitting}
          >
            {isSubmitting ? t('requestReturn.submitting') : t('requestReturn.submitButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
