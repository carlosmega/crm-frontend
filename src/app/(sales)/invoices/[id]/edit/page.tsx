'use client'

import { use, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInvoice } from '@/features/invoices/hooks/use-invoices'
import { useUpdateInvoice } from '@/features/invoices/hooks/use-invoice-mutations'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import { InvoiceStateCode } from '@/core/contracts/enums'
import type { UpdateInvoiceDto } from '@/core/contracts/entities/invoice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, AlertCircle, X, FileText, MapPin } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>
}

export type InvoiceEditTabId = 'general' | 'details'

/**
 * Invoice Edit Page
 *
 * Edición limitada de facturas activas
 * Solo permite editar campos no financieros:
 * - Description
 * - Due Date
 * - Billing Address
 */
export default function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const { data: invoice, isLoading: loading, error } = useInvoice(id)
  const updateMutation = useUpdateInvoice()

  const [activeTab, setActiveTab] = useState<InvoiceEditTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  const [formData, setFormData] = useState<UpdateInvoiceDto>({
    description: '',
    duedate: '',
    billto_name: '',
    billto_line1: '',
    billto_line2: '',
    billto_city: '',
    billto_stateorprovince: '',
    billto_postalcode: '',
    billto_country: '',
  })

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('invoice-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Populate form when invoice loads
  useEffect(() => {
    if (invoice) {
      setFormData({
        description: invoice.description || '',
        duedate: invoice.duedate?.split('T')[0] || '', // Format for date input
        billto_name: invoice.billto_name || '',
        billto_line1: invoice.billto_line1 || '',
        billto_line2: invoice.billto_line2 || '',
        billto_city: invoice.billto_city || '',
        billto_stateorprovince: invoice.billto_stateorprovince || '',
        billto_postalcode: invoice.billto_postalcode || '',
        billto_country: invoice.billto_country || '',
      })
    }
  }, [invoice])

  const canEdit = invoice?.statecode === InvoiceStateCode.Active

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEdit) {
      toast({
        title: 'Cannot Edit',
        description: 'Only active invoices can be edited',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        id,
        dto: formData,
      })

      toast({
        title: 'Invoice Updated',
        description: 'The invoice has been successfully updated',
      })

      router.push(`/invoices/${id}`)
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update invoice',
        variant: 'destructive',
      })
    }
  }

  if (error) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive mb-4">
              Error loading invoice: {error.message}
            </p>
            <Button asChild>
              <Link href="/invoices">Back to Invoices</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (loading || !invoice) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/invoices/${id}`}
        entityType="EDIT INVOICE"
        title={invoice.name}
        actions={
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              const form = document.querySelector('form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={!canEdit || updateMutation.isPending}
            className="h-8 shrink-0"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.name, href: `/invoices/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Sticky Section with Invoice Info and Actions + Tabs (Desktop Only) */}
      <div className="hidden md:block sticky top-16 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Invoice</h1>
              <p className="text-muted-foreground mt-1">
                {invoice.name} - {invoice.invoicenumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/invoices/${id}`}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  const form = document.querySelector('form') as HTMLFormElement
                  form?.requestSubmit()
                }}
                disabled={!canEdit || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4">
          <div id="invoice-tabs-nav-container" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="px-4 pb-4 pt-1">
          {!canEdit && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invoice cannot be edited because it is not in Active state.
                Only active invoices can be modified.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InvoiceEditTabId)} className="w-full">
            {/* Render tabs navigation in sticky header container via portal */}
            {tabsContainer && createPortal(
              <div className="overflow-x-auto">
                <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
                  <TabsTrigger
                    value="general"
                    className={cn(
                      "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
                      "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                      "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
                    )}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>

                  <TabsTrigger
                    value="details"
                    className={cn(
                      "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
                      "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                      "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
                    )}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Details
                  </TabsTrigger>
                </TabsList>
              </div>,
              tabsContainer
            )}

            <form onSubmit={handleSubmit}>
              {/* GENERAL TAB */}
              <TabsContent value="general" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update invoice description and due date
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Invoice description..."
                        rows={3}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duedate">Due Date</Label>
                      <DatePicker
                        value={formData.duedate}
                        onChange={(date) =>
                          setFormData({ ...formData, duedate: date?.toISOString().split('T')[0] || '' })
                        }
                        disabled={!canEdit}
                        placeholder="Select due date"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DETAILS TAB */}
              <TabsContent value="details" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                    <CardDescription>
                      Update the billing address information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billto_name">Name</Label>
                      <Input
                        id="billto_name"
                        value={formData.billto_name}
                        onChange={(e) =>
                          setFormData({ ...formData, billto_name: e.target.value })
                        }
                        placeholder="Billing name..."
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billto_line1">Address Line 1</Label>
                      <Input
                        id="billto_line1"
                        value={formData.billto_line1}
                        onChange={(e) =>
                          setFormData({ ...formData, billto_line1: e.target.value })
                        }
                        placeholder="Street address..."
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billto_line2">Address Line 2</Label>
                      <Input
                        id="billto_line2"
                        value={formData.billto_line2}
                        onChange={(e) =>
                          setFormData({ ...formData, billto_line2: e.target.value })
                        }
                        placeholder="Apt, suite, etc. (optional)"
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billto_city">City</Label>
                        <Input
                          id="billto_city"
                          value={formData.billto_city}
                          onChange={(e) =>
                            setFormData({ ...formData, billto_city: e.target.value })
                          }
                          placeholder="City..."
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billto_stateorprovince">State/Province</Label>
                        <Input
                          id="billto_stateorprovince"
                          value={formData.billto_stateorprovince}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              billto_stateorprovince: e.target.value,
                            })
                          }
                          placeholder="State/Province..."
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billto_postalcode">Postal Code</Label>
                        <Input
                          id="billto_postalcode"
                          value={formData.billto_postalcode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              billto_postalcode: e.target.value,
                            })
                          }
                          placeholder="Postal code..."
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billto_country">Country</Label>
                        <Input
                          id="billto_country"
                          value={formData.billto_country}
                          onChange={(e) =>
                            setFormData({ ...formData, billto_country: e.target.value })
                          }
                          placeholder="Country..."
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </div>
    </>
  )
}
