/**
 * Lead Assignment Service
 *
 * Sistema de auto-asignación de leads basado en reglas configurables:
 * - Territory-based (geografía)
 * - Industry-based (industria/sector)
 * - Company size-based (revenue, employee count)
 * - Round-robin (distribución equitativa)
 * - Load balancing (balanceo de carga)
 * - Skill-based (expertise del sales rep)
 *
 * Prioridad de reglas (orden de evaluación):
 * 1. Territory rules (más específicas)
 * 2. Industry rules
 * 3. Company size rules
 * 4. Skill-based rules
 * 5. Round-robin (fallback)
 */

import type { Lead } from '@/core/contracts/entities/lead'
import { IndustryCode } from '@/core/contracts/enums'

export interface SalesRep {
  id: string
  name: string
  email: string
  isActive: boolean
  currentLeadCount: number // Para load balancing
  maxLeadCapacity: number // Límite de leads activos
  territories?: string[] // Países/regiones asignadas
  industries?: IndustryCode[] // Industrias de expertise
  minCompanyRevenue?: number // Revenue mínimo que puede manejar
  maxCompanyRevenue?: number // Revenue máximo
  skills?: string[] // Skills específicas (e.g., "enterprise", "smb", "technical")
}

export interface AssignmentRule {
  id: string
  name: string
  priority: number // Menor número = mayor prioridad
  isActive: boolean
  type: 'territory' | 'industry' | 'company_size' | 'skill' | 'round_robin'
  conditions: AssignmentCondition[]
  assignTo: string // Sales rep ID
}

export interface AssignmentCondition {
  field: string // e.g., "address1_country", "industrycode", "revenue"
  operator: 'equals' | 'in' | 'between' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface AssignmentResult {
  assignedTo: string | null
  assignedToName?: string
  ruleApplied: string | null
  reason: string
  allEvaluations: {
    ruleName: string
    matched: boolean
    reason: string
  }[]
}

/**
 * Evalúa si un lead cumple con las condiciones de una regla
 */
function evaluateConditions(
  lead: Partial<Lead>,
  conditions: AssignmentCondition[]
): boolean {
  return conditions.every((condition) => {
    const fieldValue = (lead as any)[condition.field]

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)

      case 'between':
        if (!Array.isArray(condition.value) || condition.value.length !== 2) {
          return false
        }
        const [min, max] = condition.value
        return fieldValue >= min && fieldValue <= max

      case 'greater_than':
        return fieldValue > condition.value

      case 'less_than':
        return fieldValue < condition.value

      case 'contains':
        return (
          typeof fieldValue === 'string' &&
          fieldValue.toLowerCase().includes(condition.value.toLowerCase())
        )

      default:
        return false
    }
  })
}

/**
 * Evalúa si un sales rep está disponible (no ha alcanzado capacidad máxima)
 */
function isSalesRepAvailable(rep: SalesRep): boolean {
  return rep.isActive && rep.currentLeadCount < rep.maxLeadCapacity
}

/**
 * Asigna lead usando Round-Robin (distribuye equitativamente)
 */
function assignRoundRobin(
  lead: Partial<Lead>,
  salesReps: SalesRep[],
  lastAssignedIndex: number
): AssignmentResult {
  const availableReps = salesReps.filter(isSalesRepAvailable)

  if (availableReps.length === 0) {
    return {
      assignedTo: null,
      ruleApplied: null,
      reason: 'No available sales reps (all at capacity)',
      allEvaluations: [],
    }
  }

  // Rotar al siguiente rep disponible
  let nextIndex = (lastAssignedIndex + 1) % salesReps.length
  let attempts = 0

  while (attempts < salesReps.length) {
    const rep = salesReps[nextIndex]
    if (isSalesRepAvailable(rep)) {
      return {
        assignedTo: rep.id,
        assignedToName: rep.name,
        ruleApplied: 'round-robin',
        reason: `Assigned via round-robin distribution to ${rep.name}`,
        allEvaluations: [],
      }
    }
    nextIndex = (nextIndex + 1) % salesReps.length
    attempts++
  }

  return {
    assignedTo: null,
    ruleApplied: null,
    reason: 'Round-robin failed: no available reps',
    allEvaluations: [],
  }
}

/**
 * Asigna lead usando Territory-based rules
 */
function assignByTerritory(
  lead: Partial<Lead>,
  salesReps: SalesRep[]
): AssignmentResult | null {
  if (!lead.address1_country) {
    return null
  }

  const matchingReps = salesReps.filter(
    (rep) =>
      isSalesRepAvailable(rep) &&
      rep.territories &&
      rep.territories.includes(lead.address1_country!)
  )

  if (matchingReps.length === 0) {
    return null
  }

  // Si hay múltiples matches, elegir el que tenga menos leads (load balancing)
  const selectedRep = matchingReps.reduce((prev, current) =>
    current.currentLeadCount < prev.currentLeadCount ? current : prev
  )

  return {
    assignedTo: selectedRep.id,
    assignedToName: selectedRep.name,
    ruleApplied: 'territory',
    reason: `Assigned to ${selectedRep.name} based on territory: ${lead.address1_country}`,
    allEvaluations: [],
  }
}

