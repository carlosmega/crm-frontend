'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { QuoteLineItemsTable } from './quote-line-items-table'
import { QuoteLineItemForm } from './quote-line-item-form'
import type { QuoteTemplate, UpdateQuoteTemplateDto } from '@/core/contracts'
import { QuoteTemplateCategory } from '@/core/contracts'
import type { QuoteDetail } from '../types'
import {
  useUpdateQuoteTemplate,
  useDeleteQuoteTemplate,
} from '../hooks/use-quote-templates'
import { formatCurrency } from '../utils/quote-calculations'
import {
  Package,
  Pencil,
  Trash2,
  Plus,
  Users,
  User,
  BarChart3,
  Eye,
} from 'lucide-react'

interface QuoteTemplateDetailSheetProps {
  template: QuoteTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Convert template lines to QuoteDetail format for the table component
 */
function templateLinesToQuoteDetails(
  template: QuoteTemplate
): QuoteDetail[] {
  return template.templatedata.lines.map((line, index) => {
    const baseamount = line.quantity * line.priceperunit
    const discount = line.manualdiscountamount || 0
    const tax = line.tax || 0
    const extendedamount = baseamount - discount + tax

    return {
      quotedetailid: `tpl-line-${index}`,
      quoteid: template.quotetemplateid,
      productid: line.productid,
      productdescription: line.productdescription,
      lineitemnumber: index + 1,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      baseamount,
      manualdiscountamount: discount,
      tax,
      extendedamount,
      createdon: template.createdon,
      modifiedon: template.modifiedon,
    }
  })
}

/**
 * Calculate totals from template lines
 */
function calculateTemplateTotals(template: QuoteTemplate) {
  return template.templatedata.lines.reduce(
    (acc, line) => {
      const baseamount = line.quantity * line.priceperunit
      const discount = line.manualdiscountamount || 0
      const tax = line.tax || 0
      const extended = baseamount - discount + tax

      return {
        subtotal: acc.subtotal + baseamount,
        totalDiscount: acc.totalDiscount + discount,
        totalTax: acc.totalTax + tax,
        total: acc.total + extended,
      }
    },
    { subtotal: 0, totalDiscount: 0, totalTax: 0, total: 0 }
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  standard: 'Standard',
  custom: 'Custom',
  industry: 'Industry',
  service: 'Service',
  product: 'Product',
  bundle: 'Bundle',
}

export function QuoteTemplateDetailSheet({
  template,
  open,
  onOpenChange,
}: QuoteTemplateDetailSheetProps) {
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState<string>('')
  const [editIsShared, setEditIsShared] = useState(false)
  const [editLines, setEditLines] = useState<QuoteTemplate['templatedata']['lines']>([])

  // Line item form dialog
  const [showLineForm, setShowLineForm] = useState(false)
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)

  // Mutations
  const updateTemplate = useUpdateQuoteTemplate()
  const deleteTemplate = useDeleteQuoteTemplate()

  // Enter edit mode
  const handleEnterEdit = useCallback(() => {
    if (!template) return
    setEditName(template.name)
    setEditDescription(template.description || '')
    setEditCategory(template.category || '')
    setEditIsShared(template.isshared)
    setEditLines([...template.templatedata.lines])
    setIsEditMode(true)
  }, [template])

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false)
    setEditingLineIndex(null)
  }, [])

  // Save changes
  const handleSave = useCallback(() => {
    if (!template) return

    const data: UpdateQuoteTemplateDto = {
      name: editName,
      description: editDescription || undefined,
      category: (editCategory as QuoteTemplateCategory) || undefined,
      isshared: editIsShared,
      templatedata: {
        ...template.templatedata,
        name: editName,
        lines: editLines,
      },
    }

    updateTemplate.mutate(
      { id: template.quotetemplateid, data },
      {
        onSuccess: () => {
          setIsEditMode(false)
        },
      }
    )
  }, [template, editName, editDescription, editCategory, editIsShared, editLines, updateTemplate])

  // Delete
  const handleDelete = useCallback(() => {
    if (!template) return
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplate.mutate(template.quotetemplateid, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }, [template, deleteTemplate, onOpenChange])

  // Use Template
  const handleUseTemplate = useCallback(() => {
    if (!template) return
    router.push(`/quotes/new?templateId=${template.quotetemplateid}`)
    onOpenChange(false)
  }, [template, router, onOpenChange])

  // Convert edit lines to QuoteDetail format for the table
  const editQuoteDetails: QuoteDetail[] = useMemo(() => {
    return editLines.map((line, index) => {
      const baseamount = line.quantity * line.priceperunit
      const discount = line.manualdiscountamount || 0
      const tax = line.tax || 0
      const extendedamount = baseamount - discount + tax

      return {
        quotedetailid: `edit-line-${index}`,
        quoteid: 'template',
        productid: line.productid,
        productdescription: line.productdescription,
        lineitemnumber: index + 1,
        quantity: line.quantity,
        priceperunit: line.priceperunit,
        baseamount,
        manualdiscountamount: discount,
        tax,
        extendedamount,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }
    })
  }, [editLines])

  // Edit totals
  const editTotals = useMemo(() => {
    return editLines.reduce(
      (acc, line) => {
        const baseamount = line.quantity * line.priceperunit
        const discount = line.manualdiscountamount || 0
        const tax = line.tax || 0
        const extended = baseamount - discount + tax

        return {
          subtotal: acc.subtotal + baseamount,
          totalDiscount: acc.totalDiscount + discount,
          totalTax: acc.totalTax + tax,
          total: acc.total + extended,
        }
      },
      { subtotal: 0, totalDiscount: 0, totalTax: 0, total: 0 }
    )
  }, [editLines])

  // Handle edit line item
  const handleEditLine = useCallback((line: QuoteDetail) => {
    // Extract index from quotedetailid (e.g., "edit-line-2" -> 2)
    const index = parseInt(line.quotedetailid.split('-').pop() || '0', 10)
    setEditingLineIndex(index)
    setShowLineForm(true)
  }, [])

  // Handle delete line item
  const handleDeleteLine = useCallback((lineId: string) => {
    const index = parseInt(lineId.split('-').pop() || '0', 10)
    setEditLines((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Handle add line item
  const handleAddLine = useCallback(() => {
    setEditingLineIndex(null)
    setShowLineForm(true)
  }, [])

  // Handle line item form submit
  const handleLineFormSubmit = useCallback(
    (data: any) => {
      if (editingLineIndex !== null) {
        // Edit existing line
        setEditLines((prev) =>
          prev.map((line, i) =>
            i === editingLineIndex
              ? {
                  productid: data.productid,
                  productdescription: data.productdescription,
                  quantity: Number(data.quantity),
                  priceperunit: Number(data.priceperunit),
                  manualdiscountamount: Number(data.manualdiscountamount) || 0,
                  tax: Number(data.tax) || 0,
                }
              : line
          )
        )
      } else {
        // Add new line
        setEditLines((prev) => [
          ...prev,
          {
            productid: data.productid,
            productdescription: data.productdescription,
            quantity: Number(data.quantity),
            priceperunit: Number(data.priceperunit),
            manualdiscountamount: Number(data.manualdiscountamount) || 0,
            tax: Number(data.tax) || 0,
          },
        ])
      }
      setShowLineForm(false)
      setEditingLineIndex(null)
    },
    [editingLineIndex]
  )

  // Build the editing quoteLine for the form dialog
  const editingQuoteLine: QuoteDetail | undefined = useMemo(() => {
    if (editingLineIndex === null || !editLines[editingLineIndex]) return undefined
    const line = editLines[editingLineIndex]
    const baseamount = line.quantity * line.priceperunit
    return {
      quotedetailid: `edit-line-${editingLineIndex}`,
      quoteid: 'template',
      productid: line.productid,
      productdescription: line.productdescription,
      lineitemnumber: editingLineIndex + 1,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      baseamount,
      manualdiscountamount: line.manualdiscountamount || 0,
      tax: line.tax || 0,
      extendedamount: baseamount - (line.manualdiscountamount || 0) + (line.tax || 0),
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }
  }, [editingLineIndex, editLines])

  // Reset edit mode when sheet closes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setIsEditMode(false)
        setEditingLineIndex(null)
        setShowLineForm(false)
      }
      onOpenChange(isOpen)
    },
    [onOpenChange]
  )

  if (!template) return null

  const quoteDetails = templateLinesToQuoteDetails(template)
  const totals = calculateTemplateTotals(template)

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <div className="flex items-start justify-between pr-8">
              <div className="space-y-1">
                <SheetTitle className="text-xl">
                  {isEditMode ? 'Edit Template' : template.name}
                </SheetTitle>
                <SheetDescription>
                  {isEditMode
                    ? 'Update template details and line items'
                    : template.description || 'No description'}
                </SheetDescription>
              </div>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnterEdit}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-6 px-4 pb-4">
            {isEditMode ? (
              /* ==================== EDIT MODE ==================== */
              <>
                {/* Editable Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tpl-name">Template Name *</Label>
                    <Input
                      id="tpl-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Template name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tpl-desc">Description</Label>
                    <Textarea
                      id="tpl-desc"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tpl-category">Category</Label>
                      <Select
                        value={editCategory}
                        onValueChange={setEditCategory}
                      >
                        <SelectTrigger id="tpl-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sharing</Label>
                      <div className="flex items-center gap-3 pt-2">
                        <Switch
                          id="tpl-shared"
                          checked={editIsShared}
                          onCheckedChange={setEditIsShared}
                        />
                        <Label htmlFor="tpl-shared" className="cursor-pointer text-sm">
                          {editIsShared ? 'Shared with team' : 'Private'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Editable Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Line Items ({editLines.length})
                    </h3>
                    <Button
                      size="sm"
                      onClick={handleAddLine}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>

                  <QuoteLineItemsTable
                    quoteLines={editQuoteDetails}
                    canEdit
                    onEdit={handleEditLine}
                    onDelete={handleDeleteLine}
                  />

                  {/* Edit Totals */}
                  <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(editTotals.subtotal)}</span>
                    </div>
                    {editTotals.totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="tabular-nums">-{formatCurrency(editTotals.totalDiscount)}</span>
                      </div>
                    )}
                    {editTotals.totalTax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="tabular-nums">{formatCurrency(editTotals.totalTax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span className="tabular-nums">{formatCurrency(editTotals.total)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ==================== VIEW MODE ==================== */
              <>
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {template.category && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Category</p>
                      <Badge variant="secondary" className="capitalize">
                        {CATEGORY_LABELS[template.category] || template.category}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Visibility</p>
                    <div className="flex items-center gap-1.5 font-medium">
                      {template.isshared ? (
                        <>
                          <Users className="h-3.5 w-3.5" />
                          <span>Shared</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Usage Count</p>
                    <div className="flex items-center gap-1.5 font-medium">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>{template.usagecount} times</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-medium">{template.templatedata.lines.length} products</p>
                  </div>
                </div>

                <Separator />

                {/* Line Items Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Line Items
                  </h3>

                  <QuoteLineItemsTable
                    quoteLines={quoteDetails}
                    canEdit={false}
                  />
                </div>

                <Separator />

                {/* Totals */}
                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="tabular-nums">-{formatCurrency(totals.totalDiscount)}</span>
                    </div>
                  )}
                  {totals.totalTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="tabular-nums">{formatCurrency(totals.totalTax)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="border-t">
            {isEditMode ? (
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelEdit}
                  disabled={updateTemplate.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                  disabled={!editName.trim() || updateTemplate.isPending}
                >
                  {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleUseTemplate}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Line Item Form Dialog (for edit mode) */}
      {isEditMode && (
        <QuoteLineItemForm
          quoteId="template"
          quoteLine={editingQuoteLine}
          open={showLineForm}
          onOpenChange={setShowLineForm}
          onSubmit={handleLineFormSubmit}
        />
      )}
    </>
  )
}
