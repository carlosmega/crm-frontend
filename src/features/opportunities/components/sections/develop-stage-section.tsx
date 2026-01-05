"use client"

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AutoGrowTextarea } from '@/shared/components/form'
import { BPFFieldBadge } from '@/shared/components/bpf-field-badge'

/**
 * DevelopStageSection - Tab "Develop"
 *
 * IMPORTANT: This component uses Card layout to organize fields
 * into logical sections for better visual hierarchy and scannability.
 *
 * Contains all development-related fields:
 * - Proposed Solution & Timeline
 * - Customer Analysis (needs, current situation)
 * - Competitive Analysis
 */
export function DevelopStageSection() {
  const form = useFormContext()

  return (
    <div className="space-y-4">

      {/* Solution & Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Proposed Solution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Research the opportunity and develop a solution. Identify key stakeholders and competitors.
          </div>

          <FormField
            control={form.control}
            name="proposedsolution"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Proposed Solution
                  <BPFFieldBadge stageName="Develop" />
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder="Describe the solution you're proposing to the customer..."
                    minRows={4}
                    maxRows={12}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Implementation Timeline
                  <BPFFieldBadge stageName="Develop" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 3 months, Q3 2025, 12-week rollout"
                    className="h-10"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Customer Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Customer Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="customerneeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Customer Needs Analysis
                  <BPFFieldBadge stageName="Develop" />
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder="Document detailed customer needs and requirements..."
                    minRows={3}
                    maxRows={8}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentsituation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-2">
                  Current Situation Documentation
                  <BPFFieldBadge stageName="Develop" />
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder="Describe the customer's current situation and pain points..."
                    minRows={3}
                    maxRows={8}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Competitive Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Competitive Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="identifycompetitors"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    Identify Competitors
                    <BPFFieldBadge stageName="Develop" />
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Research and document competing solutions
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
