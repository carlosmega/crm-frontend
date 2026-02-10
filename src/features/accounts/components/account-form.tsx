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
import { useTranslation } from '@/shared/hooks/use-translation'
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
  const { t } = useTranslation('accounts')
  const { t: tc } = useTranslation('common')
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
            <CardTitle className="text-base font-semibold">{t('form.sections.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('form.fields.accountName')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      placeholder={t('form.placeholders.accountName')}
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
                      {t('form.fields.accountNumber')}
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
                      {t('form.hints.autoGenerated')}
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
            <CardTitle className="text-base font-semibold">{t('form.sections.contactInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailaddress1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('form.fields.email')}
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="email"
                        placeholder={t('form.placeholders.email')}
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
                    {t('form.fields.mainPhone')}
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder={t('form.placeholders.mainPhone')}
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
                    {t('form.fields.otherPhone')}
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder={t('form.placeholders.otherPhone')}
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
                    {t('form.fields.fax')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('form.placeholders.fax')}
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
                    {t('form.fields.website')}
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="url"
                      placeholder={t('form.placeholders.website')}
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
            <CardTitle className="text-base font-semibold">{t('form.sections.description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AutoGrowTextarea
                      placeholder={t('form.placeholders.description')}
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
            <CardTitle className="text-base font-semibold">{t('form.sections.businessInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="industrycode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('form.fields.industry')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('form.placeholders.selectIndustry')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={IndustryCode.Accounting.toString()}>{t('form.industry.accounting')}</SelectItem>
                        <SelectItem value={IndustryCode.Agriculture_and_Non_petrol_Natural_Resource_Extraction.toString()}>{t('form.industry.agriculture')}</SelectItem>
                        <SelectItem value={IndustryCode.Broadcasting_Printing_and_Publishing.toString()}>{t('form.industry.broadcastingPublishing')}</SelectItem>
                        <SelectItem value={IndustryCode.Brokers.toString()}>{t('form.industry.brokers')}</SelectItem>
                        <SelectItem value={IndustryCode.Building_Supply_Retail.toString()}>{t('form.industry.buildingSupply')}</SelectItem>
                        <SelectItem value={IndustryCode.Business_Services.toString()}>{t('form.industry.businessServices')}</SelectItem>
                        <SelectItem value={IndustryCode.Consulting.toString()}>{t('form.industry.consulting')}</SelectItem>
                        <SelectItem value={IndustryCode.Consumer_Services.toString()}>{t('form.industry.consumerServices')}</SelectItem>
                        <SelectItem value={IndustryCode.Design_Direction_and_Creative_Management.toString()}>{t('form.industry.designCreative')}</SelectItem>
                        <SelectItem value={IndustryCode.Distributors_Dispatchers_and_Processors.toString()}>{t('form.industry.distribution')}</SelectItem>
                        <SelectItem value={IndustryCode.Doctors_Offices_and_Clinics.toString()}>{t('form.industry.healthcare')}</SelectItem>
                        <SelectItem value={IndustryCode.Durable_Manufacturing.toString()}>{t('form.industry.durableManufacturing')}</SelectItem>
                        <SelectItem value={IndustryCode.Eating_and_Drinking_Places.toString()}>{t('form.industry.foodBeverage')}</SelectItem>
                        <SelectItem value={IndustryCode.Entertainment_Retail.toString()}>{t('form.industry.entertainmentRetail')}</SelectItem>
                        <SelectItem value={IndustryCode.Equipment_Rental_and_Leasing.toString()}>{t('form.industry.equipmentRental')}</SelectItem>
                        <SelectItem value={IndustryCode.Financial.toString()}>{t('form.industry.financial')}</SelectItem>
                        <SelectItem value={IndustryCode.Food_and_Tobacco_Processing.toString()}>{t('form.industry.foodProcessing')}</SelectItem>
                        <SelectItem value={IndustryCode.Insurance.toString()}>{t('form.industry.insurance')}</SelectItem>
                        <SelectItem value={IndustryCode.Legal_Services.toString()}>{t('form.industry.legalServices')}</SelectItem>
                        <SelectItem value={IndustryCode.Non_Durable_Merchandise_Retail.toString()}>{t('form.industry.retail')}</SelectItem>
                        <SelectItem value={IndustryCode.Petrochemical_Extraction_and_Distribution.toString()}>{t('form.industry.petrochemical')}</SelectItem>
                        <SelectItem value={IndustryCode.Service_Retail.toString()}>{t('form.industry.serviceRetail')}</SelectItem>
                        <SelectItem value={IndustryCode.Social_Services.toString()}>{t('form.industry.socialServices')}</SelectItem>
                        <SelectItem value={IndustryCode.Specialty_Realty.toString()}>{t('form.industry.realEstate')}</SelectItem>
                        <SelectItem value={IndustryCode.Transportation.toString()}>{t('form.industry.transportation')}</SelectItem>
                        <SelectItem value={IndustryCode.Utility_Creation_and_Distribution.toString()}>{t('form.industry.utilities')}</SelectItem>
                        <SelectItem value={IndustryCode.Vehicle_Retail.toString()}>{t('form.industry.vehicleRetail')}</SelectItem>
                        <SelectItem value={IndustryCode.Wholesale.toString()}>{t('form.industry.wholesale')}</SelectItem>
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
                      {t('form.fields.category')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('form.placeholders.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AccountCategoryCode.Preferred_Customer.toString()}>{t('category.preferredCustomer')}</SelectItem>
                        <SelectItem value={AccountCategoryCode.Standard.toString()}>{t('category.standard')}</SelectItem>
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
                      {t('form.fields.annualRevenue')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder={t('form.placeholders.revenue')}
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
                      {t('form.fields.numberOfEmployees')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('form.placeholders.employees')}
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
                        {t('form.fields.parentAccountId')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.placeholders.parentAccountId')}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t('form.hints.parentAccountHint')}
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
                        {t('form.fields.primaryContact')}
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
                          placeholder={t('form.placeholders.selectContact')}
                          accountId={account?.accountid}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t('form.hints.primaryContactHint')}
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
              <CardTitle className="text-base font-semibold">{t('form.sections.addressInfo')}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('form.hints.addressHint')}
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
                {tc('buttons.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[120px]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account ? t('buttons.updateAccount') : t('buttons.createAccount')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
