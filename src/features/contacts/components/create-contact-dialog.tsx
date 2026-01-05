'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactForm } from './contact-form'
import type { CreateContactDto } from '@/core/contracts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface CreateContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contact: any) => void
  /** Account ID context - when creating contact from account form, pre-fill parentcustomerid */
  accountId?: string
}

/**
 * Create Contact Dialog Component
 *
 * Modal dialog for creating a new contact inline from other forms (e.g., Account creation)
 * Uses the ContactForm component in compact mode
 */
export function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
  accountId,
}: CreateContactDialogProps) {
  const { toast } = useToast()
  const { createContact, loading } = useContactMutations()

  const handleSubmit = async (data: CreateContactDto) => {
    try {
      const newContact = await createContact(data)

      toast({
        title: "Contact created",
        description: `${newContact.firstname} ${newContact.lastname} has been created successfully.`,
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newContact)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error creating contact:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to the system. This contact can be selected after creation.
          </DialogDescription>
        </DialogHeader>

        <ContactForm
          contact={accountId ? { parentcustomerid: accountId } as any : undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
