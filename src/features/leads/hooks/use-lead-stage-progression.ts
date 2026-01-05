"use client"

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { leadService } from '../api/lead-service'
import { useToast } from '@/components/ui/use-toast'

/**
 * Hook for managing lead stage progression
 *
 * Provides functions to:
 * - Save Qualify stage field updates
 * - Advance lead to qualified status (save + prepare for conversion)
 *
 * Automatically handles:
 * - Query cache invalidation
 * - Toast notifications
 * - Error handling
 * - Loading states
 *
 * Note: Leads only have one BPF stage (Qualify) before conversion to Opportunity
 */
export function useLeadStageProgression() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  /**
   * Save Qualify stage fields without changing status
   */
  const saveStage = async (
    leadId: string,
    stageData: Record<string, any>
  ) => {
    try {
      setLoading(true)

      // Update lead with stage fields
      await leadService.update(leadId, stageData)

      // Invalidate cache to reflect changes
      queryClient.invalidateQueries({
        queryKey: ['leads', leadId],
      })
      queryClient.invalidateQueries({
        queryKey: ['leads'],
      })

      toast({
        title: 'Stage Updated',
        description: 'Qualify stage data saved successfully',
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
   * Save Qualify stage fields and prepare lead for qualification
   *
   * Note: This only saves the stage data. Actual qualification (conversion to Opportunity)
   * is done through the qualification wizard/dialog which handles Account/Contact creation.
   */
  const advanceStage = async (
    leadId: string,
    stageData: Record<string, any>
  ) => {
    try {
      setLoading(true)

      // Save Qualify stage data
      const updated = await leadService.update(leadId, stageData)

      // Invalidate cache
      queryClient.invalidateQueries({
        queryKey: ['leads', leadId],
      })
      queryClient.invalidateQueries({
        queryKey: ['leads'],
      })

      toast({
        title: 'Qualify Stage Completed',
        description: 'Lead is ready for qualification. Use the "Qualify Lead" action to convert to Opportunity.',
      })

      return updated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete Qualify stage'
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
