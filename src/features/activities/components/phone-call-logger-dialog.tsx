'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Phone, Save, Play, Pause, Square, Clock } from 'lucide-react'
import { useCreateActivity } from '../hooks'
import { ActivityTypeCode } from '@/core/contracts/enums'
import type { CreateActivityDto } from '@/core/contracts/entities/activity'
import { Card, CardContent } from '@/components/ui/card'

interface PhoneCallLoggerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regardingId?: string
  regardingType?: string
  regardingName?: string
  phoneNumber?: string
}

interface PhoneCallFormData {
  phoneNumber: string
  direction: 'inbound' | 'outbound'
  purpose: string
  outcome: string
  notes: string
  nextSteps?: string
}

/**
 * Phone Call Logger Dialog Component
 *
 * Dialog mejorado para logging de llamadas telefónicas con:
 * - Timer de duración
 * - Notas estructuradas (purpose, outcome, next steps)
 * - Dirección de llamada (inbound/outbound)
 */
export function PhoneCallLoggerDialog({
  open,
  onOpenChange,
  regardingId,
  regardingType,
  regardingName,
  phoneNumber: defaultPhoneNumber,
}: PhoneCallLoggerDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const createMutation = useCreateActivity()

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PhoneCallFormData>({
    defaultValues: {
      phoneNumber: defaultPhoneNumber || '',
      direction: 'outbound',
      purpose: '',
      outcome: '',
      notes: '',
      nextSteps: '',
    },
  })

  const direction = watch('direction')

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  // Reset timer when dialog closes
  useEffect(() => {
    if (!open) {
      setIsTimerRunning(false)
      setElapsedSeconds(0)
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => setIsTimerRunning(true)
  const pauseTimer = () => setIsTimerRunning(false)
  const stopTimer = () => {
    setIsTimerRunning(false)
    setElapsedSeconds(0)
  }

  const onSubmit = async (data: PhoneCallFormData) => {
    try {
      // Build structured phone call description
      const callDetails = `
PHONE CALL - ${data.direction === 'inbound' ? 'INCOMING' : 'OUTGOING'}
Phone Number: ${data.phoneNumber}
Duration: ${formatTime(elapsedSeconds)}

PURPOSE:
${data.purpose}

OUTCOME:
${data.outcome}

NOTES:
${data.notes}

${data.nextSteps ? `NEXT STEPS:\n${data.nextSteps}` : ''}
`.trim()

      const dto: CreateActivityDto = {
        activitytypecode: ActivityTypeCode.PhoneCall,
        subject: `${data.direction === 'inbound' ? 'Incoming' : 'Outgoing'} call - ${data.purpose.substring(0, 50)}`,
        description: callDetails,
        scheduledstart: new Date().toISOString(),
        scheduledend: new Date(Date.now() + elapsedSeconds * 1000).toISOString(),
        regardingobjectid: regardingId,
        regardingobjectidtype: regardingType,
        ownerid: session?.user?.id || 'anonymous',
      }

      await createMutation.mutateAsync(dto)

      toast({
        title: 'Phone call logged',
        description: `${data.direction === 'inbound' ? 'Incoming' : 'Outgoing'} call logged successfully`,
      })

      reset()
      setElapsedSeconds(0)
      setIsTimerRunning(false)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to log phone call',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Log Phone Call
          </DialogTitle>
          <DialogDescription>
            {regardingName && `Regarding: ${regardingName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Timer Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Call Duration</p>
                    <p className="text-2xl font-bold font-mono tabular-nums">{formatTime(elapsedSeconds)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning && elapsedSeconds === 0 && (
                    <Button type="button" onClick={startTimer} variant="default">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {isTimerRunning && (
                    <Button type="button" onClick={pauseTimer} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {!isTimerRunning && elapsedSeconds > 0 && (
                    <Button type="button" onClick={startTimer} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  {elapsedSeconds > 0 && (
                    <Button type="button" onClick={stopTimer} variant="outline">
                      <Square className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                })}
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="direction">Call Direction</Label>
              <Select
                value={direction}
                onValueChange={(value) => setValue('direction', value as 'inbound' | 'outbound')}
              >
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound (I called them)</SelectItem>
                  <SelectItem value="inbound">Inbound (They called me)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Structured Notes */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Call Purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g., Follow-up on proposal, Discovery call, Support issue"
                {...register('purpose', {
                  required: 'Purpose is required',
                })}
                className={errors.purpose ? 'border-destructive' : ''}
              />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="outcome">Call Outcome *</Label>
              <Textarea
                id="outcome"
                placeholder="Summarize the outcome of the call..."
                className="min-h-[80px]"
                {...register('outcome', {
                  required: 'Outcome is required',
                })}
              />
              {errors.outcome && (
                <p className="text-sm text-destructive">{errors.outcome.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details, concerns, or observations..."
                className="min-h-[100px]"
                {...register('notes')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nextSteps">Next Steps (Optional)</Label>
              <Textarea
                id="nextSteps"
                placeholder="What actions need to be taken? Who is responsible?"
                className="min-h-[60px]"
                {...register('nextSteps')}
              />
            </div>
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
              Save Call Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
