"use client"

import { HelpCircle, ExternalLink } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  /** Tooltip content text */
  content: string
  /** Optional title */
  title?: string
  /** Optional link to USER_GUIDE.md section */
  guideLink?: string
  /** Icon size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Side where tooltip appears */
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * HelpTooltip Component
 *
 * Contextual help tooltip with optional link to USER_GUIDE.md
 *
 * @example
 * ```tsx
 * <HelpTooltip
 *   title="Budget Status"
 *   content="Select how likely the customer is to allocate budget for this purchase"
 *   guideLink="/USER_GUIDE.md#step-1-bant-qualification"
 * />
 * ```
 */
export function HelpTooltip({
  content,
  title,
  guideLink,
  size = 'sm',
  className,
  side = 'right',
}: HelpTooltipProps) {
  const iconSize = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size]

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-muted-foreground hover:text-foreground',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              className
            )}
            aria-label="Help"
          >
            <HelpCircle className={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-xs leading-relaxed">{content}</p>
          {guideLink && (
            <a
              href={guideLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
