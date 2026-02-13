"use client"

import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react'
import type { QualificationWizardFormData } from './types'
import type { Lead } from '@/core/contracts'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'

interface OpportunityCreationStepProps {
  lead: Lead
}

/**
 * Step 4: Opportunity Creation
 *
 * Configure the sales opportunity that will be created
 */
export function OpportunityCreationStep({ lead }: OpportunityCreationStepProps) {
  const formatCurrency = useCurrencyFormat()
  const form = useFormContext<QualificationWizardFormData>()
  const estimatedValue = form.watch('estimatedValue')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Sales Opportunity</h3>
        <p className="text-sm text-muted-foreground">
          Configure the opportunity that will be created from this qualified lead
        </p>
      </div>

      {/* Preview Budget from BANT */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            From BANT Qualification
          </CardTitle>
          <CardDescription>
            Budget: {formatCurrency(form.watch('budgetAmount') || 0)}
            {' • '}
            Timeframe: {form.watch('purchaseTimeframe')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Opportunity Name */}
      <FormField
        control={form.control}
        name="opportunityName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Opportunity Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Acme Corp - CRM Implementation"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A descriptive name for this sales opportunity
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estimated Value */}
      <FormField
        control={form.control}
        name="estimatedValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Value
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="50000"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              {estimatedValue > 0 && (
                <span className="text-primary font-medium">
                  {formatCurrency(estimatedValue)}
                </span>
              )}
              {estimatedValue === 0 && 'Expected revenue from this opportunity'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estimated Close Date */}
      <FormField
        control={form.control}
        name="estimatedCloseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Estimated Close Date
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                placeholder="Select close date"
              />
            </FormControl>
            <FormDescription>
              When do you expect to close this deal?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Opportunity Description */}
      <FormField
        control={form.control}
        name="opportunityDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional details about this opportunity..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Any additional context or notes about this opportunity
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Opportunity Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{form.watch('opportunityName') || 'Not set'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(estimatedValue || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Close Date:</span>
            <span className="font-medium">
              {form.watch('estimatedCloseDate')
                ? new Date(form.watch('estimatedCloseDate')).toLocaleDateString()
                : 'Not set'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
