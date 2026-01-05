/**
 * Types for Lead Qualification Wizard
 */

import type { Lead } from '@/core/contracts'
import { z } from 'zod'

// Zod schema for form validation
export const wizardSchema = z.object({
  // Step 1: BANT
  budgetAmount: z.number().min(1, 'Budget amount is required'),
  budgetStatus: z.number(),
  decisionMaker: z.string().min(1, 'Decision maker is required'),
  needAnalysis: z.string().min(10, 'Need analysis must be at least 10 characters'),
  purchaseTimeframe: z.number(),

  // Step 2: Account
  accountOption: z.enum(['create', 'existing', 'skip']),
  existingAccountId: z.string().optional(),
  newAccountName: z.string().optional(),

  // Step 3: Contact
  contactOption: z.enum(['create', 'existing']),
  existingContactId: z.string().optional(),
  newContactFirstName: z.string().optional(),
  newContactLastName: z.string().optional(),
  newContactEmail: z.string().email().optional().or(z.literal('')),
  newContactPhone: z.string().optional(),

  // Step 4: Opportunity
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  estimatedValue: z.number().min(0, 'Estimated value must be positive'),
  estimatedCloseDate: z.string().min(1, 'Estimated close date is required'),
  opportunityDescription: z.string().optional(),
})

// Infer TypeScript type from Zod schema to ensure they're always in sync
export type QualificationWizardFormData = z.infer<typeof wizardSchema>

export interface QualificationWizardProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: QualificationResult) => void
}

export interface QualificationResult {
  account?: {
    accountid: string
    name: string
  }
  contact: {
    contactid: string
    fullname: string
  }
  opportunityId: string
  opportunityName: string
}

export const WIZARD_STEPS = [
  {
    id: 'bant',
    title: 'BANT Qualification',
    description: 'Qualify Budget, Authority, Need, Timeline',
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Select or create company account',
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Select or create contact person',
  },
  {
    id: 'opportunity',
    title: 'Opportunity',
    description: 'Configure sales opportunity',
  },
  {
    id: 'summary',
    title: 'Review',
    description: 'Confirm and qualify',
  },
] as const

export type WizardStepId = typeof WIZARD_STEPS[number]['id']
