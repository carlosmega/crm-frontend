"use client"

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Building2,
  User,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Users,
  Clock
} from 'lucide-react'
import type { QualificationWizardFormData } from './types'
import type { Lead } from '@/core/contracts'
import { formatCurrency } from '@/shared/utils/formatters'
import { Separator } from '@/components/ui/separator'

interface SummaryConfirmationStepProps {
  lead: Lead
}

/**
 * Step 5: Summary and Confirmation
 *
 * Review all information before qualifying the lead
 */
export function SummaryConfirmationStep({ lead }: SummaryConfirmationStepProps) {
  const form = useFormContext<QualificationWizardFormData>()
  const formData = form.getValues()

  const isB2B = formData.accountOption !== 'skip'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Review & Confirm
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review all information before qualifying this lead
        </p>
      </div>

      {/* BANT Qualification Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">BANT Qualification</CardTitle>
          <CardDescription>Budget, Authority, Need, Timeline assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-medium">{formatCurrency(formData.budgetAmount)}</p>
                <Badge variant="outline" className="mt-1">
                  Status: {formData.budgetStatus}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Authority</p>
                <p className="text-sm font-medium">{formData.decisionMaker}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Need</p>
                <p className="text-sm">{formData.needAnalysis.substring(0, 60)}...</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Timeline</p>
                <Badge variant="outline">{formData.purchaseTimeframe}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Records to be Created */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Records to be Created</h4>

        {/* Account */}
        {isB2B && (
          <Card className="border-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.accountOption === 'create' ? (
                <div>
                  <p className="text-sm font-medium">{formData.newAccountName}</p>
                  <Badge variant="outline" className="mt-1">New Account</Badge>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Existing Account</p>
                  <p className="text-xs text-muted-foreground">ID: {formData.existingAccountId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card className="border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.contactOption === 'create' ? (
              <div>
                <p className="text-sm font-medium">
                  {formData.newContactFirstName} {formData.newContactLastName}
                </p>
                <p className="text-xs text-muted-foreground">{formData.newContactEmail}</p>
                {formData.newContactPhone && (
                  <p className="text-xs text-muted-foreground">{formData.newContactPhone}</p>
                )}
                <Badge variant="outline" className="mt-1">New Contact</Badge>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Existing Contact</p>
                <p className="text-xs text-muted-foreground">ID: {formData.existingContactId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunity */}
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{formData.opportunityName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Value: </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(formData.estimatedValue)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Close: </span>
                <span className="font-medium">
                  {new Date(formData.estimatedCloseDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            {formData.opportunityDescription && (
              <p className="text-xs text-muted-foreground mt-2">
                {formData.opportunityDescription.substring(0, 100)}
                {formData.opportunityDescription.length > 100 && '...'}
              </p>
            )}
            <Badge className="mt-2">New Opportunity</Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Lead Status Change */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Lead Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                <span className="font-medium">{lead.fullname || `${lead.firstname} ${lead.lastname}`}</span>
                {' will be marked as '}
                <Badge variant="default" className="bg-green-600">Qualified</Badge>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Original lead record will be preserved with all history
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>Note:</strong> Once qualified, the lead status will change and cannot be reverted.
            Make sure all information is correct before proceeding.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
