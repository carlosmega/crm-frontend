"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Contact } from '@/core/contracts'
import { ContactStateCode } from '@/core/contracts'
import { contactService } from '../api/contact-service'

/**
 * Hook for managing contacts list
 */
export function useContacts(filterStatus?: ContactStateCode) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ useCallback para estabilizar la función refetch
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await contactService.getAll()

      // Filter by status if provided
      const filteredData = filterStatus !== undefined
        ? data.filter(contact => contact.statecode === filterStatus)
        : data

      setContacts(filteredData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contacts')
    } finally {
      setLoading(false)
    }
  }, [filterStatus]) // Solo recrea cuando cambia el filtro

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
  }
}

/**
 * Hook for managing a single contact
 */
export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ useCallback para estabilizar la función refetch
  const fetchContact = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await contactService.getById(id)
      setContact(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contact')
    } finally {
      setLoading(false)
    }
  }, [id]) // Solo recrea cuando cambia el id

  useEffect(() => {
    if (id) {
      fetchContact()
    }
  }, [id, fetchContact])

  return {
    contact,
    loading,
    error,
    refetch: fetchContact,
  }
}

/**
 * Hook for searching contacts by name or email
 */
export function useContactSearch() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setContacts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await contactService.search(query)
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching contacts')
    } finally {
      setLoading(false)
    }
  }

  return {
    contacts,
    loading,
    error,
    search,
  }
}

/**
 * Hook for getting contacts by account (B2B)
 */
export function useContactsByAccount(accountId: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ useCallback para estabilizar la función refetch
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await contactService.getByAccount(accountId)
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contacts')
    } finally {
      setLoading(false)
    }
  }, [accountId]) // Solo recrea cuando cambia el accountId

  useEffect(() => {
    if (accountId) {
      fetchContacts()
    }
  }, [accountId, fetchContacts])

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
  }
}
