"use client"

import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Opportunity, CreateOpportunityDto, UpdateOpportunityDto } from '@/core/contracts'
import { CustomerType, SalesStageCode, BudgetStatusCode } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

// Import sections (BPF stages now edited via dialogs)
import { GeneralInfoSection } from './sections/general-info-section'
import { AdditionalDetailsSection } from './sections/additional-details-section'

export type OpportunityFormSection = 'general' | 'additional' | 'all'

/**
 * Calcula la probabilidad de cierre según el Sales Stage
 * Según CLAUDE.md - Sales Stages con probabilidades
 */
function calculateProbability(salesstage: SalesStageCode): number {
  switch (salesstage) {
    case SalesStageCode.Qualify: return 25
    case SalesStageCode.Develop: return 50
    case SalesStageCode.Propose: return 75
    case SalesStageCode.Close: return 100
    default: return 25
  }
}

const opportunityFormSchema = z.object({
  // General Info
  name: z.string().min(1, 'Opportunity name is required'),
  customerid: z.string().optional(), // Optional porque en UPDATE no se envía
  customeridtype: z.nativeEnum(CustomerType).optional(), // Optional porque en UPDATE no se envía
  salesstage: z.nativeEnum(SalesStageCode),
  estimatedvalue: z.number().min(0, 'Estimated value must be 0 or greater'),
  estimatedclosedate: z.string().min(1, 'Estimated close date is required'),
  description: z.string().optional(),

  // Qualify Stage
  budgetamount: z.number().min(0).optional(),
  budgetstatus: z.nativeEnum(BudgetStatusCode).optional(),
  timeframe: z.string().optional(),
  needanalysis: z.string().optional(),
  decisionmaker: z.string().optional(),

  // Develop Stage
  proposedsolution: z.string().optional(),
  timeline: z.string().optional(),
  identifycompetitors: z.boolean().optional(),
  customerneeds: z.string().optional(),
  currentsituation: z.string().optional(),

  // Propose Stage
  presentationdate: z.string().optional(),
  finaldecisiondate: z.string().optional(),
  identifycustomercontacts: z.boolean().optional(),
  identifypursuitteam: z.boolean().optional(),
  sendthankyounote: z.boolean().optional(),

  // Close Stage
  actualvalue: z.number().min(0).optional(),
  actualclosedate: z.string().optional(),
  closestatus: z.string().optional(),
  competitorid: z.string().optional(),
})

type OpportunityFormValues = z.infer<typeof opportunityFormSchema>

