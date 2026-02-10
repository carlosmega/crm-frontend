"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Lead } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadForm } from './lead-form'
import { cn } from '@/lib/utils'
import { User, CheckCircle2, MapPin, FileText } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

export type LeadFormTabId = 'general' | 'qualification' | 'address' | 'notes'

interface LeadFormTabsProps {
  lead?: Lead
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * LeadFormTabs
 *
 * Tabbed form view for creating and editing leads.
 *
 * Tabs:
 * - General: Basic information and contact details (name, company, job, email, phones, website)
 * - Qualification: BANT fields (lead source, quality, estimated value/date, budget, timeframe, decision maker, need analysis)
 * - Address: Physical location
 * - Notes: Description/observations
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Organized sections for better UX (65% reduction in fields per tab)
 * - Uses LeadForm component with section filtering
 */
export function LeadFormTabs({
  lead,
  onSubmit,
  onCancel,
  isLoading
}: LeadFormTabsProps) {
  const { t: tc } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<LeadFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('lead-tabs-nav-container')
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
          <User className="w-4 h-4 mr-2" />
          {tc('tabs.general')}
        </TabsTrigger>

        <TabsTrigger
          value="qualification"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {tc('tabs.qualification')}
        </TabsTrigger>

        <TabsTrigger
          value="address"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {tc('tabs.address')}
        </TabsTrigger>

        <TabsTrigger
          value="notes"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          {tc('tabs.notes')}
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic & Contact Information */}
      <TabsContent value="general" className="mt-0">
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="general"
        />
      </TabsContent>

      {/* Qualification Tab - BANT */}
      <TabsContent value="qualification" className="mt-0">
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="qualification"
        />
      </TabsContent>

      {/* Address Tab - Location */}
      <TabsContent value="address" className="mt-0">
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="address"
        />
      </TabsContent>

      {/* Notes Tab - Description */}
      <TabsContent value="notes" className="mt-0">
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="notes"
        />
      </TabsContent>
    </Tabs>
  )
}
