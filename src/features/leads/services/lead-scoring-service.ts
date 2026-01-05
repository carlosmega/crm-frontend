/**
 * Lead Scoring Service
 *
 * Sistema automático de puntuación de leads basado en múltiples factores:
 * - Source Quality (origen del lead)
 * - Engagement Level (interacciones y actividades)
 * - Fit Score (ajuste con perfil ideal de cliente)
 * - BANT Qualification (presupuesto, autoridad, necesidad, timing)
 *
 * Score Total: 0-100 puntos
 * - Hot Lead (80-100): Calificado, listo para contacto inmediato
 * - Warm Lead (50-79): Prometedor, requiere nurturing
 * - Cold Lead (0-49): Bajo potencial, requiere calificación adicional
 */

import type { Lead } from '@/core/contracts/entities/lead'
import {
  LeadSourceCode,
  LeadQualityCode,
  BudgetStatusCode,
  PurchaseTimeframeCode,
} from '@/core/contracts/enums'

export interface LeadScoreBreakdown {
  sourceScore: number // 0-25 puntos
  engagementScore: number // 0-25 puntos
  fitScore: number // 0-25 puntos
  bantScore: number // 0-25 puntos
  totalScore: number // 0-100 puntos
  quality: LeadQualityCode
  reasoning: string[]
}

export interface ScoringConfig {
  // Source scoring (max 25 points)
  sourceWeights: Record<LeadSourceCode, number>

  // Engagement scoring (max 25 points)
  emailOpenWeight: number
  phoneCallWeight: number
  meetingWeight: number
  formSubmissionWeight: number

  // Fit scoring (max 25 points)
  industryMatchWeight: number
  revenueFitWeight: number
  employeeCountFitWeight: number
  locationFitWeight: number

  // BANT scoring (max 25 points)
  budgetWeight: number
  authorityWeight: number
  needWeight: number
  timeframeWeight: number
}

/**
 * Configuración por defecto del scoring
 */
const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  // Source weights (suma = 25)
  sourceWeights: {
    [LeadSourceCode.Advertisement]: 5,
    [LeadSourceCode.Employee_Referral]: 15,
    [LeadSourceCode.External_Referral]: 18,
    [LeadSourceCode.Partner]: 20,
    [LeadSourceCode.Public_Relations]: 8,
    [LeadSourceCode.Seminar]: 12,
    [LeadSourceCode.Trade_Show]: 10,
    [LeadSourceCode.Web]: 7,
    [LeadSourceCode.Word_of_Mouth]: 16,
    [LeadSourceCode.Other]: 3,
  },

  // Engagement weights
  emailOpenWeight: 3,
  phoneCallWeight: 8,
  meetingWeight: 10,
  formSubmissionWeight: 4,

  // Fit weights
  industryMatchWeight: 8,
  revenueFitWeight: 7,
  employeeCountFitWeight: 5,
  locationFitWeight: 5,

  // BANT weights
  budgetWeight: 8,
  authorityWeight: 6,
  needWeight: 6,
  timeframeWeight: 5,
}

/**
 * Calcula el score por fuente del lead
 */
function calculateSourceScore(
  lead: Partial<Lead>,
  config: ScoringConfig
): { score: number; reasoning: string[] } {
  const reasoning: string[] = []
  let score = 0

  if (lead.leadsourcecode !== undefined) {
    score = config.sourceWeights[lead.leadsourcecode] || 3
    reasoning.push(
      `Lead source (${getSourceLabel(lead.leadsourcecode)}): +${score} points`
    )
  } else {
    reasoning.push('No lead source specified: 0 points')
  }

  return { score, reasoning }
}

/**
 * Calcula el score de engagement basado en actividades
 */
