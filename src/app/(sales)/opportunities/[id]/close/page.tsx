"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useOpportunity } from '@/features/opportunities/hooks/use-opportunities'
import { useOpportunityMutations } from '@/features/opportunities/hooks/use-opportunity-mutations'
import { useQuotesByOpportunity } from '@/features/quotes/hooks/use-quotes'
import { OpportunityStateCode, OpportunityStatusCode, QuoteStateCode } from '@/core/contracts'
import type { CloseOpportunityDto } from '@/core/contracts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AutoGrowTextarea, FormFieldGroup } from '@/shared/components/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Loader2, Trophy, XCircle, CalendarIcon, Euro, AlertTriangle } from 'lucide-react'

const closeOpportunitySchema = z.object({
  outcome: z.enum(['won', 'lost']),
  actualvalue: z.number().positive().optional(),
  actualclosedate: z.string().min(1, 'Actual close date is required'),
  closestatus: z.string().min(1, 'Close reason is required'),
  competitorid: z.string().optional(),
})

type CloseOpportunityFormValues = z.infer<typeof closeOpportunitySchema>

export default function CloseOpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { opportunity, loading } = useOpportunity(id)
  const { closeOpportunity, loading: closing } = useOpportunityMutations()
  const { data: quotes } = useQuotesByOpportunity(id)
  const [outcome, setOutcome] = useState<'won' | 'lost'>('won')

  // ⚠️ Check if opportunity has an active quote (permissive warning)
  const hasActiveQuote = useMemo(() => {
    return quotes?.some(quote => quote.statecode === QuoteStateCode.Active)
  }, [quotes])

  const form = useForm<CloseOpportunityFormValues>({
    resolver: zodResolver(closeOpportunitySchema),
    defaultValues: {
      outcome: 'won',
      actualvalue: opportunity?.estimatedvalue,
      actualclosedate: new Date().toISOString().split('T')[0],
      closestatus: '',
      competitorid: '',
    },
  })

  const handleSubmit = async (values: CloseOpportunityFormValues) => {
    try {
      const dto: CloseOpportunityDto = {
        statecode: values.outcome === 'won' ? OpportunityStateCode.Won : OpportunityStateCode.Lost,
        statuscode: values.outcome === 'won' ? OpportunityStatusCode.Won : OpportunityStatusCode.Lost,
        actualvalue: values.outcome === 'won' ? values.actualvalue : undefined,
        actualclosedate: values.actualclosedate,
        closestatus: values.closestatus,
      }

      await closeOpportunity(id, dto)
      router.push(`/opportunities/${id}`)
    } catch (error) {
      console.error('Error closing opportunity:', error)
      alert('Failed to close opportunity. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push(`/opportunities/${id}`)
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading opportunity...</p>
          </div>
        </div>
      </>
    )
  }

  if (!opportunity) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold">Opportunity not found</p>
            <p className="text-sm text-muted-foreground">The opportunity you're looking for doesn't exist.</p>
            <Button asChild className="mt-4">
              <Link href="/opportunities">Back to Opportunities</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/opportunities">Opportunities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/opportunities/${id}`}>
                  {opportunity.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Close</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="px-4 pb-4">
          <Card>
          <CardHeader>
            <CardTitle>Close Opportunity</CardTitle>
            <CardDescription>
              Mark this opportunity as won or lost. Document the outcome and final details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Outcome Selection */}
                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Outcome</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value)
                            setOutcome(value as 'won' | 'lost')
                          }}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="relative">
                            <RadioGroupItem
                              value="won"
                              id="won"
                              className="peer sr-only"
                            />
                            <label
                              htmlFor="won"
                              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 [&:has([data-state=checked])]:border-green-500 cursor-pointer transition-colors"
                            >
                              <Trophy className="size-8 text-green-600" />
                              <div className="text-center">
                                <p className="font-semibold">Won</p>
                                <p className="text-xs text-muted-foreground">Successfully closed deal</p>
                              </div>
                            </label>
                          </div>

                          <div className="relative">
                            <RadioGroupItem
                              value="lost"
                              id="lost"
                              className="peer sr-only"
                            />
                            <label
                              htmlFor="lost"
                              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 [&:has([data-state=checked])]:border-red-500 cursor-pointer transition-colors"
                            >
                              <XCircle className="size-8 text-red-600" />
                              <div className="text-center">
                                <p className="font-semibold">Lost</p>
                                <p className="text-xs text-muted-foreground">Opportunity not closed</p>
                              </div>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Warning: No Active Quote (Permissive) */}
                {outcome === 'won' && !hasActiveQuote && (
                  <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-yellow-700 mb-1">
                          Warning - No Active Quote
                        </p>
                        <p className="text-sm text-yellow-700">
                          This opportunity doesn't have an active quote. Typically, won opportunities should have a quote that can be converted to an order. You can still close this opportunity, but consider creating and activating a quote first.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Fields */}
                {outcome === 'won' && (
                  <FormField
                    control={form.control}
                    name="actualvalue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Actual Value <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Final agreed amount"
                              className="h-10 pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                {outcome === 'lost' && (
                  <FormField
                    control={form.control}
                    name="competitorid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Competitor Who Won
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="competitor-guid or competitor name"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Optional: Document which competitor won the deal
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="actualclosedate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Actual Close Date <span className="text-destructive">*</span>
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
                  name="closestatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {outcome === 'won' ? 'Win Reason' : 'Loss Reason'} <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <AutoGrowTextarea
                          placeholder={
                            outcome === 'won'
                              ? "Document why this opportunity was won. What factors led to success?"
                              : "Document why this opportunity was lost. What can be learned for the future?"
                          }
                          className=""
                          minRows={3}
                          maxRows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={closing}
                    className="h-10 min-w-[140px]"
                    variant={outcome === 'won' ? 'default' : 'destructive'}
                  >
                    {closing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {outcome === 'won' ? (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Mark as Won
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Lost
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  )
}
