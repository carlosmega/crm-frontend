import type { Metadata } from 'next'
import { QuotesClient } from './quotes-client'

export const metadata: Metadata = {
  title: 'Quotes | CRM Sales',
  description: 'Create and manage sales quotes, pricing proposals and quote-to-order conversion',
}

export default function QuotesPage() {
  return <QuotesClient />
}
