"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Lead, CreateLeadDto, UpdateLeadDto } from '@/core/contracts'
import { LeadSourceCode, LeadQualityCode, BudgetStatusCode, BudgetStatusLabels } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import {
  Form,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldGroup, IconInput, AutoGrowTextarea } from '@/shared/components/form'
import { Mail, Phone, Smartphone, Globe, Loader2, Euro, CalendarIcon, Building2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const leadFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  jobtitle: z.string().optional(),
  companyname: z.string().optional(),
  emailaddress1: z.string().email('Invalid email').optional().or(z.literal('')),
  telephone1: z.string().optional(),
  mobilephone: z.string().optional(),
  websiteurl: z.string().url('Invalid URL').optional().or(z.literal('')),
  address1_line1: z.string().optional(),
  address1_line2: z.string().optional(),
  address1_city: z.string().optional(),
  address1_stateorprovince: z.string().optional(),
  address1_postalcode: z.string().optional(),
  address1_country: z.string().optional(),
  leadsourcecode: z.nativeEnum(LeadSourceCode),
  leadqualitycode: z.nativeEnum(LeadQualityCode).optional(),
  description: z.string().optional(),
  estimatedvalue: z.number().positive().optional(),
  estimatedclosedate: z.string().optional(),

  // BPF Qualify Stage fields
  budgetamount: z.number().positive().optional(),
  budgetstatus: z.nativeEnum(BudgetStatusCode).optional(),
  timeframe: z.string().optional(),
  needanalysis: z.string().optional(),
  decisionmaker: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

interface LeadFormProps {
  lead?: Lead
  onSubmit: (data: CreateLeadDto | UpdateLeadDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading, hideActions }: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead
      ? {
          firstname: lead.firstname,
          lastname: lead.lastname,
          jobtitle: lead.jobtitle || '',
          companyname: lead.companyname || '',
          emailaddress1: lead.emailaddress1 || '',
          telephone1: lead.telephone1 || '',
          mobilephone: lead.mobilephone || '',
          websiteurl: lead.websiteurl || '',
          address1_line1: lead.address1_line1 || '',
          address1_line2: lead.address1_line2 || '',
          address1_city: lead.address1_city || '',
          address1_stateorprovince: lead.address1_stateorprovince || '',
          address1_postalcode: lead.address1_postalcode || '',
          address1_country: lead.address1_country || '',
          leadsourcecode: lead.leadsourcecode,
          leadqualitycode: lead.leadqualitycode,
          description: lead.description || '',
          estimatedvalue: lead.estimatedvalue || undefined,
          estimatedclosedate: lead.estimatedclosedate || '',
          budgetamount: lead.budgetamount || undefined,
          budgetstatus: lead.budgetstatus,
          timeframe: lead.timeframe || '',
          needanalysis: lead.needanalysis || '',
          decisionmaker: lead.decisionmaker || '',
        }
      : {
          firstname: '',
          lastname: '',
          jobtitle: '',
          companyname: '',
          emailaddress1: '',
          telephone1: '',
          mobilephone: '',
          websiteurl: '',
          address1_line1: '',
          address1_line2: '',
          address1_city: '',
          address1_stateorprovince: '',
          address1_postalcode: '',
          address1_country: '',
          leadsourcecode: LeadSourceCode.Web,
          description: '',
          budgetamount: undefined,
          timeframe: '',
          needanalysis: '',
          decisionmaker: '',
        },
  })

  const handleSubmit = async (values: LeadFormValues) => {
    const data = {
      ...values,
      ownerid: 'user-001', // Hardcoded for now
    }
    await onSubmit(data as CreateLeadDto | UpdateLeadDto)
  }

  return (
    <Form {...form}>
      <form id="lead-edit-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="companyname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Company
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        placeholder="Acme Inc"
                        icon={Building2}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CEO"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
          </CardContent>
        </Card>

        {/* Contact Details & Key Dates - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailaddress1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="email"
                        placeholder="john.doe@example.com"
                        icon={Mail}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="tel"
                        placeholder="+34 912 345 678"
                        icon={Phone}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobilephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Mobile
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="tel"
                        placeholder="+34 678 901 234"
                        icon={Smartphone}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Website
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="url"
                        placeholder="https://example.com"
                        icon={Globe}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Key Dates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="estimatedvalue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Estimated Value
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="50000"
                          className="h-10 pl-10"
                          {...field}
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
                name="estimatedclosedate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Estimated Close Date
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
            </CardContent>
          </Card>
        </div>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address1_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Address Line 1
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle Mayor 123"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address1_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Address Line 2
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Piso 3, Puerta A"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormFieldGroup columns={3}>
              <FormField
                control={form.control}
                name="address1_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      City
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Madrid"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address1_stateorprovince"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      State/Province
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Madrid"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address1_postalcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Postal Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="28013"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            <FormField
              control={form.control}
              name="address1_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Country
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="España"
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

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="leadsourcecode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Lead Source <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LeadSourceCode.Advertisement.toString()}>Advertisement</SelectItem>
                        <SelectItem value={LeadSourceCode.Employee_Referral.toString()}>Employee Referral</SelectItem>
                        <SelectItem value={LeadSourceCode.External_Referral.toString()}>External Referral</SelectItem>
                        <SelectItem value={LeadSourceCode.Partner.toString()}>Partner</SelectItem>
                        <SelectItem value={LeadSourceCode.Public_Relations.toString()}>Public Relations</SelectItem>
                        <SelectItem value={LeadSourceCode.Seminar.toString()}>Seminar</SelectItem>
                        <SelectItem value={LeadSourceCode.Trade_Show.toString()}>Trade Show</SelectItem>
                        <SelectItem value={LeadSourceCode.Web.toString()}>Web</SelectItem>
                        <SelectItem value={LeadSourceCode.Word_of_Mouth.toString()}>Word of Mouth</SelectItem>
                        <SelectItem value={LeadSourceCode.Other.toString()}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadqualitycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Lead Quality
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LeadQualityCode.Hot.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Hot
                          </span>
                        </SelectItem>
                        <SelectItem value={LeadQualityCode.Warm.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            Warm
                          </span>
                        </SelectItem>
                        <SelectItem value={LeadQualityCode.Cold.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Cold
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AutoGrowTextarea
                      placeholder="Add notes about this lead, their interests, pain points, or any relevant context..."
                      className=""
                      minRows={3}
                      maxRows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {!hideActions && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