function calculateEngagementScore(
  lead: Partial<Lead>,
  activityCount?: {
    emails?: number
    phoneCalls?: number
    meetings?: number
    formSubmissions?: number
  },
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): { score: number; reasoning: string[] } {
  const reasoning: string[] = []
  let score = 0

  if (!activityCount) {
    reasoning.push('No activity data available: 0 points')
    return { score, reasoning }
  }

  // Email opens (max 6 points = 2 emails * 3 points)
  if (activityCount.emails) {
    const emailScore = Math.min(activityCount.emails * config.emailOpenWeight, 6)
    score += emailScore
    reasoning.push(`Email engagement (${activityCount.emails} emails): +${emailScore} points`)
  }

  // Phone calls (max 16 points = 2 calls * 8 points)
  if (activityCount.phoneCalls) {
    const phoneScore = Math.min(activityCount.phoneCalls * config.phoneCallWeight, 16)
    score += phoneScore
    reasoning.push(
      `Phone calls (${activityCount.phoneCalls} calls): +${phoneScore} points`
    )
  }

  // Meetings (max 20 points = 2 meetings * 10 points)
  if (activityCount.meetings) {
    const meetingScore = Math.min(activityCount.meetings * config.meetingWeight, 20)
    score += meetingScore
    reasoning.push(
      `Meetings (${activityCount.meetings} meetings): +${meetingScore} points`
    )
  }

  // Form submissions (max 8 points = 2 forms * 4 points)
  if (activityCount.formSubmissions) {
    const formScore = Math.min(
      activityCount.formSubmissions * config.formSubmissionWeight,
      8
    )
    score += formScore
    reasoning.push(
      `Form submissions (${activityCount.formSubmissions} forms): +${formScore} points`
    )
  }

  // Cap at 25 points
  score = Math.min(score, 25)

  if (score === 0) {
    reasoning.push('No engagement activities: 0 points')
  }

  return { score, reasoning }
}

/**
 * Calcula el score de fit (ajuste con perfil ideal)
 */
function calculateFitScore(
  lead: Partial<Lead>,
  idealProfile?: {
    industries?: number[] // Industry codes
    minRevenue?: number
    maxRevenue?: number
    minEmployees?: number
    maxEmployees?: number
    preferredCountries?: string[]
  },
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): { score: number; reasoning: string[] } {
  const reasoning: string[] = []
  let score = 0

  if (!idealProfile) {
    // Si no hay perfil ideal, dar puntos por tener datos completos
    // TODO: Industry, revenue, and employee count are Account properties, not Lead properties
    /* if (lead.industrycode !== undefined) {
      score += 8
      reasoning.push('Industry specified: +8 points')
    }
    if (lead.revenue !== undefined && lead.revenue > 0) {
      score += 7
      reasoning.push('Revenue data available: +7 points')
    }
    if (lead.numberofemployees !== undefined && lead.numberofemployees > 0) {
      score += 5
      reasoning.push('Employee count available: +5 points')
    } */
    if (lead.address1_country) {
      score += 5
      reasoning.push('Location data available: +5 points')
    }
    return { score, reasoning }
  }

  // Industry match
  // TODO: Industry code not available on Lead entity
  /* if (
    idealProfile.industries &&
    lead.industrycode !== undefined &&
    idealProfile.industries.includes(lead.industrycode)
  ) {
    score += config.industryMatchWeight
    reasoning.push(`Industry match: +${config.industryMatchWeight} points`)
  } */

  // Revenue fit
  // TODO: Revenue not available on Lead entity
  /* if (lead.revenue !== undefined && lead.revenue > 0) {
    const inRange =
      (!idealProfile.minRevenue || lead.revenue >= idealProfile.minRevenue) &&
      (!idealProfile.maxRevenue || lead.revenue <= idealProfile.maxRevenue)

    if (inRange) {
      score += config.revenueFitWeight
      reasoning.push(`Revenue in target range: +${config.revenueFitWeight} points`)
    } else {
      reasoning.push('Revenue outside target range: 0 points')
    }
  } */

  // Employee count fit
  // TODO: Employee count not available on Lead entity
  /* if (lead.numberofemployees !== undefined && lead.numberofemployees > 0) {
    const inRange =
      (!idealProfile.minEmployees ||
        lead.numberofemployees >= idealProfile.minEmployees) &&
      (!idealProfile.maxEmployees ||
        lead.numberofemployees <= idealProfile.maxEmployees)

    if (inRange) {
      score += config.employeeCountFitWeight
      reasoning.push(
        `Employee count in target range: +${config.employeeCountFitWeight} points`
      )
    } else {
      reasoning.push('Employee count outside target range: 0 points')
    }
  } */

  // Location fit
  if (
    idealProfile.preferredCountries &&
    lead.address1_country &&
    idealProfile.preferredCountries.includes(lead.address1_country)
  ) {
    score += config.locationFitWeight
    reasoning.push(`Location match: +${config.locationFitWeight} points`)
  }

  if (score === 0 && idealProfile) {
    reasoning.push('Does not match ideal customer profile: 0 points')
  }

  return { score, reasoning }
}

