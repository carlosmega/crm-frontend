'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, AlertTriangle, XCircle, Package } from 'lucide-react'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import { cn } from '@/lib/utils'

export interface LineItemVerification {
  orderdetailid: string
  quantityOrdered: number
  quantityReceived: number
  notes?: string
}

interface FulfillLineItemsVerificationProps {
  lineItems: OrderDetail[]
  verifications: LineItemVerification[]
  onVerificationChange: (verifications: LineItemVerification[]) => void
}

type LineItemStatus = 'complete' | 'partial' | 'pending' | 'excess'

/**
 * Fulfill Line Items Verification Component
 *
 * Interactive table for verifying received quantities during order fulfillment
 */
export function FulfillLineItemsVerification({
  lineItems,
  verifications,
  onVerificationChange,
}: FulfillLineItemsVerificationProps) {
  const getLineItemStatus = (ordered: number, received: number): LineItemStatus => {
    if (received === 0) return 'pending'
    if (received > ordered) return 'excess'
    if (received < ordered) return 'partial'
    return 'complete'
  }

  const getStatusBadge = (status: LineItemStatus) => {
    switch (status) {
      case 'complete':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        )
      case 'partial':
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600 border-gray-300">
            <Package className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'excess':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Excess
          </Badge>
        )
    }
  }

  const updateVerification = (
    orderdetailid: string,
    field: keyof LineItemVerification,
    value: number | string
  ) => {
    const updated = verifications.map((v) =>
      v.orderdetailid === orderdetailid ? { ...v, [field]: value } : v
    )
    onVerificationChange(updated)
  }

  const getVerification = (orderdetailid: string): LineItemVerification => {
    return (
      verifications.find((v) => v.orderdetailid === orderdetailid) || {
        orderdetailid,
        quantityOrdered: 0,
        quantityReceived: 0,
        notes: '',
      }
    )
  }

  // Calculate summary statistics
  const summary = useMemo(() => {
    let totalLines = lineItems.length
    let completeLines = 0
    let partialLines = 0
    let pendingLines = 0
    let excessLines = 0

    lineItems.forEach((item) => {
      const verification = getVerification(item.salesorderdetailid)
      const status = getLineItemStatus(verification.quantityOrdered, verification.quantityReceived)

      switch (status) {
        case 'complete':
          completeLines++
          break
        case 'partial':
          partialLines++
          break
        case 'pending':
          pendingLines++
          break
        case 'excess':
          excessLines++
          break
      }
    })

    return {
      totalLines,
      completeLines,
      partialLines,
      pendingLines,
      excessLines,
      completionRate: totalLines > 0 ? (completeLines / totalLines) * 100 : 0,
    }
  }, [lineItems, verifications])

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Summary</CardTitle>
          <CardDescription>
            Review and confirm quantities received for each line item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{summary.totalLines}</p>
              <p className="text-xs text-muted-foreground">Total Lines</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary.completeLines}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{summary.partialLines}</p>
              <p className="text-xs text-muted-foreground">Partial</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{summary.pendingLines}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{summary.completionRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Verification Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items Verification</CardTitle>
          <CardDescription>
            Enter the quantities received for each product. Quantities cannot exceed ordered amounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Product</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center min-w-[120px]">Received</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                  <TableHead className="min-w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No line items found
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item) => {
                    const verification = getVerification(item.salesorderdetailid)
                    const status = getLineItemStatus(
                      verification.quantityOrdered,
                      verification.quantityReceived
                    )
                    const hasError = verification.quantityReceived > verification.quantityOrdered

                    return (
                      <TableRow key={item.salesorderdetailid}>
                        {/* Product Name */}
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productid}</p>
                            {item.productdescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.productdescription}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Quantity Ordered */}
                        <TableCell className="text-center">
                          <span className="font-semibold">{verification.quantityOrdered}</span>
                        </TableCell>

                        {/* Quantity Received (Editable) */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={verification.quantityOrdered}
                              value={verification.quantityReceived}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                updateVerification(
                                  item.salesorderdetailid,
                                  'quantityReceived',
                                  value
                                )
                              }}
                              className={cn(
                                'w-20 text-center',
                                hasError && 'border-destructive focus-visible:ring-destructive'
                              )}
                            />
                          </div>
                          {hasError && (
                            <p className="text-xs text-destructive mt-1">
                              Exceeds ordered qty
                            </p>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">{getStatusBadge(status)}</TableCell>

                        {/* Unit Price */}
                        <TableCell className="text-right">
                          {formatCurrency(item.priceperunit)}
                        </TableCell>

                        {/* Line Total */}
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.extendedamount)}
                        </TableCell>

                        {/* Notes (Editable) */}
                        <TableCell>
                          <Textarea
                            value={verification.notes || ''}
                            onChange={(e) =>
                              updateVerification(
                                item.salesorderdetailid,
                                'notes',
                                e.target.value
                              )
                            }
                            placeholder="Add notes (damaged, missing, etc.)"
                            rows={2}
                            className="min-w-[200px] text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Warnings */}
          {summary.excessLines > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">
                    Excess Quantities Detected
                  </p>
                  <p className="text-sm text-destructive/80">
                    Some line items have received quantities exceeding ordered amounts. Please
                    verify and correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {summary.partialLines > 0 && (
            <div className="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-700 dark:text-orange-300">
                    Partial Fulfillment Warning
                  </p>
                  <p className="text-sm text-orange-600">
                    {summary.partialLines} line item{summary.partialLines > 1 ? 's have' : ' has'}
                    {' '}partial quantities. The order will be marked as partially fulfilled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
