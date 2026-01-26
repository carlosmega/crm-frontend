"use client"

import { useState, useMemo } from 'react'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { useOpportunities } from '@/features/opportunities/hooks/use-opportunities'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { OpportunityStateCode } from '@/core/contracts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Building2, User, Mail, Phone, MapPin, Briefcase, Plus } from 'lucide-react'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CreateContactDialog } from '@/features/contacts/components/create-contact-dialog'

interface CustomerSelectorDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when customer is selected */
  onSelect: (customer: SelectedCustomer) => void
  /** Customer type filter */
  customerType?: 'account' | 'contact' | 'both'
  /** Initial tab to show */
  initialType?: 'account' | 'contact'
  /** Customer IDs to exclude from results */
  excludeIds?: string[]
  /** Account ID context - when creating contacts from account form, pre-fill parentcustomerid */
  accountId?: string
}

/**
 * Customer Selector Dialog
 *
 * Searchable dialog for selecting Accounts or Contacts with enriched details:
 * - Search by name, email, phone, city
 * - Shows email, phone, city, open opportunities count
 * - Tabs for Account/Contact switching
 * - Loading and empty states
 *
 * @example
 * ```tsx
 * <CustomerSelectorDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(customer) => {
 *     setCustomerId(customer.id)
 *     setCustomerType(customer.type)
 *   }}
 *   customerType="both"
 * />
 * ```
 */
export function CustomerSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  customerType = 'both',
  initialType = 'account',
  excludeIds = [],
  accountId
}: CustomerSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'account' | 'contact'>(
    customerType === 'contact' ? 'contact' : initialType
  )
  const [createContactOpen, setCreateContactOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // Fetch data
  const { accounts, loading: accountsLoading } = useAccounts()
  const { contacts, loading: contactsLoading } = useContacts()
  const { opportunities } = useOpportunities()

  // Count open opportunities per customer
  const openOpportunitiesCount = useMemo(() => {
    if (!opportunities) return {}

    const counts: Record<string, number> = {}
    opportunities
      .filter(opp => opp.statecode === OpportunityStateCode.Open)
      .forEach(opp => {
        const key = `${opp.customeridtype}-${opp.customerid}`
        counts[key] = (counts[key] || 0) + 1
      })
    return counts
  }, [opportunities])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (!accounts) return []

    let filtered = accounts.filter(acc => !excludeIds.includes(acc.accountid))

    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase()
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(lowerQuery) ||
        acc.emailaddress1?.toLowerCase().includes(lowerQuery) ||
        acc.telephone1?.toLowerCase().includes(lowerQuery) ||
        acc.address1_city?.toLowerCase().includes(lowerQuery)
      )
    }

    return filtered
  }, [accounts, debouncedSearch, excludeIds])

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!contacts) return []

    let filtered = contacts.filter(con => !excludeIds.includes(con.contactid))

    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase()
      filtered = filtered.filter(con =>
        `${con.firstname} ${con.lastname}`.toLowerCase().includes(lowerQuery) ||
        con.emailaddress1?.toLowerCase().includes(lowerQuery) ||
        con.telephone1?.toLowerCase().includes(lowerQuery) ||
        con.address1_city?.toLowerCase().includes(lowerQuery)
      )
    }

    return filtered
  }, [contacts, debouncedSearch, excludeIds])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle selection
  const handleSelectAccount = (accountId: string) => {
    const account = accounts?.find(a => a.accountid === accountId)
    if (!account) return

    const oppKey = `account-${accountId}`
    onSelect({
      id: account.accountid,
      type: 'account',
      name: account.name,
      email: account.emailaddress1,
      phone: account.telephone1,
      city: account.address1_city,
      openOpportunities: openOpportunitiesCount[oppKey] || 0
    })
    onOpenChange(false)
  }

  const handleSelectContact = (contactId: string) => {
    const contact = contacts?.find(c => c.contactid === contactId)
    if (!contact) return

    const oppKey = `contact-${contactId}`
    onSelect({
      id: contact.contactid,
      type: 'contact',
      name: `${contact.firstname} ${contact.lastname}`,
      email: contact.emailaddress1,
      phone: contact.telephone1,
      city: contact.address1_city,
      openOpportunities: openOpportunitiesCount[oppKey] || 0
    })
    onOpenChange(false)
  }

  const handleContactCreated = (newContact: any) => {
    // Select the newly created contact
    onSelect({
      id: newContact.contactid,
      type: 'contact',
      name: `${newContact.firstname} ${newContact.lastname}`,
      email: newContact.emailaddress1,
      phone: newContact.telephone1,
      city: newContact.address1_city,
      openOpportunities: 0
    })
    setCreateContactOpen(false)
    onOpenChange(false)
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" nestLevel={1}>
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>
            Search and select an account or contact for this record
          </DialogDescription>
        </DialogHeader>

        {/* Search and Create Contact Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          {(customerType === 'contact' || customerType === 'both') && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateContactOpen(true)}
              className="shrink-0"
            >
              <Plus className="size-4 mr-2" />
              New Contact
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'account' | 'contact')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" disabled={customerType === 'contact'}>
              <Building2 className="size-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="contact" disabled={customerType === 'account'}>
              <User className="size-4 mr-2" />
              Contacts
            </TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="account" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {accountsLoading ? (
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
              ) : filteredAccounts.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="size-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">No accounts found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'No accounts available'}
                  </p>
                </div>
              ) : (
                // Results
                <div className="space-y-2">
                  {filteredAccounts.map((account) => {
                    const oppKey = `account-${account.accountid}`
                    const oppCount = openOpportunitiesCount[oppKey] || 0

                    return (
                      <button
                        key={account.accountid}
                        onClick={() => handleSelectAccount(account.accountid)}
                        className="w-full flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(account.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{account.name}</p>
                            {oppCount > 0 && (
                              <Badge variant="secondary" className="shrink-0">
                                <Briefcase className="size-3 mr-1" />
                                {oppCount} {oppCount === 1 ? 'opp' : 'opps'}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            {account.emailaddress1 && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="size-3" />
                                <span className="truncate">{account.emailaddress1}</span>
                              </div>
                            )}
                            {account.telephone1 && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="size-3" />
                                <span>{account.telephone1}</span>
                              </div>
                            )}
                            {account.address1_city && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3" />
                                <span>{account.address1_city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contact" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {contactsLoading ? (
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
              ) : filteredContacts.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="size-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">No contacts found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'No contacts available'}
                  </p>
                </div>
              ) : (
                // Results
                <div className="space-y-2">
                  {filteredContacts.map((contact) => {
                    const oppKey = `contact-${contact.contactid}`
                    const oppCount = openOpportunitiesCount[oppKey] || 0

                    return (
                      <button
                        key={contact.contactid}
                        onClick={() => handleSelectContact(contact.contactid)}
                        className="w-full flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(`${contact.firstname} ${contact.lastname}`)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">
                              {contact.firstname} {contact.lastname}
                            </p>
                            {oppCount > 0 && (
                              <Badge variant="secondary" className="shrink-0">
                                <Briefcase className="size-3 mr-1" />
                                {oppCount} {oppCount === 1 ? 'opp' : 'opps'}
                              </Badge>
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
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

      {/* Create Contact Dialog */}
      <CreateContactDialog
        open={createContactOpen}
        onOpenChange={setCreateContactOpen}
        onSuccess={handleContactCreated}
        accountId={accountId}
      />
    </>
  )
}
