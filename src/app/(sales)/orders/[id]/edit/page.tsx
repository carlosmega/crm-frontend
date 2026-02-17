'use client'

import { use } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useOrder, useUpdateOrder } from '@/features/orders/hooks/use-orders'
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'
import { OrderStateCode } from '@/core/contracts/enums'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateOrderDto } from '@/core/contracts/entities/order'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'

// Dynamic import for OrderFormTabs
const OrderFormTabs = dynamic(
  () => import('@/features/orders/components/order-form-tabs').then(m => ({ default: m.OrderFormTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    ),
    ssr: false
  }
)

interface OrderEditPageProps {
  params: Promise<{ id: string }>
}

/**
 * Order Edit Page
 *
 * Edit an existing order with tabbed interface.
 * Only available when order is in Active state.
 */
export default function OrderEditPage({ params }: OrderEditPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: order, isLoading, error } = useOrder(id)
  const updateMutation = useUpdateOrder()

  const handleSubmit = (data: UpdateOrderDto) => {
    updateMutation.mutate(
      { id, dto: data },
      {
        onSuccess: () => {
          toast.success('Order updated successfully', {
            description: 'Your changes have been saved'
          })
          router.push(`/orders/${id}`)
        },
        onError: (error) => {
          toast.error('Failed to update order', {
            description: error.message || 'Please try again'
          })
        }
      }
    )
  }

  const handleCancel = () => {
    router.push(`/orders/${id}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-destructive">
          {error ? `Error: ${error.message}` : 'Order not found'}
        </p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  // Not editable state - redirect message for non-Active orders
  if (order.statecode !== OrderStateCode.Active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold">Cannot Edit Order</p>
            <p className="text-sm text-muted-foreground mt-2">
              This order is not in Active state and cannot be edited.
            </p>
            <p className="text-sm text-muted-foreground">
              Only orders in Active state can be modified.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href={`/orders/${id}`}>View Details</Link>
            </Button>
            <Button asChild>
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/orders/${order.salesorderid}`}
        entityType="EDIT ORDER"
        title={order.name}
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('order-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={updateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Orders', href: '/orders' },
          { label: order.name, href: `/orders/${order.salesorderid}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY HEADER - Order Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Order Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{order.name}</h1>
                  <OrderStatusBadge statecode={order.statecode} />
                </div>
                {order.ordernumber && (
                  <p className="text-muted-foreground mt-1 font-mono">
                    Order #{order.ordernumber}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('order-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={updateMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Info header only */}
            <div className="md:hidden">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{order.name}</h2>
                <OrderStatusBadge statecode={order.statecode} />
              </div>
              {order.ordernumber && (
                <p className="text-muted-foreground font-mono text-sm">
                  Order #{order.ordernumber}
                </p>
              )}
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="order-form-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <OrderFormTabs
            order={order}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </div>
    </>
  )
}
