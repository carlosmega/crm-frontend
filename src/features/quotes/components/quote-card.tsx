import { memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuoteStateBadge } from './quote-state-badge'
import { QuoteStatusBadge } from './quote-status-badge'
import type { Quote } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { getExpirationStatusMessage } from '../utils/quote-helpers'
import {
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'

interface QuoteCardProps {
  quote: Quote
}

/**
 * Quote Card Component (Optimizado)
 *
 * Tarjeta individual para mostrar resumen de Quote
 * ✅ Memoizado con React.memo para evitar re-renders innecesarios en listas
 */
export const QuoteCard = memo(function QuoteCard({ quote }: QuoteCardProps) {
  const expirationMessage = getExpirationStatusMessage(quote.effectiveto)
  const isExpired =
    quote.effectiveto && new Date(quote.effectiveto) < new Date()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/quotes/${quote.quoteid}`}
              className="text-lg font-semibold hover:text-primary hover:underline"
            >
              {quote.name}
            </Link>
            {quote.quotenumber && (
              <p className="text-sm text-muted-foreground mt-1">
                {quote.quotenumber}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <QuoteStateBadge statecode={quote.statecode} />
            <QuoteStatusBadge statuscode={quote.statuscode} />
          </div>
        </div>

        {quote.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {quote.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Total Amount */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Total Amount</span>
          </div>
          <span className="text-lg font-bold">
            {formatCurrency(quote.totalamount)}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {quote.effectivefrom && quote.effectiveto ? (
            <div className="flex flex-col">
              <span className="text-muted-foreground">
                Valid: {new Date(quote.effectivefrom).toLocaleDateString()} -{' '}
                {new Date(quote.effectiveto).toLocaleDateString()}
              </span>
              {expirationMessage && (
                <span
                  className={`text-xs ${
                    isExpired ? 'text-destructive' : 'text-primary'
                  }`}
                >
                  {isExpired && (
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                  )}
                  {expirationMessage}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Dates not set</span>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Created {new Date(quote.createdon).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/quotes/${quote.quoteid}`}>
              View Details
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
