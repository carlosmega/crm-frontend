"use client"

import { useState } from 'react'
import type { CreateLeadDto, UpdateLeadDto } from '@/core/contracts'
import { leadService } from '../api/lead-service'

/**
 * Hook for lead mutations (create, update, delete, qualify, disqualify)
 */
export function useLeadMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLead = async (dto: CreateLeadDto) => {
    try {
      setLoading(true)
      setError(null)

      const newLead = await leadService.create(dto)
      return newLead
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateLead = async (id: string, dto: UpdateLeadDto) => {
    try {
      setLoading(true)
      setError(null)

      const updatedLead = await leadService.update(id, dto)
      if (!updatedLead) {
        throw new Error('Lead not found')
      }
      return updatedLead
    } catch (err: any) {
      // Capturar detalles del error de validación
      let errorMessage = 'Error updating lead'

      if (err?.error) {
        // Error del API Client transformado
        errorMessage = err.error.message

        // Si hay detalles de validación, mostrarlos
        if (err.error.details) {
          const fieldErrors = Object.entries(err.error.details)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('; ')
          errorMessage = `${errorMessage} - ${fieldErrors}`
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      console.error('Update lead error details:', err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const success = await leadService.delete(id)
      if (!success) {
        throw new Error('Lead not found')
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // NOTE: qualifyLead method has been deprecated
  // Use qualifyLeadWithEntities instead, which properly handles
  // the full qualification flow with Account/Contact/Opportunity creation

  const disqualifyLead = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const disqualifiedLead = await leadService.disqualify(id)
      if (!disqualifiedLead) {
        throw new Error('Lead not found')
      }
      return disqualifiedLead
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error disqualifying lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createLead,
    updateLead,
    deleteLead,
    disqualifyLead,
    loading,
    error,
  }
}
