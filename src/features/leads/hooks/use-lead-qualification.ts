"use client"

import { useState } from 'react'
import type { Lead, QualifyLeadDto, QualifyLeadResponse } from '@/core/contracts'
import { leadService } from '../api/lead-service'

/**
 * Hook for lead qualification
 *
 * Handles the complete qualification process:
 * 1. Creates Account (B2B) or skips (B2C)
 * 2. Creates Contact
 * 3. Creates Opportunity
 * 4. Updates Lead to Qualified state
 */
export function useLeadQualification() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Qualify lead with smart defaults
   *
   * Automatically determines:
   * - B2B vs B2C based on companyname
   * - Creates new Account/Contact by default
   * - Uses lead's estimated value/date if provided
   */
  const qualifyLead = async (lead: Lead): Promise<QualifyLeadResponse> => {
    try {
      setLoading(true)
      setError(null)

      // Validate BPF fields are complete
      if (
        !lead.budgetamount ||
        lead.budgetamount <= 0 ||
        !lead.budgetstatus ||
        !lead.timeframe ||
        !lead.needanalysis ||
        !lead.decisionmaker
      ) {
        throw new Error('Please complete all Qualify stage fields before qualifying the lead')
      }

      // Determine if B2B (has company) or B2C (individual)
      const isB2B = !!lead.companyname && lead.companyname.trim().length > 0

      // Build qualification DTO with smart defaults
      const qualifyDto: QualifyLeadDto = {
        // Account creation (B2B only)
        createAccount: isB2B,
        existingAccountId: undefined, // TODO: Add UI for selecting existing account

        // Contact creation (always create new)
        createContact: true,
        existingContactId: undefined, // TODO: Add UI for selecting existing contact

        // Opportunity details
        opportunityName: `${lead.fullname || `${lead.firstname} ${lead.lastname}`} - ${
          lead.companyname || 'Opportunity'
        }`,
        estimatedValue: lead.estimatedvalue || lead.budgetamount || 0,
        estimatedCloseDate:
          lead.estimatedclosedate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default: 30 days
        description: lead.description || lead.needanalysis,
      }

      // Call service to qualify lead
      const response = await leadService.qualify(lead.leadid, qualifyDto)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error qualifying lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Qualify lead with custom options
   *
   * Allows caller to specify exact qualification behavior:
   * - Choose existing Account/Contact
   * - Customize opportunity details
   */
  const qualifyLeadWithOptions = async (
    leadId: string,
    dto: QualifyLeadDto
  ): Promise<QualifyLeadResponse> => {
    try {
      setLoading(true)
      setError(null)

      const response = await leadService.qualify(leadId, dto)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error qualifying lead'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    qualifyLead,
    qualifyLeadWithOptions,
    loading,
    error,
  }
}
