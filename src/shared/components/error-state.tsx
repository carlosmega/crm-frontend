import { LucideIcon, AlertCircle, RefreshCw, Home, HelpCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ErrorStateProps {
  /** Title of the error */
  title?: string
  /** Error message or description */
  message: string
  /** Optional error icon (defaults to AlertCircle) */
  icon?: LucideIcon
  /** Retry callback */
  onRetry?: () => void
  /** Retry button label */
  retryLabel?: string
  /** Optional className for custom styling */
  className?: string
  /** Visual variant - inline (alert style) or full (centered page style) */
  variant?: 'inline' | 'full'
  /** Optional error code or status */
  errorCode?: string
  /** Show additional help actions */
  showHelpActions?: boolean
  /** Custom secondary action */
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

/**
 * Error State Component
 *
 * Displays error messages with optional retry functionality.
 * Supports two visual variants:
 * - inline: Compact alert-style for embedded contexts
 * - full: Centered page-style for full-page errors
 *
 * @example
 * ```tsx
 * // Full page error
 * <ErrorState
 *   title="Failed to Load Leads"
 *   message="Unable to connect to the server. Please check your connection."
 *   onRetry={() => refetch()}
 *   variant="full"
 *   errorCode="ERR_NETWORK"
 *   showHelpActions
 * />
 *
 * // Inline error
 * <ErrorState
 *   message="Unable to save changes"
 *   onRetry={handleSave}
 *   variant="inline"
 * />
 * ```
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = 'Try Again',
  className,
  variant = 'full',
  errorCode,
  showHelpActions = false,
  secondaryAction,
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={cn('', className)}>
        <Icon className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          {title}
          {errorCode && (
            <Badge variant="outline" className="font-mono text-xs bg-destructive/10 border-destructive/30">
              {errorCode}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="flex-1">{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0 bg-destructive/10 hover:bg-destructive/20 border-destructive/20"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // Full variant - centered page style
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto', className)}>
      {/* Icon circle with gradient background */}
      <div className="relative mb-6">
        {/* Animated gradient blur background */}
        <div className="absolute inset-0 rounded-full bg-destructive/20 blur-3xl animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-destructive/10 blur-2xl" />

        {/* Icon container with subtle animation */}
        <div className="relative rounded-full bg-destructive/10 p-5 ring-1 ring-destructive/20 shadow-lg">
          <Icon className="h-12 w-12 text-destructive" strokeWidth={1.5} />
        </div>
      </div>

      {/* Error code badge */}
      {errorCode && (
        <Badge
          variant="outline"
          className="mb-4 font-mono text-xs bg-destructive/5 border-destructive/20 text-destructive"
        >
          Error Code: {errorCode}
        </Badge>
      )}

      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
        {title}
      </h3>

      {/* Error message */}
      <p className="text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-8">
        {onRetry && (
          <Button onClick={onRetry} size="lg" className="gap-2 min-w-[160px]">
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Button asChild variant="outline" size="lg" className="min-w-[160px]">
              <Link href={secondaryAction.href}>
                <Home className="mr-2 h-4 w-4" />
                {secondaryAction.label}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="min-w-[160px]"
            >
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>

      {/* Help actions section */}
      {showHelpActions && (
        <div className="w-full border-t border-border pt-6 mt-6">
          <p className="text-sm font-medium text-foreground mb-4">
            Need additional help?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href="mailto:support@company.com">
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Additional help text */}
      {!showHelpActions && (
        <p className="text-xs text-muted-foreground mt-2 max-w-md leading-relaxed">
          If this problem persists, please contact your system administrator or try refreshing the page.
        </p>
      )}
    </div>
  )
}
