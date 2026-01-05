"use client"

import type { Activity } from '@/core/contracts'
import { ActivityStateCode } from '@/core/contracts/enums'
import { getActivityTypeLabel, getActivityTypeIcon } from '@/core/contracts/enums/activity-type'
import { getActivityStateLabel } from '@/core/contracts/enums/activity-state'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/shared/utils/formatters'
import * as Icons from 'lucide-react'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityInfoHeaderProps {
  activity: Activity
  className?: string
}

/**
 * ActivityInfoHeader Component
 *
 * Displays key activity information in a compact header format.
 * Matches the pattern used in AccountInfoHeader and ProductInfoHeader.
 *
 * Shows:
 * - Row 1: Subject + Type badge + State badge
 * - Row 2: Scheduled time, Duration, Owner
 * - Row 3: Description preview
 */
export function ActivityInfoHeader({ activity, className }: ActivityInfoHeaderProps) {
  const iconName = getActivityTypeIcon(activity.activitytypecode)
  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  const isOverdue = activity.statecode === ActivityStateCode.Open &&
    activity.scheduledend &&
    new Date(activity.scheduledend) < new Date()

  const getStateBadgeVariant = () => {
    if (activity.statecode === ActivityStateCode.Completed) return 'default'
    if (activity.statecode === ActivityStateCode.Canceled) return 'secondary'
    return 'outline'
  }

  return (
    <div className={cn("border-b py-4", className)}>
      <div className="space-y-3">
        {/* Row 1: Subject + Icon + Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {Icon && <Icon className="h-6 w-6 text-primary shrink-0" />}
          <h1 className="text-2xl font-bold">{activity.subject}</h1>
          <Badge variant="outline">
            {getActivityTypeLabel(activity.activitytypecode)}
          </Badge>
          <Badge variant={getStateBadgeVariant()}>
            {getActivityStateLabel(activity.statecode)}
          </Badge>
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>

        {/* Row 2: Scheduled time, Duration, Owner */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {activity.scheduledstart && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDateTime(activity.scheduledstart)}
                {activity.scheduledend && ` - ${formatDateTime(activity.scheduledend)}`}
              </span>
            </div>
          )}
          {activity.actualdurationminutes && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{activity.actualdurationminutes} min</span>
            </div>
          )}
          {activity.ownerid && (
            <div className="text-muted-foreground">
              Owner: <span className="text-foreground">{activity.ownerid}</span>
            </div>
          )}
        </div>

        {/* Row 3: Description Preview */}
        {activity.description && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </div>
        )}
      </div>
    </div>
  )
}
