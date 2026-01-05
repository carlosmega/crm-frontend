"use client"

import { useState, useEffect } from 'react'
import type { Opportunity } from '@/core/contracts'
import { OpportunityStateCode } from '@/core/contracts'
import { opportunityService } from '../api/opportunity-service'

/**
 * Hook for managing opportunities list
 */
export function useOpportunities(filterStatus?: OpportunityStateCode) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await opportunityService.getAll()

      // Filter by status if provided
      const filteredData = filterStatus !== undefined
        ? data.filter(opp => opp.statecode === filterStatus)
        : data

      setOpportunities(filteredData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading opportunities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [filterStatus])

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities,
  }
}

/**
 * Hook for managing a single opportunity
 */
export function useOpportunity(id: string) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunity = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await opportunityService.getById(id)
      setOpportunity(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading opportunity')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOpportunity()
    }
  }, [id])

  return {
    opportunity,
    loading,
    error,
    refetch: fetchOpportunity,
  }
}

/**
 * Hook for getting opportunities by originating lead
 */
export function useOpportunitiesByLead(leadId?: string) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = async () => {
    if (!leadId) {
      setOpportunities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await opportunityService.getByLead(leadId)
      setOpportunities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading opportunities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [leadId])

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities,
  }
}
