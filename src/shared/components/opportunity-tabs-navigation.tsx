"use client"

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  User,
  Target,
  TrendingUp,
  Presentation,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react'

export type OpportunityTabId = 'general' | 'qualify' | 'develop' | 'propose' | 'close' | 'activities'

interface OpportunityTabConfig {
  id: OpportunityTabId
  label: string
  icon: typeof User
  disabled?: boolean
  hidden?: boolean
  showLock?: boolean
}

interface OpportunityTabsNavigationProps {
  /** Currently active tab */
  activeTab?: OpportunityTabId
  /** Callback when tab changes */
  onTabChange?: (tab: OpportunityTabId) => void
  /** Configuration for which tabs to show/hide/disable */
  tabs?: OpportunityTabConfig[]
  /** Whether to show the Activities tab */
  showActivities?: boolean
  /** Custom className for the container */
  className?: string
}

const DEFAULT_TABS: OpportunityTabConfig[] = [
  { id: 'general', label: 'General', icon: User },
  { id: 'qualify', label: 'Qualify', icon: Target },
  { id: 'develop', label: 'Develop', icon: TrendingUp },
  { id: 'propose', label: 'Propose', icon: Presentation },
  { id: 'close', label: 'Close', icon: CheckCircle2 },
]

/**
 * Shared Opportunity Tabs Navigation Component
 *
 * Provides consistent tab styling for opportunity detail and edit pages.
 * Supports:
 * - Custom tab configurations
 * - Disabled tabs with lock icons
 * - Hidden tabs for responsive design
 * - Activities tab (optional)
 * - Purple underline for active tab
 * - Horizontal scrolling on mobile
 *
 * @example
 * // Read-only view with some tabs disabled
 * <OpportunityTabsNavigation
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   tabs={[
 *     { id: 'general', label: 'General', icon: User },
 *     { id: 'qualify', label: 'Qualify', icon: Target },
 *     { id: 'develop', label: 'Develop', icon: TrendingUp, disabled: true, showLock: true },
 *   ]}
 *   showActivities
 * />
 *
 * @example
 * // Edit form with all tabs enabled
 * <OpportunityTabsNavigation
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */
export function OpportunityTabsNavigation({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  showActivities = false,
  className,
}: OpportunityTabsNavigationProps) {
  // Add Activities tab if requested
  const allTabs = showActivities
    ? [...tabs, { id: 'activities' as OpportunityTabId, label: 'Activities', icon: Clock }]
    : tabs

  return (
    <div className={cn("overflow-x-auto", className)}>
      <TabsList className="h-auto p-0 bg-transparent border-b-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        {allTabs.map((tab, index) => {
          const Icon = tab.icon
          const isActivitiesTab = tab.id === 'activities'
          const isLast = index === allTabs.length - 1

          if (tab.hidden) return null

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                // Active state (only if not disabled)
                !tab.disabled && [
                  "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                  "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                  "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600",
                ],
                // Disabled state
                tab.disabled && "text-gray-400 cursor-not-allowed",
                // Activities tab gets auto margin left on desktop
                isActivitiesTab && "md:ml-auto"
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.showLock && tab.disabled && (
                <Lock className="w-3 h-3 ml-2" />
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </div>
  )
}
