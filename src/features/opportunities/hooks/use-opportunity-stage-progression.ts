"use client"

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { SalesStageCode } from '@/core/contracts'
import { opportunityService } from '../api/opportunity-service'
import { useToast } from '@/components/ui/use-toast'

/**
 * Hook for managing opportunity stage progression
 *
 * Provides functions to:
 * - Save stage-specific field updates
 * - Advance opportunity to next stage (save + move)
 *
 * Automatically handles:
 * - Query cache invalidation
 * - Toast notifications
 * - Error handling
 * - Loading states
 */
export function useOpportunityStageProgression() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  /**
   * Save stage-specific fields without advancing
   */
  const saveStage = async (
    opportunityId: string,
    _stage: SalesStageCode,  // For future use (stage-specific validation)
    stageData: Record<string, any>
  ) => {
    try {
      setLoading(true)

      // Update opportunity with stage fields
      await opportunityService.update(opportunityId, stageData)

      // Invalidate cache to reflect changes
      queryClient.invalidateQueries({
        queryKey: ['opportunities', opportunityId],
      })
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
      })

      toast({
        title: 'Stage Updated',
        description: 'Stage data saved successfully',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save stage'
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save stage fields and advance to next stage
   */
  const advanceStage = async (
    opportunityId: string,
    currentStage: SalesStageCode,
    stageData: Record<string, any>
  ) => {
    try {
      setLoading(true)

      // 1. Save current stage data
      await opportunityService.update(opportunityId, stageData)

      // 2. Move to next stage (updates salesstage + closeprobability)
      const updated = await opportunityService.moveToNextStage(opportunityId)

      // 3. Invalidate cache
      queryClient.invalidateQueries({
        queryKey: ['opportunities', opportunityId],
      })
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
      })

      // Get stage name for success message
      const stageNames: Record<SalesStageCode, string> = {
        0: 'Qualify',
        1: 'Develop',
        2: 'Propose',
        3: 'Close',
      }
      const nextStageName = stageNames[updated.salesstage] || 'Next'

      toast({
        title: 'Stage Advanced',
        description: `Opportunity moved to ${nextStageName} stage (${updated.closeprobability}% probability)`,
      })

      return updated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to advance stage'
      toast({
        title: 'Advancement Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    saveStage,
    advanceStage,
    loading,
  }
}
