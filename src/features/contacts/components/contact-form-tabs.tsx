"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Contact } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactForm, contactFormSchema, getContactFormDefaultValues, type ContactFormValues } from './contact-form'
import { cn } from '@/lib/utils'
import { User, Briefcase, MapPin } from 'lucide-react'

export type ContactFormTabId = 'general' | 'professional' | 'address'

interface ContactFormTabsProps {
  contact?: Contact
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  hideActions?: boolean
}

/**
 * ContactFormTabs
 *
 * Form with tabbed interface for contact editing.
 * Simpler than LeadFormTabs - no BPF, just organized sections.
 *
 * Tabs:
 * - General: Basic information (name, email, phones)
 * - Professional: Job title, department, parent account
 * - Address: Physical address information
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Shared form state across all tabs (prevents data loss on tab change)
 * - Each tab shows only relevant fields (filtered by section prop)
 * - Consistent naming with detail view tabs
 */
export function ContactFormTabs({ contact, onSubmit, isLoading, hideActions }: ContactFormTabsProps) {
  const [activeTab, setActiveTab] = useState<ContactFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // ✅ Create form once at the parent level and share across all tabs
  const sharedForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: getContactFormDefaultValues(contact),
  })

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('contact-tabs-nav-container')
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

        <TabsTrigger
          value="professional"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Professional
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
          Address
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContactFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic Information + Contact Information */}
      <TabsContent value="general" className="mt-0">
        <ContactForm
          contact={contact}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="general"
          sharedForm={sharedForm}
        />
      </TabsContent>

      {/* Professional Tab - Professional Information */}
      <TabsContent value="professional" className="mt-0">
        <ContactForm
          contact={contact}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="professional"
          sharedForm={sharedForm}
        />
      </TabsContent>

      {/* Address Tab - Address Information */}
      <TabsContent value="address" className="mt-0">
        <ContactForm
          contact={contact}
          onSubmit={onSubmit}
          isLoading={isLoading}
          hideActions={hideActions}
          section="address"
          sharedForm={sharedForm}
        />
      </TabsContent>
    </Tabs>
  )
}
