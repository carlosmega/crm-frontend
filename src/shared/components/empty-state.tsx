import { LucideIcon, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Main title of empty state */
  title: string
  /** Description text explaining why it's empty */
  description: string
  /** Optional action button */
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
  /** Optional secondary action */
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
  /** Optional help text or tips */
  helpText?: string
  /** Optional className for custom styling */
  className?: string
  /** Visual size variant */
  size?: 'default' | 'large'
  /** Show a decorative badge (e.g., "Getting Started") */
  badge?: string
  /** Quick tips or suggestions list */
  suggestions?: string[]
}

/**
 * Empty State Component
 *
 * Displays a friendly message when lists or views are empty
 * with optional CTA button to help users take action
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Package}
 *   title="No quotes found"
 *   description="Get started by creating your first quote"
 *   action={{ label: "New Quote", href: "/quotes/new" }}
 *   badge="Getting Started"
 *   suggestions={["Import from CSV", "Connect to external system", "Create manually"]}
 *   size="large"
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  helpText,
  className,
  size = 'default',
  badge,
  suggestions,
}: EmptyStateProps) {
  const isLarge = size === 'large'

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center max-w-2xl mx-auto',
      isLarge ? 'py-20 px-6' : 'py-12 px-4',
      className
    )}>
      {/* Optional badge */}
      {badge && (
        <Badge
          variant="outline"
          className="mb-4 bg-primary/5 border-primary/20 text-primary gap-1.5"
        >
          <Sparkles className="h-3 w-3" />
          {badge}
        </Badge>
      )}

      {/* Icon with decorative background */}
      <div className="relative mb-6">
        {/* Multi-layer gradient blur for depth */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/10 blur-3xl',
          isLarge && 'scale-150'
        )} />
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/5 blur-2xl',
          isLarge && 'scale-125'
        )} />

        {/* Icon container with enhanced styling */}
        <div className={cn(
          'relative rounded-full bg-gradient-to-br from-muted/50 to-muted/30 ring-1 ring-border/50 shadow-sm',
          isLarge ? 'p-6' : 'p-4'
        )}>
          <Icon className={cn(
            'text-muted-foreground',
            isLarge ? 'h-12 w-12' : 'h-8 w-8'
          )} strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-bold tracking-tight text-foreground mb-2',
        isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-muted-foreground mb-6 leading-relaxed',
        isLarge ? 'text-base max-w-lg' : 'text-sm max-w-md'
      )}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto">
          {action && (
            action.href ? (
              <Button asChild size={isLarge ? 'lg' : 'default'} className="gap-2 min-w-[180px]">
                <Link href={action.href}>
                  {action.icon ? <action.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button
                onClick={action.onClick}
                size={isLarge ? 'lg' : 'default'}
                className="gap-2 min-w-[180px]"
              >
                {action.icon ? <action.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Button asChild variant="outline" size={isLarge ? 'lg' : 'default'} className="gap-2 min-w-[180px]">
                <Link href={secondaryAction.href}>
                  {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size={isLarge ? 'lg' : 'default'}
                className="gap-2 min-w-[180px]"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}

      {/* Suggestions section */}
      {suggestions && suggestions.length > 0 && (
        <div className="w-full border-t border-border pt-6 mt-2">
          <p className="text-sm font-medium text-foreground mb-3">
            Quick suggestions:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground text-left max-w-md mx-auto">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional help text */}
      {helpText && (
        <p className={cn(
          'text-xs text-muted-foreground leading-relaxed',
          suggestions ? 'mt-4 max-w-md' : 'mt-2 max-w-md'
        )}>
          {helpText}
        </p>
      )}
    </div>
  )
}
