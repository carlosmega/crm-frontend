"use client"

import { useState } from 'react'
import type { CreateContactDto } from '@/core/contracts'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactForm } from '@/features/contacts/components/contact-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface QuickCreateContactDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when contact is created successfully */
  onContactCreated?: (contact: SelectedCustomer) => void
}

/**
 * Quick Create Contact Dialog
 *
 * Lightweight dialog for creating new contacts with only essential fields.
 * Used in contexts where users need to quickly create a contact without
 * leaving the current workflow (e.g., opportunity creation).
 *
 * @example
 * ```tsx
 * <QuickCreateContactDialog
 *   open={showCreateContact}
 *   onOpenChange={setShowCreateContact}
 *   onContactCreated={(contact) => {
 *     setSelectedCustomer(contact)
 *     form.setValue('customerid', contact.id)
 *   }}
 * />
 * ```
 */
export function QuickCreateContactDialog({
  open,
  onOpenChange,
  onContactCreated,
}: QuickCreateContactDialogProps) {
  const { createContact, loading } = useContactMutations()
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data: CreateContactDto) => {
    try {
      const newContact = await createContact(data)

      toast.success('Contact created successfully', {
        description: `${newContact.firstname} ${newContact.lastname} has been added to your contacts.`
      })

      // Convert to SelectedCustomer format
      const selectedCustomer: SelectedCustomer = {
        id: newContact.contactid,
        type: 'contact',
        name: `${newContact.firstname} ${newContact.lastname}`,
        email: newContact.emailaddress1,
        phone: newContact.telephone1,
        city: newContact.address1_city,
      }

      // Call the callback with the new contact
      onContactCreated?.(selectedCustomer)

      // Reset form and close dialog
      setFormKey(prev => prev + 1)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create contact', {
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
          <DialogTitle>Create New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact with essential information. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <ContactForm
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
