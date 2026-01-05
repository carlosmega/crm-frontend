"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface BPFAlertProps {
  variant: 'success' | 'error'
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionIcon?: LucideIcon
  compact?: boolean
}

/**
 * Standardized BPF Alert Component
 *
 * Provides consistent alert styling and behavior across BPF components:
 * - Success alerts for completed/won states
 * - Error alerts for failed/lost states
 * - Optional action button for next steps
 * - Compact mode for inline usage in sticky headers
 */
export function BPFAlert({
  variant,
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  compact = false,
}: BPFAlertProps) {
  const DefaultIcon = variant === 'success' ? CheckCircle2 : XCircle
  const AlertIcon = Icon || DefaultIcon

  // Compact inline banner for sticky headers
  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
        variant === 'success'
          ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800'
      }`}>
        <AlertIcon className="h-4 w-4 shrink-0" />
        <span className="font-medium flex-1">{title}</span>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="font-medium underline underline-offset-4 hover:no-underline whitespace-nowrap flex items-center gap-1"
          >
            {actionLabel}
            {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
          </Link>
        )}
      </div>
    )
  }

  // Standard Alert layout
  return (
    <Alert
      variant={variant === 'error' ? 'destructive' : 'default'}
      className={variant === 'success' ? 'border-primary/50 bg-primary/5' : ''}
    >
      <AlertIcon className={`h-4 w-4 ${variant === 'success' ? 'text-primary' : ''}`} />
      <AlertDescription className="text-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actionLabel && actionHref && (
            <Button asChild size="sm" variant={variant === 'success' ? 'default' : 'outline'}>
              <Link href={actionHref}>
                {actionLabel}
                {ActionIcon && <ActionIcon className="ml-2 h-4 w-4" />}
              </Link>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
