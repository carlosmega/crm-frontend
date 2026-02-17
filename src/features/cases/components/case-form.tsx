"use client"

import { useSession } from 'next-auth/react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Case, CreateCaseDto, UpdateCaseDto } from '@/core/contracts'
import {
  CasePriorityCode,
  CaseOriginCode,
  CaseTypeCode,
  getCasePriorityLabel,
  getCaseOriginLabel,
  getCaseTypeLabel,
} from '@/core/contracts'
import { Button } from '@/components/ui/button'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldGroup, AutoGrowTextarea } from '@/shared/components/form'
import { Loader2 } from 'lucide-react'
import {
  caseFormSchema,
  getCaseFormDefaultValues,
  type CaseFormValues,
} from './case-form-tabs'

export type CaseFormSection = 'general' | 'notes' | 'all'

interface CaseFormProps {
  case?: Case
  onSubmit: (data: CreateCaseDto | UpdateCaseDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  hideActions?: boolean
  section?: CaseFormSection
  sharedForm?: UseFormReturn<CaseFormValues>
}

export function CaseForm({
  case: caseData,
  onSubmit,
  onCancel,
  isLoading,
  hideActions,
  section = 'all',
  sharedForm,
}: CaseFormProps) {
  const { data: session } = useSession()

  // Use shared form if provided, otherwise create local form
  const localForm = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: getCaseFormDefaultValues(caseData),
  })

  const form = sharedForm || localForm

  const handleSubmit = async (values: CaseFormValues) => {
    const data = {
      ...values,
      ownerid: session?.user?.id || 'anonymous',
    }
    await onSubmit(data as CreateCaseDto | UpdateCaseDto)
  }

  const showGeneral = section === 'all' || section === 'general'
  const showNotes = section === 'all' || section === 'notes'

  return (
    <Form {...form}>
      <form
        id="case-edit-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {/* GENERAL SECTION - Basic Information */}
        {showGeneral && (
          <>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Title <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of the issue"
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
                    name="customerid_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Customer Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="account">Account</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Customer <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Select or enter customer ID"
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
                  name="primarycontactid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Primary Contact
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact handling this case"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormFieldGroup columns={3}>
                  <FormField
                    control={form.control}
                    name="casetypecode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Case Type
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : undefined)
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CaseTypeCode.Question.toString()}>
                              {getCaseTypeLabel(CaseTypeCode.Question)}
                            </SelectItem>
                            <SelectItem value={CaseTypeCode.Problem.toString()}>
                              {getCaseTypeLabel(CaseTypeCode.Problem)}
                            </SelectItem>
                            <SelectItem value={CaseTypeCode.Request.toString()}>
                              {getCaseTypeLabel(CaseTypeCode.Request)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prioritycode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Priority <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CasePriorityCode.High.toString()}>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                {getCasePriorityLabel(CasePriorityCode.High)}
                              </span>
                            </SelectItem>
                            <SelectItem value={CasePriorityCode.Normal.toString()}>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                {getCasePriorityLabel(CasePriorityCode.Normal)}
                              </span>
                            </SelectItem>
                            <SelectItem value={CasePriorityCode.Low.toString()}>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                {getCasePriorityLabel(CasePriorityCode.Low)}
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caseorigincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Origin <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CaseOriginCode.Phone.toString()}>
                              {getCaseOriginLabel(CaseOriginCode.Phone)}
                            </SelectItem>
                            <SelectItem value={CaseOriginCode.Email.toString()}>
                              {getCaseOriginLabel(CaseOriginCode.Email)}
                            </SelectItem>
                            <SelectItem value={CaseOriginCode.Web.toString()}>
                              {getCaseOriginLabel(CaseOriginCode.Web)}
                            </SelectItem>
                            <SelectItem value={CaseOriginCode.Facebook.toString()}>
                              {getCaseOriginLabel(CaseOriginCode.Facebook)}
                            </SelectItem>
                            <SelectItem value={CaseOriginCode.Twitter.toString()}>
                              {getCaseOriginLabel(CaseOriginCode.Twitter)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </FormFieldGroup>

                <FormField
                  control={form.control}
                  name="productid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Related Product
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Product this case relates to"
                          className="h-10"
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

        {/* NOTES SECTION - Description */}
        {showNotes && (
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
                        placeholder="Describe the issue in detail. Include any relevant information such as error messages, steps to reproduce, or customer impact..."
                        className=""
                        minRows={4}
                        maxRows={12}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
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
                className="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {caseData ? 'Update Case' : 'Create Case'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
