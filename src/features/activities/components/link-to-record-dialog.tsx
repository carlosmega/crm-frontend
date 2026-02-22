'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { useOpportunities } from '@/features/opportunities/hooks/use-opportunities'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useMatchSuggestions, useLinkEmail } from '../hooks'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  Search, Building2, User, Briefcase, Target, Mail, Loader2, Sparkles, Check,
} from 'lucide-react'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ============================================================================
// Memoized List Items
// ============================================================================

const RecordListItem = memo(function RecordListItem({
  id,
  name,
  subtitle,
  icon: Icon,
  onSelect,
}: {
  id: string
  name: string
  subtitle?: string
  icon: React.ElementType
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className="w-full flex items-start gap-3 p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
    >
      <Avatar className="size-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <Icon className="size-4 text-muted-foreground shrink-0 mt-1" />
    </button>
  )
})

// ============================================================================
// Main Component
// ============================================================================

interface LinkToRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId: string
  onLinked?: () => void
}

export function LinkToRecordDialog({
  open,
  onOpenChange,
  activityId,
  onLinked,
}: LinkToRecordDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('opportunities')
  const { toast } = useToast()

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  // Fetch suggestions and data
  const { data: suggestions, isLoading: suggestionsLoading } = useMatchSuggestions(
    open ? activityId : null
  )
  const { opportunities, loading: oppsLoading } = useOpportunities()
  const { accounts, loading: accountsLoading } = useAccounts()
  const { contacts, loading: contactsLoading } = useContacts()
  const { leads, loading: leadsLoading } = useLeads()

  const linkMutation = useLinkEmail()

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return []
    if (!debouncedSearch) return opportunities.slice(0, 50)

    const lowerQuery = debouncedSearch.toLowerCase()
    return opportunities.filter(opp =>
      opp.name?.toLowerCase().includes(lowerQuery)
    ).slice(0, 50)
  }, [opportunities, debouncedSearch])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (!accounts) return []
    if (!debouncedSearch) return accounts.slice(0, 50)

    const lowerQuery = debouncedSearch.toLowerCase()
    return accounts.filter(acc =>
      acc.name?.toLowerCase().includes(lowerQuery) ||
      acc.emailaddress1?.toLowerCase().includes(lowerQuery)
    ).slice(0, 50)
  }, [accounts, debouncedSearch])

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!contacts) return []
    if (!debouncedSearch) return contacts.slice(0, 50)

    const lowerQuery = debouncedSearch.toLowerCase()
    return contacts.filter(con =>
      `${con.firstname} ${con.lastname}`.toLowerCase().includes(lowerQuery) ||
      con.emailaddress1?.toLowerCase().includes(lowerQuery)
    ).slice(0, 50)
  }, [contacts, debouncedSearch])

  // Filter leads
  const filteredLeads = useMemo(() => {
    if (!leads) return []
    if (!debouncedSearch) return leads.slice(0, 50)

    const lowerQuery = debouncedSearch.toLowerCase()
    return leads.filter((lead: any) =>
      `${lead.firstname || ''} ${lead.lastname || ''}`.toLowerCase().includes(lowerQuery) ||
      lead.emailaddress1?.toLowerCase().includes(lowerQuery) ||
      lead.companyname?.toLowerCase().includes(lowerQuery)
    ).slice(0, 50)
  }, [leads, debouncedSearch])

  // Handle linking
  const handleLink = useCallback(async (regardingId: string, regardingType: string) => {
    try {
      await linkMutation.mutateAsync({
        activityId,
        dto: { regardingobjectid: regardingId, regardingobjectidtype: regardingType },
      })
      toast({
        title: 'Email linked',
        description: `Email successfully linked to ${regardingType}`,
      })
      onLinked?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to link email',
        variant: 'destructive',
      })
    }
  }, [activityId, linkMutation, toast, onLinked, onOpenChange])

  const handleApplySuggestion = useCallback(() => {
    if (suggestions?.suggestion) {
      handleLink(
        suggestions.suggestion.regardingobjectid,
        suggestions.suggestion.regardingobjectidtype
      )
    }
  }, [suggestions, handleLink])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Email to Record</DialogTitle>
          <DialogDescription>
            Search and select a record to associate this email with
          </DialogDescription>
        </DialogHeader>

        {/* Auto-match suggestion */}
        {suggestions?.matched && suggestions.suggestion && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Auto-match suggestion ({suggestions.suggestion.matchconfidence}% confidence)
                </span>
                <Badge variant="outline" className="text-xs">
                  {suggestions.suggestion.regardingobjectidtype}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={handleApplySuggestion}
                disabled={linkMutation.isPending}
              >
                {linkMutation.isPending ? (
                  <Loader2 className="size-3 mr-1 animate-spin" />
                ) : (
                  <Check className="size-3 mr-1" />
                )}
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search records by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunities">
              <Briefcase className="size-3 mr-1" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <Building2 className="size-3 mr-1" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <User className="size-3 mr-1" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Target className="size-3 mr-1" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {oppsLoading ? (
                <LoadingSkeleton />
              ) : filteredOpportunities.length === 0 ? (
                <EmptyState icon={Briefcase} label="opportunities" hasSearch={!!searchQuery} />
              ) : (
                <div className="space-y-2">
                  {filteredOpportunities.map((opp: any) => (
                    <RecordListItem
                      key={opp.opportunityid}
                      id={opp.opportunityid}
                      name={opp.name || 'Untitled Opportunity'}
                      subtitle={opp.estimatedvalue ? `$${Number(opp.estimatedvalue).toLocaleString()}` : undefined}
                      icon={Briefcase}
                      onSelect={(id) => handleLink(id, 'opportunity')}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {accountsLoading ? (
                <LoadingSkeleton />
              ) : filteredAccounts.length === 0 ? (
                <EmptyState icon={Building2} label="accounts" hasSearch={!!searchQuery} />
              ) : (
                <div className="space-y-2">
                  {filteredAccounts.map((acc) => (
                    <RecordListItem
                      key={acc.accountid}
                      id={acc.accountid}
                      name={acc.name}
                      subtitle={acc.emailaddress1}
                      icon={Building2}
                      onSelect={(id) => handleLink(id, 'account')}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {contactsLoading ? (
                <LoadingSkeleton />
              ) : filteredContacts.length === 0 ? (
                <EmptyState icon={User} label="contacts" hasSearch={!!searchQuery} />
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((con) => (
                    <RecordListItem
                      key={con.contactid}
                      id={con.contactid}
                      name={`${con.firstname} ${con.lastname}`}
                      subtitle={con.emailaddress1}
                      icon={User}
                      onSelect={(id) => handleLink(id, 'contact')}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[350px] pr-4">
              {leadsLoading ? (
                <LoadingSkeleton />
              ) : filteredLeads.length === 0 ? (
                <EmptyState icon={Target} label="leads" hasSearch={!!searchQuery} />
              ) : (
                <div className="space-y-2">
                  {filteredLeads.map((lead: any) => (
                    <RecordListItem
                      key={lead.leadid}
                      id={lead.leadid}
                      name={`${lead.firstname || ''} ${lead.lastname || ''}`.trim() || 'Unknown Lead'}
                      subtitle={lead.emailaddress1 || lead.companyname}
                      icon={Target}
                      onSelect={(id) => handleLink(id, 'lead')}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Helper components
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, label, hasSearch }: { icon: React.ElementType; label: string; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="size-12 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">No {label} found</p>
      <p className="text-sm text-muted-foreground mt-1">
        {hasSearch ? 'Try adjusting your search' : `No ${label} available`}
      </p>
    </div>
  )
}
