'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, Send, X, Paperclip } from 'lucide-react'
import { useSendDocumentEmail } from '@/features/activities/hooks'
import { useTranslation } from '@/shared/hooks/use-translation'

export type DocumentType = 'quote' | 'order' | 'invoice'

export interface SendDocumentEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: DocumentType
  documentId: string
  documentNumber: string
  documentName: string
  customerEmail?: string
  customerName?: string
  totalAmount?: string
  onGeneratePdf: () => Promise<Blob>
}

interface EmailFormData {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  quote: 'Quote',
  order: 'Order',
  invoice: 'Invoice',
}

export function SendDocumentEmailDialog({
  open,
  onOpenChange,
  documentType,
  documentId,
  documentNumber,
  documentName,
  customerEmail,
  customerName,
  totalAmount,
  onGeneratePdf,
}: SendDocumentEmailDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t: tc } = useTranslation('common')
  const sendEmailMutation = useSendDocumentEmail()
  const [ccVisible, setCcVisible] = useState(false)
  const [bccVisible, setBccVisible] = useState(false)
  const [attachPdf, setAttachPdf] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const docLabel = DOCUMENT_LABELS[documentType]
  const senderName = session?.user?.name || 'Sales Team'

  const defaultSubject = `${docLabel}: ${documentNumber} - ${documentName}`
  const defaultBody = `Dear ${customerName || 'Customer'},\n\nPlease find attached the ${docLabel.toLowerCase()} ${documentNumber} for your review.\n${totalAmount ? `\nTotal: ${totalAmount}\n` : ''}\nBest regards,\n${senderName}`

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    defaultValues: {
      to: customerEmail || '',
      subject: defaultSubject,
      cc: '',
      bcc: '',
      body: defaultBody,
    },
  })

  // Reset form ONLY when dialog opens (not on every prop change)
  const prevOpen = useRef(false)
  useEffect(() => {
    if (open && !prevOpen.current) {
      reset({
        to: customerEmail || '',
        subject: defaultSubject,
        cc: '',
        bcc: '',
        body: defaultBody,
      })
      setCcVisible(false)
      setBccVisible(false)
      setAttachPdf(true)
    }
    prevOpen.current = open
  }, [open, customerEmail, defaultSubject, defaultBody, reset])

  const onSubmit = async (data: EmailFormData) => {
    try {
      setIsSending(true)

      // Generate PDF if attachment is enabled
      let pdfBlob: Blob | undefined
      let pdfFilename: string | undefined
      if (attachPdf) {
        try {
          const blob = await onGeneratePdf()
          if (blob && blob.size > 0) {
            pdfBlob = blob
            pdfFilename = `${docLabel}-${documentNumber}.pdf`
          }
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError)
          toast({
            title: 'PDF generation failed',
            description: 'The email will be sent without the PDF attachment.',
            variant: 'destructive',
          })
        }
      }

      await sendEmailMutation.mutateAsync({
        to: data.to,
        subject: data.subject,
        body: data.body,
        documentType,
        documentId,
        senderName,
        cc: data.cc || undefined,
        bcc: data.bcc || undefined,
        pdfBlob,
        pdfFilename,
      })

      toast({
        title: tc('email.sentSuccess'),
        description: `${tc('email.sentDescription', { to: data.to })}`,
      })

      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: tc('errors.error') || 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {tc('email.sendDocumentTitle', { document: docLabel })}
          </DialogTitle>
          <DialogDescription>
            {documentNumber} - {documentName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Recipients Section */}
          <div className="space-y-3">
            {/* To Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="send-to" className="w-14 text-sm font-medium">{tc('email.to')}</Label>
                <Input
                  id="send-to"
                  type="email"
                  placeholder="recipient@example.com"
                  {...register('to', {
                    required: tc('email.emailRequired'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: tc('email.emailInvalid'),
                    },
                  })}
                  className={errors.to ? 'border-destructive' : ''}
                />
                <div className="flex gap-1">
                  {!ccVisible && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCcVisible(true)}>
                      {tc('email.showCc')}
                    </Button>
                  )}
                  {!bccVisible && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setBccVisible(true)}>
                      {tc('email.showBcc')}
                    </Button>
                  )}
                </div>
              </div>
              {errors.to && (
                <p className="text-sm text-destructive ml-16">{errors.to.message}</p>
              )}
            </div>

            {/* CC Field */}
            {ccVisible && (
              <div className="flex items-center gap-2">
                <Label htmlFor="send-cc" className="w-14 text-sm font-medium">{tc('email.cc')}</Label>
                <Input id="send-cc" type="email" placeholder="cc@example.com" {...register('cc')} />
                <Button type="button" variant="ghost" size="sm" onClick={() => setCcVisible(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* BCC Field */}
            {bccVisible && (
              <div className="flex items-center gap-2">
                <Label htmlFor="send-bcc" className="w-14 text-sm font-medium">{tc('email.bcc')}</Label>
                <Input id="send-bcc" type="email" placeholder="bcc@example.com" {...register('bcc')} />
                <Button type="button" variant="ghost" size="sm" onClick={() => setBccVisible(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Subject Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="send-subject" className="w-14 text-sm font-medium">{tc('email.subject')}</Label>
                <Input
                  id="send-subject"
                  placeholder="Enter subject"
                  {...register('subject', { required: tc('email.subjectRequired') })}
                  className={errors.subject ? 'border-destructive' : ''}
                />
              </div>
              {errors.subject && (
                <p className="text-sm text-destructive ml-16">{errors.subject.message}</p>
              )}
            </div>
          </div>

          {/* Body Field */}
          <div className="flex-1 overflow-hidden flex flex-col gap-2">
            <Label htmlFor="send-body" className="text-sm font-medium">{tc('email.message')}</Label>
            <Textarea
              id="send-body"
              className="flex-1 resize-none min-h-[180px] font-sans"
              {...register('body', { required: tc('email.messageRequired') })}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Attach PDF Checkbox */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              id="attach-pdf"
              checked={attachPdf}
              onCheckedChange={(checked) => setAttachPdf(checked === true)}
            />
            <label htmlFor="attach-pdf" className="flex items-center gap-2 text-sm cursor-pointer">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              {tc('email.attachPdf')} ({docLabel}-{documentNumber}.pdf)
            </label>
          </div>

          {/* Footer */}
          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{tc('email.loggedAsActivity')}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                {tc('buttons.cancel')}
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSending ? tc('email.sending') : tc('email.sendEmail')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
