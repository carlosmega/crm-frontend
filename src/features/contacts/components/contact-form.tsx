"use client"

import { useState, useEffect } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/core/contracts'
import type { SelectedCustomer } from '@/shared/types/selected-customer'
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
import { FormFieldGroup, IconInput, AutoGrowTextarea, AddressFormFields } from '@/shared/components/form'
import { CustomerSelectorButton } from '@/shared/components/selectors/customer-selector-button'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { Mail, Phone, Smartphone, User, Briefcase, Loader2 } from 'lucide-react'

// Export schema for use in ContactFormTabs
export const contactFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  salutation: z.string().optional(),
  jobtitle: z.string().optional(),
  department: z.string().optional(),
  emailaddress1: z.string().email('Invalid email').min(1, 'Email is required'),
  emailaddress2: z.string().email('Invalid email').optional().or(z.literal('')),
  telephone1: z.string().optional(),
  telephone2: z.string().optional(),
  mobilephone: z.string().optional(),
  fax: z.string().optional(),
  address1_line1: z.string().optional(),
  address1_line2: z.string().optional(),
  address1_city: z.string().optional(),
  address1_stateorprovince: z.string().optional(),
  address1_postalcode: z.string().optional(),
  address1_country: z.string().optional(),
  parentcustomerid: z.string().optional(), // Account ID for B2B
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export type ContactFormSection = 'general' | 'professional' | 'address' | 'all'

interface ContactFormProps {
  contact?: Contact
  onSubmit: (data: CreateContactDto | UpdateContactDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
  section?: ContactFormSection // Which section to show (default: 'all')
  sharedForm?: UseFormReturn<ContactFormValues> // Optional shared form instance
}

// Helper to get default values
export function getContactFormDefaultValues(contact?: Contact): ContactFormValues {
  return contact
    ? {
        firstname: contact.firstname || '',
        lastname: contact.lastname || '',
        salutation: contact.salutation || '',
        jobtitle: contact.jobtitle || '',
        department: contact.department || '',
        emailaddress1: contact.emailaddress1 || '',
        emailaddress2: contact.emailaddress2 || '',
        telephone1: contact.telephone1 || '',
        telephone2: contact.telephone2 || '',
        mobilephone: contact.mobilephone || '',
        fax: contact.fax || '',
        address1_line1: contact.address1_line1 || '',
        address1_line2: contact.address1_line2 || '',
        address1_city: contact.address1_city || '',
        address1_stateorprovince: contact.address1_stateorprovince || '',
        address1_postalcode: contact.address1_postalcode || '',
        address1_country: contact.address1_country || '',
        parentcustomerid: contact.parentcustomerid || '',
      }
    : {
        firstname: '',
        lastname: '',
        salutation: '',
        jobtitle: '',
        department: '',
        emailaddress1: '',
        emailaddress2: '',
        telephone1: '',
        telephone2: '',
        mobilephone: '',
        fax: '',
        address1_line1: '',
        address1_line2: '',
        address1_city: '',
        address1_stateorprovince: '',
        address1_postalcode: '',
        address1_country: '',
        parentcustomerid: '',
      }
}

export function ContactForm({ contact, onSubmit, onCancel, isLoading, hideActions, section = 'all', sharedForm }: ContactFormProps) {
  const { accounts } = useAccounts()
  const [selectedAccount, setSelectedAccount] = useState<SelectedCustomer | undefined>(undefined)

  // Use shared form if provided, otherwise create a new one
  const localForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: getContactFormDefaultValues(contact),
  })

  const form = sharedForm || localForm

  // Initialize selectedAccount from contact.parentcustomerid
  useEffect(() => {
    if (contact?.parentcustomerid && accounts) {
      const account = accounts.find(a => a.accountid === contact.parentcustomerid)
      if (account) {
        setSelectedAccount({
          id: account.accountid,
          type: 'account',
          name: account.name,
          email: account.emailaddress1,
          phone: account.telephone1,
          city: account.address1_city,
        })
      }
    }
  }, [contact?.parentcustomerid, accounts])

  const handleSubmit = async (values: ContactFormValues) => {
    // ✅ Limpiar campos vacíos: convertir strings vacíos a null o undefined
    const cleanData = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        // Si el valor es un string vacío, retornar undefined (se omitirá del objeto)
        if (value === '') {
          return [key, undefined]
        }
        return [key, value]
      })
    )

    // Remover propiedades undefined
    const filteredData = Object.fromEntries(
      Object.entries(cleanData).filter(([_, value]) => value !== undefined)
    )

    await onSubmit(filteredData as CreateContactDto | UpdateContactDto)
  }

  const showGeneral = section === 'all' || section === 'general'
  const showProfessional = section === 'all' || section === 'professional'
  const showAddress = section === 'all' || section === 'address'

  return (
    <Form {...form}>
      <form id="contact-edit-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* GENERAL SECTION - Basic Information + Contact Information */}
        {showGeneral && (
          <>
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <FormFieldGroup columns={3}>
                <FormField
                  control={form.control}
                  name="salutation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Salutation
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mr., Ms., Dr."
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
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        First Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <IconInput
                          placeholder="John"
                          icon={User}
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
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Last Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <IconInput
                          placeholder="Doe"
                          icon={User}
                          className=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </FormFieldGroup>

              <FormField
                control={form.control}
                name="emailaddress1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        type="email"
                        placeholder="john.doe@example.com"
                        icon={Mail}
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <FormFieldGroup columns={2}>
            <FormField
              control={form.control}
              name="telephone1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Business Phone
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
                    Home Phone
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
              name="mobilephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Mobile Phone
                  </FormLabel>
                  <FormControl>
                    <IconInput
                      type="tel"
                      placeholder="+34 654 321 987"
                      icon={Smartphone}
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
          </FormFieldGroup>

          <FormField
            control={form.control}
            name="emailaddress2"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Secondary Email
                </FormLabel>
                <FormControl>
                  <IconInput
                    type="email"
                    placeholder="john.doe.personal@example.com"
                    icon={Mail}
                    className=""
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

        {/* PROFESSIONAL SECTION - Professional Information */}
        {showProfessional && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <FormFieldGroup columns={2}>
              <FormField
                control={form.control}
                name="jobtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <IconInput
                        placeholder="Sales Manager"
                        icon={Briefcase}
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Department
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sales"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </FormFieldGroup>

            <FormField
              control={form.control}
              name="parentcustomerid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Parent Account (Company)
                  </FormLabel>
                  <FormControl>
                    <CustomerSelectorButton
                      value={selectedAccount}
                      onChange={(customer) => {
                        setSelectedAccount(customer)
                        field.onChange(customer?.id || '')
                      }}
                      customerType="account"
                      placeholder="Select parent account (optional - leave empty for B2C)"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for individual consumers (B2C). Select a company account for business contacts (B2B).
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            </CardContent>
          </Card>
        )}

        {/* ADDRESS SECTION - Address Information */}
        {showAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Address</CardTitle>
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

        {/* Form Actions */}
        {!hideActions && (
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contact ? 'Update Contact' : 'Create Contact'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}
