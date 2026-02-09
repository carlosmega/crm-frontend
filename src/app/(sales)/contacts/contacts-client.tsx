"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Contact } from '@/core/contracts'
import { ContactStateCode } from '@/core/contracts'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactList } from '@/features/contacts/components/contact-list'
import {
  BulkAction,
  DataTableFilterSummary,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, Trash2, Download, UserPlus, Loader2, WifiOff, MoreVertical } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'

export function ContactsClient() {
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Fetch contacts from Django backend with authentication
  const { contacts: fetchedContacts, loading, error, refetch } = useContacts()
  const [contacts, setContacts] = useState<Contact[]>([])

  // Sync fetched contacts with local state
  useEffect(() => {
    if (fetchedContacts) {
      setContacts(fetchedContacts)
    }
  }, [fetchedContacts])

  // ✅ Refetch when page becomes visible (after navigating back from edit/detail)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch()
      }
    }

    const handleFocus = () => {
      refetch()
    }

    // Listen to visibility changes and window focus
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetch])

  const { deleteContact } = useContactMutations()

  // ✅ Performance: Debounce search query to prevent filtering on every keystroke
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // ✅ Optimized: Filter by status
  const statusFilteredContacts = useMemo(() => {
    if (filter === 'all') return contacts
    return contacts.filter(contact => contact.statecode === Number(filter))
  }, [contacts, filter])

  // ✅ Optimized: Filter by search query (global search - separate from column filters)
  const filteredContacts = useMemo(() => {
    if (!debouncedSearchQuery) return statusFilteredContacts

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return statusFilteredContacts.filter((contact) =>
      `${contact.fullname} ${contact.emailaddress1} ${contact.telephone1} ${contact.jobtitle}`
        .toLowerCase()
        .includes(lowerQuery)
    )
  }, [statusFilteredContacts, debouncedSearchQuery])

  // ✅ Optimized: Column definitions for filter summary
  const contactColumns = useMemo(() => [
    { id: 'name', header: 'Contact Name', filter: { type: 'text' as const } },
    { id: 'account', header: 'Account', filter: { type: 'text' as const } },
    { id: 'created', header: 'Created On', filter: { type: 'date' as const } },
  ], [])

  // ✅ Optimized with useCallback
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  // ✅ Optimized with useCallback
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  // ✅ Optimized with useCallback
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id)
        // Update local state instead of refetch
        setContacts(prev => prev.filter(c => c.contactid !== id))
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }, [deleteContact])

  // ✅ Optimized with useCallback
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    try {
      // Delete all selected contacts
      await Promise.all(selectedIds.map((id) => deleteContact(id)))

      // Update local state and clear selection
      setContacts(prev => prev.filter(c => !selectedIds.includes(c.contactid)))
      setSelectedContacts([])
    } catch (error) {
      console.error('Error deleting contacts:', error)
      toast.error('Failed to delete some contacts. Please try again.')
    }
  }, [deleteContact])

  // ✅ Optimized with useCallback
  const handleBulkExport = useCallback(async (selectedIds: string[]) => {
    const selectedContactsData = contacts.filter((contact) => selectedIds.includes(contact.contactid))

    // Convert to CSV
    const headers = ['Full Name', 'Email', 'Phone', 'Mobile', 'Job Title', 'Account']
    const csvContent = [
      headers.join(','),
      ...selectedContactsData.map((contact) =>
        [
          `"${contact.fullname || ''}"`,
          `"${contact.emailaddress1 || ''}"`,
          `"${contact.telephone1 || ''}"`,
          `"${contact.mobilephone || ''}"`,
          `"${contact.jobtitle || ''}"`,
          `"${contact.parentcustomerid || 'B2C'}"`,
        ].join(',')
      ),
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [contacts])

  // ✅ Optimized with useCallback
  const handleBulkAssign = useCallback(async (selectedIds: string[]) => {
    toast.info(`Assign ${selectedIds.length} contacts to a user (feature not yet implemented)`)
  }, [])

  // ✅ Optimized: Define bulk actions
  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: handleBulkExport,
      variant: 'outline',
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: UserPlus,
      onClick: handleBulkAssign,
      variant: 'outline',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: handleBulkDelete,
      variant: 'outline',
      destructive: true,
      confirmMessage: 'Are you sure you want to delete the selected contacts? This action cannot be undone.',
    },
  ], [handleBulkExport, handleBulkAssign, handleBulkDelete])

  // ✅ Manejo de estados de carga y error
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-1" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  CONTACTS
                </p>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  Error
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <NotificationMenu />
              <UserMenu variant="icon" />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <PageHeader
            breadcrumbs={[
              { label: 'Sales', href: '/dashboard' },
              { label: 'Contacts' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Contacts"
            message={error || 'Unable to connect to the server. Please check your network connection and try again.'}
            icon={WifiOff}
            onRetry={refetch}
            retryLabel="Retry"
            variant="full"
          />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Hamburger Menu + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                CONTACTS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Contacts
              </h1>
            </div>
          </div>

          {/* RIGHT: Notifications + User + Actions Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/contacts/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Contact
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Contacts' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">{/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
              <p className="text-muted-foreground">
                Manage your contacts and key decision makers
              </p>
            </div>
            <Button asChild className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Link href="/contacts/new">
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts by name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilter(value)
                  setSelectedContacts([])
                  setColumnFilters({})
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value={ContactStateCode.Active.toString()}>Active</SelectItem>
                  <SelectItem value={ContactStateCode.Inactive.toString()}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary inside search card */}
            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={contactColumns}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <ContactList
            contacts={filteredContacts}
            selectedContacts={selectedContacts}
            onSelectionChange={setSelectedContacts}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
          />
        </div>
      </div>
    </>
  )
}
