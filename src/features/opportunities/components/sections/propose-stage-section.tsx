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
import { Checkbox } from '@/components/ui/checkbox'
import { FormFieldGroup } from '@/shared/components/form'
import { BPFFieldBadge } from '@/shared/components/bpf-field-badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'

/**
 * ProposeStageSection - Tab "Propose"
 *
 * IMPORTANT: This component uses Card layout to organize fields
 * into logical sections for better visual hierarchy and scannability.
 *
 * Contains all proposal-related fields:
 * - Presentation & Decision Dates
 * - Stakeholder Identification
 * - Follow-up Actions
 */
export function ProposeStageSection() {
  const form = useFormContext()

  return (
    <div className="space-y-4">

      {/* Presentation Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Presentation Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Present your finalized proposal, pricing, and terms to the customer. Enter into negotiations.
          </div>

          <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="presentationdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    Presentation Date
                    <BPFFieldBadge stageName="Propose" />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finaldecisiondate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    Final Decision Date
                    <BPFFieldBadge stageName="Propose" />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FormFieldGroup>
        </CardContent>
      </Card>

      {/* Stakeholder & Follow-up Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Stakeholder & Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FormField
            control={form.control}
            name="identifycustomercontacts"
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
                    Customer Contacts Identified
                    <BPFFieldBadge stageName="Propose" />
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    All key customer contacts have been identified
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identifypursuitteam"
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
                    Pursuit Team Assigned
                    <BPFFieldBadge stageName="Propose" />
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Internal team has been assigned to pursue this opportunity
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sendthankyounote"
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
                    Thank You Note Sent
                    <BPFFieldBadge stageName="Propose" />
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Follow-up thank you note sent after presentation
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
