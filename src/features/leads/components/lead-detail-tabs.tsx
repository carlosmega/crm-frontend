"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Lead } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadScoreCard } from './lead-score-card'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  History,
  Lock,
  CheckCircle2,
} from 'lucide-react'

export type LeadTabId = 'general' | 'activities'

interface LeadDetailTabsProps {
  lead: Lead
  activityCount?: {
    emails: number
    phoneCalls: number
    meetings: number
    formSubmissions: number
  }
}

/**
 * LeadDetailTabs
 *
 * Read-only tabbed view for Lead details.
 * BPF stage fields (Qualify) are now edited via the stage dialog.
 *
 * Tabs:
 * - General: Contact info, Lead details, Lead Score, Address, Description
 * - Activities: Activity timeline and history
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Clean separation between general info and activities
 */
export function LeadDetailTabs({ lead, activityCount = { emails: 0, phoneCalls: 0, meetings: 0, formSubmissions: 0 } }: LeadDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<LeadTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('lead-tabs-nav-container')
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
          <User className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
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
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Tab Contents */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Contact Information and Lead Details - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Information Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lead.emailaddress1 && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${lead.emailaddress1}`}
                    className="text-sm hover:underline truncate"
                  >
                    {lead.emailaddress1}
                  </a>
                </div>
              )}
              {lead.telephone1 && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${lead.telephone1}`}
                    className="text-sm hover:underline"
                  >
                    {lead.telephone1}
                  </a>
                </div>
              )}
              {lead.mobilephone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${lead.mobilephone}`}
                    className="text-sm hover:underline"
                  >
                    {lead.mobilephone} <span className="text-muted-foreground text-xs">(Mobile)</span>
                  </a>
                </div>
              )}
              {lead.websiteurl && (
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={lead.websiteurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline truncate"
                  >
                    {lead.websiteurl}
                  </a>
                </div>
              )}
              {!lead.emailaddress1 && !lead.telephone1 && !lead.mobilephone && !lead.websiteurl && (
                <p className="text-sm text-muted-foreground">No contact information available</p>
              )}
            </CardContent>
          </Card>

          {/* Lead Details Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lead.estimatedvalue && (
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Estimated Value</div>
                    <span className="text-sm font-medium">{formatCurrency(lead.estimatedvalue)}</span>
                  </div>
                </div>
              )}
              {lead.estimatedclosedate && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Estimated Close Date</div>
                    <span className="text-sm">{formatDate(lead.estimatedclosedate)}</span>
                  </div>
                </div>
              )}
              {!lead.estimatedvalue && !lead.estimatedclosedate && (
                <p className="text-sm text-muted-foreground">No lead details available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Score Card */}
        <LeadScoreCard lead={lead} activityCount={activityCount} />

        {/* Address Card */}
        {(lead.address1_line1 || lead.address1_city) && (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {lead.address1_line1 && <div>{lead.address1_line1}</div>}
                  {lead.address1_line2 && <div>{lead.address1_line2}</div>}
                  <div>
                    {lead.address1_city}
                    {lead.address1_stateorprovince && `, ${lead.address1_stateorprovince}`}
                    {lead.address1_postalcode && ` ${lead.address1_postalcode}`}
                  </div>
                  {lead.address1_country && <div>{lead.address1_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description Card */}
        {lead.description && (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">{lead.description}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={lead.leadid}
          regardingType="lead"
          regardingName={`${lead.firstname} ${lead.lastname}`}
        />
      </TabsContent>
    </Tabs>
  )
}

/**
 * Message shown for disabled/inaccessible stages
 */
function DisabledStageMessage({ stageName, description, requiresConversion = false }: {
  stageName: string
  description: string
  requiresConversion?: boolean
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Lock className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{stageName} Stage</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
        {requiresConversion && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Qualify Lead First
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
