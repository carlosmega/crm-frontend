"use client"

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Opportunity } from '@/core/contracts'
import { SalesStageCode, BudgetStatusCode } from '@/core/contracts'
import { StageDialog } from '@/shared/components/dialogs/stage-dialog'
import { QualifyStageSection } from '../sections/qualify-stage-section'
import { DevelopStageSection } from '../sections/develop-stage-section'
import { ProposeStageSection } from '../sections/propose-stage-section'
import { CloseStageSection } from '../sections/close-stage-section'
import { useOpportunityStageProgression } from '../../hooks/use-opportunity-stage-progression'
import { Target, TrendingUp, Presentation, CheckCircle2 } from 'lucide-react'

// ===== Stage Schemas =====

const qualifyStageSchema = z.object({
  budgetamount: z.number().positive('Budget must be greater than 0').optional(),
  budgetstatus: z.nativeEnum(BudgetStatusCode).optional(),
  timeframe: z.string().optional(),
  needanalysis: z.string().optional(),
  decisionmaker: z.string().optional(),
})

const developStageSchema = z.object({
  proposedsolution: z.string().optional(),
  timeline: z.string().optional(),
  identifycompetitors: z.boolean().optional(),
  customerneeds: z.string().optional(),
  currentsituation: z.string().optional(),
})

const proposeStageSchema = z.object({
  presentationdate: z.string().optional(),
  finaldecisiondate: z.string().optional(),
  identifycustomercontacts: z.boolean().optional(),
  sendthankyounote: z.boolean().optional(),
})

const closeStageSchema = z.object({
  actualvalue: z.number().positive().optional(),
  actualclosedate: z.string().optional(),
  closestatus: z.string().optional(),
})

// ===== Stage Configuration =====

interface StageConfig {
  name: string
  icon: typeof Target
  description: string
  schema: z.ZodObject<any>
  fields: string[]
}

const stageConfigs: Record<SalesStageCode, StageConfig> = {
  [SalesStageCode.Qualify]: {
    name: 'Qualify',
    icon: Target,
    description: 'Assess budget, timeline, and decision-making authority',
    schema: qualifyStageSchema,
    fields: ['budgetamount', 'budgetstatus', 'timeframe', 'needanalysis', 'decisionmaker'],
  },
  [SalesStageCode.Develop]: {
    name: 'Develop',
    icon: TrendingUp,
    description: 'Research opportunity and develop solution',
    schema: developStageSchema,
    fields: ['proposedsolution', 'timeline', 'identifycompetitors', 'customerneeds', 'currentsituation'],
  },
  [SalesStageCode.Propose]: {
    name: 'Propose',
    icon: Presentation,
    description: 'Present proposal and finalize terms',
    schema: proposeStageSchema,
    fields: ['presentationdate', 'finaldecisiondate', 'identifycustomercontacts', 'sendthankyounote'],
  },
  [SalesStageCode.Close]: {
    name: 'Close',
    icon: CheckCircle2,
    description: 'Finalize deal as Won or Lost',
    schema: closeStageSchema,
    fields: ['actualvalue', 'actualclosedate', 'closestatus'],
  },
}

// ===== Props =====

export interface OpportunityStageDialogProps {
  opportunity: Opportunity
  stage: SalesStageCode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// ===== Component =====

/**
 * OpportunityStageDialog
 *
 * Stage-specific dialog for editing Opportunity BPF stages.
 * Maps each stage to its corresponding section component and schema.
 *
 * Features:
 * - Dynamic section rendering based on stage
 * - Stage-specific validation
 * - Progress tracking
 * - Save and advance actions
 */
export function OpportunityStageDialog({
  opportunity,
  stage,
  open,
  onOpenChange,
  onSuccess,
}: OpportunityStageDialogProps) {
  const { saveStage, advanceStage, loading } = useOpportunityStageProgression()

  // Use a default stage if none selected (to satisfy hooks rules)
  const activeStage = stage !== null && stage in stageConfigs ? stage : SalesStageCode.Qualify
  const config = stageConfigs[activeStage]

  // Initialize form with stage-specific schema and default values
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: getStageDefaultValues(opportunity, activeStage),
    mode: 'onChange', // Validate on change for immediate feedback
  })

  // Don't render if no valid stage selected
  if (stage === null || !(stage in stageConfigs)) {
    return null
  }

  // Calculate progress
  const formValues = form.watch()
  const { completedFields, totalFields } = calculateStageProgress(formValues, config.fields)

  // Can advance if all required fields are filled and no errors
  const canAdvance = completedFields === totalFields && Object.keys(form.formState.errors).length === 0

  // Handlers
  const handleSave = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()
    await saveStage(opportunity.opportunityid, stage, data)
    onSuccess?.()
    onOpenChange(false)
  }

  const handleNextStage = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()
    await advanceStage(opportunity.opportunityid, stage, data)
    onSuccess?.()
    onOpenChange(false)
  }

  // Determine if this is the final stage
  const isFinalStage = stage === SalesStageCode.Close

  return (
    <FormProvider {...form}>
      <StageDialog
        open={open}
        onOpenChange={onOpenChange}
        stageName={config.name}
        stageIcon={config.icon}
        stageDescription={config.description}
        completedFields={completedFields}
        totalFields={totalFields}
        onSave={handleSave}
        onNextStage={isFinalStage ? undefined : handleNextStage}
        loading={loading}
        canAdvance={canAdvance}
        showNextStage={!isFinalStage}
      >
        {renderStageContent(stage)}
      </StageDialog>
    </FormProvider>
  )
}

// ===== Helper Functions =====

/**
 * Render appropriate section component for stage
 */
function renderStageContent(stage: SalesStageCode) {
  switch (stage) {
    case SalesStageCode.Qualify:
      return <QualifyStageSection />
    case SalesStageCode.Develop:
      return <DevelopStageSection />
    case SalesStageCode.Propose:
      return <ProposeStageSection />
    case SalesStageCode.Close:
      return <CloseStageSection />
    default:
      return null
  }
}

/**
 * Get default values for stage from opportunity data
 */
function getStageDefaultValues(opportunity: Opportunity, stage: SalesStageCode): Record<string, any> {
  const defaults: Record<string, any> = {}

  const config = stageConfigs[stage]
  if (!config) return defaults

  // Define field types for proper default values
  const booleanFields = ['identifycompetitors', 'identifycustomercontacts', 'identifypursuitteam', 'sendthankyounote']
  const numberFields = ['budgetamount', 'actualvalue']

  // Extract only the fields relevant to this stage
  config.fields.forEach((field) => {
    const value = (opportunity as any)[field]

    // Set appropriate default value based on field type
    if (booleanFields.includes(field)) {
      defaults[field] = value ?? false
    } else if (numberFields.includes(field)) {
      defaults[field] = value ?? undefined
    } else {
      // String fields
      defaults[field] = value ?? ''
    }
  })

  return defaults
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
    // - Number field is > 0
    // - String field is non-empty
    if (typeof value === 'boolean') return true
    if (typeof value === 'number') return value > 0
    if (typeof value === 'string') return value.trim().length > 0

    return false
  }).length

  return { completedFields, totalFields }
}
