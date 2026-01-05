'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import type { Quote, CreateQuoteDto, UpdateQuoteDto } from '../types'
import { CustomerType } from '@/core/contracts/enums'

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
  const isEdit = !!quote

  const showGeneral = section === 'all' || section === 'general'
  const showValidity = section === 'all' || section === 'validity'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
          ownerid: 'current-user-id', // TODO: Get from auth context
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
        </>
      )}

      {/* VALIDITY SECTION - Validity Period */}
      {showValidity && (
      <Card>
        <CardHeader>
          <CardTitle>Validity Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Effective From */}
            <div className="space-y-2">
              <Label htmlFor="effectivefrom">Effective From</Label>
              <Input
                id="effectivefrom"
                type="date"
                {...register('effectivefrom')}
              />
              <p className="text-xs text-muted-foreground">
                Quote becomes valid from this date
              </p>
            </div>

            {/* Effective To */}
            <div className="space-y-2">
              <Label htmlFor="effectiveto">Effective To</Label>
              <Input id="effectiveto" type="date" {...register('effectiveto')} />
              <p className="text-xs text-muted-foreground">
                Quote expires on this date
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
  )
}