/**
 * Calcula el score BANT (Budget, Authority, Need, Timeframe)
 */
function calculateBANTScore(
  lead: Partial<Lead>,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): { score: number; reasoning: string[] } {
  const reasoning: string[] = []
  let score = 0

  // Budget (0-8 points)
  if (lead.budgetstatus !== undefined) {
    switch (lead.budgetstatus) {
      case BudgetStatusCode.Will_Buy:
        score += 8
        reasoning.push('Budget: Will Buy (+8 points)')
        break
      case BudgetStatusCode.Can_Buy:
        score += 6
        reasoning.push('Budget: Can Buy (+6 points)')
        break
      case BudgetStatusCode.May_Buy:
        score += 4
        reasoning.push('Budget: May Buy (+4 points)')
        break
      case BudgetStatusCode.No_Budget:
        reasoning.push('Budget: No Budget (0 points)')
        break
    }
  }

  // Authority (0-6 points) - basado en job title keywords
  if (lead.jobtitle) {
    const title = lead.jobtitle.toLowerCase()
    const decisionMakerKeywords = [
      'ceo',
      'cto',
      'cfo',
      'coo',
      'president',
      'director',
      'vp',
      'vice president',
      'head of',
      'chief',
      'owner',
    ]
    const influencerKeywords = ['manager', 'lead', 'senior', 'principal']

    if (decisionMakerKeywords.some((keyword) => title.includes(keyword))) {
      score += 6
      reasoning.push('Authority: Decision Maker (+6 points)')
    } else if (influencerKeywords.some((keyword) => title.includes(keyword))) {
      score += 3
      reasoning.push('Authority: Influencer (+3 points)')
    } else {
      reasoning.push('Authority: End User (0 points)')
    }
  }

  // Need (0-6 points) - basado en description/notes keywords
  if (lead.description) {
    const description = lead.description.toLowerCase()
    const urgentKeywords = [
      'urgent',
      'asap',
      'immediately',
      'critical',
      'emergency',
    ]
    const needKeywords = [
      'need',
      'require',
      'must have',
      'looking for',
      'solution',
    ]

    if (urgentKeywords.some((keyword) => description.includes(keyword))) {
      score += 6
      reasoning.push('Need: Urgent (+6 points)')
    } else if (needKeywords.some((keyword) => description.includes(keyword))) {
      score += 4
      reasoning.push('Need: Identified (+4 points)')
    }
  }

  // Timeframe (0-5 points)
  if (lead.purchasetimeframe !== undefined) {
    switch (lead.purchasetimeframe) {
      case PurchaseTimeframeCode.Immediate:
        score += 5
        reasoning.push('Timeframe: Immediate (+5 points)')
        break
      case PurchaseTimeframeCode.This_Quarter:
        score += 4
        reasoning.push('Timeframe: This Quarter (+4 points)')
        break
      case PurchaseTimeframeCode.Next_Quarter:
        score += 3
        reasoning.push('Timeframe: Next Quarter (+3 points)')
        break
      case PurchaseTimeframeCode.This_Year:
        score += 2
        reasoning.push('Timeframe: This Year (+2 points)')
        break
      case PurchaseTimeframeCode.Unknown:
        reasoning.push('Timeframe: Unknown (0 points)')
        break
    }
  }

  // Cap at 25 points
  score = Math.min(score, 25)

  if (score === 0) {
    reasoning.push('No BANT qualification data: 0 points')
  }

  return { score, reasoning }
}

