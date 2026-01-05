'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCompareVersions } from '../hooks/use-quote-versions'
import { ArrowRight, Plus, Minus, Edit } from 'lucide-react'
import { formatCurrency } from '../utils/quote-calculations'

interface QuoteVersionComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromVersionId: string
  toVersionId: string
}

/**
 * Quote Version Comparison Dialog
 *
 * Muestra las diferencias entre dos versiones de un Quote
 */
export function QuoteVersionComparisonDialog({
  open,
  onOpenChange,
  fromVersionId,
  toVersionId,
}: QuoteVersionComparisonDialogProps) {
  const { data: comparison, isLoading } = useCompareVersions(
    fromVersionId,
    toVersionId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Compare Versions</DialogTitle>
          <DialogDescription>
            Changes between version {comparison?.fromVersion.versionnumber} and{' '}
            {comparison?.toVersion.versionnumber}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : comparison ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Changes:</span>{' '}
                    <span className="font-medium">
                      {comparison.summary.totalChanges}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quote Fields:</span>{' '}
                    <span className="font-medium">
                      {comparison.summary.quoteFieldsChanged}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lines Added:</span>{' '}
                    <span className="font-medium text-green-600">
                      {comparison.summary.linesAdded}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lines Removed:</span>{' '}
                    <span className="font-medium text-red-600">
                      {comparison.summary.linesRemoved}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lines Modified:</span>{' '}
                    <span className="font-medium text-orange-600">
                      {comparison.summary.linesModified}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote-level changes */}
              {comparison.changes.quote.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Quote Changes
                  </h3>
                  <div className="space-y-2">
                    {comparison.changes.quote.map((change, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-card"
                      >
                        <div className="font-medium text-sm mb-2 capitalize">
                          {change.field.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-red-500/10 text-red-700 dark:text-red-400 rounded px-3 py-2">
                            <span className="text-xs text-red-600 dark:text-red-500 font-medium">
                              OLD:{' '}
                            </span>
                            {formatValue(change.field, change.oldValue)}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded px-3 py-2">
                            <span className="text-xs text-green-600 dark:text-green-500 font-medium">
                              NEW:{' '}
                            </span>
                            {formatValue(change.field, change.newValue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Line changes */}
              {comparison.changes.lines.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Product Line Changes</h3>
                  <div className="space-y-2">
                    {comparison.changes.lines.map((change, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 ${
                          change.action === 'added'
                            ? 'bg-green-500/5 border-green-500/20'
                            : change.action === 'removed'
                              ? 'bg-red-500/5 border-red-500/20'
                              : 'bg-orange-500/5 border-orange-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-medium">
                            {change.productDescription}
                          </div>
                          <ActionBadge action={change.action} />
                        </div>

                        {change.changes && change.changes.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {change.changes.map((fieldChange, idx) => (
                              <div
                                key={idx}
                                className="text-sm flex items-center gap-2"
                              >
                                <span className="text-muted-foreground capitalize min-w-[120px]">
                                  {fieldChange.field}:
                                </span>
                                <span className="line-through text-red-600">
                                  {formatValue(fieldChange.field, fieldChange.oldValue)}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-green-600 font-medium">
                                  {formatValue(fieldChange.field, fieldChange.newValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No changes */}
              {comparison.summary.totalChanges === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No changes detected between these versions
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Unable to load comparison
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Action badge for line changes
 */
function ActionBadge({ action }: { action: 'added' | 'removed' | 'modified' }) {
  const config = {
    added: {
      label: 'Added',
      icon: <Plus className="h-3 w-3" />,
      className: 'bg-green-500 text-white',
    },
    removed: {
      label: 'Removed',
      icon: <Minus className="h-3 w-3" />,
      className: 'bg-red-500 text-white',
    },
    modified: {
      label: 'Modified',
      icon: <Edit className="h-3 w-3" />,
      className: 'bg-orange-500 text-white',
    },
  }

  const { label, icon, className } = config[action]

  return (
    <Badge className={className}>
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  )
}

/**
 * Format value based on field type
 */
function formatValue(field: string, value: any): string {
  if (value === null || value === undefined) {
    return '(empty)'
  }

  // Currency fields
  if (
    field.includes('amount') ||
    field.includes('price') ||
    field.includes('discount') ||
    field.includes('tax')
  ) {
    return formatCurrency(Number(value))
  }

  // Date fields
  if (field.includes('date') || field.includes('on')) {
    return new Date(value).toLocaleDateString()
  }

  // State/Status codes
  if (field === 'statecode' || field === 'statuscode') {
    return String(value)
  }

  return String(value)
}
