import type { Metadata } from 'next'
import { InvoicesClient } from './invoices-client'

export const metadata: Metadata = {
  title: 'Invoices | CRM Sales',
  description: 'Manage invoices, track payments and monitor accounts receivable',
}

export default function InvoicesPage() {
  return <InvoicesClient />
}
