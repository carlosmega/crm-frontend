import type { Metadata } from 'next'
import { OrdersClient } from './orders-client'

export const metadata: Metadata = {
  title: 'Orders | CRM Sales',
  description: 'Track sales orders, fulfillment status and order-to-invoice processing',
}

export default function OrdersPage() {
  return <OrdersClient />
}
