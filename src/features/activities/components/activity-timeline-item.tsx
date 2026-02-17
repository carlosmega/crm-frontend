'use client'

import { useState, memo, useMemo, useCallback } from 'react'
import type { Activity } from '@/core/contracts/entities/activity'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ActivityTypeCode,
  ActivityStateCode,
  getActivityTypeIcon,
  getActivityTypeColor,
  getActivityStateLabel,
  getActivityStateColor,
} from '@/core/contracts/enums'
import { useCompleteActivity } from '../hooks'
import { Mail, Phone, CheckSquare, Calendar, Users, StickyNote, Circle, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityTimelineItemProps {
  activity: Activity
  isLast?: boolean
}

const iconMap = {
  Mail,
  Phone,
  CheckSquare,
  Calendar,
  Users,
  StickyNote,
  Circle,
}

/**
 * Activity Timeline Item Component
 *
 * Representa un item individual en el timeline
 */
export const ActivityTimelineItem = memo(function ActivityTimelineItem({ activity, isLast = false }: ActivityTimelineItemProps) {
  const [expanded, setExpanded] = useState(false)
  const completeMutation = useCompleteActivity()

  const { Icon, iconColor, stateColor, displayDate, isOverdue } = useMemo(() => {
    const iconName = getActivityTypeIcon(activity.activitytypecode)
    return {
      Icon: iconMap[iconName as keyof typeof iconMap] || Circle,
      iconColor: getActivityTypeColor(activity.activitytypecode),
      stateColor: getActivityStateColor(activity.statecode),
      displayDate: activity.actualend || activity.actualstart || activity.scheduledstart || activity.createdon,
      isOverdue: activity.statecode === ActivityStateCode.Open &&
        activity.scheduledend &&
        new Date(activity.scheduledend) < new Date(),
    }
  }, [activity])

  const handleComplete = useCallback(async () => {
    try {
      await completeMutation.mutateAsync({
        id: activity.activityid,
        dto: {
          statecode: ActivityStateCode.Completed,
          actualend: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Error completing activity:', error)
    }
  }, [completeMutation, activity.activityid])

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-sm ${iconColor}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm truncate">
                {activity.subject}
              </h4>
              <Badge className={stateColor}>
                {getActivityStateLabel(activity.statecode)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
            </p>
          </div>

          {/* Actions */}
          {activity.statecode === ActivityStateCode.Open && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              className="shrink-0"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>

        {/* Description */}
        {activity.description && (
          <div className="text-sm text-gray-600">
            <p className={expanded ? '' : 'line-clamp-2'}>
              {activity.description}
            </p>
            {activity.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary text-xs hover:underline mt-1"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          {activity.scheduledstart && (
            <div>
              <span className="font-medium">Scheduled:</span>{' '}
              {new Date(activity.scheduledstart).toLocaleString()}
            </div>
          )}
          {activity.actualdurationminutes && (
            <div>
              <span className="font-medium">Duration:</span>{' '}
              {activity.actualdurationminutes} min
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
