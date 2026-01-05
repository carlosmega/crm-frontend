"use client"

import { useFormContext } from 'react-hook-form'
import { BudgetStatusCode, BudgetStatusLabels } from '@/core/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldGroup, AutoGrowTextarea } from '@/shared/components/form'
import { Euro } from 'lucide-react'

/**
 * QualifyStageSection - Tab "Qualify"
 *
 * IMPORTANT: This component mirrors the Card structure used in GeneralInfoSection.
 * Uses the same spacing and Card layout for visual coherence.
 *
 * Contains all qualification-related fields:
 * - Budget Amount & Status
 * - Purchase Timeframe
 * - Need Analysis
 * - Decision Maker
 */
export function QualifyStageSection() {
  const form = useFormContext()
  return (
    <div className="space-y-4"> {/* Mismo spacing que GeneralInfoSection */}

      {/* Budget & Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Budget & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="budgetamount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Budget Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="100000"
                        className="h-10 pl-10"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budgetstatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Budget Status
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select budget status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(BudgetStatusLabels).map(([code, label]) => (
                        <SelectItem key={code} value={code}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FormFieldGroup>

          <FormField
            control={form.control}
            name="timeframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Purchase Timeframe
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Q2 2025, Within 3 months, This fiscal year"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Qualification Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Qualification Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="needanalysis"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Need Analysis
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder="Document the customer's needs, pain points, and requirements. What problem are they trying to solve?"
                    minRows={3}
                    maxRows={10}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="decisionmaker"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Decision Maker (Contact ID)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="contact-guid-here"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  ID of the contact who has decision-making authority
                </p>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
