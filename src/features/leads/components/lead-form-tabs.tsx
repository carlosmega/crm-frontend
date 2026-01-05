"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Lead } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadForm } from './lead-form'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

export type LeadFormTabId = 'general'

export type LeadFormSection =
  | 'basic'
  | 'contact'
  | 'address'
  | 'details'
  | 'all'

interface LeadFormTabsProps {
  lead?: Lead
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  /** If true (for NEW leads), only show General tab without BPF */
  isCreating?: boolean
}

/**
 * LeadFormTabs
 *
 * Tabbed form view for creating and editing leads.
 *
 * Modes:
 * - Creating (isCreating=true): Only General tab, no BPF
 * - Editing (isCreating=false): General tab with BPF (BPF shown in page, not here)
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Uses LeadForm component with section filtering
 */
export function LeadFormTabs({
  lead,
  onSubmit,
  onCancel,
  isLoading,
  isCreating = false
}: LeadFormTabsProps) {
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
          General
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Tab Contents */}
      <TabsContent value="general" className="mt-0">
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
        />
      </TabsContent>
    </Tabs>
  )
}
