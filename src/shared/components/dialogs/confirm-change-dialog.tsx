"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmChangeDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Title of the dialog */
  title: string
  /** Main description message */
  message: string
  /** Name of the entity being changed (e.g., "Contact", "Account") */
  entityName?: string
  /** Current value/relationship that will be changed */
  currentValue?: string
  /** Label for the current value (e.g., "Current Primary Account") */
  currentValueLabel?: string
  /** Additional note/warning message */
  note?: string
  /** Callback when user confirms the change */
  onConfirm: () => void
  /** Callback when user cancels */
  onCancel: () => void
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Loading state */
  isLoading?: boolean
}

/**
 * Confirm Change Dialog
 *
 * Reusable confirmation dialog with custom styling using shadcn/ui.
 * Used when changing relationships between entities (e.g., moving a contact from one account to another).
 *
 * @example
 * ```tsx
 * <ConfirmChangeDialog
 *   open={confirmOpen}
 *   onOpenChange={setConfirmOpen}
 *   title="Change Primary Account?"
 *   message="John Doe is already linked to another account."
 *   currentValue="account-123-456"
 *   currentValueLabel="Current Primary Account"
 *   note="A contact can only have ONE primary account."
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   confirmText="Yes, Change Account"
 * />
 * ```
 */
export function ConfirmChangeDialog({
  open,
  onOpenChange,
  title,
  message,
  entityName,
  currentValue,
  currentValueLabel = 'Current Value',
  note,
  onConfirm,
  onCancel,
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel',
  isLoading = false,
}: ConfirmChangeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Main message */}
              <p>{message}</p>

              {/* Current value display (if provided) */}
              {currentValue && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-amber-900 mb-1">
                    {currentValueLabel}:
                  </p>
                  <p className="text-amber-700 font-mono text-xs break-all">
                    {currentValue}
                  </p>
                </div>
              )}

              {/* Note/Warning (if provided) */}
              {note && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> {note}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
