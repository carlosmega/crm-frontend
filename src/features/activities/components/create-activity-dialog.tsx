'use client'

import { useSession } from 'next-auth/react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Loader2, Plus } from 'lucide-react'
import { useCreateActivity } from '../hooks'
import { ActivityTypeCode, getActivityTypeLabel } from '@/core/contracts/enums'
import type { CreateActivityDto } from '@/core/contracts/entities/activity'
import { Input } from '@/components/ui/input'

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regardingId?: string
  regardingType?: string
  regardingName?: string
}

interface ActivityFormData {
  activitytype: string
  subject: string
  description?: string
  scheduledstart?: Date
  scheduledend?: Date
}

/**
 * Create Activity Dialog Component
 *
 * Modal para crear una nueva actividad
 */
export function CreateActivityDialog({
  open,
  onOpenChange,
  regardingId,
  regardingType,
  regardingName,
}: CreateActivityDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const createMutation = useCreateActivity()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      activitytype: ActivityTypeCode.Task.toString(),
    },
  })

  const activityType = watch('activitytype')

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const dto: CreateActivityDto = {
        activitytypecode: parseInt(data.activitytype) as ActivityTypeCode,
        subject: data.subject,
        description: data.description,
        scheduledstart: data.scheduledstart?.toISOString(),
        scheduledend: data.scheduledend?.toISOString(),
        regardingobjectid: regardingId,
        regardingobjectidtype: regardingType,
        ownerid: session?.user?.id || 'anonymous',
      }

      await createMutation.mutateAsync(dto)

      toast({
        title: 'Activity created',
        description: `${getActivityTypeLabel(parseInt(data.activitytype))} has been created successfully`,
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create activity',
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
          <DialogTitle>New Activity</DialogTitle>
          <DialogDescription>
            Create a new activity
            {regardingName && ` for ${regardingName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activitytype">Activity Type *</Label>
            <Select
              value={activityType}
              onValueChange={(value) => setValue('activitytype', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActivityTypeCode.Email.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.Email)}
                </SelectItem>
                <SelectItem value={ActivityTypeCode.PhoneCall.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.PhoneCall)}
                </SelectItem>
                <SelectItem value={ActivityTypeCode.Task.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.Task)}
                </SelectItem>
                <SelectItem value={ActivityTypeCode.Appointment.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.Appointment)}
                </SelectItem>
                <SelectItem value={ActivityTypeCode.Meeting.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.Meeting)}
                </SelectItem>
                <SelectItem value={ActivityTypeCode.Note.toString()}>
                  {getActivityTypeLabel(ActivityTypeCode.Note)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Plus className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
