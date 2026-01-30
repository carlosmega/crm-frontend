"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Case } from '@/core/contracts'
import { CasePriorityCode, CaseOriginCode, CaseTypeCode } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaseForm } from './case-form'
import { cn } from '@/lib/utils'
import { FileText, StickyNote } from 'lucide-react'

export type CaseFormTabId = 'general' | 'notes'

// Schema for form validation - exported for use in CaseForm
export const caseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customerid: z.string().min(1, 'Customer is required'),
  customerid_type: z.enum(['account', 'contact']),
  primarycontactid: z.string().optional(),
  casetypecode: z.nativeEnum(CaseTypeCode).optional(),
  prioritycode: z.nativeEnum(CasePriorityCode),
  caseorigincode: z.nativeEnum(CaseOriginCode),
  productid: z.string().optional(),
})

export type CaseFormValues = z.infer<typeof caseFormSchema>

export function getCaseFormDefaultValues(caseData?: Case): CaseFormValues {
  if (caseData) {
    return {
      title: caseData.title,
      description: caseData.description || '',
      customerid: caseData.customerid,
      customerid_type: caseData.customerid_type,
      primarycontactid: caseData.primarycontactid || '',
      casetypecode: caseData.casetypecode,
      prioritycode: caseData.prioritycode,
      caseorigincode: caseData.caseorigincode,
      productid: caseData.productid || '',
    }
  }
  return {
    title: '',
    description: '',
    customerid: '',
    customerid_type: 'account' as const,
    primarycontactid: '',
    prioritycode: CasePriorityCode.Normal,
    caseorigincode: CaseOriginCode.Web,
    productid: '',
  }
}

interface CaseFormTabsProps {
  case?: Case
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  hideActions?: boolean
}

/**
 * CaseFormTabs
 *
 * Tabbed form view for creating and editing cases.
 * Follows the same pattern as ContactFormTabs.
 *
 * Tabs:
 * - General: Basic information, customer, classification
 * - Notes: Description and details
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Shared form state across all tabs (prevents data loss on tab change)
 * - Each tab shows only relevant fields (filtered by section prop)
 */
export function CaseFormTabs({
  case: caseData,
  onSubmit,
  isLoading,
  hideActions,
}: CaseFormTabsProps) {
  const [activeTab, setActiveTab] = useState<CaseFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Create form once at the parent level and share across all tabs
  const sharedForm = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: getCaseFormDefaultValues(caseData),
  })

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('case-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="notes"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <StickyNote className="w-4 h-4 mr-2" />
          Notes
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as CaseFormTabId)}
      className="w-full"
    >
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic Information & Classification */}
      <TabsContent value="general" className="mt-0">
        <CaseForm
          case={caseData}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="general"
          sharedForm={sharedForm}
        />
      </TabsContent>

      {/* Notes Tab - Description */}
      <TabsContent value="notes" className="mt-0">
        <CaseForm
          case={caseData}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="notes"
          sharedForm={sharedForm}
        />
      </TabsContent>
    </Tabs>
  )
}
