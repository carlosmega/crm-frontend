'use client'

import { use, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { useOrder, useFulfillOrder } from '@/features/orders/hooks/use-orders'
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'
import { OrderStateCode } from '@/core/contracts/enums'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import { useToast } from '@/components/ui/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Package,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  X,
  FileText,
  Info,
} from 'lucide-react'

interface OrderFulfillPageProps {
  params: Promise<{ id: string }>
}

interface FulfillFormData {
  datefulfilled: string
  notes?: string
}

export type OrderFulfillTabId = 'details' | 'summary'

/**
 * Order Fulfill Page
 *
 * Página para marcar una orden como cumplida/entregada
 */
export default function OrderFulfillPage({ params }: OrderFulfillPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const { data: order, isLoading: loading, error } = useOrder(id)
  const fulfillMutation = useFulfillOrder()

  const [activeTab, setActiveTab] = useState<OrderFulfillTabId>('details')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FulfillFormData>({
    defaultValues: {
      datefulfilled: new Date().toISOString().split('T')[0],
    },
  })

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('order-fulfill-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const onSubmit = async (data: FulfillFormData) => {
    try {
      await fulfillMutation.mutateAsync({
        id,
        dto: {
          statecode: OrderStateCode.Fulfilled,
          datefulfilled: data.datefulfilled,
        },
      })

      toast({
        title: 'Order Fulfilled',
        description: 'The order has been successfully marked as fulfilled.',
      })

      router.push(`/orders/${id}`)
    } catch (error) {
      console.error('Error fulfilling order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fulfill order. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    router.push(`/orders/${id}`)
  }

  if (error) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive mb-4">
              Error loading order: {error.message}
            </p>
            <Button asChild>
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (loading || !order) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  // Check if order can be fulfilled
  if (order.statecode !== OrderStateCode.Submitted) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cannot Fulfill Order</h2>
            <p className="text-muted-foreground mb-4">
              This order must be in "Submitted" status to be fulfilled.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Current status: <OrderStatusBadge statecode={order.statecode} className="ml-2" />
            </p>
            <Button asChild>
              <Link href={`/orders/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
              <Link href={`/orders/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                FULFILL ORDER
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {order.name}
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              const form = document.querySelector('form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={fulfillMutation.isPending}
            className="h-8 shrink-0"
          >
            {fulfillMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/orders/${id}`}>
                  {order.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Fulfill</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Sticky Section with Order Info and Actions + Tabs (Desktop Only) */}
      <div className="hidden md:block sticky top-16 z-40 bg-gray-100/98 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Fulfill Order</h1>
              <p className="text-muted-foreground mt-1">
                Mark this order as fulfilled and delivered to the customer
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  const form = document.querySelector('form') as HTMLFormElement
                  form?.requestSubmit()
                }}
                disabled={fulfillMutation.isPending}
              >
                {fulfillMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fulfilling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Fulfilled
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4">
          <div id="order-fulfill-tabs-nav-container" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <div className="px-4 pb-4 pt-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderFulfillTabId)} className="w-full">
            {/* Render tabs navigation in sticky header container via portal */}
            {tabsContainer && createPortal(
              <div className="overflow-x-auto">
                <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
                  <TabsTrigger
                    value="details"
                    className={cn(
                      "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
                      "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                      "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
                    )}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Fulfillment Details
                  </TabsTrigger>

                  <TabsTrigger
                    value="summary"
                    className={cn(
                      "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
                      "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                      "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
                    )}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Order Summary
                  </TabsTrigger>
                </TabsList>
              </div>,
              tabsContainer
            )}

            {/* FULFILLMENT DETAILS TAB */}
            <TabsContent value="details" className="mt-0">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Fulfillment Details</CardTitle>
                    <CardDescription>
                      Enter the details of the order fulfillment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Fulfillment Date */}
                    <div className="space-y-2">
                      <Label htmlFor="datefulfilled">
                        Fulfillment Date *
                      </Label>
                      <Controller
                        name="datefulfilled"
                        control={control}
                        rules={{ required: 'Fulfillment date is required' }}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value}
                            onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                            placeholder="Select fulfillment date"
                          />
                        )}
                      />
                      {errors.datefulfilled && (
                        <p className="text-sm text-destructive">
                          {errors.datefulfilled.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        The date when the order was fulfilled and shipped
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Fulfillment Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder="Add any notes about the fulfillment (tracking number, carrier, special instructions, etc.)"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional notes about this fulfillment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </TabsContent>

            {/* ORDER SUMMARY TAB */}
            <TabsContent value="summary" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Name</p>
                    <p className="font-medium">{order.name}</p>
                  </div>

                  {order.ordernumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-mono text-sm">{order.ordernumber}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(order.totalamount)}
                    </span>
                  </div>

                  {order.requestdeliveryby && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Requested Delivery</p>
                        <p className="font-medium">
                          {new Date(order.requestdeliveryby).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Order status will change to "Fulfilled"
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    An invoice can be generated
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Customer will be notified (if configured)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
