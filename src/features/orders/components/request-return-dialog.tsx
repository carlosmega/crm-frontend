'use client'

import { useState } from 'react'
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
import { formatCurrency } from '@/shared/utils/formatters'
import { Badge } from '@/components/ui/badge'

/**
 * Request Return Dialog Component
 *
 * Dialog para crear solicitudes de devolución (RMA)
 */

interface RequestReturnDialogProps {
  order: Order
  children?: React.ReactNode
}

const RETURN_REASONS = [
  { code: ReturnReasonCode.Defective, label: 'Defective Product' },
  { code: ReturnReasonCode.WrongItem, label: 'Wrong Item Shipped' },
  { code: ReturnReasonCode.Damaged, label: 'Damaged in Shipping' },
  { code: ReturnReasonCode.NotAsDescribed, label: 'Not As Described' },
  { code: ReturnReasonCode.ChangedMind, label: 'Changed Mind' },
  { code: ReturnReasonCode.BetterPrice, label: 'Found Better Price' },
  { code: ReturnReasonCode.OrderError, label: 'Order Error' },
  { code: ReturnReasonCode.LateDelivery, label: 'Late Delivery' },
  { code: ReturnReasonCode.NoLongerNeeded, label: 'No Longer Needed' },
  { code: ReturnReasonCode.Other, label: 'Other' },
]

const RETURN_TYPES = [
  { code: ReturnTypeCode.FullRefund, label: 'Full Refund', description: 'Get full refund to original payment method' },
  { code: ReturnTypeCode.PartialRefund, label: 'Partial Refund', description: 'Refund for specific items only' },
  { code: ReturnTypeCode.Exchange, label: 'Exchange', description: 'Exchange for different product' },
  { code: ReturnTypeCode.StoreCredit, label: 'Store Credit', description: 'Receive store credit for future purchases' },
  { code: ReturnTypeCode.Replacement, label: 'Replacement', description: 'Replace defective item at no charge' },
]

export function RequestReturnDialog({ order, children }: RequestReturnDialogProps) {
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
      alert('Failed to create return request. Please try again.')
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
            Request Return
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Return or Refund</DialogTitle>
          <DialogDescription>
            Submit a return request for order {order.ordernumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Order Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order #:</span>
                <span className="font-medium">{order.ordernumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">{formatCurrency(order.totalamount)}</span>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div className="space-y-2">
            <Label htmlFor="return-reason">
              Return Reason <span className="text-destructive">*</span>
            </Label>
            <Select
              value={returnReason?.toString()}
              onValueChange={(val) => setReturnReason(Number(val) as ReturnReasonCode)}
            >
              <SelectTrigger id="return-reason">
                <SelectValue placeholder="Select reason for return" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code.toString()}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Return Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reason-details">Additional Details</Label>
            <Textarea
              id="reason-details"
              placeholder="Please provide more details about your return reason..."
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Return Type */}
          <div className="space-y-2">
            <Label htmlFor="return-type">
              Resolution Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={returnType?.toString()}
              onValueChange={(val) => setReturnType(Number(val) as ReturnTypeCode)}
            >
              <SelectTrigger id="return-type">
                <SelectValue placeholder="Select resolution type" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code.toString()}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Notes */}
          <div className="space-y-2">
            <Label htmlFor="customer-notes">Additional Comments (Optional)</Label>
            <Textarea
              id="customer-notes"
              placeholder="Any additional information you'd like to share..."
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
                  Important Information
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Your return request will be reviewed within 1-2 business days</li>
                  <li>A restocking fee may apply based on return reason</li>
                  <li>Original shipping costs are non-refundable unless item is defective</li>
                  <li>You'll receive an RMA number once approved</li>
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
            {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
