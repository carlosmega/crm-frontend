'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Calendar as CalendarIcon, Save, MapPin, Users, Clock } from 'lucide-react'
import { useCreateActivity } from '../hooks'
import { ActivityTypeCode } from '@/core/contracts/enums'
import type { CreateActivityDto } from '@/core/contracts/entities/activity'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'
import { format, addMinutes, isBefore, startOfToday } from 'date-fns'
import { cn } from '@/lib/utils'

interface MeetingSchedulerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regardingId?: string
  regardingType?: string
  regardingName?: string
}

interface MeetingFormData {
  subject: string
  location: string
  locationType: 'virtual' | 'physical'
  description?: string
  attendees?: string
  duration: number
}

const DURATION_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: 'Half day (4 hours)', value: 240 },
  { label: 'Full day (8 hours)', value: 480 },
]

/**
 * Meeting Scheduler Dialog Component
 *
 * Dialog completo para agendar reuniones con:
 * - Calendar picker para fecha/hora
 * - Duration presets
 * - Location (virtual/physical)
 * - Attendees list
 * - Meeting notes
 */
export function MeetingSchedulerDialog({
  open,
  onOpenChange,
  regardingId,
  regardingType,
  regardingName,
}: MeetingSchedulerDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const createMutation = useCreateActivity()
  const [startDate, setStartDate] = useState<Date>()
  const [startTime, setStartTime] = useState<string>('09:00')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      subject: '',
      location: '',
      locationType: 'virtual',
      description: '',
      attendees: '',
      duration: 60,
    },
  })

  const locationType = watch('locationType')
  const duration = watch('duration')

  const getStartDateTime = () => {
    if (!startDate || !startTime) return null

    const [hours, minutes] = startTime.split(':').map(Number)
    const dateTime = new Date(startDate)
    dateTime.setHours(hours, minutes, 0, 0)
    return dateTime
  }

  const getEndDateTime = () => {
    const startDateTime = getStartDateTime()
    if (!startDateTime) return null

    return addMinutes(startDateTime, duration)
  }

  const onSubmit = async (data: MeetingFormData) => {
    try {
      const startDateTime = getStartDateTime()
      const endDateTime = getEndDateTime()

      if (!startDateTime || !endDateTime) {
        toast({
          title: 'Validation Error',
          description: 'Please select a start date and time',
          variant: 'destructive',
        })
        return
      }

      if (isBefore(startDateTime, new Date())) {
        toast({
          title: 'Validation Error',
          description: 'Cannot schedule a meeting in the past',
          variant: 'destructive',
        })
        return
      }

      // Build meeting description
      const meetingDetails = `
MEETING DETAILS
Date & Time: ${format(startDateTime, 'PPP p')} - ${format(endDateTime, 'p')}
Duration: ${duration} minutes
Location Type: ${data.locationType === 'virtual' ? 'Virtual Meeting' : 'Physical Location'}
Location: ${data.location || 'Not specified'}
${data.attendees ? `\nAttendees:\n${data.attendees}` : ''}

${data.description ? `\nNOTES:\n${data.description}` : ''}
`.trim()

      const dto: CreateActivityDto = {
        activitytypecode: ActivityTypeCode.Appointment,
        subject: data.subject,
        description: meetingDetails,
        scheduledstart: startDateTime.toISOString(),
        scheduledend: endDateTime.toISOString(),
        regardingobjectid: regardingId,
        regardingobjectidtype: regardingType,
        ownerid: session?.user?.id || 'anonymous',
      }

      await createMutation.mutateAsync(dto)

      toast({
        title: 'Meeting scheduled',
        description: `Meeting "${data.subject}" has been scheduled for ${format(startDateTime, 'PPP p')}`,
      })

      reset()
      setStartDate(undefined)
      setStartTime('09:00')
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule meeting',
        variant: 'destructive',
      })
    }
  }

  const endDateTime = getEndDateTime()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>
            {regardingName && `Regarding: ${regardingName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Meeting Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Meeting Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Kickoff meeting, Demo presentation, Strategy review"
              {...register('subject', {
                required: 'Meeting subject is required',
              })}
              className={errors.subject ? 'border-destructive' : ''}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Date and Time Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Start Date */}
            <div className="space-y-1.5 md:col-span-1">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => isBefore(date, startOfToday())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Time *</Label>
              <TimePicker
                value={startTime}
                onChange={(time) => setStartTime(time)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration *</Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setValue('duration', parseInt(value))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value.toString()}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Time Display */}
          {endDateTime && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Meeting ends at <strong>{format(endDateTime, 'p')}</strong> on{' '}
                <strong>{format(endDateTime, 'PP')}</strong>
              </span>
            </div>
          )}

          {/* Location Type */}
          <div className="space-y-1.5">
            <Label htmlFor="locationType">Location Type *</Label>
            <Select
              value={locationType}
              onValueChange={(value) => setValue('locationType', value as 'virtual' | 'physical')}
            >
              <SelectTrigger id="locationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>Virtual Meeting (Teams, Zoom, etc.)</span>
                  </div>
                </SelectItem>
                <SelectItem value="physical">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Physical Location</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location">
              {locationType === 'virtual' ? 'Meeting Link' : 'Location'} *
            </Label>
            <Input
              id="location"
              placeholder={
                locationType === 'virtual'
                  ? 'https://teams.microsoft.com/...'
                  : 'Conference Room A, Building 1'
              }
              {...register('location', {
                required: 'Location is required',
              })}
              className={errors.location ? 'border-destructive' : ''}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-1.5">
            <Label htmlFor="attendees">
              <Users className="inline h-4 w-4 mr-1" />
              Attendees (Optional)
            </Label>
            <Textarea
              id="attendees"
              placeholder="List attendees (one per line)&#10;e.g.,&#10;John Doe (john@example.com)&#10;Jane Smith (jane@example.com)"
              className="min-h-[80px]"
              {...register('attendees')}
            />
            <p className="text-xs text-muted-foreground">
              Note: In production, this would integrate with your contact list
            </p>
          </div>

          {/* Description / Agenda */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Meeting Agenda / Notes</Label>
            <Textarea
              id="description"
              placeholder="Add meeting agenda, topics to discuss, or preparation notes..."
              className="min-h-[100px]"
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
