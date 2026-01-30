"use client"

import { useState, useEffect } from 'react'
import type { Case } from '@/core/contracts'
import { CaseStateCode } from '@/core/contracts'
import { caseService } from '../api/case-service'

/**
 * Hook for managing cases list
 */
export function useCases(filterState?: CaseStateCode) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)

      const data =
        filterState !== undefined
          ? await caseService.getByState(filterState)
          : await caseService.getAll()

      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading cases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [filterState])

  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
  }
}

/**
 * Hook for managing a single case
 */
export function useCase(id: string) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCase = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await caseService.getById(id)
      setCaseData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading case')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCase()
    }
  }, [id])

  return {
    case: caseData,
    loading,
    error,
    refetch: fetchCase,
  }
}

/**
 * Hook for searching cases
 */
export function useCaseSearch() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setCases([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await caseService.search(query)
      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching cases')
    } finally {
      setLoading(false)
    }
  }

  return {
    cases,
    loading,
    error,
    search,
  }
}
