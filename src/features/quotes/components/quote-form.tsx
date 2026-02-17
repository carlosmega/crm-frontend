'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '../types'
import { CustomerType } from '@/core/contracts/enums'
import { useTranslation } from '@/shared/hooks/use-translation'

export type QuoteFormSection = 'general' | 'validity' | 'all'

interface QuoteFormProps {
  quote?: Quote
  onSubmit: (data: CreateQuoteDto | UpdateQuoteDto) => void
  onCancel: () => void
  isSubmitting?: boolean
  hideActions?: boolean
  section?: QuoteFormSection // Which section to show (default: 'all')
}

/**
 * Quote Form Component
 *
 * Formulario para crear o editar quotes
 */
export function QuoteForm({
  quote,
  onSubmit,
  onCancel,
  isSubmitting = false,
  hideActions = false,
  section = 'all',
}: QuoteFormProps) {
  const { data: session } = useSession()
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')
  const isEdit = !!quote

  const showGeneral = section === 'all' || section === 'general'
  const showValidity = section === 'all' || section === 'validity'

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
          customeridtype: CustomerType.Account,
          ownerid: session?.user?.id || 'anonymous',
        },
  })

  const customerType = watch('customeridtype')

  // Customer selector state
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | undefined>()

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

  return (
    <form id="quote-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* GENERAL SECTION - Basic Information + Customer Information */}
      {showGeneral && (
        <>
      {/* Basic Information */}
      <Card>
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
        </>
      )}

      {/* VALIDITY SECTION - Validity Period */}
      {showValidity && (
      <Card>
        <CardHeader>
          <CardTitle>{t('form.validityPeriod')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Effective From */}
            <div className="space-y-2">
              <Label htmlFor="effectivefrom">{t('form.effectiveFrom')}</Label>
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
              <p className="text-xs text-muted-foreground">
                {t('form.effectiveFromHint')}
              </p>
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label htmlFor="effectiveto">{t('form.effectiveTo')}</Label>
              <Controller
                name="effectiveto"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    placeholder={tc('form.pickDate')}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.effectiveToHint')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

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
  )
}
