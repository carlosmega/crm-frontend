import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Quote } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { DollarSign } from 'lucide-react'

interface QuoteTotalsSummaryProps {
  quote: Quote
  className?: string
}

/**
 * Quote Totals Summary
 *
 * Muestra el resumen de totales del quote
 */
export function QuoteTotalsSummary({
  quote,
  className,
}: QuoteTotalsSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Quote Totals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Line Items Total */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">
            {formatCurrency(quote.totallineitemamount)}
          </span>
        </div>

        {/* Discount */}
        {quote.totaldiscountamount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(quote.totaldiscountamount)}
            </span>
          </div>
        )}

        {/* Subtotal after discount */}
        {quote.totaldiscountamount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal (after discount):
            </span>
            <span className="font-medium">
              {formatCurrency(
                quote.totallineitemamount - quote.totaldiscountamount
              )}
            </span>
          </div>
        )}

        {/* Tax */}
        {quote.totaltax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span className="font-medium">
              {formatCurrency(quote.totaltax)}
            </span>
          </div>
        )}

        {/* Freight */}
        {quote.freightamount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Freight:</span>
            <span className="font-medium">
              {formatCurrency(quote.freightamount)}
            </span>
          </div>
        )}

        <Separator />

        {/* Total Amount */}
        <div className="flex justify-between">
          <span className="font-semibold">Total Amount:</span>
          <span className="font-bold text-xl">
            {formatCurrency(quote.totalamount)}
          </span>
        </div>

        {/* Amount less freight (if applicable) */}
        {quote.freightamount > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Amount (excl. freight):</span>
            <span>{formatCurrency(quote.totalamountlessfreight)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
