import type { Metadata } from 'next'
import { AccountsClient } from './accounts-client'

export const metadata: Metadata = {
  title: 'Accounts | CRM Sales',
  description: 'Manage customer accounts, track business relationships and company information',
}

export default function AccountsPage() {
  return <AccountsClient />
}
