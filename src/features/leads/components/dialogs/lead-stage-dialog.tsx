"use client"

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Lead } from '@/core/contracts'
import { BudgetStatusCode } from '@/core/contracts'
import { StageDialog } from '@/shared/components/dialogs/stage-dialog'
import { QualifyStageSection } from '../sections/qualify-stage-section'
import { useLeadStageProgression } from '../../hooks/use-lead-stage-progression'
import { Target } from 'lucide-react'

// ===== Qualify Stage Schema =====

const qualifyStageSchema = z.object({
  budgetamount: z.number().positive('Budget must be greater than 0').optional(),
  budgetstatus: z.nativeEnum(BudgetStatusCode).optional(),
  timeframe: z.string().optional(),
  needanalysis: z.string().optional(),
  decisionmaker: z.string().optional(),
})

// ===== Stage Configuration =====

const QUALIFY_STAGE_CONFIG = {
  name: 'Qualify',
  icon: Target,
  description: 'Assess budget, timeline, and decision-making authority',
  schema: qualifyStageSchema,
  fields: ['budgetamount', 'budgetstatus', 'timeframe', 'needanalysis', 'decisionmaker'],
}

// ===== Props =====

export interface LeadStageDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// ===== Component =====

/**
 * LeadStageDialog
 *
 * Stage-specific dialog for editing Lead BPF Qualify stage.
 * Leads only have one BPF stage (Qualify) before conversion to Opportunity.
 *
 * Features:
 * - Dynamic section rendering for Qualify stage
 * - Stage-specific validation
 * - Progress tracking
 * - Save and advance actions (advance = move to qualified status)
 */
export function LeadStageDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: LeadStageDialogProps) {
  const { saveStage, advanceStage, loading } = useLeadStageProgression()

  // Initialize form with Qualify stage schema and default values
  const form = useForm({
    resolver: zodResolver(QUALIFY_STAGE_CONFIG.schema),
    defaultValues: getStageDefaultValues(lead),
    mode: 'onChange', // Validate on change for immediate feedback
  })

  // Calculate progress
  const formValues = form.watch()
  const { completedFields, totalFields } = calculateStageProgress(formValues, QUALIFY_STAGE_CONFIG.fields)

  // Can advance if all required fields are filled and no errors
  const canAdvance = completedFields === totalFields && Object.keys(form.formState.errors).length === 0

  // Handlers
  const handleSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()
    await saveStage(lead.leadid, data)
    onSuccess?.()
    onOpenChange(false)
  }

  const handleNextStage = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()
    await advanceStage(lead.leadid, data)
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <FormProvider {...form}>
      <StageDialog
        open={open}
        onOpenChange={onOpenChange}
        stageName={QUALIFY_STAGE_CONFIG.name}
        stageIcon={QUALIFY_STAGE_CONFIG.icon}
        stageDescription={QUALIFY_STAGE_CONFIG.description}
        completedFields={completedFields}
        totalFields={totalFields}
        onSave={handleSave}
        onNextStage={handleNextStage}
        loading={loading}
        canAdvance={canAdvance}
      >
        <QualifyStageSection />
      </StageDialog>
    </FormProvider>
  )
}

// ===== Helper Functions =====

/**
 * Get default values for Qualify stage from lead data
 */
function getStageDefaultValues(lead: Lead): Record<string, any> {
  return {
    budgetamount: lead.budgetamount ?? 0,
    budgetstatus: lead.budgetstatus ?? BudgetStatusCode.No_Budget,
    timeframe: lead.timeframe ?? '',
    needanalysis: lead.needanalysis ?? '',
    decisionmaker: lead.decisionmaker ?? '',
  }
}

/**
 * Calculate how many required fields are completed
 */
function calculateStageProgress(
  formValues: Record<string, any>,
  fields: string[]
): { completedFields: number; totalFields: number } {
  const totalFields = fields.length

  const completedFields = fields.filter((field) => {
    const value = formValues[field]

    // Count as completed if:
    // - Boolean field exists (true or false)
    // - budgetstatus: Valid enum value (including 0 for No_Budget)
    // - budgetamount: Number > 0
    // - String field is non-empty
    if (typeof value === 'boolean') return true

    // Special handling for budgetstatus (enum can be 0)
    if (field === 'budgetstatus') {
      return value !== undefined && value !== null
    }

    // Other number fields must be > 0
    if (typeof value === 'number') return value > 0
    if (typeof value === 'string') return value.trim().length > 0

    return false
  }).length

  return { completedFields, totalFields }
}
