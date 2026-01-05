"use client"

import { useState, useEffect } from 'react'
import type { Lead } from '@/core/contracts'
import { LeadStateCode } from '@/core/contracts'
import { leadService } from '../api/lead-service'

/**
 * Hook for managing leads list
 */
export function useLeads(filterStatus?: LeadStateCode) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = filterStatus !== undefined
        ? await leadService.getByStatus(filterStatus)
        : await leadService.getAll()

      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [filterStatus])

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
  }
}

/**
 * Hook for managing a single lead
 */
export function useLead(id: string) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLead = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await leadService.getById(id)
      setLead(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading lead')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchLead()
    }
  }, [id])

  return {
    lead,
    loading,
    error,
    refetch: fetchLead,
  }
}

/**
 * Hook for searching leads
 */
export function useLeadSearch() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setLeads([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await leadService.getAll({ search: query })
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching leads')
    } finally {
      setLoading(false)
    }
  }

  return {
    leads,
    loading,
    error,
    search,
  }
}
