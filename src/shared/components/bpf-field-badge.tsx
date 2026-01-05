"use client"

import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BPFFieldBadgeProps {
  stageName?: string
  className?: string
}

/**
 * BPF Field Badge
 *
 * Visual indicator that appears next to form field labels
 * to show they belong to the current Business Process Flow stage.
 *
 * Inspired by Dynamics 365's field markers that help users
 * understand which fields are part of the active sales stage.
 *
 * Usage:
 * <FormLabel>
 *   Budget Amount
 *   <BPFFieldBadge stageName="Qualify" />
 * </FormLabel>
 */
export function BPFFieldBadge({ stageName = "BPF", className }: BPFFieldBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold",
              "bg-primary/10 text-primary border border-primary/20",
              "transition-colors hover:bg-primary/20",
              className
            )}
          >
            <Target className="w-2.5 h-2.5" />
            <span className="uppercase tracking-wide">{stageName}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs max-w-[200px]">
          <p>This field is part of the <strong>{stageName}</strong> stage in the Business Process Flow</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
