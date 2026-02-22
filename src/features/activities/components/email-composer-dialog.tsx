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
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, Send, X, Plus } from 'lucide-react'
import { useCreateActivity } from '../hooks'
import { ActivityTypeCode } from '@/core/contracts/enums'
import type { CreateActivityDto } from '@/core/contracts/entities/activity'
import { Badge } from '@/components/ui/badge'

interface EmailComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regardingId?: string
  regardingType?: string
  regardingName?: string
  to?: string
  subject?: string
}

interface EmailFormData {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}

/**
 * Email Composer Dialog Component
 *
 * Modal simulado para enviar emails (registra como activity Email)
 * Incluye To/CC/BCC, subject, y body con rich text básico
 */
export function EmailComposerDialog({
  open,
  onOpenChange,
  regardingId,
  regardingType,
  regardingName,
  to: defaultTo,
  subject: defaultSubject,
}: EmailComposerDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const createMutation = useCreateActivity()
  const [ccVisible, setCcVisible] = useState(false)
  const [bccVisible, setBccVisible] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    defaultValues: {
      to: defaultTo || '',
      subject: defaultSubject || '',
      cc: '',
      bcc: '',
      body: '',
    },
  })

  const onSubmit = async (data: EmailFormData) => {
    try {
      // Construir descripción completa del email
      const emailDetails = `
TO: ${data.to}
${data.cc ? `CC: ${data.cc}\n` : ''}${data.bcc ? `BCC: ${data.bcc}\n` : ''}
SUBJECT: ${data.subject}

---

${data.body}
`.trim()

      // Generate tracking token if regarding context exists
      let finalSubject = data.subject || 'No Subject'
      if (regardingId && regardingType) {
        const typeMap: Record<string, string> = {
          opportunity: 'OPP',
          account: 'ACC',
          contact: 'CON',
          lead: 'LEAD',
          quote: 'QUOTE',
          order: 'ORD',
          invoice: 'INV',
        }
        const typeCode = typeMap[regardingType] || regardingType.toUpperCase().slice(0, 5)
        const shortId = regardingId.replace(/-/g, '').slice(0, 8)
        const token = `[CRM:${typeCode}-${shortId}]`
        if (!finalSubject.includes('[CRM:')) {
          finalSubject = `${finalSubject} ${token}`
        }
      }

      const dto: CreateActivityDto = {
        activitytypecode: ActivityTypeCode.Email,
        subject: finalSubject,
        description: emailDetails,
        scheduledstart: new Date().toISOString(),
        regardingobjectid: regardingId,
        regardingobjectidtype: regardingType,
        ownerid: session?.user?.id || 'anonymous',
      }

      await createMutation.mutateAsync(dto)

      toast({
        title: 'Email sent',
        description: `Email sent to ${data.to} successfully`,
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            New Email
          </DialogTitle>
          <DialogDescription>
            {regardingName && `Regarding: ${regardingName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Recipients Section */}
          <div className="space-y-3">
            {/* To Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="to" className="w-12 text-sm">To</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  {...register('to', {
                    required: 'Recipient email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className={errors.to ? 'border-destructive' : ''}
                />
                <div className="flex gap-1">
                  {!ccVisible && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCcVisible(true)}
                    >
                      Cc
                    </Button>
                  )}
                  {!bccVisible && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBccVisible(true)}
                    >
                      Bcc
                    </Button>
                  )}
                </div>
              </div>
              {errors.to && (
                <p className="text-sm text-destructive ml-14">{errors.to.message}</p>
              )}
            </div>

            {/* CC Field */}
            {ccVisible && (
              <div className="flex items-center gap-2">
                <Label htmlFor="cc" className="w-12 text-sm">Cc</Label>
                <Input
                  id="cc"
                  type="email"
                  placeholder="cc@example.com"
                  {...register('cc')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCcVisible(false)
                    reset({ ...register, cc: '' })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* BCC Field */}
            {bccVisible && (
              <div className="flex items-center gap-2">
                <Label htmlFor="bcc" className="w-12 text-sm">Bcc</Label>
                <Input
                  id="bcc"
                  type="email"
                  placeholder="bcc@example.com"
                  {...register('bcc')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBccVisible(false)
                    reset({ ...register, bcc: '' })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Subject Field */}
            <div className="flex items-center gap-2">
              <Label htmlFor="subject" className="w-12 text-sm">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                {...register('subject', {
                  required: 'Subject is required',
                })}
                className={errors.subject ? 'border-destructive' : ''}
              />
            </div>
            {errors.subject && (
              <p className="text-sm text-destructive ml-14">{errors.subject.message}</p>
            )}
          </div>

          {/* Body Field - Rich Text Simulation */}
          <div className="flex-1 overflow-hidden flex flex-col gap-2">
            <Label htmlFor="body" className="text-sm">Message</Label>
            <Textarea
              id="body"
              placeholder="Type your message here..."
              className="flex-1 resize-none min-h-[200px] font-sans"
              {...register('body', {
                required: 'Message body is required',
              })}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Footer with Actions */}
          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Simulated</Badge>
              <span>This email will be logged as an activity</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Email
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
