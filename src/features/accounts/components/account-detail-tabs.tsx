"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Account } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTimeline } from '@/features/activities/components'
import { AccountContactsSubGrid } from './account-contacts-subgrid'
import { AccountOpportunitiesSubGrid } from './account-opportunities-subgrid'
import { cn } from '@/lib/utils'
import {
  Building2,
  Users,
  Briefcase,
  History,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react'

export type AccountTabId = 'general' | 'contacts' | 'opportunities' | 'activities'

interface AccountDetailTabsProps {
  account: Account
}

/**
 * AccountDetailTabs
 *
 * Tabbed view for Account details.
 *
 * Tabs:
 * - General: Contact info, Business info, Address, Description
 * - Related Contacts: Contacts associated with this account
 * - Related Opportunities: Opportunities for this account
 * - Activities: Activity timeline and history
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Simple tab structure (no BPF like opportunities/leads)
 * - Sub-grids for related contacts and opportunities
 */
export function AccountDetailTabs({ account }: AccountDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<AccountTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('account-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Format helpers
  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

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
          <Building2 className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="contacts"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Users className="w-4 h-4 mr-2" />
          Related Contacts
        </TabsTrigger>

        <TabsTrigger
          value="opportunities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Related Opportunities
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
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Contact Information Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {account.emailaddress1 && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${account.emailaddress1}`}
                    className="text-sm hover:underline truncate"
                  >
                    {account.emailaddress1}
                  </a>
                </div>
              )}
              {account.telephone1 && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${account.telephone1}`}
                    className="text-sm hover:underline"
                  >
                    {account.telephone1}
                  </a>
                </div>
              )}
              {account.websiteurl && (
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={account.websiteurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline truncate"
                  >
                    {account.websiteurl}
                  </a>
                </div>
              )}
              {!account.emailaddress1 && !account.telephone1 && !account.websiteurl && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>

          {/* Business Information Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {account.revenue && (
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Annual Revenue</div>
                    <span className="text-sm font-medium">{formatCurrency(account.revenue)}</span>
                  </div>
                </div>
              )}
              {account.numberofemployees && (
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Employees</div>
                    <span className="text-sm">{account.numberofemployees}</span>
                  </div>
                </div>
              )}
              {account.createdon && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Created On</div>
                    <span className="text-sm">{formatDate(account.createdon)}</span>
                  </div>
                </div>
              )}
              {!account.revenue && !account.numberofemployees && !account.createdon && (
                <p className="text-sm text-muted-foreground">No business information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Address Card */}
        {(account.address1_line1 || account.address1_city) && (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Primary Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {account.address1_line1 && <div>{account.address1_line1}</div>}
                  {account.address1_line2 && <div>{account.address1_line2}</div>}
                  <div>
                    {account.address1_city}
                    {account.address1_stateorprovince &&
                      `, ${account.address1_stateorprovince}`}
                    {account.address1_postalcode && ` ${account.address1_postalcode}`}
                  </div>
                  {account.address1_country && <div>{account.address1_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description Card */}
        {account.description && (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">{account.description}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* RELATED CONTACTS TAB */}
      <TabsContent value="contacts" className="mt-0">
        <AccountContactsSubGrid accountId={account.accountid} />
      </TabsContent>

      {/* RELATED OPPORTUNITIES TAB */}
      <TabsContent value="opportunities" className="mt-0">
        <AccountOpportunitiesSubGrid accountId={account.accountid} />
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={account.accountid}
          regardingType="account"
          regardingName={account.name}
        />
      </TabsContent>
    </Tabs>
  )
}