interface OpportunityFormProps {
  opportunity?: Opportunity
  onSubmit: (data: CreateOpportunityDto | UpdateOpportunityDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
  section?: OpportunityFormSection // Which section to show (default: 'all')
}

export function OpportunityForm({
  opportunity,
  onSubmit,
  onCancel,
  isLoading,
  hideActions,
  section = 'all'
}: OpportunityFormProps) {
  const { data: session } = useSession()

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: opportunity
      ? {
          name: opportunity.name || '',
          customerid: opportunity.customerid || '',
          customeridtype: opportunity.customeridtype || CustomerType.Account,
          salesstage: opportunity.salesstage || SalesStageCode.Qualify,
          estimatedvalue: opportunity.estimatedvalue || 0,
          estimatedclosedate: opportunity.estimatedclosedate || '',
          description: opportunity.description || '',
          // Additional fields would come from extended Opportunity type
          budgetamount: 0,
          budgetstatus: BudgetStatusCode.No_Budget,
          timeframe: '',
          needanalysis: '',
          decisionmaker: '',
          proposedsolution: '',
          timeline: '',
          identifycompetitors: false,
          customerneeds: '',
          currentsituation: '',
          presentationdate: '',
          finaldecisiondate: '',
          identifycustomercontacts: false,
          identifypursuitteam: false,
          sendthankyounote: false,
          actualvalue: opportunity.actualvalue || 0,
          actualclosedate: opportunity.actualclosedate || '',
          closestatus: opportunity.closestatus || '',
          competitorid: '',
        }
      : {
          name: '',
          customerid: '',
          customeridtype: CustomerType.Account,
          salesstage: SalesStageCode.Qualify,
          estimatedvalue: 0,
          estimatedclosedate: '',
          description: '',
          budgetamount: 0,
          budgetstatus: BudgetStatusCode.No_Budget,
          timeframe: '',
          needanalysis: '',
          decisionmaker: '',
          proposedsolution: '',
          timeline: '',
          identifycompetitors: false,
          customerneeds: '',
          currentsituation: '',
          presentationdate: '',
          finaldecisiondate: '',
          identifycustomercontacts: false,
          identifypursuitteam: false,
          sendthankyounote: false,
          actualvalue: 0,
          actualclosedate: '',
          closestatus: '',
          competitorid: '',
        },
  })

  const handleSubmit = async (values: OpportunityFormValues) => {
    console.log('📝 OpportunityForm handleSubmit called')
    console.log('Raw form values:', values)
    console.log('Is UPDATE mode:', !!opportunity)

    // ✅ SOLUCIÓN: Filtrar campos según CREATE vs UPDATE
    let cleanedData: any

    if (opportunity) {
      // UPDATE MODE: Mapear campos del formulario al formato Django backend
      // ⚠️ Django usa nombres diferentes: estimatedrevenue, probability, customername
      cleanedData = {
        name: values.name,
        description: values.description || undefined,
        salesstage: values.salesstage,
        estimatedrevenue: values.estimatedvalue > 0 ? values.estimatedvalue : undefined,
        estimatedclosedate: values.estimatedclosedate,
        probability: calculateProbability(values.salesstage),
        statuscode: 1, // In Progress (default para updates)
        // Algunos backends Django requieren el ID en el body también
        opportunityid: opportunity.opportunityid,
      }
      console.log('Before cleanup (UPDATE):', cleanedData)

      // Eliminar campos undefined o vacíos
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key]
        if (value === undefined || value === '') {
          delete cleanedData[key]
        }
      })
      console.log('After cleanup (UPDATE):', cleanedData)
    } else {
      // CREATE MODE: Incluir todos los campos necesarios de CreateOpportunityDto
      // Validar que customerid y customeridtype estén presentes
      if (!values.customerid) {
        throw new Error('Customer ID is required when creating a new opportunity')
      }
      if (!values.customeridtype) {
        throw new Error('Customer Type is required when creating a new opportunity')
      }

      cleanedData = {
        name: values.name,
        customerid: values.customerid,
        customeridtype: values.customeridtype,
        salesstage: values.salesstage,
        estimatedvalue: values.estimatedvalue,
        estimatedclosedate: values.estimatedclosedate,
        description: values.description || undefined,
        ownerid: session?.user?.id || 'anonymous',
      }

      // Eliminar campos undefined
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined || cleanedData[key] === '') {
          delete cleanedData[key]
        }
      })
    }

    console.log('Cleaned data to submit:', cleanedData)
    console.log('Cleaned data JSON:', JSON.stringify(cleanedData, null, 2))
    await onSubmit(cleanedData as CreateOpportunityDto | UpdateOpportunityDto)
  }

  // Section visibility control
  const showGeneral = section === 'all' || section === 'general'
  const showAdditional = section === 'all' || section === 'additional'

  return (
    <Form {...form}>
      <form
        id="opportunity-edit-form"
        onSubmit={form.handleSubmit(
          handleSubmit,
          (errors) => {
            console.error('Form validation errors:', errors)
            toast.error('Please fix the following errors: ' +
              Object.entries(errors)
                .map(([field, error]) => `${field}: ${error?.message}`)
                .join(', ')
            )
          }
        )}
        className="space-y-4"
      >
        {/* GENERAL SECTION */}
        {showGeneral && (
          <GeneralInfoSection isEditMode={!!opportunity} />
        )}

        {/* ADDITIONAL DETAILS SECTION */}
        {showAdditional && (
          <AdditionalDetailsSection isEditMode={!!opportunity} />
        )}

        {/* Actions */}
        {!hideActions && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[140px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
