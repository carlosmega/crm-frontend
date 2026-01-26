"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Opportunity } from '@/core/contracts'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTimeline } from '@/features/activities/components'
import { OpportunityOriginatingLead } from './opportunity-originating-lead'
import { OpportunityTabsNavigation, type OpportunityTabId } from '@/shared/components/opportunity-tabs-navigation'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react'

interface OpportunityDetailTabsProps {
  opportunity: Opportunity
  originatingLeadId?: string
}

export function OpportunityDetailTabs({
  opportunity,
  originatingLeadId
}: OpportunityDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<OpportunityTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const container = document.getElementById('opportunity-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).replace('de', 'de')
  }

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '-'
    return 'Yesterday via Email'
  }

  // Tabs navigation configuration
  const tabsNavigation = (
    <OpportunityTabsNavigation
      tabs={[
        { id: 'general', label: 'General', icon: User },
      ]}
      showActivities
    />
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OpportunityTabId)} className="w-full">
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0">
        <div className="space-y-4">
          {/* Contact Information and Key Dates - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information Card */}
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {/* Phone */}
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href="tel:555-1234" className="text-sm hover:underline">
                    555-1234
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href="mailto:customer@example.com"
                    className="text-sm hover:underline truncate"
                  >
                    customer@example.com
                  </a>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">Mexico City, MX</span>
                </div>
              </CardContent>
            </Card>

            {/* Key Dates Card */}
            <Card className="gap-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Key Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {/* Last Interaction */}
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Last Interaction</div>
                  <span className="text-sm">{formatRelativeTime(opportunity.modifiedon)}</span>
                </div>
              </div>

              {/* Desktop: Also show Estimated Close Date */}
              <div className="hidden md:flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Estimated Close Date</div>
                  <span className="text-sm">{formatDate(opportunity.estimatedclosedate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Edit and Log Activity Buttons - Mobile Only */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Log Activity
            </button>
          </div>

          {/* Opportunity Score Card - Full Width */}
          <Card className="gap-4">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Opportunity Score</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">Automatic scoring based on multiple factors</p>
                </div>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors items-center gap-1 hidden md:flex">
                  <span>Details</span>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Layout: Side by side */}
              <div className="hidden md:flex gap-12">
                {/* Score Number - LEFT SIDE */}
                <div className="flex flex-col items-center justify-start pt-4">
                  <div className="flex items-baseline">
                    <span className="text-7xl font-bold text-primary">
                      {Math.round((opportunity.closeprobability || 0) / 4)}
                    </span>
                    <span className="text-3xl text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-4 px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs font-semibold text-primary">Cold Lead</span>
                  </div>
                </div>

                {/* Score Breakdown - RIGHT SIDE */}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Score Breakdown</h4>

                  <div className="space-y-3.5">
                    {/* Source Quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Source Quality</span>
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">7/25</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden -mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `28%` }}
                      />
                    </div>

                    {/* Engagement Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Engagement Level</span>
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">0/25</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden -mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `0%` }}
                      />
                    </div>

                    {/* Customer Fit */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>Customer Fit</span>
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">0/25</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden -mt-2">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: '0%' }} />
                    </div>

                    {/* Overall Quality */}
                    <div className="pt-2 mt-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Overall Quality</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${opportunity.closeprobability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout: Stacked */}
              <div className="md:hidden space-y-6">
                {/* Score Number - TOP */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-primary">
                      {Math.round((opportunity.closeprobability || 0) / 4)}
                    </span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-3 px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-xs font-semibold text-primary">Cold Lead</span>
                  </div>
                </div>

                {/* Score Breakdown - BOTTOM */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Score Breakdown</h4>

                  <div className="space-y-3">
                    {/* Source Quality */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">Source Quality</span>
                        <span className="text-sm font-semibold text-foreground">7/25</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `28%` }}
                        />
                      </div>
                    </div>

                    {/* Engagement Level */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">Engagement Level</span>
                        <span className="text-sm font-semibold text-foreground">0/25</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `0%` }}
                        />
                      </div>
                    </div>

                    {/* Customer Fit */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">Customer Fit</span>
                        <span className="text-sm font-semibold text-foreground">0/25</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '0%' }} />
                      </div>
                    </div>

                    {/* Overall Quality */}
                    <div className="pt-2 border-t border-muted">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">Overall Quality</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${opportunity.closeprobability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={opportunity.opportunityid}
          regardingType="opportunity"
          regardingName={opportunity.name}
        />
      </TabsContent>
    </Tabs>
  )
}