/**
 * Asigna lead usando Industry-based rules
 *
 * TODO: Industry code is not available on Lead entity, only on Account
 * This function should be implemented for Account-based assignment
 */
/* function assignByIndustry(
  lead: Partial<Lead>,
  salesReps: SalesRep[]
): AssignmentResult | null {
  if (!lead.industrycode) {
    return null
  }

  const industryCode = lead.industrycode

  const matchingReps = salesReps.filter(
    (rep) =>
      isSalesRepAvailable(rep) &&
      rep.industries &&
      rep.industries.includes(industryCode)
  )

  if (matchingReps.length === 0) {
    return null
  }

  // Load balancing entre los matches
  const selectedRep = matchingReps.reduce((prev, current) =>
    current.currentLeadCount < prev.currentLeadCount ? current : prev
  )

  return {
    assignedTo: selectedRep.id,
    assignedToName: selectedRep.name,
    ruleApplied: 'industry',
    reason: `Assigned to ${selectedRep.name} based on industry expertise`,
    allEvaluations: [],
  }
} */

/**
 * Asigna lead usando Company Size rules (basado en revenue)
 *
 * TODO: Revenue is not available on Lead entity, only on Account
 * This function should be implemented for Account-based assignment
 */
/* function assignByCompanySize(
  lead: Partial<Lead>,
  salesReps: SalesRep[]
): AssignmentResult | null {
  if (!lead.revenue || lead.revenue <= 0) {
    return null
  }

  const matchingReps = salesReps.filter((rep) => {
    if (!isSalesRepAvailable(rep)) return false

    const minMatch = !rep.minCompanyRevenue || lead.revenue! >= rep.minCompanyRevenue
    const maxMatch = !rep.maxCompanyRevenue || lead.revenue! <= rep.maxCompanyRevenue

    return minMatch && maxMatch
  })

  if (matchingReps.length === 0) {
    return null
  }

  // Load balancing
  const selectedRep = matchingReps.reduce((prev, current) =>
    current.currentLeadCount < prev.currentLeadCount ? current : prev
  )

  return {
    assignedTo: selectedRep.id,
    assignedToName: selectedRep.name,
    ruleApplied: 'company_size',
    reason: `Assigned to ${selectedRep.name} based on company revenue: $${lead.revenue?.toLocaleString()}`,
    allEvaluations: [],
  }
} */

/**
 * Asigna lead usando Skill-based rules
 */
