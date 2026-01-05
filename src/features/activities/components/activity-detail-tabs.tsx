"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { Activity } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clock,
  User,
  Link2,
  FileText,
  History,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/utils/formatters'

export type ActivityTabId = 'general' | 'related' | 'history'

interface ActivityDetailTabsProps {
  activity: Activity
}

/**
 * ActivityDetailTabs
 *
 * Tabbed view for Activity details.
 *
 * Tabs:
 * - General: Schedule info, General info, Description
 * - Related: Related records (disabled)
 * - History: Activity history (disabled)
 */
export function ActivityDetailTabs({ activity }: ActivityDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ActivityTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('activity-tabs-nav-container')
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
          value="related"
          disabled
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "text-gray-400 cursor-not-allowed"
          )}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Related
        </TabsTrigger>

        <TabsTrigger
          value="history"
          disabled
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "text-gray-400 cursor-not-allowed"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Schedule Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.scheduledstart && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Scheduled Start
                  </p>
                  <p className="text-sm mt-1">{formatDateTime(activity.scheduledstart)}</p>
                </div>
              )}
              {activity.scheduledend && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Scheduled End
                  </p>
                  <p className="text-sm mt-1">{formatDateTime(activity.scheduledend)}</p>
                </div>
              )}
              {activity.actualdurationminutes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {activity.actualdurationminutes} minutes
                  </p>
                </div>
              )}
              {!activity.scheduledstart && !activity.scheduledend && !activity.actualdurationminutes && (
                <p className="text-sm text-muted-foreground">No schedule information available</p>
              )}
            </CardContent>
          </Card>

          {/* General Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Owner
                </p>
                <p className="text-sm mt-1">{activity.ownerid}</p>
              </div>
              {activity.regardingobjectid && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Regarding
                  </p>
                  <Link
                    href={`/${activity.regardingobjectidtype}s/${activity.regardingobjectid}`}
                    className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
                  >
                    <Link2 className="h-3 w-3" />
                    {activity.regardingobjectidtype} ({activity.regardingobjectid.substring(0, 8)}...)
                  </Link>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created On
                </p>
                <p className="text-sm mt-1">{formatDate(activity.createdon)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {activity.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{activity.description}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* RELATED TAB */}
      <TabsContent value="related" className="mt-0">
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Related records will be displayed here</p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* HISTORY TAB */}
      <TabsContent value="history" className="mt-0">
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Activity history will be displayed here</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
