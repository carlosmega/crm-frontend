'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@/core/contracts'
import { CustomerType } from '@/core/contracts/enums'

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
  const isEdit = !!invoice

  const showGeneral = section === 'all' || section === 'general'
  const showBilling = section === 'all' || section === 'billing'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
          ownerid: 'current-user-id', // TODO: Get from auth context
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
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invoice Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Invoice Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Invoice name is required' })}
                  placeholder="e.g., INV-2024-001 - Acme Corp"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="duedate">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duedate"
                  type="date"
                  {...register('duedate', { required: 'Due date is required' })}
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
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Customer <span className="text-destructive">*</span>
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
                    Selected: {selectedCustomer.name} ({selectedCustomer.type})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Related Records (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salesorderid">Sales Order ID</Label>
                <Input
                  id="salesorderid"
                  {...register('salesorderid')}
                  placeholder="Order that generated this invoice"
                />
                <p className="text-xs text-muted-foreground">
                  Link this invoice to a sales order
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opportunityid">Opportunity ID</Label>
                <Input
                  id="opportunityid"
                  {...register('opportunityid')}
                  placeholder="Related opportunity"
                />
                <p className="text-xs text-muted-foreground">
                  Link this invoice to an opportunity
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
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEdit ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Billing address information can be added after creating the invoice.
                </p>
                <div className="p-4 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium mb-2">Next Steps:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Create the invoice with basic information</li>
                    <li>Edit the invoice to add billing details</li>
                    <li>Add line items for products or services</li>
                    <li>Send the invoice to the customer</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billto_name">Bill To Name</Label>
                  <Input
                    id="billto_name"
                    placeholder="Customer billing name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billto_line1">Address Line 1</Label>
                  <Input
                    id="billto_line1"
                    placeholder="Street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billto_line2">Address Line 2</Label>
                  <Input
                    id="billto_line2"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billto_city">City</Label>
                    <Input
                      id="billto_city"
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billto_stateorprovince">State/Province</Label>
                    <Input
                      id="billto_stateorprovince"
                      placeholder="State or Province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billto_postalcode">Postal Code</Label>
                    <Input
                      id="billto_postalcode"
                      placeholder="Postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billto_country">Country</Label>
                    <Input
                      id="billto_country"
                      placeholder="Country"
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
            {isSubmitting && <span className="mr-2">Loading...</span>}
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      )}
    </form>
  )
}
