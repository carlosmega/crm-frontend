"use client"

import { useState } from 'react'
import type { CreateOpportunityDto, UpdateOpportunityDto, CloseOpportunityDto } from '@/core/contracts'
import { opportunityService } from '../api/opportunity-service'

/**
 * Hook for opportunity mutations (create, update, delete, close)
 */
export function useOpportunityMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOpportunity = async (dto: CreateOpportunityDto) => {
    try {
      setLoading(true)
      setError(null)

      const newOpportunity = await opportunityService.create(dto)
      return newOpportunity
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating opportunity'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateOpportunity = async (id: string, dto: UpdateOpportunityDto) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🚀 Sending UPDATE request with DTO:', dto)
      const updatedOpportunity = await opportunityService.update(id, dto)
      if (!updatedOpportunity) {
        throw new Error('Opportunity not found')
      }
      return updatedOpportunity
    } catch (err: any) {
      // Logging detallado del error
      console.error('❌ Update opportunity failed')
      console.error('Error object type:', typeof err)
      console.error('Error constructor:', err?.constructor?.name)
      console.error('Error keys:', Object.keys(err || {}))
      console.error('Error.success:', err?.success)
      console.error('Error.error:', err?.error)
      console.error('Error.error.code:', err?.error?.code)
      console.error('Error.error.message:', err?.error?.message)
      console.error('Error.error.details:', err?.error?.details)

      // Si hay detalles de validación, mostrarlos de forma legible
      if (err?.error?.details) {
        console.error('📋 Validation errors by field:')
        Object.entries(err.error.details).forEach(([field, errors]) => {
          console.error(`  - ${field}:`, errors)
        })
      }

      // Capturar detalles del error de validación
      let errorMessage = 'Error updating opportunity'

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

      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteOpportunity = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      await opportunityService.delete(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting opportunity'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const closeOpportunity = async (id: string, dto: CloseOpportunityDto) => {
    try {
      setLoading(true)
      setError(null)

      const closedOpportunity = await opportunityService.close(id, dto)
      return closedOpportunity
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error closing opportunity'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    closeOpportunity,
    loading,
    error,
  }
}
