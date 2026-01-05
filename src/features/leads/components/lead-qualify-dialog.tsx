"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Lead } from '@/core/contracts'
import { useLeadQualification } from '../hooks/use-lead-qualification'
import { CustomerSelectorDialog } from '@/shared/components/selectors/customer-selector-dialog'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Building2, User, TrendingUp, Loader2, Euro, Calendar, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LeadQualifyDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Validation schema
const qualifySchema = z.object({
  // Account
  accountMode: z.enum(['create', 'existing', 'none']),
  existingAccountId: z.string().optional(),
  existingAccountName: z.string().optional(),

  // Contact
  contactMode: z.enum(['create', 'existing']),
  existingContactId: z.string().optional(),
  existingContactName: z.string().optional(),

  // Opportunity
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  estimatedValue: z.number().positive('Estimated value must be greater than 0'),
  estimatedCloseDate: z.string().min(1, 'Close date is required'),
  description: z.string().optional(),
}).refine(
  (data) => {
    // If accountMode is 'existing', must have an account selected
    if (data.accountMode === 'existing' && !data.existingAccountId) {
      return false
    }
    // If contactMode is 'existing', must have a contact selected
    if (data.contactMode === 'existing' && !data.existingContactId) {
      return false
    }
    return true
  },
  {
    message: 'Please select an existing record when choosing "Use existing"',
  }
)

type QualifyFormData = z.infer<typeof qualifySchema>

