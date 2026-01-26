/**
 * Test data for E2E tests
 * Following CDS model patterns for Lead → Opportunity flow
 */

export const testLeads = {
  // B2B Lead - with company (will create Account + Contact + Opportunity)
  b2bLead: {
    firstName: 'E2E Test',
    lastName: 'B2B Lead',
    company: 'E2E Test Company',
    jobTitle: 'CEO',
    email: 'e2e.b2b@testcompany.com',
    phone: '+34 912 345 678',
  },

  // B2C Lead - without company (will create Contact + Opportunity)
  b2cLead: {
    firstName: 'E2E Test',
    lastName: 'B2C Lead',
    company: '', // No company = B2C
    jobTitle: '',
    email: 'e2e.b2c@personal.com',
    phone: '+34 678 901 234',
  },
}

export const testOpportunity = {
  name: 'E2E Test Opportunity',
  estimatedValue: 75000,
  estimatedCloseDate: getDateInFuture(30), // 30 days from now
  description: 'Opportunity created from E2E test lead qualification',
}

/**
 * Helper to get date string in future
 */
function getDateInFuture(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateUniqueLeadData(type: 'b2b' | 'b2c' = 'b2b') {
  const timestamp = Date.now()
  const base = type === 'b2b' ? testLeads.b2bLead : testLeads.b2cLead

  return {
    ...base,
    firstName: `E2E-${timestamp}`,
    lastName: `Test-${type.toUpperCase()}`,
    email: `e2e-${timestamp}@test.com`,
    company: type === 'b2b' ? `Test Company ${timestamp}` : '',
  }
}
