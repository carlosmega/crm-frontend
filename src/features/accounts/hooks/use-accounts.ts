"use client"

import { useState, useEffect } from 'react'
import type { Account } from '@/core/contracts'
import { AccountStateCode } from '@/core/contracts'
import { accountService } from '../api/account-service'

/**
 * Hook for managing accounts list
 */
export function useAccounts(filterStatus?: AccountStateCode) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await accountService.getAll()

      // Filter by status if provided
      const filteredData = filterStatus !== undefined
        ? data.filter(account => account.statecode === filterStatus)
        : data

      setAccounts(filteredData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [filterStatus])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  }
}

/**
 * Hook for managing a single account
 */
export function useAccount(id: string) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccount = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await accountService.getById(id)
      setAccount(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading account')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAccount()
    }
  }, [id])

  return {
    account,
    loading,
    error,
    refetch: fetchAccount,
  }
}

/**
 * Hook for searching accounts by name
 */
export function useAccountSearch() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setAccounts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await accountService.searchByName(query)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching accounts')
    } finally {
      setLoading(false)
    }
  }

  return {
    accounts,
    loading,
    error,
    search,
  }
}
