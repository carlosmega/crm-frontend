'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Building2,
  User,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'
import type { DuplicateDetectionResult } from '../services/duplicate-detection-service'
import type { Lead } from '@/core/contracts/entities/lead'
import type { Account } from '@/core/contracts/entities/account'
import type { Contact } from '@/core/contracts/entities/contact'

interface DuplicateWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicates: DuplicateDetectionResult
  entityType: 'lead' | 'account' | 'contact'
  onContinue: () => void
  onMerge?: (selectedId: string) => void
  onCancel: () => void
}

/**
 * Duplicate Warning Dialog Component
 *
 * Muestra advertencias cuando se detectan posibles duplicados al crear:
 * - Leads (por email, nombre, compañía)
 * - Accounts (por nombre, website, email domain)
 * - Contacts (por email, nombre, cuenta parent)
 *
 * Opciones:
 * - Continue Anyway (crear de todas formas)
 * - Merge (fusionar con existente) - opcional
 * - Cancel (cancelar creación)
 */
export function DuplicateWarningDialog({
  open,
  onOpenChange,
  duplicates,
  entityType,
  onContinue,
  onMerge,
  onCancel,
}: DuplicateWarningDialogProps) {
  const { t } = useTranslation('leads')
  const { t: tc } = useTranslation('common')
  const { hasDuplicates, matches, confidence } = duplicates

  if (!hasDuplicates || matches.length === 0) {
    return null
  }

  const getConfidenceBadge = () => {
    switch (confidence) {
      case 'high':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {tc('confidence.high')}
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="secondary" className="gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            <AlertTriangle className="h-3 w-3" />
            {tc('confidence.medium')}
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {tc('confidence.low')}
          </Badge>
        )
    }
  }

  const getEntityIcon = () => {
    switch (entityType) {
      case 'lead':
        return <User className="h-5 w-5" />
      case 'account':
        return <Building2 className="h-5 w-5" />
      case 'contact':
        return <User className="h-5 w-5" />
    }
  }

  const getEntityLabel = () => {
    return tc(`entities.${entityType}`)
  }

  const renderLeadMatch = (record: Lead) => (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">
          {record.firstname} {record.lastname}
        </span>
      </div>
      {record.companyname && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {record.companyname}
        </div>
      )}
      {record.emailaddress1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          {record.emailaddress1}
        </div>
      )}
      {record.telephone1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {record.telephone1}
        </div>
      )}
    </div>
  )

  const renderAccountMatch = (record: Account) => (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">{record.name}</span>
      </div>
      {record.websiteurl && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {record.websiteurl}
        </div>
      )}
      {record.emailaddress1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          {record.emailaddress1}
        </div>
      )}
      {record.telephone1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {record.telephone1}
        </div>
      )}
    </div>
  )

  const renderContactMatch = (record: Contact) => (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">
          {record.firstname} {record.lastname}
        </span>
      </div>
      {record.jobtitle && (
        <div className="text-muted-foreground">{record.jobtitle}</div>
      )}
      {record.emailaddress1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          {record.emailaddress1}
        </div>
      )}
      {record.telephone1 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {record.telephone1}
        </div>
      )}
    </div>
  )

  const renderMatchRecord = (record: Lead | Account | Contact) => {
    if (entityType === 'lead') return renderLeadMatch(record as Lead)
    if (entityType === 'account') return renderAccountMatch(record as Account)
    if (entityType === 'contact') return renderContactMatch(record as Contact)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            {t('duplicate.title', { entity: getEntityLabel() })}
          </DialogTitle>
          <DialogDescription>
            {matches.length === 1
              ? t('duplicate.foundRecords', { count: matches.length })
              : t('duplicate.foundRecordsPlural', { count: matches.length })}
          </DialogDescription>
        </DialogHeader>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('duplicate.detectionConfidence')}</span>
          {getConfidenceBadge()}
        </div>

        {/* Alert Message */}
        <Alert variant={confidence === 'high' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {confidence === 'high' && t('duplicate.highAlert')}
            {confidence === 'medium' && t('duplicate.mediumAlert')}
            {confidence === 'low' && t('duplicate.lowAlert')}
          </AlertDescription>
        </Alert>

        {/* Matches List */}
        <ScrollArea className="flex-1 max-h-[400px] pr-4">
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={match.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Score Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant={
                          match.score >= 80
                            ? 'destructive'
                            : match.score >= 65
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {t('duplicate.match', { score: match.score })}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {match.matchedFields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Match Details */}
                    {renderMatchRecord(match.record)}

                    {/* Merge Button (if callback provided) */}
                    {onMerge && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          onMerge(match.id)
                          onOpenChange(false)
                        }}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        {t('duplicate.useThisInstead', { entity: getEntityLabel() })}
                      </Button>
                    )}
                  </div>
                </div>

                {index < matches.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel}>
            {tc('buttons.cancel')}
          </Button>
          <Button
            variant={confidence === 'high' ? 'destructive' : 'default'}
            onClick={() => {
              onContinue()
              onOpenChange(false)
            }}
          >
            {confidence === 'high'
              ? t('duplicate.createDuplicateAnyway')
              : t('duplicate.continuCreating')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
