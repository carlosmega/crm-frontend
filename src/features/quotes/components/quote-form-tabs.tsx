"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
import { useTranslation } from '@/shared/hooks/use-translation'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useContact } from '@/features/contacts/hooks/use-contacts'

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
 */
export function QuoteFormTabs({ quote, defaultData, onSubmit, onCancel, isSubmitting, hideActions }: QuoteFormTabsProps) {
  const { data: session } = useSession()
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')
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
    setError,
    clearErrors,
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
          customerid: '', // ✅ Initialize empty for validation
          customeridtype: CustomerType.Account,
          ownerid: session?.user?.id || 'anonymous',
        },
  })

  const customerType = watch('customeridtype')

  // Customer selector state
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | undefined>()

  // ✅ Fetch customer data when editing to populate the selector
  const shouldFetchAccount = quote?.customeridtype === 'account'
  const shouldFetchContact = quote?.customeridtype === 'contact'

  const { account: accountData } = useAccount(shouldFetchAccount ? quote!.customerid : '')
  const { contact: contactData } = useContact(shouldFetchContact ? quote!.customerid : '')

  // ✅ Initialize selected customer when editing (after data is fetched)
  useEffect(() => {
    if (quote?.customerid && quote?.customeridtype) {
      if (quote.customeridtype === 'account' && accountData) {
        setSelectedCustomer({
          id: accountData.accountid,
          type: 'account',
          name: accountData.name,
          email: accountData.emailaddress1,
          phone: accountData.telephone1,
        })
      } else if (quote.customeridtype === 'contact' && contactData) {
        setSelectedCustomer({
          id: contactData.contactid,
          type: 'contact',
          name: contactData.fullname || `${contactData.firstname} ${contactData.lastname}`,
          email: contactData.emailaddress1,
          phone: contactData.telephone1 || contactData.mobilephone,
        })
      }
    }
  }, [quote?.customerid, quote?.customeridtype, accountData, contactData])

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('quote-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const handleFormSubmit = (data: CreateQuoteDto) => {
    // ✅ VALIDATION: Customer is REQUIRED
    if (!data.customerid || data.customerid.trim() === '') {
      setError('customerid', {
        type: 'manual',
        message: t('form.customerRequired'),
      })
      // Scroll to General tab to show error
      setActiveTab('general')
      // Focus customer selector
      setTimeout(() => {
        const customerButton = document.querySelector('[data-customer-selector]') as HTMLElement
        customerButton?.focus()
      }, 100)
      return
    }

    onSubmit(data)
  }

  // Handle customer selection
  const handleCustomerSelect = (customer: SelectedCustomer | undefined) => {
    setSelectedCustomer(customer)
    if (customer) {
      setValue('customerid', customer.id)
      setValue('customeridtype', customer.type === 'account' ? CustomerType.Account : CustomerType.Contact)
      // Clear error when customer is selected
      clearErrors('customerid')
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
          {t('formTabs.general')}
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
          {t('formTabs.validity')}
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
              <CardTitle>{t('form.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quote Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.quoteName')} *</Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: t('form.quoteNameRequired'),
                    minLength: {
                      value: 3,
                      message: t('form.quoteNameMinLength'),
                    },
                  })}
                  placeholder={t('form.quoteNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('form.description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type */}
              <div className="space-y-2">
                <Label>{t('form.customerType')} *</Label>
                <Select
                  value={customerType}
                  onValueChange={(value) =>
                    setValue('customeridtype', value as CustomerType)
                  }
                >
                  <SelectTrigger id="customeridtype">
                    <SelectValue placeholder={t('form.selectCustomerType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CustomerType.Account}>
                      {t('form.accountBusiness')}
                    </SelectItem>
                    <SelectItem value={CustomerType.Contact}>
                      {t('form.contactIndividual')}
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
                <Label htmlFor="opportunityid">{t('form.linkedOpportunity')}</Label>
                <Input
                  id="opportunityid"
                  {...register('opportunityid')}
                  placeholder={t('form.selectOpportunity')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.opportunityPlaceholder')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VALIDITY SECTION - Validity Period */}
        <div className={cn(activeTab !== 'validity' && 'hidden')}>
          <Card>
            <CardHeader>
              <CardTitle>{t('form.validityPeriod')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Select Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('formTabs.quickSelect')}</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { days: 15, label: t('formTabs.days15') },
                    { days: 30, label: t('formTabs.days30') },
                    { days: 60, label: t('formTabs.days60') },
                    { days: 90, label: t('formTabs.days90') },
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
                  {t('formTabs.presetHint')}
                </p>
              </div>

              {/* Manual Date Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('formTabs.orCustomDates')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Effective From */}
                  <div className="space-y-2">
                    <Label htmlFor="effectivefrom" className="text-sm font-normal">
                      {t('form.effectiveFrom')}
                    </Label>
                    <Controller
                      name="effectivefrom"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder={tc('form.pickDate')}
                        />
                      )}
                    />
                  </div>

                  {/* Effective To */}
                  <div className="space-y-2">
                    <Label htmlFor="effectiveto" className="text-sm font-normal">
                      {t('form.effectiveTo')}
                    </Label>
                    <Controller
                      name="effectiveto"
                      control={control}
                      rules={{
                        validate: (value) => {
                          const from = watch('effectivefrom')
                          if (!from || !value) return true
                          return new Date(value) > new Date(from) || t('formTabs.endDateError')
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={(date) => field.onChange(date?.toISOString())}
                          placeholder={tc('form.pickDate')}
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
                    <span className="text-muted-foreground">{t('formTabs.validityDuration')}</span>
                    <span className="font-medium">
                      {(() => {
                        const from = new Date(watch('effectivefrom'))
                        const to = new Date(watch('effectiveto'))
                        const diffTime = to.getTime() - from.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        if (diffDays < 0) return t('formTabs.invalidDates')
                        if (diffDays === 0) return t('formTabs.sameDay')
                        if (diffDays === 1) return t('formTabs.oneDay')
                        return `${diffDays} ${t('formTabs.days')}`
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
              {tc('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? tc('form.updating')
                  : tc('form.creating')
                : isEdit
                ? t('form.updateQuote')
                : t('form.createQuote')}
            </Button>
          </div>
        )}
      </form>
    </Tabs>
  )
}
