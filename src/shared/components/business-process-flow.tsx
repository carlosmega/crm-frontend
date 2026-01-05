"use client"

import React from 'react'
import { Check, Circle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface BPFStage {
  id: string
  name: string
  description?: string
  requiredFields?: string[]
  completedFields?: number
  totalFields?: number
  probability?: number
}

export type BPFStageStatus = 'completed' | 'active' | 'pending' | 'disabled'

export interface BPFStageWithStatus extends BPFStage {
  status: BPFStageStatus
}

interface BusinessProcessFlowProps {
  stages: BPFStageWithStatus[]
  className?: string
  onStageClick?: (stageId: string) => void
  fullWidth?: boolean
}

/**
 * BusinessProcessFlow Component (Modern Redesign)
 *
 * Professional BPF with:
 * - Clean design without intrusive borders
 * - Progress indicators for active stages
 * - Expandable information panel (non-intrusive)
 * - Smooth microinteractions
 * - Responsive mobile view
 */
export function BusinessProcessFlow({
  stages,
  className,
  onStageClick,
  fullWidth = false,
}: BusinessProcessFlowProps) {
  return (
    <nav
      role="navigation"
      aria-label="Sales process stages"
      className={cn("w-full", className)}
    >
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Stage Bar - Modern Clean Style - Más esbelto */}
        <div className={cn(
          "flex items-center justify-center gap-0 py-2 px-8",
          fullWidth ? "w-full" : "max-w-6xl mx-auto"
        )}>
          {stages.map((stage, index) => {
            const completionPercentage = stage.totalFields
              ? ((stage.completedFields ?? 0) / stage.totalFields) * 100
              : 0

            return (
              <div key={stage.id} className="flex items-center flex-1">
                {/* All stages with requiredFields get a Popover */}
                {stage.requiredFields ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => onStageClick?.(stage.id)}
                        disabled={stage.status === 'pending' || stage.status === 'disabled'}
                        type="button"
                        aria-label={`${stage.name} stage - ${stage.status}${completionPercentage ? ` - ${Math.round(completionPercentage)}% complete` : ''}${stage.probability !== undefined ? ` - ${stage.probability}% win probability` : ''}`}
                        aria-current={stage.status === 'active' ? 'step' : undefined}
                        aria-describedby={stage.requiredFields ? `${stage.id}-description` : undefined}
                        className={cn(
                          "group relative flex items-center justify-center gap-1.5 px-1 py-1.5 rounded-md transition-all duration-200 w-full",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          stage.status !== 'pending' && stage.status !== 'disabled' && "hover:bg-muted/40",
                          stage.status === 'active' && "bg-muted/20",
                          stage.status === 'pending' && "cursor-not-allowed opacity-60",
                          stage.status === 'disabled' && "cursor-not-allowed opacity-40"
                        )}
                      >
                        {/* Stage Icon with Progress Ring (only for active) */}
                        <div className="relative flex-shrink-0">
                          {/* Progress ring for active stage */}
                          {stage.status === 'active' && stage.totalFields && (
                            <svg className="w-7 h-7 -rotate-90 absolute inset-0" viewBox="0 0 28 28">
                              <circle cx="14" cy="14" r="12" className="fill-none stroke-muted/30" strokeWidth="1.5" />
                              <circle cx="14" cy="14" r="12" className="fill-none stroke-primary transition-all duration-500" strokeWidth="1.5" strokeDasharray={`${completionPercentage * 0.75} 75`} strokeLinecap="round" />
                            </svg>
                          )}
                          <div className={cn("relative flex items-center justify-center transition-all duration-200", stage.status === 'completed' && "scale-105")}>
                            {stage.status === 'completed' ? (
                              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
                              </div>
                            ) : stage.status === 'active' ? (
                              // Active: solo punto central, el progress ring SVG es el borde
                              <div className="w-7 h-7 rounded-full bg-transparent flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              </div>
                            ) : stage.status === 'disabled' ? (
                              <div className="w-7 h-7 rounded-full border border-muted-foreground/10 bg-muted/20 flex items-center justify-center" />
                            ) : (
                              <div className="w-7 h-7 rounded-full border border-muted-foreground/20 flex items-center justify-center" />
                            )}
                          </div>
                        </div>

                        {/* Stage Name and Info */}
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <p className={cn(
                              "text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                              stage.status === 'active' ? "text-foreground" :
                              stage.status === 'completed' ? "text-muted-foreground" :
                              stage.status === 'disabled' ? "text-muted-foreground/40" :
                              "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                            )}>
                              {stage.name}
                            </p>
                            {stage.probability !== undefined && stage.status !== 'pending' && stage.status !== 'disabled' && (
                              <Badge
                                variant={stage.status === 'active' ? 'default' : 'secondary'}
                                className="text-[9px] font-semibold px-1.5 py-0 h-4"
                              >
                                {stage.probability}%
                              </Badge>
                            )}
                            {stage.status === 'active' && stage.totalFields && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary/80 border border-primary/10">
                                {stage.completedFields}/{stage.totalFields}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Info className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">View details</span>
                          </div>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="bottom" align="start">
                      {stage.requiredFields && (
                        <span id={`${stage.id}-description`} className="sr-only">
                          Required fields: {stage.requiredFields.join(', ')}
                        </span>
                      )}
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground/90">
                              {stage.name} Stage Requirements
                            </h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {stage.status === 'completed' ? 'Completed fields' :
                               stage.status === 'active' ? 'Complete these fields to progress' :
                               'Required fields for this stage'}
                            </p>
                          </div>
                          {stage.totalFields && (
                            <div className="text-right">
                              <p className="text-xs font-medium text-foreground/90">
                                {stage.completedFields}/{stage.totalFields}
                              </p>
                              <div className="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                        {stage.requiredFields && (
                          <div className="space-y-1">
                            {stage.requiredFields.map((field, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-muted/30">
                                <div className={cn("w-1 h-1 rounded-full flex-shrink-0", idx < (stage.completedFields ?? 0) ? "bg-primary" : "bg-muted-foreground/30")} />
                                <span className={cn(idx < (stage.completedFields ?? 0) && "text-foreground/60 line-through")}>
                                  {field}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    onClick={() => onStageClick?.(stage.id)}
                    disabled={stage.status === 'pending' || stage.status === 'disabled'}
                    type="button"
                    aria-label={`${stage.name} stage - ${stage.status}${stage.probability !== undefined ? ` - ${stage.probability}% win probability` : ''}`}
                    aria-current={stage.status === 'active' ? 'step' : undefined}
                    className={cn(
                      "group relative flex items-center justify-center gap-1.5 px-1 py-1.5 rounded-md transition-all duration-200 w-full",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      stage.status !== 'pending' && stage.status !== 'disabled' && "hover:bg-muted/40",
                      stage.status === 'pending' && "cursor-not-allowed opacity-60",
                      stage.status === 'disabled' && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {/* Stage Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={cn("relative flex items-center justify-center transition-all duration-200", stage.status === 'completed' && "scale-105")}>
                        {stage.status === 'completed' ? (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
                          </div>
                        ) : stage.status === 'active' ? (
                          // Active: punto central
                          <div className="w-7 h-7 rounded-full border-2 border-primary bg-transparent flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        ) : stage.status === 'disabled' ? (
                          <div className="w-7 h-7 rounded-full border border-muted-foreground/10 bg-muted/20 flex items-center justify-center" />
                        ) : (
                          <div className="w-7 h-7 rounded-full border border-muted-foreground/20 flex items-center justify-center" />
                        )}
                      </div>
                    </div>
                    {/* Stage Name */}
                    <div className="flex items-center gap-1">
                      <p className={cn(
                        "text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                        stage.status === 'completed' ? "text-muted-foreground" :
                        stage.status === 'disabled' ? "text-muted-foreground/40" :
                        "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                      )}>
                        {stage.name}
                      </p>
                      {stage.probability !== undefined && stage.status !== 'pending' && stage.status !== 'disabled' && (
                        <Badge
                          variant={stage.status === 'active' ? 'default' : 'secondary'}
                          className="text-[9px] font-semibold px-1.5 py-0 h-4"
                        >
                          {stage.probability}%
                        </Badge>
                      )}
                    </div>
                  </button>
                )}

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="relative w-12 h-[2px] flex-shrink-0">
                    {/* Base line */}
                    <div className="absolute inset-0 bg-gray-300 rounded-full" />

                    {/* Progress line */}
                    {stage.status === 'completed' && (
                      <div className="absolute inset-0 bg-primary rounded-full transition-all duration-300" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile View (Vertical) - Simplified */}
      <div className="md:hidden space-y-2 px-4 py-2">
        {stages.map((stage, index) => {
          const completionPercentage = stage.totalFields
            ? ((stage.completedFields ?? 0) / stage.totalFields) * 100
            : 0

          return (
            <div key={stage.id} className="relative">
              <button
                onClick={() => onStageClick?.(stage.id)}
                disabled={stage.status === 'pending' || stage.status === 'disabled'}
                aria-label={`${stage.name} stage - ${stage.status}${completionPercentage ? ` - ${Math.round(completionPercentage)}% complete` : ''}${stage.probability !== undefined ? ` - ${stage.probability}% win probability` : ''}`}
                aria-current={stage.status === 'active' ? 'step' : undefined}
                className={cn(
                  "w-full flex items-start gap-2.5 text-left p-2.5 rounded-lg transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  stage.status !== 'pending' && stage.status !== 'disabled' && "hover:bg-muted/50",
                  stage.status === 'active' && "bg-muted/30",
                  stage.status === 'disabled' && "opacity-40 cursor-not-allowed"
                )}
              >
              {/* Stage Icon */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 shrink-0",
                stage.status === 'completed' && "bg-primary border-primary text-primary-foreground",
                stage.status === 'active' && "bg-primary/10 border-primary text-primary",
                stage.status === 'pending' && "bg-muted/50 border-muted-foreground/20 text-muted-foreground",
                stage.status === 'disabled' && "bg-muted/20 border-muted-foreground/10 text-muted-foreground/30"
              )}>
                {stage.status === 'completed' ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : stage.status === 'active' ? (
                  // Active: solo el borde del contenedor (sin ícono interno)
                  <div className="w-2 h-2 rounded-full bg-primary" />
                ) : (
                  // Pending/Disabled: círculo vacío
                  <Circle className="w-4 h-4" fill="none" />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className={cn(
                    "text-sm font-semibold",
                    stage.status === 'active' && "text-primary",
                    stage.status === 'completed' && "text-foreground",
                    stage.status === 'pending' && "text-muted-foreground",
                    stage.status === 'disabled' && "text-muted-foreground/40"
                  )}>
                    {stage.name}
                  </p>
                  {stage.probability !== undefined && stage.status !== 'pending' && stage.status !== 'disabled' && (
                    <Badge
                      variant={stage.status === 'active' ? 'default' : 'secondary'}
                      className="text-[9px] font-semibold px-1.5 py-0 h-4"
                    >
                      {stage.probability}%
                    </Badge>
                  )}
                  {stage.status === 'active' && stage.totalFields && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                      {stage.completedFields}/{stage.totalFields}
                    </span>
                  )}
                </div>
                {stage.description && (
                  <p className="text-xs text-muted-foreground">
                    {stage.description}
                  </p>
                )}
              </div>
            </button>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="absolute left-[1.125rem] top-[3rem] w-0.5 h-2 -translate-x-1/2">
                <div className={cn(
                  "w-full h-full transition-all duration-200 rounded-full",
                  stage.status === 'completed' ? "bg-primary" : "bg-muted-foreground/20"
                )} />
              </div>
            )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
