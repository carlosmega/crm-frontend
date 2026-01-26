"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Opportunity } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OpportunityForm } from './opportunity-form'
import { cn } from '@/lib/utils'
import { DollarSign, FileText } from 'lucide-react'

export type OpportunityFormTabId = 'general' | 'additional'

interface OpportunityFormTabsProps {
  opportunity?: Opportunity
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * OpportunityFormTabs
 *
 * Tabbed form view for creating and editing opportunities.
 *
 * Tabs:
 * - General: Essential info (name, customer, sales stage, estimated value/date, description)
 * - Additional Details: Optional closure fields (actual value/date, close status, competitor)
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Organized sections for better UX (50% reduction in fields per tab)
 * - Uses OpportunityForm component with section filtering
 * - NO BPF stage tabs (Qualify, Develop, Propose, Close) - managed via SalesBusinessProcessFlow
 */
export function OpportunityFormTabs({
  opportunity,
  onSubmit,
  onCancel,
  isLoading
}: OpportunityFormTabsProps) {
  const [activeTab, setActiveTab] = useState<OpportunityFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('opportunity-tabs-nav-container')
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
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="additional"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          Additional Details
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OpportunityFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Essential Information */}
      <TabsContent value="general" className="mt-0">
        <OpportunityForm
          opportunity={opportunity}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="general"
        />
      </TabsContent>

      {/* Additional Details Tab - Optional Closure Fields */}
      <TabsContent value="additional" className="mt-0">
        <OpportunityForm
          opportunity={opportunity}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="additional"
        />
      </TabsContent>
    </Tabs>
  )
}
