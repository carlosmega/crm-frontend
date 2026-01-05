"use client"

import { ArrowRight, CheckCircle2, AlertCircle, Info, Lightbulb } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type NextStepVariant = 'success' | 'warning' | 'info' | 'tip'

interface NextStepAction {
  label: string
  href?: string
  onClick?: () => void
}

interface NextStepBannerProps {
  /** Type of banner */
  variant?: NextStepVariant
  /** Title of the banner */
  title: string
  /** Description/guidance text */
  description: string
  /** Primary action button */
  action?: NextStepAction
  /** Optional secondary action */
  secondaryAction?: NextStepAction
  /** Link to relevant USER_GUIDE.md section */
  guideLink?: string
  /** Custom className */
  className?: string
  /** Show dismiss button */
  dismissible?: boolean
  /** On dismiss callback */
  onDismiss?: () => void
}

const variantConfig: Record<NextStepVariant, {
  icon: React.ElementType
  className: string
  iconClassName: string
}> = {
  success: {
    icon: CheckCircle2,
    className: 'border-green-500/50 bg-green-50 dark:bg-green-950/20',
    iconClassName: 'text-green-600',
  },
  warning: {
    icon: AlertCircle,
    className: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20',
    iconClassName: 'text-yellow-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/20',
    iconClassName: 'text-blue-600',
  },
  tip: {
    icon: Lightbulb,
    className: 'border-purple-500/50 bg-purple-50 dark:bg-purple-950/20',
    iconClassName: 'text-purple-600',
  },
}

/**
 * NextStepBanner Component
 *
 * Displays contextual guidance for next steps in the sales process
 *
 * @example
 * ```tsx
 * <NextStepBanner
 *   variant="success"
 *   title="Lead Qualified Successfully"
 *   description="The lead has been converted to an opportunity. Next, move it through the sales stages."
 *   action={{
 *     label: "View Opportunity",
 *     href: `/opportunities/${opportunityId}`
 *   }}
 *   guideLink="/USER_GUIDE.md#3-opportunity-management"
 * />
 * ```
 */
export function NextStepBanner({
  variant = 'info',
  title,
  description,
  action,
  secondaryAction,
  guideLink,
  className,
  dismissible,
  onDismiss,
}: NextStepBannerProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Alert className={cn(config.className, 'relative', className)}>
      <Icon className={cn('h-4 w-4', config.iconClassName)} />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
            aria-label="Dismiss"
          >
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">{description}</p>

        <div className="flex flex-wrap items-center gap-2">
          {action && (
            action.href ? (
              <Button
                asChild
                size="sm"
                className={cn(
                  variant === 'success' && 'bg-green-600 hover:bg-green-700',
                  variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
                  variant === 'info' && 'bg-blue-600 hover:bg-blue-700',
                  variant === 'tip' && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                <Link href={action.href}>
                  {action.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={action.onClick}
                size="sm"
                className={cn(
                  variant === 'success' && 'bg-green-600 hover:bg-green-700',
                  variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
                  variant === 'info' && 'bg-blue-600 hover:bg-blue-700',
                  variant === 'tip' && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                {action.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size="sm"
              >
                {secondaryAction.label}
              </Button>
            )
          )}

          {guideLink && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <a href={guideLink} target="_blank" rel="noopener noreferrer">
                Learn more in guide
              </a>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
