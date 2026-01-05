/**
 * Mock Quote Versions Data
 *
 * Datos de ejemplo para desarrollo y testing del sistema de versiones
 */

import type { QuoteVersion } from '@/core/contracts'
import { QuoteVersionChangeType } from '@/core/contracts'

export const mockQuoteVersions: QuoteVersion[] = [
  // Version 4 - Latest: Discount Applied
  {
    quoteversionid: 'qv-004',
    quoteid: 'quote-002',
    versionnumber: 4,
    versiondata: {
      name: 'Acme Corp - Q1 2025 Software Licenses',
      description: 'Quarterly software license renewal with volume discount',
      customerid: 'account-001',
      customeridtype: 'account',
      opportunityid: 'opp-001',
      effectivefrom: '2025-01-01',
      effectiveto: '2025-03-31',
      totalamount: 8500,
      totaldiscountamount: 1500,
      totaltax: 850,
      statecode: 1, // Active
      statuscode: 2, // Active
      lines: [
        {
          quotedetailid: 'qd-001',
          productid: 'prod-001',
          productdescription: 'Microsoft Office 365 Business Premium',
          quantity: 50,
          priceperunit: 12.50,
          manualdiscountamount: 125,
          tax: 62.50,
          baseamount: 625,
          extendedamount: 562.50,
        },
        {
          quotedetailid: 'qd-002',
          productid: 'prod-002',
          productdescription: 'Adobe Creative Cloud All Apps',
          quantity: 25,
          priceperunit: 54.99,
          manualdiscountamount: 275,
          tax: 137.48,
          baseamount: 1374.75,
          extendedamount: 1237.23,
        },
        {
          quotedetailid: 'qd-003',
          productid: 'prod-003',
          productdescription: 'Slack Business+',
          quantity: 100,
          priceperunit: 12.50,
          manualdiscountamount: 250,
          tax: 125,
          baseamount: 1250,
          extendedamount: 1125,
        },
      ],
    },
    changetype: QuoteVersionChangeType.DiscountApplied,
    changedescription: 'Applied 20% volume discount to all products',
    changedfields: ['totaldiscountamount', 'totalamount'],
    createdby: 'John Smith',
    createdon: '2025-01-15T14:30:00Z',
    changereason: 'Volume discount approved by sales manager',
  },

  // Version 3: Product Added
  {
    quoteversionid: 'qv-003',
    quoteid: 'quote-002',
    versionnumber: 3,
    versiondata: {
      name: 'Acme Corp - Q1 2025 Software Licenses',
      description: 'Quarterly software license renewal',
      customerid: 'account-001',
      customeridtype: 'account',
      opportunityid: 'opp-001',
      effectivefrom: '2025-01-01',
      effectiveto: '2025-03-31',
      totalamount: 10000,
      totaldiscountamount: 0,
      totaltax: 1000,
      statecode: 1,
      statuscode: 2,
      lines: [
        {
          quotedetailid: 'qd-001',
          productid: 'prod-001',
          productdescription: 'Microsoft Office 365 Business Premium',
          quantity: 50,
          priceperunit: 12.50,
          manualdiscountamount: 0,
          tax: 62.50,
          baseamount: 625,
          extendedamount: 687.50,
        },
        {
          quotedetailid: 'qd-002',
          productid: 'prod-002',
          productdescription: 'Adobe Creative Cloud All Apps',
          quantity: 25,
          priceperunit: 54.99,
          manualdiscountamount: 0,
          tax: 137.48,
          baseamount: 1374.75,
          extendedamount: 1512.23,
        },
        {
          quotedetailid: 'qd-003',
          productid: 'prod-003',
          productdescription: 'Slack Business+',
          quantity: 100,
          priceperunit: 12.50,
          manualdiscountamount: 0,
          tax: 125,
          baseamount: 1250,
          extendedamount: 1375,
        },
      ],
    },
    changetype: QuoteVersionChangeType.ProductAdded,
    changedescription: 'Added Slack Business+ licenses per customer request',
    changedfields: ['lines', 'totalamount'],
    createdby: 'John Smith',
    createdon: '2025-01-14T10:15:00Z',
  },

  // Version 2: Price Changed
  {
    quoteversionid: 'qv-002',
    quoteid: 'quote-002',
    versionnumber: 2,
    versiondata: {
      name: 'Acme Corp - Q1 2025 Software Licenses',
      description: 'Quarterly software license renewal',
      customerid: 'account-001',
      customeridtype: 'account',
      opportunityid: 'opp-001',
      effectivefrom: '2025-01-01',
      effectiveto: '2025-03-31',
      totalamount: 8750,
      totaldiscountamount: 0,
      totaltax: 875,
      statecode: 0, // Draft
      statuscode: 1, // Draft
      lines: [
        {
          quotedetailid: 'qd-001',
          productid: 'prod-001',
          productdescription: 'Microsoft Office 365 Business Premium',
          quantity: 50,
          priceperunit: 12.50,
          manualdiscountamount: 0,
          tax: 62.50,
          baseamount: 625,
          extendedamount: 687.50,
        },
        {
          quotedetailid: 'qd-002',
          productid: 'prod-002',
          productdescription: 'Adobe Creative Cloud All Apps',
          quantity: 25,
          priceperunit: 54.99,
          manualdiscountamount: 0,
          tax: 137.48,
          baseamount: 1374.75,
          extendedamount: 1512.23,
        },
      ],
    },
    changetype: QuoteVersionChangeType.PriceChanged,
    changedescription: 'Updated Adobe pricing to reflect new 2025 rates',
    changedfields: ['priceperunit', 'totalamount'],
    createdby: 'John Smith',
    createdon: '2025-01-12T16:45:00Z',
  },

  // Version 1: Created
  {
    quoteversionid: 'qv-001',
    quoteid: 'quote-002',
    versionnumber: 1,
    versiondata: {
      name: 'Acme Corp - Q1 2025 Software Licenses',
      description: 'Quarterly software license renewal',
      customerid: 'account-001',
      customeridtype: 'account',
      opportunityid: 'opp-001',
      effectivefrom: '2025-01-01',
      effectiveto: '2025-03-31',
      totalamount: 8000,
      totaldiscountamount: 0,
      totaltax: 800,
      statecode: 0,
      statuscode: 1,
      lines: [
        {
          quotedetailid: 'qd-001',
          productid: 'prod-001',
          productdescription: 'Microsoft Office 365 Business Premium',
          quantity: 50,
          priceperunit: 12.50,
          manualdiscountamount: 0,
          tax: 62.50,
          baseamount: 625,
          extendedamount: 687.50,
        },
        {
          quotedetailid: 'qd-002',
          productid: 'prod-002',
          productdescription: 'Adobe Creative Cloud All Apps',
          quantity: 25,
          priceperunit: 49.99,
          manualdiscountamount: 0,
          tax: 124.98,
          baseamount: 1249.75,
          extendedamount: 1374.73,
        },
      ],
    },
    changetype: QuoteVersionChangeType.Created,
    changedescription: 'Initial quote created from opportunity',
    changedfields: [],
    createdby: 'John Smith',
    createdon: '2025-01-10T09:00:00Z',
  },
]

/**
 * Initialize localStorage with mock versions
 */
export function initializeMockQuoteVersions(): void {
  if (typeof window === 'undefined') return

  const STORAGE_KEY = 'crm_quote_versions'
  const existing = localStorage.getItem(STORAGE_KEY)

  // Only initialize if empty
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockQuoteVersions))
    console.log('✅ Mock quote versions initialized')
  }
}
