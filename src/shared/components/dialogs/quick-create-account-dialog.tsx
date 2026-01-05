"use client"

import { useState } from 'react'
import type { CreateAccountDto } from '@/core/contracts'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountForm } from '@/features/accounts/components/account-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface QuickCreateAccountDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when account is created successfully */
  onAccountCreated?: (account: SelectedCustomer) => void
}

/**
 * Quick Create Account Dialog
 *
 * Lightweight dialog for creating new accounts with only essential fields.
 * Used in contexts where users need to quickly create an account without
 * leaving the current workflow (e.g., opportunity creation).
 *
 * @example
 * ```tsx
 * <QuickCreateAccountDialog
 *   open={showCreateAccount}
 *   onOpenChange={setShowCreateAccount}
 *   onAccountCreated={(account) => {
 *     setSelectedCustomer(account)
 *     form.setValue('customerid', account.id)
 *   }}
 * />
 * ```
 */
export function QuickCreateAccountDialog({
  open,
  onOpenChange,
  onAccountCreated,
}: QuickCreateAccountDialogProps) {
  const { createAccount, loading } = useAccountMutations()
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data: CreateAccountDto) => {
    try {
      const newAccount = await createAccount(data)

      toast.success('Account created successfully', {
        description: `${newAccount.name} has been added to your accounts.`
      })

      // Convert to SelectedCustomer format
      const selectedCustomer: SelectedCustomer = {
        id: newAccount.accountid,
        type: 'account',
        name: newAccount.name,
        email: newAccount.emailaddress1,
        phone: newAccount.telephone1,
        city: newAccount.address1_city,
      }

      // Call the callback with the new account
      onAccountCreated?.(selectedCustomer)

      // Reset form and close dialog
      setFormKey(prev => prev + 1)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create account', {
        description: error instanceof Error ? error.message : 'Please try again.'
      })
    }
  }

  const handleCancel = () => {
    setFormKey(prev => prev + 1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogDescription>
            Add a new business account with essential information. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AccountForm
            key={formKey}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={loading}
            section="general"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
