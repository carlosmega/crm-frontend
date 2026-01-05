'use client'

import { useState } from 'react'
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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<QuoteTemplateCategory>(
    QuoteTemplateCategory.Custom
  )
  const [isShared, setIsShared] = useState(false)

  const saveAsTemplate = useSaveQuoteAsTemplate()

  const handleSave = () => {
    if (!name.trim()) {
      alert('Template name is required')
      return
    }

    if (quoteLines.length === 0) {
      alert('Cannot save empty quote as template')
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
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this quote as a reusable template. It will include all{' '}
            {quoteLines.length} product {quoteLines.length === 1 ? 'line' : 'lines'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Software License"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="template-category">Category</Label>
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
                  Standard
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Custom}>
                  Custom
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Service}>
                  Service
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Product}>
                  Product
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Bundle}>
                  Bundle
                </SelectItem>
                <SelectItem value={QuoteTemplateCategory.Industry}>
                  Industry-Specific
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
                Share with team
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this template available to all users
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="text-sm font-medium">Template Preview</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products:</span>
                <span className="font-medium">{quoteLines.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span className="font-medium">
                  {isShared ? 'Shared (Team)' : 'Private'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
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
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveAsTemplate.isPending}
          >
            {saveAsTemplate.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
