'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuoteStateBadge } from './quote-state-badge'
import { QuoteStatusBadge } from './quote-status-badge'
import type { Quote } from '../types'
import { QuoteStateCode } from '@/core/contracts/enums'
import {
  isQuoteEditable,
  isQuoteActive,
  isQuoteDraft,
  isQuoteWon,
} from '../utils/quote-helpers'
import {
  Edit,
  MoreVertical,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  XCircle,
  RotateCcw,
  Trash2,
  Copy,
  Save,
  FileText,
} from 'lucide-react'
import { useQuotePdfExport } from '../hooks/use-quote-pdf-export'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteInfoHeaderProps {
  quote: Quote
  onActivate?: () => void
  onWin?: () => void
  onLose?: () => void
  onCancel?: () => void
  onRevise?: () => void
  onDelete?: () => void
  onClone?: () => void
  onSaveAsTemplate?: () => void
  isCloning?: boolean
  hideActions?: boolean
}

/**
 * Quote Info Header
 *
 * Header con información del quote y acciones contextuales según estado
 */
export function QuoteInfoHeader({
  quote,
  onActivate,
  onWin,
  onLose,
  onCancel,
  onRevise,
  onDelete,
  onClone,
  onSaveAsTemplate,
  isCloning = false,
  hideActions = false,
}: QuoteInfoHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { exportToPdf, isExporting } = useQuotePdfExport()
  const { t } = useTranslation('quotes')

  const canEdit = isQuoteEditable(quote)
  const canActivate = isQuoteDraft(quote)
  const canWin = isQuoteActive(quote)
  const canLose = isQuoteActive(quote) || isQuoteDraft(quote)
  const canRevise = !isQuoteWon(quote) && !isQuoteDraft(quote)
  const canDelete = isQuoteDraft(quote)

  const handleEdit = () => {
    router.push(`/quotes/${quote.quoteid}/edit`)
  }

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Quote Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold truncate">{quote.name}</h1>
        </div>

        {quote.quotenumber && (
          <p className="text-sm text-muted-foreground mb-3">
            {t('header.quoteNumber')} {quote.quotenumber}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <QuoteStateBadge statecode={quote.statecode} />
          <QuoteStatusBadge statuscode={quote.statuscode} />
        </div>

        {quote.description && (
          <p className="text-muted-foreground mt-3 max-w-3xl">
            {quote.description}
          </p>
        )}
      </div>

      {/* Actions */}
      {!hideActions && (
        <div className="flex items-center gap-2">
          {/* Primary Action based on state */}
          {canActivate && onActivate && (
            <Button onClick={onActivate} size="lg">
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('header.activateQuote')}
            </Button>
          )}

          {canWin && onWin && (
            <Button onClick={onWin} size="lg">
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('header.winQuote')}
            </Button>
          )}

          {canEdit && (
            <Button onClick={handleEdit} variant="outline" size="lg">
              <Edit className="mr-2 h-4 w-4" />
              {t('header.edit')}
            </Button>
          )}

          {/* More Actions Menu */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('header.editQuote')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {canActivate && onActivate && (
                <DropdownMenuItem onClick={onActivate}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('header.activateQuote')}
                </DropdownMenuItem>
              )}

              {canWin && onWin && (
                <DropdownMenuItem onClick={onWin}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('header.winQuote')}
                </DropdownMenuItem>
              )}

              {canLose && onLose && (
                <DropdownMenuItem onClick={onLose}>
                  <TrendingDown className="mr-2 h-4 w-4" />
                  {t('header.loseQuote')}
                </DropdownMenuItem>
              )}

              {canRevise && onRevise && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onRevise}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('header.reviseQuote')}
                  </DropdownMenuItem>
                </>
              )}

              {onCancel && !isQuoteWon(quote) && (
                <DropdownMenuItem onClick={onCancel}>
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('header.cancelQuote')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onClone && (
                <DropdownMenuItem onClick={onClone} disabled={isCloning}>
                  <Copy className="mr-2 h-4 w-4" />
                  {isCloning ? t('header.cloning') : t('header.cloneQuote')}
                </DropdownMenuItem>
              )}

              {onSaveAsTemplate && (
                <DropdownMenuItem onClick={onSaveAsTemplate}>
                  <Save className="mr-2 h-4 w-4" />
                  {t('header.saveAsTemplate')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => exportToPdf(quote.quoteid)}
                disabled={isExporting}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isExporting ? t('header.exporting') : t('header.exportPdf')}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(quote.quoteid)
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t('header.copyQuoteId')}
              </DropdownMenuItem>

              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('header.deleteQuote')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
