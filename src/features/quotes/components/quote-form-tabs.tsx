"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { CustomerType } from '@/core/contracts/enums'
import { cn } from '@/lib/utils'
import { FileText, Calendar } from 'lucide-react'

export type QuoteFormTabId = 'general' | 'validity'

interface QuoteFormDefaultData {
  name?: string
  description?: string
  effectivefrom?: string
  effectiveto?: string
}

interface QuoteFormTabsProps {
  quote?: Quote
  defaultData?: QuoteFormDefaultData
  onSubmit: (data: CreateQuoteDto | UpdateQuoteDto) => void
  onCancel: () => void
  isSubmitting?: boolean
  hideActions?: boolean
}

/**
 * QuoteFormTabs
 *
 * Form with tabbed interface for quote editing.
 * Uses a SINGLE form instance to preserve state across tab changes.
 *
 * Tabs:
 * - General: Basic information (name, description) + Customer information
 * - Validity: Validity period (effective from/to dates)
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Single form preserves data when switching tabs
 * - Each tab shows only relevant fields (via CSS visibility)
 */
export function QuoteFormTabs({ quote, defaultData, onSubmit, onCancel, isSubmitting, hideActions }: QuoteFormTabsProps) {
  const [activeTab, setActiveTab] = useState<QuoteFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)
  const isEdit = !!quote

  // Single form instance for all tabs
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateQuoteDto>({
    defaultValues: quote
      ? {
          name: quote.name,
          description: quote.description,
          customerid: quote.customerid,
          customeridtype: quote.customeridtype,
          opportunityid: quote.opportunityid,
          effectivefrom: quote.effectivefrom,
          effectiveto: quote.effectiveto,
          ownerid: quote.ownerid,
        }
      : {
          name: defaultData?.name || '',
          description: defaultData?.description || '',
          effectivefrom: defaultData?.effectivefrom,
          effectiveto: defaultData?.effectiveto,
          customeridtype: CustomerType.Account,
          ownerid: 'current-user-id',
        },
  })

  const customerType = watch('customeridtype')

  // Customer selector state
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | undefined>()

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('quote-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const handleFormSubmit = (data: CreateQuoteDto) => {
    onSubmit(data)
  }

  // Handle customer selection
  const handleCustomerSelect = (customer: SelectedCustomer | undefined) => {
    setSelectedCustomer(customer)
    if (customer) {
      setValue('customerid', customer.id)
      setValue('customeridtype', customer.type === 'account' ? CustomerType.Account : CustomerType.Contact)
    } else {
      setValue('customerid', '')
    }
  }

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          onClick={() => setActiveTab('general')}
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
          data-state={activeTab === 'general' ? 'active' : 'inactive'}
        >
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="validity"
          onClick={() => setActiveTab('validity')}
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
          data-state={activeTab === 'validity' ? 'active' : 'inactive'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Validity
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Single form with all sections - visibility controlled by activeTab */}
      <form id="quote-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* GENERAL SECTION - Basic Information + Customer Information */}
        <div className={cn(activeTab !== 'general' && 'hidden')}>
          {/* Basic Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quote Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Quote Name *</Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Quote name is required',
                    minLength: {
                      value: 3,
                      message: 'Quote name must be at least 3 characters',
                    },
                  })}
                  placeholder="e.g., CRM Enterprise Implementation - Acme Corp"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of what this quote covers..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type */}
              <div className="space-y-2">
                <Label>Customer Type *</Label>
                <Select
                  value={customerType}
                  onValueChange={(value) =>
                    setValue('customeridtype', value as CustomerType)
                  }
                >
                  <SelectTrigger id="customeridtype">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CustomerType.Account}>
                      Account (Business)
                    </SelectItem>
                    <SelectItem value={CustomerType.Contact}>
                      Contact (Individual)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Selector */}
              <div className="space-y-2">
                <Label>
                  {customerType === CustomerType.Account
                    ? 'Account *'
                    : 'Contact *'}
                </Label>
                <CustomerSelectorButton
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  customerType={customerType === CustomerType.Account ? 'account' : 'contact'}
                  placeholder={
                    customerType === CustomerType.Account
                      ? 'Select account...'
                      : 'Select contact...'
                  }
                />
                {errors.customerid && (
                  <p className="text-sm text-destructive">
                    {errors.customerid.message}
                  </p>
                )}
              </div>

              {/* Opportunity ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="opportunityid">Linked Opportunity (Optional)</Label>
                <Input
                  id="opportunityid"
                  {...register('opportunityid')}
                  placeholder="Select opportunity if this quote is linked to one"
                />
                <p className="text-xs text-muted-foreground">
                  TODO: Replace with opportunity selector
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VALIDITY SECTION - Validity Period */}
        <div className={cn(activeTab !== 'validity' && 'hidden')}>
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Select Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Select</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { days: 15, label: '15 Days' },
                    { days: 30, label: '30 Days' },
                    { days: 60, label: '60 Days' },
                    { days: 90, label: '90 Days' },
                  ].map((preset) => (
                    <Button
                      key={preset.days}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date()
                        const endDate = new Date(today)
                        endDate.setDate(endDate.getDate() + preset.days)

                        setValue('effectivefrom', today.toISOString())
                        setValue('effectiveto', endDate.toISOString())
                      }}
                      className={cn(
                        "transition-all",
                        // Check if current dates match this preset (within 1 day tolerance)
                        (() => {
                          const from = watch('effectivefrom')
                          const to = watch('effectiveto')
                          if (!from || !to) return false

                          const fromDate = new Date(from)
                          const toDate = new Date(to)
                          const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
                          const isToday = Math.abs(new Date().getTime() - fromDate.getTime()) < 24 * 60 * 60 * 1000

                          return isToday && diffDays === preset.days
                        })() && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a preset to set validity period starting today
                </p>
              </div>

              {/* Manual Date Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Or set custom dates</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Effective From */}
                  <div className="space-y-2">
                    <Label htmlFor="effectivefrom" className="text-sm font-normal">
                      Effective From
                    </Label>
                    <Controller
                      name="effectivefrom"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder="Select start date"
                        />
                      )}
                    />
                  </div>

                  {/* Effective To */}
                  <div className="space-y-2">
                    <Label htmlFor="effectiveto" className="text-sm font-normal">
                      Effective To
                    </Label>
                    <Controller
                      name="effectiveto"
                      control={control}
                      rules={{
                        validate: (value) => {
                          const from = watch('effectivefrom')
                          if (!from || !value) return true
                          return new Date(value) > new Date(from) || 'End date must be after start date'
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder="Select end date"
                        />
                      )}
                    />
                    {errors.effectiveto && (
                      <p className="text-sm text-destructive">{errors.effectiveto.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Display */}
              {watch('effectivefrom') && watch('effectiveto') && (
                <div className="rounded-lg bg-muted/50 p-4 border border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validity Duration:</span>
                    <span className="font-medium">
                      {(() => {
                        const from = new Date(watch('effectivefrom'))
                        const to = new Date(watch('effectiveto'))
                        const diffTime = to.getTime() - from.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        if (diffDays < 0) return 'Invalid dates'
                        if (diffDays === 0) return 'Same day'
                        if (diffDays === 1) return '1 day'
                        return `${diffDays} days`
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        {!hideActions && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                ? 'Update Quote'
                : 'Create Quote'}
            </Button>
          </div>
        )}
      </form>
    </Tabs>
  )
}
