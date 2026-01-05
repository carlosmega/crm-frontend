"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useLeadQualification } from '../../hooks/use-lead-qualification'
import type { QualificationWizardFormData, QualificationWizardProps, WizardStepId } from './types'
import { WIZARD_STEPS, wizardSchema } from './types'
import { BantQualificationStep } from './bant-qualification-step'
import { AccountSelectionStep } from './account-selection-step'
import { ContactSelectionStep } from './contact-selection-step'
import { OpportunityCreationStep } from './opportunity-creation-step'
import { SummaryConfirmationStep } from './summary-confirmation-step'
import { cn } from '@/lib/utils'

/**
 * Lead Qualification Wizard
 *
 * Multi-step wizard for qualifying leads using BANT framework
 */
export function LeadQualificationWizard({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: QualificationWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { qualifyLeadWithOptions, loading } = useLeadQualification()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isB2B = !!lead.companyname && lead.companyname.trim().length > 0

  // Initialize form with lead data
  const form = useForm<QualificationWizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      // BANT from lead
      budgetAmount: lead.budgetamount || 0,
      budgetStatus: lead.budgetstatus || 0,
      decisionMaker: lead.decisionmaker || '',
      needAnalysis: lead.needanalysis || '',
      purchaseTimeframe: lead.purchasetimeframe || 0,

      // Account
      accountOption: isB2B ? 'create' : 'skip',
      newAccountName: lead.companyname || '',

      // Contact
      contactOption: 'create',
      newContactFirstName: lead.firstname || '',
      newContactLastName: lead.lastname || '',
      newContactEmail: lead.emailaddress1 || '',
      newContactPhone: lead.telephone1 || '',

      // Opportunity
      opportunityName: `${lead.companyname || lead.fullname} - Sales Opportunity`,
      estimatedValue: lead.budgetamount || 0,
      estimatedCloseDate: lead.estimatedclosedate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      opportunityDescription: lead.description || lead.needanalysis || '',
    },
  })

  const currentStep = WIZARD_STEPS[currentStepIndex]
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1
  const isFirstStep = currentStepIndex === 0

  // Validate current step before proceeding
  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues()

    switch (currentStepIndex) {
      case 0: // BANT
        return await form.trigger([
          'budgetAmount',
          'budgetStatus',
          'decisionMaker',
          'needAnalysis',
          'purchaseTimeframe',
        ])

      case 1: // Account
        if (values.accountOption === 'create') {
          return await form.trigger(['newAccountName'])
        }
        if (values.accountOption === 'existing') {
          if (!values.existingAccountId) {
            toast({
              title: 'Account Required',
              description: 'Please select an existing account',
              variant: 'destructive',
            })
            return false
          }
        }
        return true

      case 2: // Contact
        if (values.contactOption === 'create') {
          return await form.trigger([
            'newContactFirstName',
            'newContactLastName',
            'newContactEmail',
          ])
        }
        if (values.contactOption === 'existing') {
          if (!values.existingContactId) {
            toast({
              title: 'Contact Required',
              description: 'Please select an existing contact',
              variant: 'destructive',
            })
            return false
          }
        }
        return true

      case 3: // Opportunity
        return await form.trigger([
          'opportunityName',
          'estimatedValue',
          'estimatedCloseDate',
        ])

      case 4: // Summary
        return true

      default:
        return true
    }
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSubmit = async (data: QualificationWizardFormData) => {
    try {
      setIsSubmitting(true)

      // Build qualification DTO
      const qualifyDto = {
        // Account
        createAccount: data.accountOption === 'create',
        existingAccountId: data.existingAccountId,

        // Contact
        createContact: data.contactOption === 'create',
        existingContactId: data.existingContactId,

        // Opportunity
        opportunityName: data.opportunityName,
        estimatedValue: data.estimatedValue,
        estimatedCloseDate: data.estimatedCloseDate,
        description: data.opportunityDescription,
      }

      // Qualify lead
      const response = await qualifyLeadWithOptions(lead.leadid, qualifyDto)

      toast({
        title: 'Lead Qualified Successfully!',
        description: `Opportunity "${response.opportunity.name}" has been created`,
      })

      // Call success callback
      if (onSuccess) {
        onSuccess({
          account: response.account,
          contact: response.contact!,
          opportunityId: response.opportunity.opportunityid,
          opportunityName: response.opportunity.name,
        })
      }

      // Close dialog
      onOpenChange(false)

      // Navigate to opportunity
      router.push(`/opportunities/${response.opportunity.opportunityid}`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Qualification Failed',
        description: error instanceof Error ? error.message : 'Failed to qualify lead',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <BantQualificationStep />
      case 1:
        return <AccountSelectionStep lead={lead} />
      case 2:
        return <ContactSelectionStep lead={lead} />
      case 3:
        return <OpportunityCreationStep lead={lead} />
      case 4:
        return <SummaryConfirmationStep lead={lead} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Qualify Lead - {lead.fullname || `${lead.firstname} ${lead.lastname}`}</DialogTitle>
          <DialogDescription>
            Follow the BANT framework to qualify this lead and create sales opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {WIZARD_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1 flex-1',
                  index === currentStepIndex && 'text-primary font-medium',
                  index < currentStepIndex && 'text-green-600'
                )}
              >
                <div className="flex items-center gap-1">
                  {index < currentStepIndex && <CheckCircle2 className="h-3 w-3" />}
                  <span>{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 overflow-hidden flex flex-col">
            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-1">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
              </div>

              {!isLastStep ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || loading}>
                  {(isSubmitting || loading) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {isSubmitting || loading ? 'Qualifying...' : 'Qualify Lead'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
