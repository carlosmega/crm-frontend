"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Case } from '@/core/contracts'
import { CaseStateCode } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ActivityTimeline } from '@/features/activities/components'
import { CaseStatusBadge } from './case-status-badge'
import { CasePriorityBadge } from './case-priority-badge'
import { CaseOriginBadge } from './case-origin-badge'
import { CaseTypeBadge } from './case-type-badge'
import { cn } from '@/lib/utils'
import {
  User,
  Building2,
  Calendar,
  History,
  FileText,
  CheckCircle2,
  Package,
  Ticket,
} from 'lucide-react'

export type CaseTabId = 'general' | 'activities'

interface CaseDetailTabsProps {
  case: Case
}

/**
 * CaseDetailTabs
 *
 * Read-only tabbed view for Case details.
 *
 * Tabs:
 * - General: Case details, Customer info, Classification, Resolution
 * - Activities: Activity timeline and history
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Clean separation between general info and activities
 */
export function CaseDetailTabs({ case: caseData }: CaseDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<CaseTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('case-tabs-nav-container')
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            "data-[state=inactive]:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
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
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as CaseTabId)}
      className="w-full"
    >
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Tab Contents */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Case Overview and Customer - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Case Overview Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Case Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.ticketnumber && (
                <div className="flex items-center gap-2.5">
                  <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Ticket Number</div>
                    <span className="text-sm font-mono font-medium">{caseData.ticketnumber}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Status</div>
                  <CaseStatusBadge
                    statecode={caseData.statecode}
                    statuscode={caseData.statuscode}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Priority</div>
                  <CasePriorityBadge priority={caseData.prioritycode} />
                </div>
              </div>
              {caseData.casetypecode && (
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Type</div>
                    <CaseTypeBadge type={caseData.casetypecode} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Origin</div>
                  <CaseOriginBadge origin={caseData.caseorigincode} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                {caseData.customerid_type === 'account' ? (
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    {caseData.customerid_type === 'account' ? 'Account' : 'Contact'}
                  </div>
                  <span className="text-sm font-medium">
                    {caseData.customername || caseData.customerid}
                  </span>
                </div>
              </div>
              {caseData.primarycontactname && (
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Primary Contact</div>
                    <span className="text-sm">{caseData.primarycontactname}</span>
                  </div>
                </div>
              )}
              {caseData.productname && (
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Related Product</div>
                    <span className="text-sm">{caseData.productname}</span>
                  </div>
                </div>
              )}
              {caseData.ownername && (
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-0.5">Assigned To</div>
                    <span className="text-sm">{caseData.ownername}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Card */}
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">Created</div>
                <span className="text-sm">{formatDateTime(caseData.createdon)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">Last Modified</div>
                <span className="text-sm">{formatDateTime(caseData.modifiedon)}</span>
              </div>
            </div>
            {caseData.resolvedon && (
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Resolved</div>
                  <span className="text-sm">{formatDateTime(caseData.resolvedon)}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">First Response Sent</div>
                <Badge variant={caseData.firstresponsesent ? 'default' : 'secondary'}>
                  {caseData.firstresponsesent ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Card (only for resolved cases) */}
        {caseData.statecode === CaseStateCode.Resolved && caseData.resolutionsummary && (
          <Card className="gap-3 border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.resolutiontype && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Resolution Type</div>
                  <Badge variant="outline">{caseData.resolutiontype}</Badge>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Resolution Summary</div>
                <p className="text-sm leading-relaxed">{caseData.resolutionsummary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description Card */}
        {caseData.description && (
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={caseData.incidentid}
          regardingType="case"
          regardingName={caseData.title}
        />
      </TabsContent>
    </Tabs>
  )
}
