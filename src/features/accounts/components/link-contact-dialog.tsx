"use client"

import { useState, useMemo } from 'react'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmChangeDialog } from '@/shared/components/dialogs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'
import { useToast } from '@/components/ui/use-toast'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

interface LinkContactDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Account ID to link contacts to */
  accountId: string
  /** Callback after successfully linking a contact */
  onSuccess?: () => void
}

/**
 * Link Contact Dialog
 *
 * Dialog for selecting and linking existing contacts to an account.
 * Updates the contact's parentcustomerid to link it to the account.
 */
export function LinkContactDialog({
  open,
  onOpenChange,
  accountId,
  onSuccess,
}: LinkContactDialogProps) {
  const { t } = useTranslation('accounts')
  const [searchQuery, setSearchQuery] = useState('')
  const [linking, setLinking] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingContact, setPendingContact] = useState<any>(null)
  const { toast } = useToast()

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // Fetch all contacts
  const { contacts, loading } = useContacts()
  const { updateContact } = useContactMutations()

  // Filter contacts: exclude those already linked to this account
  const availableContacts = useMemo(() => {
    if (!contacts) return []

    let filtered = contacts.filter(
      (contact) => contact.parentcustomerid !== accountId
    )

    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (contact) =>
          `${contact.firstname} ${contact.lastname}`.toLowerCase().includes(lowerQuery) ||
          contact.emailaddress1?.toLowerCase().includes(lowerQuery) ||
          contact.telephone1?.toLowerCase().includes(lowerQuery) ||
          contact.address1_city?.toLowerCase().includes(lowerQuery)
      )
    }

    return filtered
  }, [contacts, debouncedSearch, accountId])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle linking a contact to this account
  const handleLinkContact = async (contactId: string) => {
    const contact = contacts?.find((c) => c.contactid === contactId)
    if (!contact) return

    // Check if contact already has a parent account
    if (contact.parentcustomerid && contact.parentcustomerid !== accountId) {
      // Show custom confirmation dialog instead of browser confirm
      setPendingContact(contact)
      setConfirmDialogOpen(true)
      return
    }

    // If no existing parent account, proceed directly
    await performLinkContact(contact)
  }

  // Perform the actual linking operation
  const performLinkContact = async (contact: any) => {
    setLinking(true)
    try {
      await updateContact(contact.contactid, {
        ...contact,
        parentcustomerid: accountId,
      })

      const fullName = `${contact.firstname} ${contact.lastname}`
      toast({
        title: t('linkContact.contactLinked'),
        description: t('linkContact.contactLinkedDesc', { name: fullName }),
      })

      if (onSuccess) {
        onSuccess()
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error linking contact:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : t('linkContact.linkError'),
        variant: 'destructive',
      })
    } finally {
      setLinking(false)
    }
  }

  // Handle confirmation from AlertDialog
  const handleConfirmChange = async () => {
    if (pendingContact) {
      await performLinkContact(pendingContact)
      setPendingContact(null)
    }
    setConfirmDialogOpen(false)
  }

  // Handle cancel from AlertDialog
  const handleCancelChange = () => {
    setPendingContact(null)
    setConfirmDialogOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('linkContact.title')}</DialogTitle>
          <DialogDescription>
            {t('linkContact.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t('linkContact.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Contact List */}
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : availableContacts.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">{t('linkContact.noContactsFound')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? t('linkContact.tryAdjusting')
                  : t('linkContact.allLinked')}
              </p>
            </div>
          ) : (
            // Results
            <div className="space-y-2">
              {availableContacts.map((contact) => (
                <button
                  key={contact.contactid}
                  onClick={() => handleLinkContact(contact.contactid)}
                  disabled={linking}
                  className="w-full flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(`${contact.firstname} ${contact.lastname}`)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {contact.firstname} {contact.lastname}
                      </p>
                      {contact.parentcustomerid && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded shrink-0">
                          {t('linkContact.hasPrimaryAccount')}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      {contact.emailaddress1 && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3" />
                          <span className="truncate">{contact.emailaddress1}</span>
                        </div>
                      )}
                      {contact.telephone1 && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3" />
                          <span>{contact.telephone1}</span>
                        </div>
                      )}
                      {contact.address1_city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          <span>{contact.address1_city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {linking && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Reusable component */}
      <ConfirmChangeDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={t('linkContact.changePrimaryTitle')}
        message={t('linkContact.changePrimaryMessage', { name: `${pendingContact?.firstname} ${pendingContact?.lastname}` })}
        currentValue={pendingContact?.parentcustomerid}
        currentValueLabel={t('linkContact.currentPrimaryLabel')}
        note={t('linkContact.changePrimaryNote')}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        confirmText={t('linkContact.confirmChange')}
        isLoading={linking}
      />
    </>
  )
}
