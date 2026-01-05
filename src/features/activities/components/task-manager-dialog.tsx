'use client'

import { useState } from 'react'
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
import { Loader2, CheckSquare, Save, Calendar as CalendarIcon, Bell } from 'lucide-react'
import { useCreateActivity } from '../hooks'
import { ActivityTypeCode, PriorityCode, getPriorityLabel, getPriorityColor } from '@/core/contracts/enums'
import type { CreateActivityDto } from '@/core/contracts/entities/activity'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays, addHours, isAfter, isBefore, startOfToday } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regardingId?: string
  regardingType?: string
  regardingName?: string
}

interface TaskFormData {
  subject: string
  description?: string
  dueDate?: Date
  priority: PriorityCode
  reminderEnabled: boolean
  reminderTime?: Date
}

/**
 * Task Manager Dialog Component
 *
 * Dialog completo para crear y gestionar tareas con:
 * - Priority levels (Low, Normal, High, Urgent)
 * - Due dates con calendar picker
 * - Reminder configuration
 * - Color coding por prioridad
 * - Validation de fechas (no pasadas)
 */
export function TaskManagerDialog({
  open,
  onOpenChange,
  regardingId,
  regardingType,
  regardingName,
}: TaskManagerDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateActivity()
  const [dueDate, setDueDate] = useState<Date>()
  const [reminderDate, setReminderDate] = useState<Date>()
  const [reminderEnabled, setReminderEnabled] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      subject: '',
      description: '',
      priority: PriorityCode.Normal,
      reminderEnabled: false,
    },
  })

  const priority = watch('priority')

  const handleDueDateSelect = (date: Date | undefined) => {
    setDueDate(date)

    // Auto-set reminder to 1 day before if due date is selected
    if (date && reminderEnabled) {
      const defaultReminder = addDays(date, -1)
      if (isAfter(defaultReminder, new Date())) {
        setReminderDate(defaultReminder)
      }
    }
  }

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled)

    if (enabled && dueDate) {
      // Set default reminder to 1 day before due date
      const defaultReminder = addDays(dueDate, -1)
      if (isAfter(defaultReminder, new Date())) {
        setReminderDate(defaultReminder)
      } else {
        setReminderDate(addHours(new Date(), 1))
      }
    } else {
      setReminderDate(undefined)
    }
  }

  const getDueDateStatus = (date?: Date) => {
    if (!date) return null

    const today = startOfToday()
    const dueDateStart = new Date(date)
    dueDateStart.setHours(0, 0, 0, 0)

    if (isBefore(dueDateStart, today)) {
      return { label: 'Overdue', color: 'text-red-600 bg-red-100' }
    } else if (dueDateStart.getTime() === today.getTime()) {
      return { label: 'Due Today', color: 'text-orange-600 bg-orange-100' }
    } else if (isBefore(dueDateStart, addDays(today, 7))) {
      return { label: 'Due Soon', color: 'text-yellow-600 bg-yellow-100' }
    } else {
      return { label: 'Upcoming', color: 'text-green-600 bg-green-100' }
    }
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (!dueDate) {
        toast({
          title: 'Validation Error',
          description: 'Due date is required',
          variant: 'destructive',
        })
        return
      }

      // Build task description with priority and reminder info
      const taskDetails = `
TASK DETAILS
Priority: ${getPriorityLabel(data.priority)}
Due Date: ${format(dueDate, 'PPP')}
${reminderEnabled && reminderDate ? `Reminder: ${format(reminderDate, 'PPP p')}` : ''}

DESCRIPTION:
${data.description || 'No description provided'}
`.trim()

      const dto: CreateActivityDto = {
        activitytypecode: ActivityTypeCode.Task,
        subject: data.subject,
        description: taskDetails,
        scheduledstart: new Date().toISOString(),
        scheduledend: dueDate.toISOString(),
        prioritycode: data.priority,
        regardingobjectid: regardingId,
        regardingobjectidtype: regardingType,
        ownerid: 'user-1', // TODO: Get from auth context
      }

      await createMutation.mutateAsync(dto)

      toast({
        title: 'Task created',
        description: `Task "${data.subject}" has been created with ${getPriorityLabel(data.priority).toLowerCase()} priority`,
      })

      reset()
      setDueDate(undefined)
      setReminderDate(undefined)
      setReminderEnabled(false)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      })
    }
  }

  const dueDateStatus = getDueDateStatus(dueDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Create Task
          </DialogTitle>
          <DialogDescription>
            {regardingName && `Regarding: ${regardingName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Task Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Follow up with client, Send proposal, Schedule demo"
              {...register('subject', {
                required: 'Task subject is required',
              })}
              className={errors.subject ? 'border-destructive' : ''}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Priority and Due Date Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Priority */}
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={priority?.toString()}
                onValueChange={(value) => setValue('priority', parseInt(value) as PriorityCode)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PriorityCode.Low.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', getPriorityColor(PriorityCode.Low))}>
                        Low
                      </Badge>
                      <span className="text-muted-foreground">- Can wait</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={PriorityCode.Normal.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', getPriorityColor(PriorityCode.Normal))}>
                        Normal
                      </Badge>
                      <span className="text-muted-foreground">- Standard priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={PriorityCode.High.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', getPriorityColor(PriorityCode.High))}>
                        High
                      </Badge>
                      <span className="text-muted-foreground">- Important</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={PriorityCode.Urgent.toString()}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', getPriorityColor(PriorityCode.Urgent))}>
                        Urgent
                      </Badge>
                      <span className="text-muted-foreground">- Critical</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDueDateSelect}
                    disabled={(date) => isBefore(date, startOfToday())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDateStatus && (
                <Badge variant="outline" className={cn('text-xs', dueDateStatus.color)}>
                  {dueDateStatus.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add task details, context, or specific actions needed..."
              className="min-h-[100px]"
              {...register('description')}
            />
          </div>

          {/* Reminder Section */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="reminder" className="cursor-pointer">Set Reminder</Label>
              </div>
              <Button
                type="button"
                variant={reminderEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReminderToggle(!reminderEnabled)}
              >
                {reminderEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {reminderEnabled && (
              <div className="space-y-1.5">
                <Label>Remind me on</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !reminderDate && 'text-muted-foreground'
                      )}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {reminderDate ? format(reminderDate, 'PPP p') : 'Pick reminder date & time'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      disabled={(date) => isBefore(date, new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Note: This is a simulated reminder. In production, this would trigger a notification.
                </p>
              </div>
            )}
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
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
