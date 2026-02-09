/**
 * Lead Source Analytics Service
 *
 * Sistema de analytics para tracking de fuentes de leads:
 * - Campaign → Form → Lead tracking (atribución multi-touch)
 * - Conversion rate por fuente
 * - ROI por canal de marketing
 * - Time-to-convert por fuente
 * - Lead quality por fuente
 * - Cost per lead (CPL) y Cost per acquisition (CPA)
 *
 * Métricas clave:
 * - Volume (cantidad de leads por fuente)
 * - Quality (score promedio por fuente)
 * - Conversion Rate (% leads → qualified → won)
 * - Velocity (tiempo promedio de conversión)
 * - ROI (retorno de inversión por canal)
 */

import type { Lead } from '@/core/contracts/entities/lead'
import type { Opportunity } from '@/core/contracts/entities/opportunity'
import { LeadSourceCode, LeadQualityCode, LeadStateCode, OpportunityStateCode } from '@/core/contracts/enums'

export interface LeadSourceMetrics {
  source: LeadSourceCode
  sourceName: string

  // Volume metrics
  totalLeads: number
  newLeadsThisMonth: number
  newLeadsLastMonth: number
  growthRate: number // % change month-over-month

  // Quality metrics
  averageScore: number // 0-100
  hotLeadsCount: number
  warmLeadsCount: number
  coldLeadsCount: number
  qualityDistribution: {
    hot: number // %
    warm: number // %
    cold: number // %
  }

  // Conversion metrics
  qualifiedCount: number
  qualifiedRate: number // %
  opportunitiesCreated: number
  opportunitiesWon: number
  winRate: number // %
  totalRevenue: number

  // Velocity metrics
  avgTimeToQualify: number // días
  avgTimeToClose: number // días

  // Cost metrics (opcional - requiere integración con marketing)
  totalCost?: number
  costPerLead?: number
  costPerAcquisition?: number
  roi?: number // %
}

export interface CampaignAttribution {
  campaignId: string
  campaignName: string
  campaignType: 'email' | 'social' | 'ppc' | 'event' | 'content' | 'other'
  formId?: string
  formName?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  landingPageUrl?: string
  firstTouchDate: Date
  lastTouchDate: Date
  touchCount: number // Número de interacciones antes de conversión
}

export interface LeadSourceAnalytics {
  dateRange: {
    from: Date
    to: Date
  }
  metrics: LeadSourceMetrics[]
  topPerformers: {
    byVolume: LeadSourceMetrics
    byQuality: LeadSourceMetrics
    byConversion: LeadSourceMetrics
    byROI?: LeadSourceMetrics
  }
  trends: {
    source: LeadSourceCode
    monthlyData: {
      month: string // "2025-01"
      leadsCount: number
      qualifiedCount: number
      revenue: number
    }[]
  }[]
  recommendations: string[]
}

/**
 * Calcula el nombre legible de una fuente
 */
