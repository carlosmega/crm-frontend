'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Loader2, Save } from 'lucide-react'
import { useUpdateActivity } from '../hooks'
import type { Activity, UpdateActivityDto } from '@/core/contracts/entities/activity'

interface EditActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: Activity
}

interface ActivityFormData {
  subject: string
  description?: string
  scheduledstart?: Date
  scheduledend?: Date
  prioritycode?: string
}

/**
 * Edit Activity Dialog Component
 *
 * Modal para editar una actividad existente
 */
export function EditActivityDialog({
  open,
  onOpenChange,
  activity,
}: EditActivityDialogProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateActivity()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      subject: activity.subject,
      description: activity.description || '',
      scheduledstart: activity.scheduledstart
        ? new Date(activity.scheduledstart)
        : undefined,
      scheduledend: activity.scheduledend
        ? new Date(activity.scheduledend)
        : undefined,
      prioritycode: activity.prioritycode?.toString() || '1',
    },
  })

  // Update form when activity changes
  useEffect(() => {
    if (activity) {
      reset({
        subject: activity.subject,
        description: activity.description || '',
        scheduledstart: activity.scheduledstart
          ? new Date(activity.scheduledstart)
          : undefined,
        scheduledend: activity.scheduledend
          ? new Date(activity.scheduledend)
          : undefined,
        prioritycode: activity.prioritycode?.toString() || '1',
      })
    }
  }, [activity, reset])

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const dto: UpdateActivityDto = {
        subject: data.subject,
        description: data.description,
        scheduledstart: data.scheduledstart?.toISOString(),
        scheduledend: data.scheduledend?.toISOString(),
        prioritycode: data.prioritycode ? parseInt(data.prioritycode) : undefined,
      }

      await updateMutation.mutateAsync({
        id: activity.activityid,
        dto,
      })

      toast({
        title: 'Activity updated',
        description: 'Activity has been updated successfully',
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update activity',
        variant: 'destructive',
      })
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Update the activity details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter activity subject"
              {...register('subject', {
                required: 'Subject is required',
              })}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter activity description"
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Scheduled Start */}
          <div className="space-y-2">
            <Label htmlFor="scheduledstart">Scheduled Start</Label>
            <Controller
              name="scheduledstart"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select start date and time"
                />
              )}
            />
          </div>

          {/* Scheduled End */}
          <div className="space-y-2">
            <Label htmlFor="scheduledend">Scheduled End</Label>
            <Controller
              name="scheduledend"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select end date and time"
                />
              )}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="prioritycode">Priority</Label>
            <select
              id="prioritycode"
              {...register('prioritycode')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="0">Low</option>
              <option value="1">Normal</option>
              <option value="2">High</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
