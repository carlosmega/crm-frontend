import type { Metadata } from 'next'
import { CasesClient } from './cases-client'

export const metadata: Metadata = {
  title: 'Cases | CRM Service',
  description: 'Manage support cases, track resolutions and monitor service level agreements',
}

export default function CasesPage() {
  return <CasesClient />
}
