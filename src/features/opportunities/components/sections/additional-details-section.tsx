"use client"

import { useFormContext } from 'react-hook-form'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormFieldGroup, AutoGrowTextarea } from '@/shared/components/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon, Euro } from 'lucide-react'

interface AdditionalDetailsSectionProps {
  isEditMode?: boolean
}

/**
 * AdditionalDetailsSection - Tab "Additional Details"
 *
 * IMPORTANT: This component uses Card layout to organize fields
 * into logical sections for better visual hierarchy and scannability.
 *
 * Contains optional closure-related fields:
 * - Actual Value & Close Date
 * - Win/Loss Documentation
 * - Competitor Information
 */
export function AdditionalDetailsSection({ isEditMode = false }: AdditionalDetailsSectionProps) {
  const { t } = useTranslation('opportunities')
  const form = useFormContext()

  return (
    <div className="space-y-4">

      {/* Deal Closure Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('form.sections.dealClosure')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {t('form.hints.dealClosureDesc')}
          </div>

          <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="actualvalue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('form.fields.actualValue')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={t('form.placeholders.actualValue')}
                        className="h-10 pl-10"
                        {...field}
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
              name="actualclosedate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('form.fields.actualCloseDate')}
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
                          {field.value ? format(new Date(field.value), "PPP") : t('form.placeholders.pickDate')}
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

      {/* Win/Loss Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('form.sections.winLossAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="closestatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('form.fields.winLossReason')}
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder={t('form.placeholders.winLossReason')}
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
            name="competitorid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('form.fields.competitorWon')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.placeholders.competitorName')}
                    className="h-10"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {t('form.hints.competitorHint')}
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
