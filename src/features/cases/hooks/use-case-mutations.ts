"use client"

import { useState, useCallback } from 'react'
import type {
  Case,
  CreateCaseDto,
  UpdateCaseDto,
  ResolveCaseDto,
  CancelCaseDto,
} from '@/core/contracts'
import { caseService } from '../api/case-service'

interface MutationState {
  loading: boolean
  error: string | null
}

/**
 * Hook for case mutations (create, update, delete, resolve, cancel, reopen)
 */
export function useCaseMutations() {
  const [createState, setCreateState] = useState<MutationState>({
    loading: false,
    error: null,
  })
  const [updateState, setUpdateState] = useState<MutationState>({
    loading: false,
    error: null,
  })
  const [deleteState, setDeleteState] = useState<MutationState>({
    loading: false,
    error: null,
  })
  const [resolveState, setResolveState] = useState<MutationState>({
    loading: false,
    error: null,
  })
  const [cancelState, setCancelState] = useState<MutationState>({
    loading: false,
    error: null,
  })
  const [reopenState, setReopenState] = useState<MutationState>({
    loading: false,
    error: null,
  })

  /**
   * Create a new case
   */
  const createCase = useCallback(
    async (dto: CreateCaseDto): Promise<Case | null> => {
      setCreateState({ loading: true, error: null })
      try {
        const result = await caseService.create(dto)
        setCreateState({ loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create case'
        setCreateState({ loading: false, error })
        return null
      }
    },
    []
  )

  /**
   * Update an existing case
   */
  const updateCase = useCallback(
    async (id: string, dto: UpdateCaseDto): Promise<Case | null> => {
      setUpdateState({ loading: true, error: null })
      try {
        const result = await caseService.update(id, dto)
        setUpdateState({ loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to update case'
        setUpdateState({ loading: false, error })
        return null
      }
    },
    []
  )

  /**
   * Delete a case
   */
  const deleteCase = useCallback(async (id: string): Promise<boolean> => {
    setDeleteState({ loading: true, error: null })
    try {
      const result = await caseService.delete(id)
      setDeleteState({ loading: false, error: null })
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete case'
      setDeleteState({ loading: false, error })
      return false
    }
  }, [])

  /**
   * Resolve a case
   */
  const resolveCase = useCallback(
    async (id: string, dto: ResolveCaseDto): Promise<Case | null> => {
      setResolveState({ loading: true, error: null })
      try {
        const result = await caseService.resolve(id, dto)
        setResolveState({ loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to resolve case'
        setResolveState({ loading: false, error })
        return null
      }
    },
    []
  )

  /**
   * Cancel a case
   */
  const cancelCase = useCallback(
    async (id: string, dto?: CancelCaseDto): Promise<Case | null> => {
      setCancelState({ loading: true, error: null })
      try {
        const result = await caseService.cancel(id, dto)
        setCancelState({ loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to cancel case'
        setCancelState({ loading: false, error })
        return null
      }
    },
    []
  )

  /**
   * Reopen a resolved or cancelled case
   */
  const reopenCase = useCallback(async (id: string): Promise<Case | null> => {
    setReopenState({ loading: true, error: null })
    try {
      const result = await caseService.reopen(id)
      setReopenState({ loading: false, error: null })
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to reopen case'
      setReopenState({ loading: false, error })
      return null
    }
  }, [])

  return {
    // Actions
    createCase,
    updateCase,
    deleteCase,
    resolveCase,
    cancelCase,
    reopenCase,
    // States
    createState,
    updateState,
    deleteState,
    resolveState,
    cancelState,
    reopenState,
    // Convenience loading check
    isLoading:
      createState.loading ||
      updateState.loading ||
      deleteState.loading ||
      resolveState.loading ||
      cancelState.loading ||
      reopenState.loading,
  }
}
