"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { accountService } from '@/features/accounts/api/account-service'
import { contactService } from '@/features/contacts/api/contact-service'
import type { Account, Contact } from '@/core/contracts'

interface CustomerNameCache {
  accounts: Map<string, string>
  contacts: Map<string, string>
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch and cache all customer names (Accounts and Contacts)
 *
 * This hook fetches all accounts and contacts once and caches their names
 * for efficient lookup in DataTables and other components.
 *
 * Performance: Single fetch on mount, then cached for the session.
 *
 * @returns {Object} cache - Customer name cache with lookup function
 * @returns {Function} cache.getCustomerName - Function to get customer name by ID and type
 * @returns {boolean} cache.loading - Loading state
 * @returns {string|null} cache.error - Error message if any
 *
 * @example
 * ```tsx
 * const { getCustomerName, loading } = useCustomerNames()
 *
 * // In a table cell
 * const customerName = getCustomerName(quote.customerid, quote.customeridtype)
 * // Returns: "Acme Corp" or "John Doe" or "Customer abc123..." (fallback)
 * ```
 */
export function useCustomerNames() {
  const [cache, setCache] = useState<CustomerNameCache>({
    accounts: new Map(),
    contacts: new Map(),
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        setCache(prev => ({ ...prev, loading: true, error: null }))

        // Fetch accounts and contacts in parallel
        const [accounts, contacts] = await Promise.all([
          accountService.getAll(),
          contactService.getAll(),
        ])

        // Build lookup maps
        const accountsMap = new Map<string, string>()
        accounts.forEach((account: Account) => {
          accountsMap.set(account.accountid, account.name)
        })

        const contactsMap = new Map<string, string>()
        contacts.forEach((contact: Contact) => {
          // Use fullname if available, otherwise compute from firstname + lastname
          const name = contact.fullname || `${contact.firstname} ${contact.lastname}`.trim()
          contactsMap.set(contact.contactid, name)
        })

        setCache({
          accounts: accountsMap,
          contacts: contactsMap,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching customer names:', error)
        setCache(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error loading customer names',
        }))
      }
    }

    fetchCustomerNames()
  }, [])

  /**
   * Get customer name by ID and type
   *
   * @param customerId - Account ID or Contact ID
   * @param customerType - 'account' or 'contact'
   * @returns Customer name or fallback string
   */
  const getCustomerName = useCallback(
    (customerId?: string, customerType?: 'account' | 'contact'): string => {
      if (!customerId) return 'No Customer'

      if (customerType === 'account') {
        return cache.accounts.get(customerId) || `Customer ${customerId.substring(0, 8)}`
      } else if (customerType === 'contact') {
        return cache.contacts.get(customerId) || `Contact ${customerId.substring(0, 8)}`
      }

      // Unknown type, try both maps
      return (
        cache.accounts.get(customerId) ||
        cache.contacts.get(customerId) ||
        `Customer ${customerId.substring(0, 8)}`
      )
    },
    [cache.accounts, cache.contacts]
  )

  return useMemo(
    () => ({
      getCustomerName,
      loading: cache.loading,
      error: cache.error,
    }),
    [getCustomerName, cache.loading, cache.error]
  )
}
