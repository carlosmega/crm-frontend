"use client"

import { useState, useMemo } from 'react'
import { useContactsByAccount } from '@/features/contacts/hooks/use-contacts'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactList } from '@/features/contacts/components/contact-list'
import { LinkContactDialog } from './link-contact-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Plus, Users, Loader2, RefreshCw, Link2, Unlink } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import type { BulkAction } from '@/shared/components/data-table'

interface AccountContactsSubGridProps {
  accountId: string
}

/**
 * AccountContactsSubGrid
 *
 * Displays all contacts associated with a specific account.
 * Uses dedicated hook for better filtering and performance.
 */
export function AccountContactsSubGrid({ accountId }: AccountContactsSubGridProps) {
  const { t } = useTranslation('accounts')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const { contacts: accountContacts, loading, error, refetch } = useContactsByAccount(accountId)
  const { updateContact } = useContactMutations()
  const { toast } = useToast()

  // Bulk action to unlink selected contacts from this account
  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'unlink-contacts',
      label: t('subgrid.contacts.unlinkFromAccount'),
      icon: Unlink,
      variant: 'destructive',
      onClick: async (selectedIds: string[]) => {
        try {
          // Update each selected contact to remove parentcustomerid
          await Promise.all(
            selectedIds.map(async (contactId) => {
              const contact = accountContacts.find(c => c.contactid === contactId)
              if (contact) {
                await updateContact(contactId, {
                  ...contact,
                  parentcustomerid: undefined,
                })
              }
            })
          )

          toast({
            title: t('subgrid.contacts.contactsUnlinked'),
            description: t('subgrid.contacts.contactsUnlinkedDesc', { count: selectedIds.length }),
          })

          // Clear selection and refresh
          setSelectedContacts([])
          refetch()
        } catch (error) {
          console.error('Error unlinking contacts:', error)
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : t('subgrid.contacts.errorUnlinking'),
            variant: 'destructive',
          })
        }
      },
    },
  ], [accountContacts, updateContact, toast, refetch])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error loading contacts: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('subgrid.contacts.title', { count: accountContacts.length })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {t('subgrid.contacts.linkExisting')}
            </Button>
            <Button asChild size="sm">
              <Link href={`/contacts/new?accountId=${accountId}`}>
                <Plus className="mr-2 h-4 w-4" />
                {t('subgrid.contacts.newContact')}
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {accountContacts.length > 0 ? (
          <div className="px-6 pb-6">
            <ContactList
              contacts={accountContacts}
              selectedContacts={selectedContacts}
              onSelectionChange={setSelectedContacts}
              bulkActions={bulkActions}
            />
          </div>
        ) : (
          <div className="py-12 text-center px-6">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {t('subgrid.contacts.noContacts')}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/contacts/new?accountId=${accountId}`}>
                <Plus className="mr-2 h-4 w-4" />
                {t('subgrid.contacts.addFirst')}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>

      {/* Link Contact Dialog */}
      <LinkContactDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        accountId={accountId}
        onSuccess={() => {
          refetch()
          setLinkDialogOpen(false)
        }}
      />
    </Card>
  )
}
