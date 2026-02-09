import type { Metadata } from 'next'
import { LeadsClient } from './leads-client'

export const metadata: Metadata = {
  title: 'Leads | CRM Sales',
  description: 'Track and qualify sales leads through the pipeline from prospect to opportunity',
}

export default function LeadsPage() {
  return <LeadsClient />
}
