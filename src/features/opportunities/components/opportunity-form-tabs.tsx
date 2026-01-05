"use client"

import type { Opportunity } from '@/core/contracts'
import { OpportunityForm } from './opportunity-form'

// Only 'general' tab in form mode - BPF stages are handled via SalesBusinessProcessFlow component
export type OpportunityFormTabId = 'general'

interface OpportunityFormTabsProps {
  opportunity?: Opportunity
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * OpportunityFormTabs
 *
 * Form view for creating and editing opportunities.
 *
 * Features:
 * - Single "General" tab for main form
 * - NO BPF stage tabs (Qualify, Develop, Propose, Close) - these are managed via SalesBusinessProcessFlow component and dialogs
 * - NO Activities tab (only for detail view)
 * - Uses OpportunityForm component
 */
export function OpportunityFormTabs({
  opportunity,
  onSubmit,
  onCancel,
  isLoading
}: OpportunityFormTabsProps) {
  return (
    <OpportunityForm
      opportunity={opportunity}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      hideActions
    />
  )
}
