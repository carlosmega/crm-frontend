'use client'

import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@/core/contracts'
import { CustomerType } from '@/core/contracts/enums'
import { useTranslation } from '@/shared/hooks/use-translation'

export type InvoiceFormSection = 'general' | 'billing' | 'all'

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: CreateInvoiceDto | UpdateInvoiceDto) => void
  onCancel: () => void
  isSubmitting?: boolean
  hideActions?: boolean
  section?: InvoiceFormSection
}

export function InvoiceForm({
  invoice,
  onSubmit,
  onCancel,
  isSubmitting = false,
  hideActions = false,
  section = 'all',
}: InvoiceFormProps) {
  const { t } = useTranslation('invoices')
  const { t: tc } = useTranslation('common')
  const { data: session } = useSession()
  const isEdit = !!invoice

  const showGeneral = section === 'all' || section === 'general'
  const showBilling = section === 'all' || section === 'billing'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateInvoiceDto>({
    defaultValues: invoice
      ? {
          name: invoice.name,
          customerid: invoice.customerid,
          customeridtype: invoice.customeridtype,
          duedate: invoice.duedate?.split('T')[0], // Format for date input
          salesorderid: invoice.salesorderid,
          opportunityid: invoice.opportunityid,
          ownerid: invoice.ownerid,
        }
      : {
          customeridtype: CustomerType.Account,
          ownerid: session?.user?.id || 'anonymous',
          duedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: 30 days from now
        },
  })

  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | undefined>()

  const handleFormSubmit = (data: CreateInvoiceDto) => {
    onSubmit(data)
  }

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
    <form id="invoice-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* GENERAL SECTION */}
      {showGeneral && (
        <>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invoice Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('form.invoiceName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: t('form.invoiceNameRequired') })}
                  placeholder={t('form.invoiceNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="duedate">
                  {t('form.dueDate')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="duedate"
                  control={control}
                  rules={{ required: t('form.dueDateRequired') }}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      placeholder={t('form.selectDueDate')}
                    />
                  )}
                />
                {errors.duedate && (
                  <p className="text-sm text-destructive">{errors.duedate.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {t('form.customer')} <span className="text-destructive">*</span>
                </Label>
                <CustomerSelectorButton
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  disabled={isEdit}
                />
                {errors.customerid && (
                  <p className="text-sm text-destructive">{errors.customerid.message}</p>
                )}
                {selectedCustomer && (
                  <p className="text-sm text-muted-foreground">
                    {t('form.selectedCustomer', { name: selectedCustomer.name, type: selectedCustomer.type })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.relatedRecords')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salesorderid">{t('form.salesOrderId')}</Label>
                <Input
                  id="salesorderid"
                  {...register('salesorderid')}
                  placeholder={t('form.salesOrderPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.salesOrderHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunityid">{t('form.opportunityId')}</Label>
                <Input
                  id="opportunityid"
                  {...register('opportunityid')}
                  placeholder={t('form.opportunityPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.opportunityHint')}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* BILLING SECTION */}
      {showBilling && (
        <Card>
          <CardHeader>
            <CardTitle>{t('form.billingInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEdit ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('form.billingInfoHint')}
                </p>
                <div className="p-4 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium mb-2">{t('form.nextSteps')}</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>{t('form.nextStepsList.create')}</li>
                    <li>{t('form.nextStepsList.edit')}</li>
                    <li>{t('form.nextStepsList.addLines')}</li>
                    <li>{t('form.nextStepsList.send')}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billto_name">{tc('address.billToName')}</Label>
                  <Input
                    id="billto_name"
                    placeholder={tc('placeholders.customerBillingName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billto_line1">{tc('address.addressLine1')}</Label>
                  <Input
                    id="billto_line1"
                    placeholder={tc('placeholders.streetAddress')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billto_line2">{tc('address.addressLine2')}</Label>
                  <Input
                    id="billto_line2"
                    placeholder={tc('placeholders.aptSuite')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billto_city">{tc('address.city')}</Label>
                    <Input
                      id="billto_city"
                      placeholder={tc('placeholders.city')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billto_stateorprovince">{tc('address.stateProvince')}</Label>
                    <Input
                      id="billto_stateorprovince"
                      placeholder={tc('placeholders.stateOrProvince')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billto_postalcode">{tc('address.postalCode')}</Label>
                    <Input
                      id="billto_postalcode"
                      placeholder={tc('placeholders.postalCode')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billto_country">{tc('address.country')}</Label>
                    <Input
                      id="billto_country"
                      placeholder={tc('placeholders.country')}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!hideActions && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 min-w-[140px]"
          >
            {isSubmitting && <span className="mr-2">{tc('messages.loading')}</span>}
            {invoice ? t('form.updateInvoice') : t('form.createInvoice')}
          </Button>
        </div>
      )}
    </form>
  )
}
