'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Info, Target, Users, Zap, CheckCircle2 } from 'lucide-react'
import type { Lead } from '@/core/contracts/entities/lead'
import { calculateLeadScore, type LeadScoreBreakdown } from '../services/lead-scoring-service'
import { LeadQualityCode } from '@/core/contracts/enums'

interface LeadScoreCardProps {
  lead: Lead
  activityCount?: {
    emails?: number
    phoneCalls?: number
    meetings?: number
    formSubmissions?: number
  }
}

/**
 * Lead Score Card Component
 *
 * Muestra el score automático del lead con breakdown visual:
 * - Score total 0-100
 * - Badge de calidad (Hot/Warm/Cold)
 * - Progress bars por categoría
 * - Dialog con reasoning detallado
 */
export function LeadScoreCard({ lead, activityCount }: LeadScoreCardProps) {
  // Calcular score
  const scoreBreakdown = calculateLeadScore(lead, { activityCount })

  const getQualityColor = (quality: LeadQualityCode) => {
    switch (quality) {
      case LeadQualityCode.Hot:
        return 'bg-red-100 text-red-800 border-red-300'
      case LeadQualityCode.Warm:
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case LeadQualityCode.Cold:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getQualityIcon = (quality: LeadQualityCode) => {
    switch (quality) {
      case LeadQualityCode.Hot:
        return '🔥'
      case LeadQualityCode.Warm:
        return '⚡'
      case LeadQualityCode.Cold:
        return '❄️'
    }
  }

  const getQualityLabel = (quality: LeadQualityCode) => {
    switch (quality) {
      case LeadQualityCode.Hot:
        return 'Hot Lead'
      case LeadQualityCode.Warm:
        return 'Warm Lead'
      case LeadQualityCode.Cold:
        return 'Cold Lead'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'source':
        return <Target className="h-4 w-4" />
      case 'engagement':
        return <Zap className="h-4 w-4" />
      case 'fit':
        return <Users className="h-4 w-4" />
      case 'bant':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lead Score
            </CardTitle>
            <CardDescription>Automatic scoring based on multiple factors</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Lead Score Breakdown</DialogTitle>
                <DialogDescription>
                  Detailed scoring analysis for {lead.firstname} {lead.lastname}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {scoreBreakdown.reasoning.map((line, index) => {
                    const isHeader = line.startsWith('---')
                    const isTotal = line.startsWith('TOTAL SCORE')
                    const isQuality = line.startsWith('QUALITY')

                    if (isHeader) {
                      return (
                        <div key={index} className="mt-4 mb-2">
                          <Separator />
                          <h4 className="font-semibold text-sm mt-2 text-primary">
                            {line.replace(/---/g, '').trim()}
                          </h4>
                        </div>
                      )
                    }

                    if (isTotal || isQuality) {
                      return (
                        <div key={index} className="font-bold text-base mt-4 p-2 bg-muted rounded">
                          {line}
                        </div>
                      )
                    }

                    if (line.trim() === '') {
                      return <div key={index} className="h-2" />
                    }

                    return (
                      <div key={index} className="text-sm text-muted-foreground pl-2">
                        {line}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Score */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl font-bold ${getScoreColor(scoreBreakdown.totalScore)}`}>
              {scoreBreakdown.totalScore}
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <Badge className={`mt-2 ${getQualityColor(scoreBreakdown.quality)}`}>
              {getQualityIcon(scoreBreakdown.quality)} {getQualityLabel(scoreBreakdown.quality)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Overall Quality</div>
            <Progress
              value={scoreBreakdown.totalScore}
              className="h-2 w-32 mt-2"
            />
          </div>
        </div>

        <Separator />

        {/* Category Breakdown */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Score Breakdown</div>

          {/* Source Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getCategoryIcon('source')}
                <span className="font-medium">Source Quality</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Score based on lead source (Partner, Referral, Web, etc.)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">
                {scoreBreakdown.sourceScore}/25
              </span>
            </div>
            <Progress
              value={(scoreBreakdown.sourceScore / 25) * 100}
              className="h-2"
            />
          </div>

          {/* Engagement Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getCategoryIcon('engagement')}
                <span className="font-medium">Engagement Level</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Score based on activities (emails, calls, meetings)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">
                {scoreBreakdown.engagementScore}/25
              </span>
            </div>
            <Progress
              value={(scoreBreakdown.engagementScore / 25) * 100}
              className="h-2"
            />
          </div>

          {/* Fit Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getCategoryIcon('fit')}
                <span className="font-medium">Customer Fit</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Score based on industry, revenue, company size, location
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">
                {scoreBreakdown.fitScore}/25
              </span>
            </div>
            <Progress
              value={(scoreBreakdown.fitScore / 25) * 100}
              className="h-2"
            />
          </div>

          {/* BANT Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getCategoryIcon('bant')}
                <span className="font-medium">BANT Qualification</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Score based on Budget, Authority, Need, Timeframe
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">
                {scoreBreakdown.bantScore}/25
              </span>
            </div>
            <Progress
              value={(scoreBreakdown.bantScore / 25) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-1">Recommendation</div>
          <div className="text-sm text-muted-foreground">
            {scoreBreakdown.totalScore >= 80 && (
              <>
                <span className="font-semibold text-red-600">High priority lead.</span> Contact
                immediately. This lead shows strong buying signals and good fit.
              </>
            )}
            {scoreBreakdown.totalScore >= 50 && scoreBreakdown.totalScore < 80 && (
              <>
                <span className="font-semibold text-orange-600">Promising lead.</span> Continue
                nurturing with targeted content. Schedule a discovery call.
              </>
            )}
            {scoreBreakdown.totalScore < 50 && (
              <>
                <span className="font-semibold text-blue-600">Low priority lead.</span> Add to
                nurture campaign. Gather more qualification information before investing time.
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