export function LeadQualifyDialog({ lead, open, onOpenChange }: LeadQualifyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { qualifyLeadWithOptions, loading } = useLeadQualification()
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdEntities, setCreatedEntities] = useState<{
    account?: { accountid: string; name: string }
    contact?: { contactid: string; fullname: string }
    opportunity: { opportunityid: string; name: string }
  } | null>(null)

  // Account/Contact selector dialogs
  const [accountSelectorOpen, setAccountSelectorOpen] = useState(false)
  const [contactSelectorOpen, setContactSelectorOpen] = useState(false)

  const isB2B = !!lead.companyname && lead.companyname.trim().length > 0

  // Default 30 days from now for close date
  const defaultCloseDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const form = useForm<QualifyFormData>({
    resolver: zodResolver(qualifySchema),
    defaultValues: {
      accountMode: isB2B ? 'create' : 'none',
      contactMode: 'create',
      opportunityName: `${lead.fullname || `${lead.firstname} ${lead.lastname}`} - ${
        lead.companyname || 'Opportunity'
      }`,
      estimatedValue: lead.estimatedvalue || lead.budgetamount || 0,
      estimatedCloseDate: lead.estimatedclosedate?.split('T')[0] || defaultCloseDate,
      description: lead.description || lead.needanalysis || '',
    },
  })

  const accountMode = form.watch('accountMode')
  const contactMode = form.watch('contactMode')

  const validateBPFFields = () => {
    const missingFields: string[] = []

    if (!lead.budgetamount || lead.budgetamount <= 0) {
      missingFields.push('Budget Amount')
    }
    if (lead.budgetstatus === undefined || lead.budgetstatus === null) {
      missingFields.push('Budget Status')
    }
    if (!lead.timeframe) {
      missingFields.push('Purchase Timeframe')
    }
    if (!lead.needanalysis) {
      missingFields.push('Need Analysis')
    }
    if (!lead.decisionmaker) {
      missingFields.push('Decision Maker')
    }

    return missingFields
  }

  const handleAccountSelect = (customer: SelectedCustomer) => {
    form.setValue('existingAccountId', customer.id)
    form.setValue('existingAccountName', customer.name)
  }

  const handleContactSelect = (customer: SelectedCustomer) => {
    form.setValue('existingContactId', customer.id)
    form.setValue('existingContactName', customer.name)
  }

  const onSubmit = async (data: QualifyFormData) => {
    try {
      // Validate BPF fields
      const missingFields = validateBPFFields()
      if (missingFields.length > 0) {
        toast({
          title: 'Incomplete Qualify Stage',
          description: `Please complete the following fields: ${missingFields.join(', ')}`,
          variant: 'destructive',
        })
        return
      }

      // Build DTO
      const qualifyDto = {
        createAccount: data.accountMode === 'create',
        existingAccountId: data.accountMode === 'existing' ? data.existingAccountId : undefined,
        createContact: data.contactMode === 'create',
        existingContactId: data.contactMode === 'existing' ? data.existingContactId : undefined,
        opportunityName: data.opportunityName,
        estimatedValue: data.estimatedValue,
        estimatedCloseDate: new Date(data.estimatedCloseDate).toISOString(),
        description: data.description,
      }

      // Qualify lead
      const response = await qualifyLeadWithOptions(lead.leadid, qualifyDto)

      setCreatedEntities({
        account: response.account,
        contact: response.contact,
        opportunity: response.opportunity,
      })

      setShowSuccess(true)

      toast({
        title: 'Lead Qualified Successfully',
        description: `Opportunity "${response.opportunity.name}" has been created`,
      })
    } catch (error) {
      toast({
        title: 'Qualification Failed',
        description: error instanceof Error ? error.message : 'Failed to qualify lead',
        variant: 'destructive',
      })
    }
  }

  const handleViewOpportunity = () => {
    if (createdEntities?.opportunity) {
      router.push(`/opportunities/${createdEntities.opportunity.opportunityid}`)
    }
  }

  const handleClose = () => {
    setShowSuccess(false)
    setCreatedEntities(null)
    form.reset()
    onOpenChange(false)
    router.refresh()
  }

  // Success dialog
  if (showSuccess && createdEntities) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <AlertDialogTitle>Lead Qualified Successfully!</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              The following records have been created from this lead:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Account Card (B2B only) */}
            {createdEntities.account && (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">{createdEntities.account.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/accounts/${createdEntities.account!.accountid}`)}
                >
                  View
                </Button>
              </div>
            )}

            {/* Contact Card */}
            {createdEntities.contact && (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <User className="h-5 w-5 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Contact Created</p>
                  <p className="text-sm text-muted-foreground">{createdEntities.contact.fullname}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/contacts/${createdEntities.contact!.contactid}`)}
                >
                  View
                </Button>
              </div>
            )}

            {/* Opportunity Card */}
            <div className="flex items-start gap-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Opportunity Created</p>
                <p className="text-sm text-muted-foreground">{createdEntities.opportunity.name}</p>
              </div>
              <Button size="sm" onClick={handleViewOpportunity}>
                View Opportunity
              </Button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>Done</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Main qualification dialog
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Qualify Lead</DialogTitle>
            <DialogDescription>
              Configure how to qualify this lead and create related records
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* B2B/B2C Indicator */}
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">
                {isB2B ? '🏢 B2B Qualification' : '👤 B2C Qualification'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isB2B ? `Company: ${lead.companyname}` : 'Individual customer (no company)'}
              </p>
            </div>

            {/* Validation Warnings */}
            {validateBPFFields().length > 0 && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Missing Required Fields
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Complete these fields in the Qualify Stage first: {validateBPFFields().join(', ')}
                </p>
              </div>
            )}

            {/* Account Configuration (B2B only) */}
            {isB2B && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Account</CardTitle>
                  </div>
                  <CardDescription>Choose how to handle the company account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={accountMode}
                    onValueChange={(value) => {
                      form.setValue('accountMode', value as 'create' | 'existing' | 'none')
                      if (value !== 'existing') {
                        form.setValue('existingAccountId', undefined)
                        form.setValue('existingAccountName', undefined)
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="create" id="account-create" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="account-create" className="font-medium">
                          Create new account
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Create "{lead.companyname}" as a new account
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="existing" id="account-existing" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="account-existing" className="font-medium">
                          Use existing account
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Link to an account that already exists
                        </p>
                        {accountMode === 'existing' && (
                          <div className="space-y-2">
                            {form.watch('existingAccountName') ? (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm flex-1">
                                  {form.watch('existingAccountName')}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    form.setValue('existingAccountId', undefined)
                                    form.setValue('existingAccountName', undefined)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAccountSelectorOpen(true)}
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                Select Account
                              </Button>
                            )}
                            {form.formState.errors.existingAccountId && (
                              <p className="text-xs text-red-500">
                                {form.formState.errors.existingAccountId.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Contact Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base">Contact</CardTitle>
                </div>
                <CardDescription>Choose how to handle the contact person</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={contactMode}
                  onValueChange={(value) => {
                    form.setValue('contactMode', value as 'create' | 'existing')
                    if (value !== 'existing') {
                      form.setValue('existingContactId', undefined)
                      form.setValue('existingContactName', undefined)
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="create" id="contact-create" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="contact-create" className="font-medium">
                        Create new contact
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Create "{lead.fullname || `${lead.firstname} ${lead.lastname}`}" as a new contact
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="existing" id="contact-existing" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="contact-existing" className="font-medium">
                        Use existing contact
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Link to a contact that already exists
                      </p>
                      {contactMode === 'existing' && (
                        <div className="space-y-2">
                          {form.watch('existingContactName') ? (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm flex-1">
                                {form.watch('existingContactName')}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  form.setValue('existingContactId', undefined)
                                  form.setValue('existingContactName', undefined)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setContactSelectorOpen(true)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Select Contact
                            </Button>
                          )}
                          {form.formState.errors.existingContactId && (
                            <p className="text-xs text-red-500">
                              {form.formState.errors.existingContactId.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Opportunity Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Opportunity</CardTitle>
                </div>
                <CardDescription>Configure the sales opportunity details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="opportunityName">
                    Opportunity Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="opportunityName"
                    {...form.register('opportunityName')}
                    placeholder="e.g., Acme Inc - Sales Opportunity"
                  />
                  {form.formState.errors.opportunityName && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.opportunityName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">
                      Estimated Value <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedValue"
                        type="number"
                        step="0.01"
                        className="pl-10"
                        {...form.register('estimatedValue', {
                          setValueAs: (v) => (v === '' ? 0 : parseFloat(v)),
                        })}
                        placeholder="100000"
                      />
                    </div>
                    {form.formState.errors.estimatedValue && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.estimatedValue.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedCloseDate">
                      Est. Close Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedCloseDate"
                        type="date"
                        className="pl-10"
                        {...form.register('estimatedCloseDate')}
                      />
                    </div>
                    {form.formState.errors.estimatedCloseDate && (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.estimatedCloseDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Describe the opportunity and customer needs..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || validateBPFFields().length > 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? 'Qualifying...' : 'Qualify Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Selector */}
      <CustomerSelectorDialog
        open={accountSelectorOpen}
        onOpenChange={setAccountSelectorOpen}
        onSelect={handleAccountSelect}
        customerType="account"
      />

      {/* Contact Selector */}
      <CustomerSelectorDialog
        open={contactSelectorOpen}
        onOpenChange={setContactSelectorOpen}
        onSelect={handleContactSelect}
        customerType="contact"
      />
    </>
  )
}
