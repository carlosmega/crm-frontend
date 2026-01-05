"use client"

import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export interface StageDialogProps {
  // Dialog state
  open: boolean
  onOpenChange: (open: boolean) => void

  // Stage information
  stageName: string
  stageIcon: LucideIcon
  stageDescription?: string

  // Progress tracking
  completedFields: number
  totalFields: number

  // Content
  children: React.ReactNode

  // Actions
  onSave: () => Promise<void>
  onNextStage?: () => Promise<void>
  loading?: boolean
  canAdvance?: boolean
  showNextStage?: boolean  // New prop to conditionally show Next Stage button

  // Customization
  className?: string
}

/**
 * StageDialog - Generic BPF Stage Dialog
 *
 * Reusable dialog component for Business Process Flow stages.
 * Provides consistent UI for stage-specific field editing with
 * progress tracking and navigation actions.
 *
 * Features:
 * - Header with stage name, icon, and description
 * - Progress badge showing completed/total fields
 * - Scrollable content area for stage sections
 * - Footer with Save and Next Stage actions
 * - Responsive design (full-screen on mobile)
 *
 * Usage:
 * ```tsx
 * <StageDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   stageName="Qualify"
 *   stageIcon={Target}
 *   stageDescription="Assess budget, timeline, and authority"
 *   completedFields={3}
 *   totalFields={5}
 *   onSave={handleSave}
 *   onNextStage={handleNextStage}
 *   canAdvance={isValid}
 * >
 *   <QualifyStageSection />
 * </StageDialog>
 * ```
 */
export function StageDialog({
  open,
  onOpenChange,
  stageName,
  stageIcon: StageIcon,
  stageDescription,
  completedFields,
  totalFields,
  children,
  onSave,
  onNextStage,
  loading = false,
  canAdvance = true,
  showNextStage = true,
  className,
}: StageDialogProps) {
  const completionPercentage = totalFields > 0
    ? Math.round((completedFields / totalFields) * 100)
    : 0

  const handleSaveClick = async () => {
    try {
      await onSave()
    } catch (error) {
      console.error('Error saving stage:', error)
    }
  }

  const handleNextStageClick = async () => {
    try {
      await onNextStage()
    } catch (error) {
      console.error('Error advancing stage:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl max-h-[90vh] overflow-hidden flex flex-col",
          "sm:max-h-[90vh]",
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <StageIcon className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold">
                {stageName} Stage
              </DialogTitle>
              {stageDescription && (
                <DialogDescription className="mt-1 text-sm">
                  {stageDescription}
                </DialogDescription>
              )}

              {/* Progress Badge */}
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={completionPercentage === 100 ? "default" : "secondary"}
                  className="text-xs font-medium"
                >
                  {completedFields}/{totalFields} fields completed
                </Badge>
                {completionPercentage > 0 && completionPercentage < 100 && (
                  <span className="text-xs text-muted-foreground">
                    {completionPercentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <div className="py-6">
            {children}
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <div className="flex items-center justify-between w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveClick}
                disabled={loading}
                className="sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>

              {showNextStage && onNextStage && (
                <Button
                  type="button"
                  onClick={handleNextStageClick}
                  disabled={loading || !canAdvance}
                  className="bg-purple-600 hover:bg-purple-700 sm:w-auto"
                  title={!canAdvance ? 'Complete all required fields to advance' : 'Save and move to next stage'}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Next Stage
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
