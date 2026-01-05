"use client"

import { useState } from 'react'
import type { CreateContactDto, UpdateContactDto } from '@/core/contracts'
import { contactService } from '../api/contact-service'

/**
 * Hook for contact mutations (create, update, delete, deactivate, activate)
 */
export function useContactMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createContact = async (dto: CreateContactDto) => {
    try {
      setLoading(true)
      setError(null)

      const newContact = await contactService.create(dto)
      return newContact
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating contact'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateContact = async (id: string, dto: UpdateContactDto) => {
    try {
      setLoading(true)
      setError(null)

      const updatedContact = await contactService.update(id, dto)

      if (!updatedContact) {
        throw new Error('Contact not found')
      }

      return updatedContact
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating contact'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteContact = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const success = await contactService.delete(id)
      if (!success) {
        throw new Error('Contact not found')
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting contact'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deactivateContact = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const deactivatedContact = await contactService.deactivate(id)
      if (!deactivatedContact) {
        throw new Error('Contact not found')
      }
      return deactivatedContact
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deactivating contact'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createContact,
    updateContact,
    deleteContact,
    deactivateContact,
    loading,
    error,
  }
}