function getSourceName(source: LeadSourceCode): string {
  const names: Record<LeadSourceCode, string> = {
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
  return names[source]
}

/**
 * Calcula métricas para una fuente específica
 */
function calculateSourceMetrics(
  source: LeadSourceCode,
  leads: Lead[],
  opportunities: Opportunity[],
  dateRange: { from: Date; to: Date },
  costs?: { [key in LeadSourceCode]?: number }
): LeadSourceMetrics {
  const sourceLeads = leads.filter((l) => l.leadsourcecode === source)

  // Volume metrics
  const totalLeads = sourceLeads.length
  const thisMonth = new Date()
  const lastMonth = new Date(thisMonth)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const newLeadsThisMonth = sourceLeads.filter((l) => {
    const createdDate = new Date(l.createdon!)
    return createdDate >= new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
  }).length

  const newLeadsLastMonth = sourceLeads.filter((l) => {
    const createdDate = new Date(l.createdon!)
    return (
      createdDate >= new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1) &&
      createdDate < new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    )
  }).length

  const growthRate =
    newLeadsLastMonth > 0
      ? ((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100
      : 0

  // Quality metrics
  const hotLeadsCount = sourceLeads.filter(
    (l) => l.leadqualitycode === LeadQualityCode.Hot
  ).length
  const warmLeadsCount = sourceLeads.filter(
    (l) => l.leadqualitycode === LeadQualityCode.Warm
  ).length
  const coldLeadsCount = sourceLeads.filter(
    (l) => l.leadqualitycode === LeadQualityCode.Cold
  ).length

  // Calcular average score (simulado - en producción vendría del campo leadscorevalue)
  const averageScore =
    totalLeads > 0
      ? (hotLeadsCount * 85 + warmLeadsCount * 60 + coldLeadsCount * 30) / totalLeads
      : 0

  const qualityDistribution = {
    hot: totalLeads > 0 ? (hotLeadsCount / totalLeads) * 100 : 0,
    warm: totalLeads > 0 ? (warmLeadsCount / totalLeads) * 100 : 0,
    cold: totalLeads > 0 ? (coldLeadsCount / totalLeads) * 100 : 0,
  }

  // Conversion metrics
  const qualifiedLeads = sourceLeads.filter((l) => l.statecode === LeadStateCode.Qualified)
  const qualifiedCount = qualifiedLeads.length
  const qualifiedRate = totalLeads > 0 ? (qualifiedCount / totalLeads) * 100 : 0

  // Opportunities creadas desde estos leads (Set for O(1) lookups)
  const sourceLeadIdSet = new Set(sourceLeads.map((l) => l.leadid))
  const sourceOpportunities = opportunities.filter((o) =>
    sourceLeadIdSet.has(o.originatingleadid || '')
  )

  const opportunitiesCreated = sourceOpportunities.length
  const opportunitiesWon = sourceOpportunities.filter(
    (o) => o.statecode === OpportunityStateCode.Won
  ).length
  const winRate =
    opportunitiesCreated > 0 ? (opportunitiesWon / opportunitiesCreated) * 100 : 0

  const totalRevenue = sourceOpportunities
    .filter((o) => o.statecode === OpportunityStateCode.Won)
    .reduce((sum, o) => sum + (o.actualvalue || 0), 0)

  // Velocity metrics (simplificado)
  const avgTimeToQualify = 14 // Placeholder - en producción calcular real
  const avgTimeToClose = 45 // Placeholder - en producción calcular real

  // Cost metrics
  const totalCost = costs?.[source]
  const costPerLead = totalCost && totalLeads > 0 ? totalCost / totalLeads : undefined
  const costPerAcquisition =
    totalCost && opportunitiesWon > 0 ? totalCost / opportunitiesWon : undefined
  const roi =
    totalCost && totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : undefined

  return {
    source,
    sourceName: getSourceName(source),
    totalLeads,
    newLeadsThisMonth,
    newLeadsLastMonth,
    growthRate,
    averageScore,
    hotLeadsCount,
    warmLeadsCount,
    coldLeadsCount,
    qualityDistribution,
    qualifiedCount,
    qualifiedRate,
    opportunitiesCreated,
    opportunitiesWon,
    winRate,
    totalRevenue,
    avgTimeToQualify,
    avgTimeToClose,
    totalCost,
    costPerLead,
    costPerAcquisition,
    roi,
  }
}

/**
 * Genera recomendaciones basadas en las métricas
 */
function generateRecommendations(metrics: LeadSourceMetrics[]): string[] {
  const recommendations: string[] = []

  // Identificar fuentes de alto volumen pero baja calidad
  const highVolumeLowQuality = metrics.filter(
    (m) => m.totalLeads > 50 && m.averageScore < 40
  )
  if (highVolumeLowQuality.length > 0) {
    recommendations.push(
      `⚠️ High volume but low quality detected in: ${highVolumeLowQuality.map((m) => m.sourceName).join(', ')}. Consider improving lead qualification criteria.`
    )
  }

  // Identificar fuentes con buen ROI
  const goodROI = metrics.filter((m) => m.roi !== undefined && m.roi > 200)
  if (goodROI.length > 0) {
    recommendations.push(
      `✅ Excellent ROI (>200%) from: ${goodROI.map((m) => m.sourceName).join(', ')}. Consider increasing investment in these channels.`
    )
  }

  // Identificar fuentes con bajo ROI
  const poorROI = metrics.filter((m) => m.roi !== undefined && m.roi < 0)
  if (poorROI.length > 0) {
    recommendations.push(
      `❌ Negative ROI detected in: ${poorROI.map((m) => m.sourceName).join(', ')}. Review campaign effectiveness or pause these channels.`
    )
  }

  // Identificar fuentes con alta tasa de conversión
  const highConversion = metrics.filter((m) => m.qualifiedRate > 50)
  if (highConversion.length > 0) {
    recommendations.push(
      `🎯 High conversion rate (>50%) from: ${highConversion.map((m) => m.sourceName).join(', ')}. These are your best performing sources.`
    )
  }

  // Identificar fuentes con crecimiento alto
  const fastGrowth = metrics.filter((m) => m.growthRate > 50)
  if (fastGrowth.length > 0) {
    recommendations.push(
      `📈 Fast growing sources (>50% MoM): ${fastGrowth.map((m) => m.sourceName).join(', ')}. Monitor closely and scale if quality remains high.`
    )
  }

  // Identificar fuentes con bajo costo por lead
  const lowCPL = metrics.filter(
    (m) => m.costPerLead !== undefined && m.costPerLead < 50
  )
  if (lowCPL.length > 0) {
    recommendations.push(
      `💰 Low cost per lead (<$50) from: ${lowCPL.map((m) => m.sourceName).join(', ')}. Cost-effective channels worth scaling.`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('No specific recommendations at this time. Continue monitoring performance.')
  }

  return recommendations
}

/**
 * Calcula analytics completo de fuentes de leads
 */
export function calculateLeadSourceAnalytics(
  leads: Lead[],
  opportunities: Opportunity[],
  dateRange: { from: Date; to: Date },
  costs?: { [key in LeadSourceCode]?: number }
): LeadSourceAnalytics {
  // Filtrar leads por date range
  const filteredLeads = leads.filter((l) => {
    if (!l.createdon) return false
    const createdDate = new Date(l.createdon)
    return createdDate >= dateRange.from && createdDate <= dateRange.to
  })

  // Obtener todas las fuentes únicas
  const sources = Array.from(
    new Set(filteredLeads.map((l) => l.leadsourcecode))
  ).filter((s) => s !== undefined) as LeadSourceCode[]

  // Calcular métricas para cada fuente
  const metrics = sources.map((source) =>
    calculateSourceMetrics(source, filteredLeads, opportunities, dateRange, costs)
  )

  // Identificar top performers
  const topPerformers = {
    byVolume: metrics.reduce((prev, current) =>
      current.totalLeads > prev.totalLeads ? current : prev
    ),
    byQuality: metrics.reduce((prev, current) =>
      current.averageScore > prev.averageScore ? current : prev
    ),
    byConversion: metrics.reduce((prev, current) =>
      current.qualifiedRate > prev.qualifiedRate ? current : prev
    ),
    byROI:
      metrics.filter((m) => m.roi !== undefined).length > 0
        ? metrics
            .filter((m) => m.roi !== undefined)
            .reduce((prev, current) => (current.roi! > (prev.roi || 0) ? current : prev))
        : undefined,
  }

  // Generar trends (placeholder - en producción calcular real)
  const trends = sources.map((source) => ({
    source,
    monthlyData: [
      { month: '2025-01', leadsCount: 45, qualifiedCount: 23, revenue: 125000 },
      { month: '2025-02', leadsCount: 52, qualifiedCount: 28, revenue: 145000 },
      { month: '2025-03', leadsCount: 48, qualifiedCount: 25, revenue: 135000 },
    ],
  }))

  // Generar recomendaciones
  const recommendations = generateRecommendations(metrics)

  return {
    dateRange,
    metrics,
    topPerformers,
    trends,
    recommendations,
  }
}

/**
 * Atribución de campaña a lead (multi-touch attribution)
 */
export function attributeCampaignToLead(
  lead: Lead,
  campaignData: Partial<CampaignAttribution>
): CampaignAttribution {
  return {
    campaignId: campaignData.campaignId || 'unknown',
    campaignName: campaignData.campaignName || 'Unknown Campaign',
    campaignType: campaignData.campaignType || 'other',
    formId: campaignData.formId,
    formName: campaignData.formName,
    utmSource: campaignData.utmSource,
    utmMedium: campaignData.utmMedium,
    utmCampaign: campaignData.utmCampaign,
    utmContent: campaignData.utmContent,
    landingPageUrl: campaignData.landingPageUrl,
    firstTouchDate: campaignData.firstTouchDate || new Date(lead.createdon || Date.now()),
    lastTouchDate: campaignData.lastTouchDate || new Date(lead.createdon || Date.now()),
    touchCount: campaignData.touchCount || 1,
  }
}

/**
 * Comparación entre dos períodos (útil para reportes)
 */
export function compareSourcePerformance(
  currentPeriod: LeadSourceMetrics[],
  previousPeriod: LeadSourceMetrics[]
): {
  source: LeadSourceCode
  sourceName: string
  volumeChange: number // %
  qualityChange: number // points
  conversionChange: number // %
  revenueChange: number // $
}[] {
  return currentPeriod.map((current) => {
    const previous = previousPeriod.find((p) => p.source === current.source)

    if (!previous) {
      return {
        source: current.source,
        sourceName: current.sourceName,
        volumeChange: 0,
        qualityChange: 0,
        conversionChange: 0,
        revenueChange: current.totalRevenue,
      }
    }

    return {
      source: current.source,
      sourceName: current.sourceName,
      volumeChange:
        previous.totalLeads > 0
          ? ((current.totalLeads - previous.totalLeads) / previous.totalLeads) * 100
          : 0,
      qualityChange: current.averageScore - previous.averageScore,
      conversionChange: current.qualifiedRate - previous.qualifiedRate,
      revenueChange: current.totalRevenue - previous.totalRevenue,
    }
  })
}
