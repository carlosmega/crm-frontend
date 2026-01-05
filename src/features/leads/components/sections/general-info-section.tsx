"use client"

import { UseFormReturn } from 'react-hook-form'
import { LeadSourceCode, LeadQualityCode } from '@/core/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { FormFieldGroup, IconInput, AutoGrowTextarea } from '@/shared/components/form'
import { Mail, Phone, Smartphone, Globe, Euro, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface GeneralInfoSectionProps {
  form: UseFormReturn<any>
}

/**
 * GeneralInfoSection - Tab "General"
 *
 * IMPORTANT: This component mirrors the read-only view structure.
 * It uses the same Card layout, spacing, and section organization
 * as /leads/[id]/page.tsx to maintain visual coherence.
 *
 * Sections (matching read view):
 * 1. Basic Information Card (name, company, job title, source, quality)
 * 2. Contact Information Card (email, phone, mobile, website)
 * 3. Lead Details Card (estimated value, estimated close date)
 * 4. Address Card
 * 5. Description Card
 */
export function GeneralInfoSection({ form }: GeneralInfoSectionProps) {
  return (
    <div className="space-y-4"> {/* Mismo spacing que read view */}

      {/* Basic Information Card */}
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
                    <Input placeholder="John" className="h-10" {...field} />
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
                    <Input placeholder="Doe" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO" className="h-10" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FormFieldGroup>

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
                <FormLabel className="text-sm font-medium">Lead Quality Rating</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select quality rating" />
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
        </CardContent>
      </Card>

      {/* Grid 2 columnas - Contact Information + Lead Details (igual que read view) */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="emailaddress1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <IconInput
                      type="email"
                      placeholder="john.doe@example.com"
                      icon={Mail}
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
                  <FormLabel className="text-sm font-medium">Phone</FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder="+34 912 345 678"
                      icon={Phone}
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
                  <FormLabel className="text-sm font-medium">Mobile</FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder="+34 678 901 234"
                      icon={Smartphone}
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
                  <FormLabel className="text-sm font-medium">Website</FormLabel>
                  <FormControl>
                    <IconInput
                      type="url"
                      placeholder="https://example.com"
                      icon={Globe}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Lead Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="estimatedvalue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Estimated Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="50000"
                        className="h-10 pl-10"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
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
                  <FormLabel className="text-sm font-medium">Estimated Close Date</FormLabel>
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

      {/* Address Card */}
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
                <FormLabel className="text-sm font-medium">Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="Calle Mayor 123" className="h-10" {...field} />
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
                <FormLabel className="text-sm font-medium">Address Line 2</FormLabel>
                <FormControl>
                  <Input placeholder="Piso 3, Puerta A" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">City</FormLabel>
                  <FormControl>
                    <Input placeholder="Madrid" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Madrid" className="h-10" {...field} />
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
                  <FormLabel className="text-sm font-medium">Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="28013" className="h-10" {...field} />
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
                <FormLabel className="text-sm font-medium">Country</FormLabel>
                <FormControl>
                  <Input placeholder="España" className="h-10" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Description Card */}
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
                <FormLabel className="text-sm font-medium">Description</FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder="Add general notes about this lead, their interests, or any relevant context..."
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
    </div>
  )
}
