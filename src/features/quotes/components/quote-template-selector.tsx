'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { QuoteTemplate } from '@/core/contracts'
import { useSharedQuoteTemplates } from '../hooks/use-quote-templates'
import { Package, Search, Users, User, FileText } from 'lucide-react'
import { formatCurrency } from '../utils/quote-calculations'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: QuoteTemplate) => void
}

/**
 * Quote Template Selector Dialog
 *
 * Permite seleccionar un template para crear nuevo Quote
 */
export function QuoteTemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: QuoteTemplateSelectorProps) {
  const { t } = useTranslation('quotes')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: templates, isLoading } = useSharedQuoteTemplates()

  // Filter templates by search
  const filteredTemplates = templates?.filter((template) => {
    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.category?.toLowerCase().includes(query)
    )
  })

  const handleSelect = (template: QuoteTemplate) => {
    onSelectTemplate(template)
    onOpenChange(false)
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('templateSelector.title')}</DialogTitle>
          <DialogDescription>
            {t('templateSelector.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('templateSelector.searchPlaceholder')}
            className="pl-9"
          />
        </div>

        {/* Templates List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.quotetemplateid}
                  template={template}
                  onSelect={() => handleSelect(template)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? t('templateSelector.noMatch') : t('templateSelector.noTemplates')}
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  {t('templateSelector.clearSearch')}
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: QuoteTemplate
  onSelect: () => void
}) {
  const { t } = useTranslation('quotes')

  // Calculate total from template lines
  const total = template.templatedata.lines.reduce((sum, line) => {
    const baseAmount = line.quantity * line.priceperunit
    const discount = line.manualdiscountamount || 0
    const tax = line.tax || 0
    return sum + (baseAmount - discount + tax)
  }, 0)

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold group-hover:text-primary transition-colors">
              {template.name}
            </h4>
          </div>

          {/* Description */}
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{template.templatedata.lines.length} {t('templateSelector.items')}</span>
            </div>
            <div className="flex items-center gap-1">
              {template.isshared ? (
                <Users className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              <span>{template.isshared ? t('templateSelector.shared') : t('templateSelector.private')}</span>
            </div>
            {template.usagecount > 0 && (
              <span>{t('templateSelector.usedCount', { count: template.usagecount })}</span>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="text-right space-y-1">
          {template.category && (
            <Badge variant="secondary" className="capitalize">
              {template.category}
            </Badge>
          )}
          <div className="text-lg font-semibold">{formatCurrency(total)}</div>
        </div>
      </div>
    </button>
  )
}
