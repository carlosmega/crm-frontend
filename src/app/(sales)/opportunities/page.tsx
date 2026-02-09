import type { Metadata } from 'next'
import { OpportunitiesClient } from './opportunities-client'

export const metadata: Metadata = {
  title: 'Opportunities | CRM Sales',
  description: 'Manage sales opportunities, track pipeline stages and revenue forecasts',
}

export default function OpportunitiesPage() {
  return <OpportunitiesClient />
}
