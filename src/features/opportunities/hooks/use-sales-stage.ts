"use client"

import { useState } from 'react'
import { opportunityService } from '../api/opportunity-service'

/**
 * Hook for managing sales stage transitions
 */
export function useSalesStage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const moveToNextStage = async (opportunityId: string) => {
    try {
      setLoading(true)
      setError(null)

      const updatedOpportunity = await opportunityService.moveToNextStage(opportunityId)
      return updatedOpportunity
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error moving to next stage'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const moveToPreviousStage = async (opportunityId: string) => {
    try {
      setLoading(true)
      setError(null)

      const updatedOpportunity = await opportunityService.moveToPreviousStage(opportunityId)
      return updatedOpportunity
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error moving to previous stage'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    moveToNextStage,
    moveToPreviousStage,
    loading,
    error,
  }
}
