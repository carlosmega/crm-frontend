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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetStatusCode } from '@/core/contracts/enums'
import { DollarSign, Users, Target, Calendar } from 'lucide-react'
import { HelpTooltip } from '@/shared/components/help-tooltip'
import type { QualificationWizardFormData } from './types'

/**
 * Step 1: BANT Qualification
 *
 * B - Budget: Does the lead have budget?
 * A - Authority: Is the lead a decision maker?
 * N - Need: What problem are they trying to solve?
 * T - Timeline: When do they need a solution?
 */
export function BantQualificationStep() {
  const form = useFormContext<QualificationWizardFormData>()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">BANT Qualification</h3>
        <p className="text-sm text-muted-foreground">
          Qualify the lead using the BANT framework: Budget, Authority, Need, Timeline
        </p>
      </div>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Budget
          </CardTitle>
          <CardDescription>Does the lead have budget for this purchase?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="budgetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Estimated budget available for this purchase</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetStatus"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Budget Status</FormLabel>
                  <HelpTooltip
                    title="Budget Status"
                    content="Select how likely the customer is to allocate budget: No Budget (none available), May Buy (considering), Can Buy (budget exists), Will Buy (approved)."
                    guideLink="/USER_GUIDE.md#step-1-bant-qualification"
                  />
                </div>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={BudgetStatusCode.No_Budget.toString()}>
                      No Budget
                    </SelectItem>
                    <SelectItem value={BudgetStatusCode.May_Buy.toString()}>
                      May Buy
                    </SelectItem>
                    <SelectItem value={BudgetStatusCode.Can_Buy.toString()}>
                      Can Buy
                    </SelectItem>
                    <SelectItem value={BudgetStatusCode.Will_Buy.toString()}>
                      Will Buy
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Likelihood of budget approval</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Authority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Authority
          </CardTitle>
          <CardDescription>Is this person the decision maker?</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="decisionMaker"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Decision Maker</FormLabel>
                  <HelpTooltip
                    title="Decision Authority"
                    content="Identify the person with final approval authority. This should be someone who can sign the contract and allocate budget."
                    guideLink="/USER_GUIDE.md#step-1-bant-qualification"
                  />
                </div>
                <FormControl>
                  <Input
                    placeholder="John Doe, VP of Sales"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Name and title of the person who will make the final decision
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Need */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Need
          </CardTitle>
          <CardDescription>What problem are they trying to solve?</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="needAnalysis"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Need Analysis</FormLabel>
                  <HelpTooltip
                    title="Customer Needs"
                    content="Document the customer's pain points, current situation, and desired outcomes. What problem are they trying to solve? Why now?"
                    guideLink="/USER_GUIDE.md#step-1-bant-qualification"
                  />
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe the customer's pain points, requirements, and what they're trying to achieve..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Document the specific problems, requirements, and desired outcomes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            Timeline
          </CardTitle>
          <CardDescription>When does the customer need a solution?</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="purchaseTimeframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Timeframe</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">
                      Immediate (This Week)
                    </SelectItem>
                    <SelectItem value="1">
                      This Quarter
                    </SelectItem>
                    <SelectItem value="2">
                      Next Quarter
                    </SelectItem>
                    <SelectItem value="3">
                      This Year
                    </SelectItem>
                    <SelectItem value="4">
                      Unknown
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Expected timeframe for purchase decision</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
