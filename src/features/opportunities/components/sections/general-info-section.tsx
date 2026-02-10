"use client"

import { useState, useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldGroup, AutoGrowTextarea } from '@/shared/components/form'
import { CustomerType, SalesStageCode } from '@/core/contracts'
import { Euro, CalendarIcon, User, Building2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import { HelpTooltip } from '@/shared/components/help-tooltip'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { useContacts } from '@/features/contacts/hooks/use-contacts'

interface GeneralInfoSectionProps {
  isEditMode?: boolean
}

/**
 * GeneralInfoSection - Tab "General"
 *
 * IMPORTANT: This component uses Card layout to organize fields
 * into logical sections for better visual hierarchy and scannability.
 *
 * Sections:
 * 1. Basic Information Card (name, customer)
 * 2. Sales Details Card (sales stage, estimated value, close date)
 * 3. Description Card
 */
export function GeneralInfoSection({ isEditMode = false }: GeneralInfoSectionProps) {
  const { t } = useTranslation('opportunities')
  const form = useFormContext()
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | undefined>()

  // Fetch accounts and contacts for customer lookup in edit mode
  const { accounts } = useAccounts()
  const { contacts } = useContacts()

  // Memoized Maps for O(1) lookups
  const accountsMap = useMemo(
    () => new Map(accounts?.map(a => [a.accountid, a]) ?? []),
    [accounts]
  )
  const contactsMap = useMemo(
    () => new Map(contacts?.map(c => [c.contactid, c]) ?? []),
    [contacts]
  )

  // Initialize selectedCustomer from form values (for edit mode)
  useEffect(() => {
    if (isEditMode) {
      const customerid = form.getValues('customerid')
      const customeridtype = form.getValues('customeridtype')

      if (customerid && customeridtype !== undefined) {
        if (customeridtype === CustomerType.Account) {
          const account = accountsMap.get(customerid)
          if (account) {
            setSelectedCustomer({
              id: account.accountid,
              type: 'account',
              name: account.name,
              email: account.emailaddress1,
              phone: account.telephone1,
              city: account.address1_city,
            })
          }
        } else if (customeridtype === CustomerType.Contact) {
          const contact = contactsMap.get(customerid)
          if (contact) {
            setSelectedCustomer({
              id: contact.contactid,
              type: 'contact',
              name: `${contact.firstname} ${contact.lastname}`,
              email: contact.emailaddress1,
              phone: contact.telephone1,
              city: contact.address1_city,
            })
          }
        }
      }
    }
  }, [isEditMode, form, accountsMap, contactsMap])

  return (
    <div className="space-y-4">

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('form.sections.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('form.fields.opportunityName')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.placeholders.opportunityName')}
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="customeridtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('form.fields.customerType')} {!isEditMode && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t('form.placeholders.selectCustomerType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CustomerType.Account}>
                        <span className="flex items-center gap-2">
                          <Building2 className="size-4" />
                          {t('form.customerTypes.accountB2B')}
                        </span>
                      </SelectItem>
                      <SelectItem value={CustomerType.Contact}>
                        <span className="flex items-center gap-2">
                          <User className="size-4" />
                          {t('form.customerTypes.contactB2C')}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">
                      {t('form.hints.customerCannotChange')}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('form.fields.customer')} {!isEditMode && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <CustomerSelectorButton
                      value={selectedCustomer}
                      onChange={(customer) => {
                        setSelectedCustomer(customer)
                        if (customer) {
                          field.onChange(customer.id)
                          form.setValue('customeridtype', customer.type === 'account' ? CustomerType.Account : CustomerType.Contact)
                        } else {
                          field.onChange('')
                        }
                      }}
                      customerType={form.watch('customeridtype') === CustomerType.Account ? 'account' : 'contact'}
                      placeholder={
                        form.watch('customeridtype') === CustomerType.Account
                          ? t('form.placeholders.selectAccount')
                          : t('form.placeholders.selectContact')
                      }
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">
                      {t('form.hints.customerCannotChange')}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </FormFieldGroup>
        </CardContent>
      </Card>

      {/* Sales Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('form.sections.salesDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="salesstage"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-sm font-medium">
                      {t('form.fields.salesStage')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <HelpTooltip
                      title={t('form.hints.salesStageTooltipTitle')}
                      content={t('form.hints.salesStageTooltipContent')}
                      guideLink="/USER_GUIDE.md#opportunity-sales-stages"
                    />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={t('form.placeholders.selectSalesStage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SalesStageCode.Qualify.toString()}>{t('salesStages.qualify')}</SelectItem>
                      <SelectItem value={SalesStageCode.Develop.toString()}>{t('salesStages.develop')}</SelectItem>
                      <SelectItem value={SalesStageCode.Propose.toString()}>{t('salesStages.propose')}</SelectItem>
                      <SelectItem value={SalesStageCode.Close.toString()}>{t('salesStages.close')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedvalue"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-sm font-medium">
                      {t('form.fields.estimatedValue')} <span className="text-destructive">*</span>
                    </FormLabel>
                    <HelpTooltip
                      title={t('form.hints.dealValueTooltipTitle')}
                      content={t('form.hints.dealValueTooltipContent')}
                      guideLink="/USER_GUIDE.md#working-with-opportunities"
                    />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={t('form.placeholders.estimatedValue')}
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
          </FormFieldGroup>

          <FormField
            control={form.control}
            name="estimatedclosedate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('form.fields.estimatedCloseDate')} <span className="text-destructive">*</span>
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
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('form.sections.description')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t('form.fields.description')}
                </FormLabel>
                <FormControl>
                  <AutoGrowTextarea
                    placeholder={t('form.placeholders.description')}
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