function assignBySkills(
  lead: Partial<Lead>,
  salesReps: SalesRep[],
  requiredSkills: string[]
): AssignmentResult | null {
  if (!requiredSkills || requiredSkills.length === 0) {
    return null
  }

  const matchingReps = salesReps.filter((rep) => {
    if (!isSalesRepAvailable(rep) || !rep.skills) return false

    // Rep debe tener al menos una de las skills requeridas
    return requiredSkills.some((skill) =>
      rep.skills!.some((repSkill) =>
        repSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  })

  if (matchingReps.length === 0) {
    return null
  }

  // Load balancing
  const selectedRep = matchingReps.reduce((prev, current) =>
    current.currentLeadCount < prev.currentLeadCount ? current : prev
  )

  return {
    assignedTo: selectedRep.id,
    assignedToName: selectedRep.name,
    ruleApplied: 'skill',
    reason: `Assigned to ${selectedRep.name} based on required skills: ${requiredSkills.join(', ')}`,
    allEvaluations: [],
  }
}

/**
 * Asigna lead usando reglas configurables (custom rules)
 */
function assignByCustomRules(
  lead: Partial<Lead>,
  rules: AssignmentRule[],
  salesReps: SalesRep[]
): AssignmentResult | null {
  // Ordenar reglas por prioridad (menor número = mayor prioridad)
  const sortedRules = [...rules]
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.priority - b.priority)

  for (const rule of sortedRules) {
    if (evaluateConditions(lead, rule.conditions)) {
      const assignedRep = salesReps.find((rep) => rep.id === rule.assignTo)

      if (assignedRep && isSalesRepAvailable(assignedRep)) {
        return {
          assignedTo: assignedRep.id,
          assignedToName: assignedRep.name,
          ruleApplied: `custom-rule-${rule.id}`,
          reason: `Assigned to ${assignedRep.name} via custom rule: "${rule.name}"`,
          allEvaluations: [],
        }
      }
    }
  }

  return null
}

/**
 * Función principal: Asigna un lead automáticamente
 */
export function autoAssignLead(
  lead: Partial<Lead>,
  salesReps: SalesRep[],
  options?: {
    customRules?: AssignmentRule[]
    requiredSkills?: string[]
    lastAssignedIndex?: number
    preferredStrategy?: 'territory' | 'industry' | 'company_size' | 'skill' | 'round_robin'
  }
): AssignmentResult {
  const evaluations: { ruleName: string; matched: boolean; reason: string }[] = []

  // 1. Intentar custom rules primero (si existen)
  if (options?.customRules && options.customRules.length > 0) {
    const customResult = assignByCustomRules(lead, options.customRules, salesReps)
    if (customResult) {
      evaluations.push({
        ruleName: 'Custom Rules',
        matched: true,
        reason: customResult.reason,
      })
      return { ...customResult, allEvaluations: evaluations }
    }
    evaluations.push({
      ruleName: 'Custom Rules',
      matched: false,
      reason: 'No matching custom rules',
    })
  }

  // 2. Territory-based (mayor prioridad)
  const territoryResult = assignByTerritory(lead, salesReps)
  if (territoryResult) {
    evaluations.push({
      ruleName: 'Territory',
      matched: true,
      reason: territoryResult.reason,
    })
    return { ...territoryResult, allEvaluations: evaluations }
  }
  evaluations.push({
    ruleName: 'Territory',
    matched: false,
    reason: lead.address1_country
      ? 'No reps available for this territory'
      : 'No country specified',
  })

  // 3. Industry-based
  // TODO: Industry code is not available on Lead entity, only on Account
  // This would need to be implemented after Lead is qualified and linked to Account
  /* const industryResult = assignByIndustry(lead, salesReps)
  if (industryResult) {
    evaluations.push({
      ruleName: 'Industry',
      matched: true,
      reason: industryResult.reason,
    })
    return { ...industryResult, allEvaluations: evaluations }
  } */
  evaluations.push({
    ruleName: 'Industry',
    matched: false,
    reason: 'Industry code not available on Lead entity',
  })

  // 4. Company Size-based
  // TODO: Revenue is not available on Lead entity, only on Account
  /* const companySizeResult = assignByCompanySize(lead, salesReps)
  if (companySizeResult) {
    evaluations.push({
      ruleName: 'Company Size',
      matched: true,
      reason: companySizeResult.reason,
    })
    return { ...companySizeResult, allEvaluations: evaluations }
  } */
  evaluations.push({
    ruleName: 'Company Size',
    matched: false,
    reason: 'Revenue not available on Lead entity',
  })

  // 5. Skill-based
  if (options?.requiredSkills && options.requiredSkills.length > 0) {
    const skillResult = assignBySkills(lead, salesReps, options.requiredSkills)
    if (skillResult) {
      evaluations.push({
        ruleName: 'Skills',
        matched: true,
        reason: skillResult.reason,
      })
      return { ...skillResult, allEvaluations: evaluations }
    }
    evaluations.push({
      ruleName: 'Skills',
      matched: false,
      reason: 'No reps available with required skills',
    })
  }

  // 6. Fallback: Round-robin
  const roundRobinResult = assignRoundRobin(
    lead,
    salesReps,
    options?.lastAssignedIndex ?? 0
  )
  evaluations.push({
    ruleName: 'Round-Robin (Fallback)',
    matched: roundRobinResult.assignedTo !== null,
    reason: roundRobinResult.reason,
  })

  return { ...roundRobinResult, allEvaluations: evaluations }
}

/**
 * Obtiene la distribución de leads por sales rep (para load balancing)
 */
export function getLeadDistribution(salesReps: SalesRep[]): {
  rep: SalesRep
  percentage: number
  isOverloaded: boolean
}[] {
  const totalLeads = salesReps.reduce((sum, rep) => sum + rep.currentLeadCount, 0)

  return salesReps.map((rep) => ({
    rep,
    percentage: totalLeads > 0 ? (rep.currentLeadCount / totalLeads) * 100 : 0,
    isOverloaded: rep.currentLeadCount >= rep.maxLeadCapacity,
  }))
}

/**
 * Sugiere re-asignaciones para balancear la carga
 */
export function suggestRebalancing(salesReps: SalesRep[]): {
  shouldRebalance: boolean
  reason: string
  suggestions: {
    from: string
    to: string
    leadCount: number
  }[]
} {
  const distribution = getLeadDistribution(salesReps)
  const activeReps = distribution.filter((d) => d.rep.isActive)

  if (activeReps.length === 0) {
    return {
      shouldRebalance: false,
      reason: 'No active sales reps',
      suggestions: [],
    }
  }

  const avgPercentage = 100 / activeReps.length
  const threshold = 20 // 20% de desviación

  const overloaded = activeReps.filter((d) => d.percentage > avgPercentage + threshold)
  const underloaded = activeReps.filter((d) => d.percentage < avgPercentage - threshold)

  if (overloaded.length === 0 || underloaded.length === 0) {
    return {
      shouldRebalance: false,
      reason: 'Lead distribution is balanced',
      suggestions: [],
    }
  }

  const suggestions = overloaded.flatMap((over) =>
    underloaded.map((under) => {
      const diff = over.rep.currentLeadCount - under.rep.currentLeadCount
      const toMove = Math.floor(diff / 2)

      return {
        from: over.rep.name,
        to: under.rep.name,
        leadCount: toMove,
      }
    })
  )

  return {
    shouldRebalance: true,
    reason: `${overloaded.length} reps are overloaded, ${underloaded.length} are underloaded`,
    suggestions,
  }
}
