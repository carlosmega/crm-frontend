'use client'

import { useState, useMemo } from 'react'
import type { Activity } from '@/core/contracts/entities/activity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ActivityTypeCode,
  getActivityTypeLabel,
  getActivityTypeIcon,
  getActivityTypeColor,
  getActivityStateLabel,
  getActivityStateColor,
} from '@/core/contracts/enums'
import { useActivitiesByRegarding } from '../hooks'
import { Plus, Filter, Mail, Phone, CheckSquare, Calendar, Users, StickyNote } from 'lucide-react'
import { ActivityTimelineItem } from './activity-timeline-item'
import { CreateActivityDialog } from './create-activity-dialog'

interface ActivityTimelineProps {
  regardingId: string
  regardingType: 'lead' | 'opportunity' | 'account' | 'contact' | 'quote' | 'order' | 'invoice' | 'product'
  regardingName?: string
}

type FilterType = 'all' | ActivityTypeCode

/**
 * Activity Timeline Component
 *
 * Muestra todas las actividades relacionadas a un registro (Lead, Opportunity, etc.)
 * en formato de timeline chronológico
 *
 * Features:
 * - Timeline vertical ordenado por fecha
 * - Filtros por tipo de actividad
 * - Crear nueva actividad
 * - Ver detalles de actividad
 * - Marcar como completada
 */
export function ActivityTimeline({
  regardingId,
  regardingType,
  regardingName,
}: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: activities, isLoading } = useActivitiesByRegarding(
    regardingId,
    regardingType
  )

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (!activities) return []
    if (filterType === 'all') return activities
    return activities.filter((a) => a.activitytypecode === filterType)
  }, [activities, filterType])

  // Count by type
  const counts = useMemo(() => {
    if (!activities) return {}
    return activities.reduce((acc, activity) => {
      const type = activity.activitytypecode
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<number, number>)
  }, [activities])

  const filterButtons: { type: FilterType; icon: any; label: string }[] = [
    { type: 'all', icon: Filter, label: 'All' },
    { type: ActivityTypeCode.Email, icon: Mail, label: 'Emails' },
    { type: ActivityTypeCode.PhoneCall, icon: Phone, label: 'Calls' },
    { type: ActivityTypeCode.Task, icon: CheckSquare, label: 'Tasks' },
    { type: ActivityTypeCode.Appointment, icon: Calendar, label: 'Appointments' },
    { type: ActivityTypeCode.Meeting, icon: Users, label: 'Meetings' },
    { type: ActivityTypeCode.Note, icon: StickyNote, label: 'Notes' },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Activity
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => {
              const Icon = btn.icon
              const count = btn.type === 'all'
                ? activities?.length || 0
                : counts[btn.type] || 0
              const isActive = filterType === btn.type

              return (
                <Button
                  key={btn.type}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(btn.type)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {btn.label}
                  {count > 0 && (
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className="ml-1"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Timeline */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-gray-500">
                {filterType === 'all'
                  ? 'No activities yet. Create your first activity to get started.'
                  : `No ${getActivityTypeLabel(filterType).toLowerCase()}s found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <ActivityTimelineItem
                  key={activity.activityid}
                  activity={activity}
                  isLast={index === filteredActivities.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Activity Dialog */}
      <CreateActivityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        regardingId={regardingId}
        regardingType={regardingType}
        regardingName={regardingName}
      />
    </>
  )
}
