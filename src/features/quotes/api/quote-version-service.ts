/**
 * Quote Version Service
 *
 * Maneja el historial de versiones de Quotes (auditoría y tracking de cambios)
 */

import type {
  QuoteVersion,
  CreateQuoteVersionDto,
  QuoteVersionComparison,
  QuoteVersionQueryParams,
  Quote,
  QuoteDetail,
} from '@/core/contracts'
import { QuoteVersionChangeType } from '@/core/contracts'

// LocalStorage key
const STORAGE_KEY = 'crm_quote_versions'

/**
 * Get all versions from localStorage
 */
function getAllVersions(): QuoteVersion[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

/**
 * Save versions to localStorage
 */
function saveVersions(versions: QuoteVersion[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
}

/**
 * Quote Version Service
 */
export const quoteVersionService = {
  /**
   * Get all versions for a specific quote
   */
  async getVersionsByQuote(params: QuoteVersionQueryParams): Promise<QuoteVersion[]> {
    const allVersions = getAllVersions()

    // Single-pass filter combining all conditions
    const filtered = allVersions.filter((v) => {
      if (v.quoteid !== params.quoteid) return false
      if (params.changetype && v.changetype !== params.changetype) return false
      if (params.fromDate && v.createdon < params.fromDate) return false
      if (params.toDate && v.createdon > params.toDate) return false
      return true
    })

    // Sort by version number (descending - newest first)
    filtered.sort((a, b) => b.versionnumber - a.versionnumber)

    // Apply pagination
    const offset = params.offset || 0
    const limit = params.limit || 50

    return filtered.slice(offset, offset + limit)
  },

  /**
   * Get a specific version by ID
   */
  async getById(versionId: string): Promise<QuoteVersion | null> {
    const versions = getAllVersions()
    return versions.find((v) => v.quoteversionid === versionId) || null
  },

  /**
   * Get latest version for a quote
   */
  async getLatestVersion(quoteid: string): Promise<QuoteVersion | null> {
    const versions = await this.getVersionsByQuote({ quoteid, limit: 1 })
    return versions[0] || null
  },

  /**
   * Create a new version
   */
  async create(dto: CreateQuoteVersionDto): Promise<QuoteVersion> {
    const versions = getAllVersions()

    const newVersion: QuoteVersion = {
      quoteversionid: `qv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quoteid: dto.quoteid,
      versionnumber: dto.versionnumber,
      versiondata: dto.versiondata,
      changetype: dto.changetype,
      changedescription: dto.changedescription,
      changedfields: dto.changedfields,
      createdby: dto.createdby,
      createdon: new Date().toISOString(),
      changereason: dto.changereason,
    }

    versions.push(newVersion)
    saveVersions(versions)

    return newVersion
  },

  /**
   * Create version snapshot from current Quote state
   */
  async createSnapshot(
    quote: Quote,
    quoteLines: QuoteDetail[],
    changetype: QuoteVersionChangeType,
    options?: {
      changedescription?: string
      changedfields?: string[]
      changereason?: string
      createdby?: string
    }
  ): Promise<QuoteVersion> {
    // Get current version number
    const existingVersions = await this.getVersionsByQuote({ quoteid: quote.quoteid })
    const nextVersionNumber = existingVersions.length + 1

    // Calculate totals (ensure numeric types to prevent string concatenation)
    const totalamount = quoteLines.reduce((sum, line) => sum + (Number(line.extendedamount) || 0), 0)
    const totaldiscountamount = quoteLines.reduce(
      (sum, line) => sum + (Number(line.manualdiscountamount) || 0),
      0
    )
    const totaltax = quoteLines.reduce((sum, line) => sum + (Number(line.tax) || 0), 0)

    return this.create({
      quoteid: quote.quoteid,
      versionnumber: nextVersionNumber,
      versiondata: {
        name: quote.name,
        description: quote.description,
        customerid: quote.customerid,
        customeridtype: quote.customeridtype,
        opportunityid: quote.opportunityid,
        effectivefrom: quote.effectivefrom,
        effectiveto: quote.effectiveto,
        totalamount,
        totaldiscountamount,
        totaltax,
        statecode: quote.statecode,
        statuscode: quote.statuscode,
        lines: quoteLines.map((line) => ({
          quotedetailid: line.quotedetailid,
          productid: line.productid,
          productdescription: line.productdescription,
          quantity: Number(line.quantity) || 0,
          priceperunit: Number(line.priceperunit) || 0,
          manualdiscountamount: Number(line.manualdiscountamount) || 0,
          tax: Number(line.tax) || 0,
          baseamount: Number(line.baseamount) || 0,
          extendedamount: Number(line.extendedamount) || 0,
        })),
      },
      changetype,
      changedescription: options?.changedescription,
      changedfields: options?.changedfields,
      createdby: options?.createdby || 'anonymous',
      changereason: options?.changereason,
    })
  },

  /**
   * Compare two versions
   */
  async compareVersions(
    fromVersionId: string,
    toVersionId: string
  ): Promise<QuoteVersionComparison | null> {
    const fromVersion = await this.getById(fromVersionId)
    const toVersion = await this.getById(toVersionId)

    if (!fromVersion || !toVersion) {
      return null
    }

    const quoteChanges: QuoteVersionComparison['changes']['quote'] = []
    const lineChanges: QuoteVersionComparison['changes']['lines'] = []

    // Compare quote-level fields
    const quoteFields = [
      'name',
      'description',
      'customerid',
      'effectivefrom',
      'effectiveto',
      'totalamount',
      'statecode',
      'statuscode',
    ]

    for (const field of quoteFields) {
      const oldVal = (fromVersion.versiondata as any)[field]
      const newVal = (toVersion.versiondata as any)[field]

      if (oldVal !== newVal) {
        quoteChanges.push({
          field,
          oldValue: oldVal,
          newValue: newVal,
          type: 'modified',
        })
      }
    }

    // Compare lines using Map for O(1) lookups
    const oldLines = fromVersion.versiondata.lines
    const newLines = toVersion.versiondata.lines
    const oldLinesMap = new Map(oldLines.map((l) => [l.quotedetailid, l]))
    const newLinesMap = new Map(newLines.map((l) => [l.quotedetailid, l]))

    // Find added lines
    for (const newLine of newLines) {
      if (!oldLinesMap.has(newLine.quotedetailid)) {
        lineChanges.push({
          action: 'added',
          lineId: newLine.quotedetailid,
          productDescription: newLine.productdescription,
        })
      }
    }

    // Find removed lines
    for (const oldLine of oldLines) {
      if (!newLinesMap.has(oldLine.quotedetailid)) {
        lineChanges.push({
          action: 'removed',
          lineId: oldLine.quotedetailid,
          productDescription: oldLine.productdescription,
        })
      }
    }

    // Find modified lines
    for (const newLine of newLines) {
      const oldLine = oldLinesMap.get(newLine.quotedetailid)
      if (oldLine) {
        const lineFieldChanges: { field: string; oldValue: any; newValue: any }[] = []

        const lineFields = [
          'quantity',
          'priceperunit',
          'manualdiscountamount',
          'tax',
          'extendedamount',
        ]

        for (const field of lineFields) {
          const oldVal = (oldLine as any)[field]
          const newVal = (newLine as any)[field]

          if (oldVal !== newVal) {
            lineFieldChanges.push({
              field,
              oldValue: oldVal,
              newValue: newVal,
            })
          }
        }

        if (lineFieldChanges.length > 0) {
          lineChanges.push({
            action: 'modified',
            lineId: newLine.quotedetailid,
            productDescription: newLine.productdescription,
            changes: lineFieldChanges,
          })
        }
      }
    }

    return {
      fromVersion,
      toVersion,
      changes: {
        quote: quoteChanges,
        lines: lineChanges,
      },
      summary: {
        totalChanges: quoteChanges.length + lineChanges.length,
        quoteFieldsChanged: quoteChanges.length,
        linesAdded: lineChanges.filter((c) => c.action === 'added').length,
        linesRemoved: lineChanges.filter((c) => c.action === 'removed').length,
        linesModified: lineChanges.filter((c) => c.action === 'modified').length,
      },
    }
  },

  /**
   * Delete all versions for a quote (cascade delete)
   */
  async deleteByQuote(quoteid: string): Promise<number> {
    const versions = getAllVersions()
    const filtered = versions.filter((v) => v.quoteid !== quoteid)
    const deletedCount = versions.length - filtered.length
    saveVersions(filtered)
    return deletedCount
  },

  /**
   * Get version count for a quote
   */
  async getVersionCount(quoteid: string): Promise<number> {
    const versions = await this.getVersionsByQuote({ quoteid })
    return versions.length
  },

  /**
   * Get change summary by type
   */
  async getChangeSummary(quoteid: string): Promise<
    Record<QuoteVersionChangeType, number>
  > {
    const versions = await this.getVersionsByQuote({ quoteid })

    const summary: Record<string, number> = {}

    for (const version of versions) {
      summary[version.changetype] = (summary[version.changetype] || 0) + 1
    }

    return summary as Record<QuoteVersionChangeType, number>
  },
}
