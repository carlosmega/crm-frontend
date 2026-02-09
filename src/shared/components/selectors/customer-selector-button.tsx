"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { Button } from '@/components/ui/button'

const CustomerSelectorDialog = dynamic(
  () => import('./customer-selector-dialog').then(mod => ({ default: mod.CustomerSelectorDialog })),
  { ssr: false }
)
import { Building2, User, Mail, Phone, MapPin, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerSelectorButtonProps {
  /** Selected customer value */
  value?: SelectedCustomer
  /** Callback when customer changes (undefined to clear) */
  onChange: (customer: SelectedCustomer | undefined) => void
  /** Customer type filter */
  customerType?: 'account' | 'contact' | 'both'
  /** Placeholder text when no customer selected */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Custom className */
  className?: string
  /** Account ID context - when creating contacts from account form, pre-fill parentcustomerid */
  accountId?: string
}

/**
 * Customer Selector Button
 *
 * Button component that opens CustomerSelectorDialog
 * Displays selected customer with details or placeholder if empty
 *
 * @example
 * ```tsx
 * <CustomerSelectorButton
 *   value={selectedCustomer}
 *   onChange={(customer) => {
 *     setSelectedCustomer(customer)
 *     setFormData(prev => ({
 *       ...prev,
 *       customerid: customer.id,
 *       customeridtype: customer.type
 *     }))
 *   }}
 *   customerType="both"
 *   placeholder="Select customer..."
 * />
 * ```
 */
export function CustomerSelectorButton({
  value,
  onChange,
  customerType = 'both',
  placeholder = 'Select customer...',
  disabled = false,
  className,
  accountId
}: CustomerSelectorButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <>
      {value ? (
        // Selected customer view
        <div
          className={cn(
            "relative rounded-lg border bg-card text-card-foreground p-3",
            !disabled && "cursor-pointer hover:bg-accent hover:border-primary transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setDialogOpen(true)}
        >
          <div className="flex items-start gap-3">
            {/* Icon based on type */}
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              {value.type === 'account' ? (
                <Building2 className="size-4 text-primary" />
              ) : (
                <User className="size-4 text-primary" />
              )}
            </div>

            {/* Customer details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{value.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleClear}
                      className="h-6 w-6"
                      title="Clear selection"
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                  <ChevronDown className="size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-muted-foreground mt-1">
                {value.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3" />
                    <span className="truncate">{value.email}</span>
                  </div>
                )}
                {value.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3" />
                    <span>{value.phone}</span>
                  </div>
                )}
                {value.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    <span>{value.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty state - placeholder button
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-muted-foreground font-normal h-auto py-3",
            className
          )}
          onClick={() => setDialogOpen(true)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {customerType === 'account' ? (
              <Building2 className="size-4" />
            ) : customerType === 'contact' ? (
              <User className="size-4" />
            ) : (
              <Building2 className="size-4" />
            )}
            <span>{placeholder}</span>
          </div>
          <ChevronDown className="size-4 ml-auto" />
        </Button>
      )}

      {/* Dialog */}
      <CustomerSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={onChange}
        customerType={customerType}
        initialType={value?.type || 'account'}
        accountId={accountId}
      />
    </>
  )
}