/**
 * Determina la calidad del lead basado en el score total
 */
function determineLeadQuality(totalScore: number): LeadQualityCode {
  if (totalScore >= 80) return LeadQualityCode.Hot
  if (totalScore >= 50) return LeadQualityCode.Warm
  return LeadQualityCode.Cold
}

/**
 * Label para fuente de lead (helper)
 */
function getSourceLabel(source: LeadSourceCode): string {
  const labels: Record<LeadSourceCode, string> = {
    [LeadSourceCode.Advertisement]: 'Advertisement',
    [LeadSourceCode.Employee_Referral]: 'Employee Referral',
    [LeadSourceCode.External_Referral]: 'External Referral',
    [LeadSourceCode.Partner]: 'Partner',
    [LeadSourceCode.Public_Relations]: 'Public Relations',
    [LeadSourceCode.Seminar]: 'Seminar',
    [LeadSourceCode.Trade_Show]: 'Trade Show',
    [LeadSourceCode.Web]: 'Web',
    [LeadSourceCode.Word_of_Mouth]: 'Word of Mouth',
    [LeadSourceCode.Other]: 'Other',
  }
  return labels[source] || 'Unknown'
}

/**
 * Calcula el score completo de un lead
 */
export function calculateLeadScore(
  lead: Partial<Lead>,
  options?: {
    activityCount?: {
      emails?: number
      phoneCalls?: number
      meetings?: number
      formSubmissions?: number
    }
    idealProfile?: {
      industries?: number[]
      minRevenue?: number
      maxRevenue?: number
      minEmployees?: number
      maxEmployees?: number
      preferredCountries?: string[]
    }
    config?: Partial<ScoringConfig>
  }
): LeadScoreBreakdown {
  const config = { ...DEFAULT_SCORING_CONFIG, ...options?.config }

  // Calcular scores individuales
  const sourceResult = calculateSourceScore(lead, config)
  const engagementResult = calculateEngagementScore(
    lead,
    options?.activityCount,
    config
  )
  const fitResult = calculateFitScore(lead, options?.idealProfile, config)
  const bantResult = calculateBANTScore(lead, config)

  // Score total
  const totalScore =
    sourceResult.score +
    engagementResult.score +
    fitResult.score +
    bantResult.score

  // Determinar calidad
  const quality = determineLeadQuality(totalScore)

  // Combinar reasoning
  const reasoning = [
    '--- SOURCE SCORE ---',
    ...sourceResult.reasoning,
    '',
    '--- ENGAGEMENT SCORE ---',
    ...engagementResult.reasoning,
    '',
    '--- FIT SCORE ---',
    ...fitResult.reasoning,
    '',
    '--- BANT SCORE ---',
    ...bantResult.reasoning,
    '',
    `TOTAL SCORE: ${totalScore}/100`,
    `QUALITY: ${quality === LeadQualityCode.Hot ? 'HOT' : quality === LeadQualityCode.Warm ? 'WARM' : 'COLD'}`,
  ]

  return {
    sourceScore: sourceResult.score,
    engagementScore: engagementResult.score,
    fitScore: fitResult.score,
    bantScore: bantResult.score,
    totalScore,
    quality,
    reasoning,
  }
}

/**
 * Actualiza automáticamente el leadqualitycode de un lead basado en su score
 */
export function autoUpdateLeadQuality(
  lead: Lead,
  scoreBreakdown: LeadScoreBreakdown
): Lead {
  return {
    ...lead,
    leadqualitycode: scoreBreakdown.quality,
    // En producción, también se guardaría el score en un campo custom
    // leadscorevalue: scoreBreakdown.totalScore,
  }
}
