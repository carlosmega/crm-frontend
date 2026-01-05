"use client"

import { useState } from 'react'
import type { CreateAccountDto, UpdateAccountDto } from '@/core/contracts'
import { AccountStateCode } from '@/core/contracts'
import { accountService } from '../api/account-service'

/**
 * Hook for account mutations (create, update, delete, deactivate, activate)
 */
export function useAccountMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAccount = async (dto: CreateAccountDto) => {
    try {
      setLoading(true)
      setError(null)

      const newAccount = await accountService.create(dto)
      return newAccount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating account'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateAccount = async (id: string, dto: UpdateAccountDto) => {
    try {
      setLoading(true)
      setError(null)

      const updatedAccount = await accountService.update(id, dto)
      if (!updatedAccount) {
        throw new Error('Account not found')
      }
      return updatedAccount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating account'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const success = await accountService.delete(id)
      if (!success) {
        throw new Error('Account not found')
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting account'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deactivateAccount = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const deactivatedAccount = await accountService.deactivate(id)
      if (!deactivatedAccount) {
        throw new Error('Account not found')
      }
      return deactivatedAccount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deactivating account'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const activateAccount = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const updatedAccount = await accountService.activate(id)
      if (!updatedAccount) {
        throw new Error('Account not found')
      }
      return updatedAccount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error activating account'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createAccount,
    updateAccount,
    deleteAccount,
    deactivateAccount,
    activateAccount,
    loading,
    error,
  }
}
