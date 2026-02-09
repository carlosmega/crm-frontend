import type { Metadata } from 'next'
import { ContactsClient } from './contacts-client'

export const metadata: Metadata = {
  title: 'Contacts | CRM Sales',
  description: 'Manage contact information, communication history and relationships',
}

export default function ContactsPage() {
  return <ContactsClient />
}
