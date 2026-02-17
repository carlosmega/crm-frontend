'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { QuoteTemplateCategory } from '@/core/contracts'
import type { Quote } from '@/core/contracts'
import { useSaveQuoteAsTemplate } from '../hooks/use-quote-templates'
import { useTranslation } from '@/shared/hooks/use-translation'

interface SaveAsTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote: Quote
  quoteLines: any[]
}

/**
 * Save Quote as Template Dialog
 *
 * Permite guardar una Quote existente como template reutilizable
 */
export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  quote,
  quoteLines,
}: SaveAsTemplateDialogProps) {
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<QuoteTemplateCategory>(
    QuoteTemplateCategory.Custom
  )
  const [isShared, setIsShared] = useState(false)

  const saveAsTemplate = useSaveQuoteAsTemplate()

  const handleSave = () => {
    if (!name.trim()) {
      toast.warning('Template name is required')
      return
    }

    if (quoteLines.length === 0) {
      toast.warning('Cannot save empty quote as template')
      return
    }

    saveAsTemplate.mutate(
      {
        quote,
        quoteLines,
        templateData: {
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          isshared: isShared,
        },
      },
      {
        onSuccess: () => {
          // Reset form
          setName('')
          setDescription('')
          setCategory(QuoteTemplateCategory.Custom)
          setIsShared(false)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('dialog.saveTemplate.title')}</DialogTitle>
          <DialogDescription>
            {t('dialog.saveTemplate.description', {
              count: quoteLines.length,
              item: quoteLines.length === 1 ? t('dialog.saveTemplate.line') : t('dialog.saveTemplate.lines'),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              {t('dialog.saveTemplate.templateName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('dialog.saveTemplate.templateNamePlaceholder')}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">{t('dialog.saveTemplate.templateDescription')}</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dialog.saveTemplate.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="template-category">{t('dialog.saveTemplate.category')}</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as QuoteTemplateCategory)
              }
            >
              <SelectTrigger id="template-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuoteTemplateCategory.Standard}>
                  {t('dialog.saveTemplate.categories.standard')}
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Custom}>
                  {t('dialog.saveTemplate.categories.custom')}
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Service}>
                  {t('dialog.saveTemplate.categories.service')}
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Product}>
                  {t('dialog.saveTemplate.categories.product')}
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Bundle}>
                  {t('dialog.saveTemplate.categories.bundle')}
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Industry}>
                  {t('dialog.saveTemplate.categories.industrySpecific')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share with Team */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="template-shared"
              checked={isShared}
              onCheckedChange={(checked) => setIsShared(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="template-shared"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {t('dialog.saveTemplate.shareWithTeam')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('dialog.saveTemplate.shareDescription')}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="text-sm font-medium">{t('dialog.saveTemplate.preview')}</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dialog.saveTemplate.productsCount')}</span>
                <span className="font-medium">{quoteLines.length} {t('dialog.saveTemplate.items')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dialog.saveTemplate.visibilityLabel')}</span>
                <span className="font-medium">
                  {isShared ? t('dialog.saveTemplate.sharedTeam') : t('dialog.saveTemplate.private')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dialog.saveTemplate.categoryLabel')}</span>
                <span className="font-medium capitalize">{category}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveAsTemplate.isPending}
          >
            {tc('buttons.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveAsTemplate.isPending}
          >
            {saveAsTemplate.isPending ? t('dialog.saveTemplate.saving') : t('dialog.saveTemplate.saveTemplate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
