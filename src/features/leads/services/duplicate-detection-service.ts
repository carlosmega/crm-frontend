/**
 * Duplicate Detection Service
 *
 * Detecta registros duplicados usando fuzzy matching y reglas de similitud.
 * Soporta: Leads, Accounts, Contacts
 */

import type { Lead } from '@/core/contracts/entities/lead'
import type { Account } from '@/core/contracts/entities/account'
import type { Contact } from '@/core/contracts/entities/contact'

export interface DuplicateMatch {
  id: string
  score: number // 0-100, donde 100 es match exacto
  matchedFields: string[]
  record: Lead | Account | Contact
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean
  matches: DuplicateMatch[]
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Normaliza un string para comparación
 * - Convierte a lowercase
 * - Elimina espacios extra
 * - Elimina caracteres especiales
 */
function normalizeString(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Calcula similitud entre dos strings usando Levenshtein distance simplificado
 * Retorna 0-100 donde 100 es match exacto
 */
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1)
  const norm2 = normalizeString(str2)

  if (norm1 === norm2) return 100
  if (!norm1 || !norm2) return 0

  // Exact match después de normalización
  if (norm1 === norm2) return 100

  // Contains check
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length)
    const shorter = Math.min(norm1.length, norm2.length)
    return Math.round((shorter / longer) * 90)
  }

  // Simplified Levenshtein-like similarity
  const maxLen = Math.max(norm1.length, norm2.length)
  let matches = 0

  for (let i = 0; i < Math.min(norm1.length, norm2.length); i++) {
    if (norm1[i] === norm2[i]) matches++
  }

  return Math.round((matches / maxLen) * 80)
}

/**
 * Extrae dominio de un email
 */
function extractEmailDomain(email: string | undefined | null): string {
  if (!email) return ''
  const parts = email.toLowerCase().split('@')
  return parts.length > 1 ? parts[1] : ''
}

/**
 * Detecta leads duplicados
 */
export function detectDuplicateLeads(
  newLead: Partial<Lead>,
  existingLeads: Lead[]
): DuplicateDetectionResult {
  const matches: DuplicateMatch[] = []

  for (const existing of existingLeads) {
    let score = 0
    const matchedFields: string[] = []

    // Email match (peso alto: 40 puntos)
    if (newLead.emailaddress1 && existing.emailaddress1) {
      const emailSimilarity = calculateSimilarity(
        newLead.emailaddress1,
        existing.emailaddress1
      )
      if (emailSimilarity === 100) {
        score += 40
        matchedFields.push('email')
      } else if (emailSimilarity > 80) {
        score += 20
        matchedFields.push('email (similar)')
      }
    }

    // Name match (peso medio: 25 puntos)
    const newFullName = `${newLead.firstname || ''} ${newLead.lastname || ''}`
    const existingFullName = `${existing.firstname || ''} ${existing.lastname || ''}`
    const nameSimilarity = calculateSimilarity(newFullName, existingFullName)

    if (nameSimilarity >= 90) {
      score += 25
      matchedFields.push('name')
    } else if (nameSimilarity >= 70) {
      score += 15
      matchedFields.push('name (similar)')
    }

    // Company match (peso medio: 20 puntos)
    if (newLead.companyname && existing.companyname) {
      const companySimilarity = calculateSimilarity(
        newLead.companyname,
        existing.companyname
      )
      if (companySimilarity >= 90) {
        score += 20
        matchedFields.push('company')
      } else if (companySimilarity >= 70) {
        score += 10
        matchedFields.push('company (similar)')
      }
    }

    // Phone match (peso bajo: 15 puntos)
    if (newLead.telephone1 && existing.telephone1) {
      const phoneSimilarity = calculateSimilarity(
        newLead.telephone1,
        existing.telephone1
      )
      if (phoneSimilarity === 100) {
        score += 15
        matchedFields.push('phone')
      }
    }

    // Si el score es >= 50, es un posible duplicado
    if (score >= 50) {
      matches.push({
        id: existing.leadid,
        score,
        matchedFields,
        record: existing,
      })
    }
  }

  // Ordenar por score descendente
  matches.sort((a, b) => b.score - a.score)

  // Determinar confianza
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (matches.length > 0) {
    const topScore = matches[0].score
    if (topScore >= 80) confidence = 'high'
    else if (topScore >= 65) confidence = 'medium'
    else confidence = 'low'
  }

  return {
    hasDuplicates: matches.length > 0,
    matches: matches.slice(0, 5), // Top 5 matches
    confidence,
  }
}

/**
 * Detecta accounts duplicados
 */
