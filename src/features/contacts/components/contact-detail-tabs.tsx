"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { Contact } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import {
  User,
  Briefcase,
  History,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react'

export type ContactTabId = 'general' | 'professional' | 'address' | 'activities'

interface ContactDetailTabsProps {
  contact: Contact
}

/**
 * ContactDetailTabs
 *
 * Tabbed view for Contact details.
 *
 * Tabs:
 * - General: Basic contact information and contact methods
 * - Professional: Job title, department, company information
 * - Address: Physical address information
 * - Activities: Activity timeline and history
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Simple tab structure (no BPF like opportunities/leads)
 * - Consistent naming with edit form tabs
 */
export function ContactDetailTabs({ contact }: ContactDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ContactTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('contact-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Format helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors ml-auto",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          Activities
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContactTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB - Contact Information */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Contact Information Card */}
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
              {contact.emailaddress1 && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${contact.emailaddress1}`}
                    className="text-sm hover:underline truncate"
                  >
                    {contact.emailaddress1}
                  </a>
                </div>
              )}
              {contact.telephone1 && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${contact.telephone1}`}
                    className="text-sm hover:underline"
                  >
                    {contact.telephone1}
                  </a>
                </div>
              )}
              {contact.mobilephone && (
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${contact.mobilephone}`}
                    className="text-sm hover:underline"
                  >
                    {contact.mobilephone}
                  </a>
                </div>
              )}
              {contact.emailaddress2 && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${contact.emailaddress2}`}
                    className="text-sm hover:underline truncate"
                  >
                    {contact.emailaddress2}
                  </a>
                </div>
              )}
              {!contact.emailaddress1 && !contact.telephone1 && !contact.mobilephone && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>
      </TabsContent>

      {/* PROFESSIONAL TAB - Professional Information */}
      <TabsContent value="professional" className="mt-0 space-y-4">
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {contact.jobtitle && (
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Job Title</div>
                  <span className="text-sm font-medium">{contact.jobtitle}</span>
                </div>
              </div>
            )}
            {contact.department && (
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Department</div>
                  <span className="text-sm">{contact.department}</span>
                </div>
              </div>
            )}
            {contact.parentcustomerid && (
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Account (B2B)</div>
                  <Link
                    href={`/accounts/${contact.parentcustomerid}`}
                    className="text-sm hover:underline text-primary"
                  >
                    {contact.parentcustomerid.substring(0, 8)}...
                  </Link>
                </div>
              </div>
            )}
            {contact.createdon && (
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Created On</div>
                  <span className="text-sm">{formatDate(contact.createdon)}</span>
                </div>
              </div>
            )}
            {!contact.jobtitle && !contact.department && !contact.parentcustomerid && !contact.createdon && (
              <p className="text-sm text-muted-foreground">No professional information available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ADDRESS TAB - Address Information */}
      <TabsContent value="address" className="mt-0 space-y-4">
        {(contact.address1_line1 || contact.address1_city) ? (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Primary Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {contact.address1_line1 && <div>{contact.address1_line1}</div>}
                  {contact.address1_line2 && <div>{contact.address1_line2}</div>}
                  <div>
                    {contact.address1_city}
                    {contact.address1_stateorprovince &&
                      `, ${contact.address1_stateorprovince}`}
                    {contact.address1_postalcode && ` ${contact.address1_postalcode}`}
                  </div>
                  {contact.address1_country && <div>{contact.address1_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No address information available</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ACTIVITIES TAB - Activity Timeline */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={contact.contactid}
          regardingType="contact"
          regardingName={contact.fullname}
        />
      </TabsContent>
    </Tabs>
  )
}
