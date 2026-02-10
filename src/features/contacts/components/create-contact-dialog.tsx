'use client'

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
import { useTranslation } from '@/shared/hooks/use-translation'
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
  const { t } = useTranslation('contacts')
  const { t: tc } = useTranslation('common')
  const { toast } = useToast()
  const { createContact, loading } = useContactMutations()

  const handleSubmit = async (data: CreateContactDto) => {
    try {
      const newContact = await createContact(data)

      toast({
        title: t('createDialog.contactCreated'),
        description: t('createDialog.contactCreatedDesc', { firstName: newContact.firstname, lastName: newContact.lastname }),
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(newContact)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error creating contact:', error)
      toast({
        title: tc('messages.error'),
        description: error instanceof Error ? error.message : t('createDialog.createError'),
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" nestLevel={2}>
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('createDialog.description')}
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
