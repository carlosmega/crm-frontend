"use client"

import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Plus, Search } from 'lucide-react'
import type { QualificationWizardFormData } from './types'
import type { Lead } from '@/core/contracts'
import { useState } from 'react'
import { useContacts } from '@/features/contacts/hooks/use-contacts'
import { Badge } from '@/components/ui/badge'

interface ContactSelectionStepProps {
  lead: Lead
}

/**
 * Step 3: Contact Selection/Creation
 *
 * Create new contact or link to existing
 * Contact is ALWAYS required (B2B and B2C)
 */
export function ContactSelectionStep({ lead }: ContactSelectionStepProps) {
  const form = useFormContext<QualificationWizardFormData>()
  const contactOption = form.watch('contactOption')

  const [searchQuery, setSearchQuery] = useState('')
  const { contacts } = useContacts()

  // Filter contacts by search query
  const filteredContacts = contacts?.filter((contact) => {
    const fullName = `${contact.firstname} ${contact.lastname}`.toLowerCase()
    const email = contact.emailaddress1?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  }) || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Contact Person</h3>
        <p className="text-sm text-muted-foreground">
          Create a new contact or link to an existing person
        </p>
      </div>

      {/* Lead Info Preview */}
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Lead Information
          </CardTitle>
          <CardDescription>
            {lead.firstname} {lead.lastname}
            {lead.emailaddress1 && ` • ${lead.emailaddress1}`}
            {lead.telephone1 && ` • ${lead.telephone1}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Contact Options */}
      <FormField
        control={form.control}
        name="contactOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Contact Option</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    contactOption === 'create'
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => form.setValue('contactOption', 'create')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="create" id="contact-create" />
                      <div className="flex-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Contact
                        </CardTitle>
                        <CardDescription>
                          Create a new contact from lead information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {contactOption === 'create' && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="newContactFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newContactLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="newContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john.doe@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  )}
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    contactOption === 'existing'
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => form.setValue('contactOption', 'existing')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="existing" id="contact-existing" />
                      <div className="flex-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Link to Existing Contact
                        </CardTitle>
                        <CardDescription>
                          Find and link to an existing contact
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {contactOption === 'existing' && (
                    <CardContent className="space-y-3">
                      <div>
                        <Input
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="existingContactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Contact</FormLabel>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {filteredContacts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  {searchQuery
                                    ? 'No contacts found matching your search'
                                    : 'No contacts available'}
                                </p>
                              ) : (
                                filteredContacts.slice(0, 5).map((contact) => (
                                  <Card
                                    key={contact.contactid}
                                    className={`cursor-pointer transition-all p-3 ${
                                      field.value === contact.contactid
                                        ? 'border-primary bg-primary/5'
                                        : 'hover:border-primary/50'
                                    }`}
                                    onClick={() => field.onChange(contact.contactid)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {contact.firstname} {contact.lastname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {contact.emailaddress1 || 'No email'}
                                          {contact.jobtitle && ` • ${contact.jobtitle}`}
                                        </p>
                                      </div>
                                      {field.value === contact.contactid && (
                                        <Badge variant="default">Selected</Badge>
                                      )}
                                    </div>
                                  </Card>
                                ))
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  )}
                </Card>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
