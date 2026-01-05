"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Quote } from '../types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuoteForm } from './quote-form'
import { cn } from '@/lib/utils'
import { FileText, Calendar } from 'lucide-react'

export type QuoteFormTabId = 'general' | 'validity'

interface QuoteFormTabsProps {
  quote?: Quote
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting?: boolean
  hideActions?: boolean
}

/**
 * QuoteFormTabs
 *
 * Form with tabbed interface for quote editing.
 *
 * Tabs:
 * - General: Basic information (name, description) + Customer information
 * - Validity: Validity period (effective from/to dates)
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Each tab shows only relevant fields (filtered by section prop)
 * - Consistent naming with detail view tabs
 */
export function QuoteFormTabs({ quote, onSubmit, onCancel, isSubmitting, hideActions }: QuoteFormTabsProps) {
  const [activeTab, setActiveTab] = useState<QuoteFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('quote-tabs-nav-container')
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
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="validity"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Validity
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QuoteFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic Information + Customer Information */}
      <TabsContent value="general" className="mt-0">
        <QuoteForm
          quote={quote}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          hideActions={hideActions}
          section="general"
        />
      </TabsContent>

      {/* Validity Tab - Validity Period */}
      <TabsContent value="validity" className="mt-0">
        <QuoteForm
          quote={quote}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          hideActions={hideActions}
          section="validity"
        />
      </TabsContent>
    </Tabs>
  )
}
