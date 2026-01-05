"use client"

import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, Search, XCircle } from 'lucide-react'
import type { QualificationWizardFormData } from './types'
import type { Lead } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { Badge } from '@/components/ui/badge'

interface AccountSelectionStepProps {
  lead: Lead
}

/**
 * Step 2: Account Selection/Creation
 *
 * For B2B leads: Create new account or link to existing
 * For B2C leads: Skip (no account needed)
 */
export function AccountSelectionStep({ lead }: AccountSelectionStepProps) {
  const form = useFormContext<QualificationWizardFormData>()
  const accountOption = form.watch('accountOption')
  const isB2B = !!lead.companyname && lead.companyname.trim().length > 0

  const [searchQuery, setSearchQuery] = useState('')
  const { accounts } = useAccounts()

  // Filter accounts by search query
  const filteredAccounts = accounts?.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Company Account</h3>
        <p className="text-sm text-muted-foreground">
          {isB2B
            ? 'Create a new account or link to an existing company'
            : 'This is a B2C lead (individual customer) - no company account needed'}
        </p>
      </div>

      {/* B2B/B2C Indicator */}
      <Card className={isB2B ? 'border-blue-500' : 'border-purple-500'}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {isB2B ? (
              <>
                <Building2 className="h-4 w-4 text-blue-600" />
                B2B - Business Customer
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-purple-600" />
                B2C - Individual Customer
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isB2B
              ? `Company: ${lead.companyname}`
              : 'No company name provided - treating as individual customer'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Account Options */}
      <FormField
        control={form.control}
        name="accountOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Account Option</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                {isB2B && (
                  <Card
                    className={`cursor-pointer transition-all ${
                      accountOption === 'create'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('accountOption', 'create')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="create" id="create" />
                        <div className="flex-1">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Account
                          </CardTitle>
                          <CardDescription>
                            Create a new company account for {lead.companyname}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {accountOption === 'create' && (
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="newAccountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Corporation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    )}
                  </Card>
                )}

                {isB2B && (
                  <Card
                    className={`cursor-pointer transition-all ${
                      accountOption === 'existing'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('accountOption', 'existing')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="existing" id="existing" />
                        <div className="flex-1">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Link to Existing Account
                          </CardTitle>
                          <CardDescription>
                            Find and link to an existing company account
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {accountOption === 'existing' && (
                      <CardContent className="space-y-3">
                        <div>
                          <Input
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="existingAccountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Account</FormLabel>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {filteredAccounts.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    {searchQuery
                                      ? 'No accounts found matching your search'
                                      : 'No accounts available'}
                                  </p>
                                ) : (
                                  filteredAccounts.slice(0, 5).map((account) => (
                                    <Card
                                      key={account.accountid}
                                      className={`cursor-pointer transition-all p-3 ${
                                        field.value === account.accountid
                                          ? 'border-primary bg-primary/5'
                                          : 'hover:border-primary/50'
                                      }`}
                                      onClick={() => field.onChange(account.accountid)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium">{account.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {account.address1_city || 'No location'}
                                          </p>
                                        </div>
                                        {field.value === account.accountid && (
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
                )}

                {!isB2B && (
                  <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="skip" id="skip" checked disabled />
                        <div className="flex-1">
                          <CardTitle className="text-sm">No Account (B2C)</CardTitle>
                          <CardDescription>
                            Individual customer - no company account needed
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
