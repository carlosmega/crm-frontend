'use client'

import { CasesClient } from './cases-client'

/**
 * Cases List Page
 *
 * Client Component for loading and displaying cases.
 * Requires client-side rendering for authentication cookies.
 */
export default function CasesPage() {
  return <CasesClient />
}
