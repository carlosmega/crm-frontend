"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Account, CreateAccountDto, UpdateAccountDto } from '@/core/contracts'
import { IndustryCode, AccountCategoryCode } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { FormFieldGroup, IconInput, AutoGrowTextarea, AddressFormFields } from '@/shared/components/form'
import { CustomerSelectorButton } from '@/shared/components/selectors'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { Mail, Phone, Globe, Loader2, Euro, Building2 } from 'lucide-react'

// Export schema for use in AccountFormTabs
export const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountnumber: z.string().optional(), // Autogenerado por el backend
  description: z.string().optional(),
  emailaddress1: z.string().email('Invalid email').optional().or(z.literal('')),
  telephone1: z.string().optional(),
  telephone2: z.string().optional(),
  fax: z.string().optional(),
  websiteurl: z.string().url('Invalid URL').optional().or(z.literal('')),
  address1_line1: z.string().optional(),
  address1_line2: z.string().optional(),
  address1_city: z.string().optional(),
  address1_stateorprovince: z.string().optional(),
  address1_postalcode: z.string().optional(),
  address1_country: z.string().optional(),
  industrycode: z.nativeEnum(IndustryCode).optional(),
  accountcategorycode: z.nativeEnum(AccountCategoryCode).optional(),
  revenue: z.number().positive().optional(),
  numberofemployees: z.number().int().positive().optional(),
  parentaccountid: z.string().optional(),
  primarycontactid: z.string().optional(),
  creditonhold: z.boolean().optional(),
  creditlimit: z.number().positive().optional(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>

export type AccountFormSection = 'general' | 'details' | 'address' | 'all'

// Helper to get default values
export function getAccountFormDefaultValues(account?: Account): AccountFormValues {
  return account
    ? {
        name: account.name,
        accountnumber: account.accountnumber || '',
        description: account.description || '',
        emailaddress1: account.emailaddress1 || '',
        telephone1: account.telephone1 || '',
        telephone2: account.telephone2 || '',
        fax: account.fax || '',
        websiteurl: account.websiteurl || '',
        address1_line1: account.address1_line1 || '',
        address1_line2: account.address1_line2 || '',
        address1_city: account.address1_city || '',
        address1_stateorprovince: account.address1_stateorprovince || '',
        address1_postalcode: account.address1_postalcode || '',
        address1_country: account.address1_country || '',
        industrycode: account.industrycode,
        accountcategorycode: account.accountcategorycode,
        revenue: account.revenue,
        numberofemployees: account.numberofemployees,
        parentaccountid: account.parentaccountid || '',
        primarycontactid: account.primarycontactid || '',
        creditonhold: account.creditonhold ?? false,
        creditlimit: account.creditlimit,
      }
    : {
        name: '',
        accountnumber: '',
        description: '',
        emailaddress1: '',
        telephone1: '',
        telephone2: '',
        fax: '',
        websiteurl: '',
        address1_line1: '',
        address1_line2: '',
        address1_city: '',
        address1_stateorprovince: '',
        address1_postalcode: '',
        address1_country: '',
        revenue: undefined,
        numberofemployees: undefined,
        parentaccountid: '',
        primarycontactid: '',
        creditonhold: false,
        creditlimit: undefined,
      }
}

interface AccountFormProps {
  account?: Account
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
  section?: AccountFormSection // Which section to show (default: 'all')
  sharedForm?: UseFormReturn<AccountFormValues> // Optional shared form instance
}

export function AccountForm({ account, onSubmit, onCancel, isLoading, hideActions, section = 'all', sharedForm }: AccountFormProps) {
  const { data: session } = useSession()
  const [selectedContact, setSelectedContact] = useState<SelectedCustomer | undefined>()

  // Fetch contacts for contact lookup
  const { contacts } = useContacts()

  // Use shared form if provided, otherwise create a new one
  const localForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: getAccountFormDefaultValues(account),
  })

  const form = sharedForm || localForm

  // Initialize selectedContact from form values (for edit mode)
  useEffect(() => {
    const contactid = form.getValues('primarycontactid')
    if (contactid && contacts) {
      const contact = contacts.find(c => c.contactid === contactid)
      if (contact) {
        setSelectedContact({
          id: contact.contactid,
          type: 'contact',
          name: `${contact.firstname} ${contact.lastname}`,
          email: contact.emailaddress1,
          phone: contact.telephone1,
          city: contact.address1_city,
        })
      }
    }
  }, [form, contacts])

  // Section visibility control
  const showGeneral = section === 'all' || section === 'general'
  const showDetails = section === 'all' || section === 'details'
  const showAddress = section === 'all' || section === 'address'

  const handleSubmit = async (values: AccountFormValues) => {
    const data = {
      ...values,
      ownerid: session?.user?.id || 'anonymous',
    }
    await onSubmit(data as CreateAccountDto | UpdateAccountDto)
  }

  return (
    <Form {...form}>
      <form id="account-edit-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* GENERAL SECTION - Basic & Contact Information */}
        {showGeneral && (
          <>
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Account Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      placeholder="Acme Corporation"
                      icon={Building2}
                      className=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Account Number - Solo mostrar en modo edición como read-only */}
            {account && account.accountnumber && (
              <FormField
                control={form.control}
                name="accountnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Account Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 bg-muted"
                        {...field}
                        disabled
                        readOnly
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated system identifier
                    </p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

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
                    <FormLabel className="text-sm font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="email"
                        placeholder="info@acmecorp.com"
                        icon={Mail}
                        className=""
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
              name="telephone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Main Phone
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
              name="telephone2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Other Phone
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder="+34 912 345 679"
                      icon={Phone}
                      className=""
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
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Fax
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+34 912 345 680"
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
              name="websiteurl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Website
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="url"
                      placeholder="https://www.acmecorp.com"
                      icon={Globe}
                      className=""
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
                  <FormControl>
                    <AutoGrowTextarea
                      placeholder="Additional notes or description about this account..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
          </>
        )}

        {/* DETAILS SECTION - Business Information & Relationships */}
        {showDetails && (
          <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="industrycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Industry
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={IndustryCode.Accounting.toString()}>Accounting</SelectItem>
                        <SelectItem value={IndustryCode.Agriculture_and_Non_petrol_Natural_Resource_Extraction.toString()}>Agriculture</SelectItem>
                        <SelectItem value={IndustryCode.Broadcasting_Printing_and_Publishing.toString()}>Broadcasting & Publishing</SelectItem>
                        <SelectItem value={IndustryCode.Brokers.toString()}>Brokers</SelectItem>
                        <SelectItem value={IndustryCode.Building_Supply_Retail.toString()}>Building Supply Retail</SelectItem>
                        <SelectItem value={IndustryCode.Business_Services.toString()}>Business Services</SelectItem>
                        <SelectItem value={IndustryCode.Consulting.toString()}>Consulting</SelectItem>
                        <SelectItem value={IndustryCode.Consumer_Services.toString()}>Consumer Services</SelectItem>
                        <SelectItem value={IndustryCode.Design_Direction_and_Creative_Management.toString()}>Design & Creative</SelectItem>
                        <SelectItem value={IndustryCode.Distributors_Dispatchers_and_Processors.toString()}>Distribution</SelectItem>
                        <SelectItem value={IndustryCode.Doctors_Offices_and_Clinics.toString()}>Healthcare</SelectItem>
                        <SelectItem value={IndustryCode.Durable_Manufacturing.toString()}>Durable Manufacturing</SelectItem>
                        <SelectItem value={IndustryCode.Eating_and_Drinking_Places.toString()}>Food & Beverage</SelectItem>
                        <SelectItem value={IndustryCode.Entertainment_Retail.toString()}>Entertainment Retail</SelectItem>
                        <SelectItem value={IndustryCode.Equipment_Rental_and_Leasing.toString()}>Equipment Rental</SelectItem>
                        <SelectItem value={IndustryCode.Financial.toString()}>Financial Services</SelectItem>
                        <SelectItem value={IndustryCode.Food_and_Tobacco_Processing.toString()}>Food Processing</SelectItem>
                        <SelectItem value={IndustryCode.Insurance.toString()}>Insurance</SelectItem>
                        <SelectItem value={IndustryCode.Legal_Services.toString()}>Legal Services</SelectItem>
                        <SelectItem value={IndustryCode.Non_Durable_Merchandise_Retail.toString()}>Retail</SelectItem>
                        <SelectItem value={IndustryCode.Petrochemical_Extraction_and_Distribution.toString()}>Petrochemical</SelectItem>
                        <SelectItem value={IndustryCode.Service_Retail.toString()}>Service Retail</SelectItem>
                        <SelectItem value={IndustryCode.Social_Services.toString()}>Social Services</SelectItem>
                        <SelectItem value={IndustryCode.Specialty_Realty.toString()}>Real Estate</SelectItem>
                        <SelectItem value={IndustryCode.Transportation.toString()}>Transportation</SelectItem>
                        <SelectItem value={IndustryCode.Utility_Creation_and_Distribution.toString()}>Utilities</SelectItem>
                        <SelectItem value={IndustryCode.Vehicle_Retail.toString()}>Vehicle Retail</SelectItem>
                        <SelectItem value={IndustryCode.Wholesale.toString()}>Wholesale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountcategorycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Category
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AccountCategoryCode.Preferred_Customer.toString()}>Preferred Customer</SelectItem>
                        <SelectItem value={AccountCategoryCode.Standard.toString()}>Standard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Annual Revenue
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="5000000"
                          className="h-10 pl-10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberofemployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Number of Employees
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="250"
                        className="h-10"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            {/* Parent Account ID - Solo en modo edición */}
            {account && (
              <FormFieldGroup columns={2}>
                <FormField
                  control={form.control}
                  name="parentaccountid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Parent Account ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="account-guid-here"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        For corporate hierarchies - ID of the parent account
                      </p>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarycontactid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Primary Contact
                      </FormLabel>
                      <FormControl>
                        <CustomerSelectorButton
                          value={selectedContact}
                          onChange={(customer) => {
                            setSelectedContact(customer)
                            if (customer) {
                              field.onChange(customer.id)
                            } else {
                              field.onChange('')
                            }
                          }}
                          customerType="contact"
                          placeholder="Select primary contact..."
                          accountId={account?.accountid}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Main decision maker or point of contact at this account
                      </p>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </FormFieldGroup>
            )}
          </CardContent>
        </Card>
        )}

        {/* ADDRESS SECTION - Address Information */}
        {showAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Address Information</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ingresa el código postal para autocompletar la dirección (México)
              </p>
            </CardHeader>
            <CardContent>
              <AddressFormFields
                form={form}
                fieldNames={{
                  line1: 'address1_line1',
                  line2: 'address1_line2',
                  city: 'address1_city',
                  stateOrProvince: 'address1_stateorprovince',
                  postalCode: 'address1_postalcode',
                  country: 'address1_country',
                }}
                enablePostalCodeLookup
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {!hideActions && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[120px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