export function detectDuplicateAccounts(
  newAccount: Partial<Account>,
  existingAccounts: Account[]
): DuplicateDetectionResult {
  const matches: DuplicateMatch[] = []

  for (const existing of existingAccounts) {
    let score = 0
    const matchedFields: string[] = []

    // Account name match (peso muy alto: 50 puntos)
    if (newAccount.name && existing.name) {
      const nameSimilarity = calculateSimilarity(newAccount.name, existing.name)
      if (nameSimilarity >= 95) {
        score += 50
        matchedFields.push('name')
      } else if (nameSimilarity >= 80) {
        score += 30
        matchedFields.push('name (similar)')
      }
    }

    // Website domain match (peso alto: 30 puntos)
    if (newAccount.websiteurl && existing.websiteurl) {
      const newDomain = normalizeString(newAccount.websiteurl).replace(/^(https?:\/\/)?(www\.)?/, '')
      const existingDomain = normalizeString(existing.websiteurl).replace(/^(https?:\/\/)?(www\.)?/, '')

      if (newDomain && existingDomain && newDomain === existingDomain) {
        score += 30
        matchedFields.push('website')
      }
    }

    // Email domain match (peso medio: 15 puntos)
    if (newAccount.emailaddress1 && existing.emailaddress1) {
      const newDomain = extractEmailDomain(newAccount.emailaddress1)
      const existingDomain = extractEmailDomain(existing.emailaddress1)

      if (newDomain && existingDomain && newDomain === existingDomain) {
        score += 15
        matchedFields.push('email domain')
      }
    }

    // Phone match (peso bajo: 5 puntos)
    if (newAccount.telephone1 && existing.telephone1) {
      const phoneSimilarity = calculateSimilarity(
        newAccount.telephone1,
        existing.telephone1
      )
      if (phoneSimilarity === 100) {
        score += 5
        matchedFields.push('phone')
      }
    }

    if (score >= 50) {
      matches.push({
        id: existing.accountid,
        score,
        matchedFields,
        record: existing,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (matches.length > 0) {
    const topScore = matches[0].score
    if (topScore >= 80) confidence = 'high'
    else if (topScore >= 65) confidence = 'medium'
    else confidence = 'low'
  }

  return {
    hasDuplicates: matches.length > 0,
    matches: matches.slice(0, 5),
    confidence,
  }
}

/**
 * Detecta contacts duplicados
 */
export function detectDuplicateContacts(
  newContact: Partial<Contact>,
  existingContacts: Contact[]
): DuplicateDetectionResult {
  const matches: DuplicateMatch[] = []

  for (const existing of existingContacts) {
    let score = 0
    const matchedFields: string[] = []

    // Email match (peso muy alto: 45 puntos)
    if (newContact.emailaddress1 && existing.emailaddress1) {
      const emailSimilarity = calculateSimilarity(
        newContact.emailaddress1,
        existing.emailaddress1
      )
      if (emailSimilarity === 100) {
        score += 45
        matchedFields.push('email')
      }
    }

    // Full name match (peso alto: 30 puntos)
    const newFullName = `${newContact.firstname || ''} ${newContact.lastname || ''}`
    const existingFullName = `${existing.firstname || ''} ${existing.lastname || ''}`
    const nameSimilarity = calculateSimilarity(newFullName, existingFullName)

    if (nameSimilarity >= 95) {
      score += 30
      matchedFields.push('name')
    } else if (nameSimilarity >= 80) {
      score += 20
      matchedFields.push('name (similar)')
    }

    // Parent account match + name (bonus: +15 puntos)
    if (
      newContact.parentcustomerid &&
      existing.parentcustomerid &&
      newContact.parentcustomerid === existing.parentcustomerid &&
      nameSimilarity >= 70
    ) {
      score += 15
      matchedFields.push('same account')
    }

    // Phone match (peso medio: 10 puntos)
    if (newContact.telephone1 && existing.telephone1) {
      const phoneSimilarity = calculateSimilarity(
        newContact.telephone1,
        existing.telephone1
      )
      if (phoneSimilarity === 100) {
        score += 10
        matchedFields.push('phone')
      }
    }

    if (score >= 50) {
      matches.push({
        id: existing.contactid,
        score,
        matchedFields,
        record: existing,
      })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (matches.length > 0) {
    const topScore = matches[0].score
    if (topScore >= 85) confidence = 'high'
    else if (topScore >= 70) confidence = 'medium'
    else confidence = 'low'
  }

  return {
    hasDuplicates: matches.length > 0,
    matches: matches.slice(0, 5),
    confidence,
  }
}
