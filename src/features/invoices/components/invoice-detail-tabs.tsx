"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { Invoice } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceLinesTable } from '@/features/invoices/components/invoice-lines-table'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/shared/utils/formatters'
import {
  FileText,
  Receipt,
  Calendar,
  Link2,
  History,
  Building2,
  User,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

export type InvoiceTabId = 'general' | 'items' | 'details' | 'related' | 'activities'

interface InvoiceDetailTabsProps {
  invoice: Invoice
  invoiceLines?: any[]
}

/**
 * InvoiceDetailTabs
 *
 * Tabbed view for Invoice details.
 *
 * Tabs:
 * - General: Invoice overview with key information
 * - Items: Invoice lines table
 * - Details: Billing address, dates, payment info
 * - Related: Related records (order, opportunity)
 * - Activities: Activity timeline and history
 */
export function InvoiceDetailTabs({ invoice, invoiceLines = [] }: InvoiceDetailTabsProps) {
  const { t } = useTranslation('invoices')
  const [activeTab, setActiveTab] = useState<InvoiceTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('invoice-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Format helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Tabs navigation component
  const tabsNavigation = (
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
          {t('detailTabs.general')}
        </TabsTrigger>

        <TabsTrigger
          value="items"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Receipt className="w-4 h-4 mr-2" />
          {t('detailTabs.itemsCount', { count: invoiceLines.length })}
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
          <Calendar className="w-4 h-4 mr-2" />
          {t('detailTabs.details')}
        </TabsTrigger>

        <TabsTrigger
          value="related"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Link2 className="w-4 h-4 mr-2" />
          {t('detailTabs.related')}
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          {t('detailTabs.activities')}
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InvoiceTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {invoice.customeridtype === 'account' ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                {t('detailTabs.customerInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.customerType')}</p>
                <p className="font-medium capitalize">{invoice.customeridtype}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.customerId')}</p>
                <p className="font-mono text-sm">{invoice.customerid}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('detailTabs.invoiceSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.discountamount && invoice.discountamount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('detailCard.discount')}</span>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(invoice.discountamount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('detailCard.tax')}</span>
                <span className="font-medium">{formatCurrency(invoice.totaltax || 0)}</span>
              </div>
              {invoice.freightamount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('detailCard.freight')}</span>
                  <span className="font-medium">{formatCurrency(invoice.freightamount)}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('detailCard.totalAmount')}</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(invoice.totalamount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Dates Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('detailTabs.importantDates')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {invoice.duedate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.dueDate')}</p>
                <p className="font-medium">{formatDate(invoice.duedate)}</p>
              </div>
            )}
            {invoice.datedelivered && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.delivered')}</p>
                <p className="font-medium">{formatDate(invoice.datedelivered)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t('detailTabs.created')}</p>
              <p className="font-medium">{formatDate(invoice.createdon)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('detailTabs.lastModified')}</p>
              <p className="font-medium">{formatDate(invoice.modifiedon)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        {invoice.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('detailTabs.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{invoice.description}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ITEMS TAB */}
      <TabsContent value="items" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t('detailTabs.invoiceItems', { count: invoiceLines.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceLines.length > 0 ? (
              <InvoiceLinesTable lines={invoiceLines} />
            ) : (
              <div className="py-12 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('detailTabs.noItems')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* DETAILS TAB */}
      <TabsContent value="details" className="mt-0 space-y-4">
        {/* Billing Address Card */}
        {(invoice.billto_line1 || invoice.billto_city) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('detailTabs.billingAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {invoice.billto_name && <div className="font-medium mb-1">{invoice.billto_name}</div>}
                  {invoice.billto_line1 && <div>{invoice.billto_line1}</div>}
                  {invoice.billto_line2 && <div>{invoice.billto_line2}</div>}
                  <div>
                    {invoice.billto_city}
                    {invoice.billto_stateorprovince && `, ${invoice.billto_stateorprovince}`}
                    {invoice.billto_postalcode && ` ${invoice.billto_postalcode}`}
                  </div>
                  {invoice.billto_country && <div>{invoice.billto_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('detailTabs.paymentInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.paymenttermscode !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.paymentTerms')}</p>
                <p className="font-medium">
                  {invoice.paymenttermscode === 1 ? t('detailTabs.paymentTermsValues.net30') :
                   invoice.paymenttermscode === 2 ? t('detailTabs.paymentTermsValues.net45') :
                   invoice.paymenttermscode === 3 ? t('detailTabs.paymentTermsValues.net60') : t('detailTabs.paymentTermsValues.default')}
                </p>
              </div>
            )}
            {invoice.duedate && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.dueDate')}</p>
                <p className="font-medium">{formatDate(invoice.duedate)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!invoice.billto_line1 && !invoice.billto_city && (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('detailTabs.noBillingInfo')}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* RELATED TAB */}
      <TabsContent value="related" className="mt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('detailTabs.relatedRecords')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.salesorderid && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.order')}</p>
                <Link
                  href={`/orders/${invoice.salesorderid}`}
                  className="text-sm hover:underline text-primary font-medium"
                >
                  {t('detailTabs.viewOriginalOrder')}
                </Link>
              </div>
            )}
            {invoice.opportunityid && (
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.opportunity')}</p>
                <Link
                  href={`/opportunities/${invoice.opportunityid}`}
                  className="text-sm hover:underline text-primary font-medium"
                >
                  {t('detailTabs.viewOpportunity')}
                </Link>
              </div>
            )}
            {!invoice.salesorderid && !invoice.opportunityid && (
              <p className="text-sm text-muted-foreground">{t('detailTabs.noRelated')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={invoice.invoiceid}
          regardingType="invoice"
          regardingName={invoice.name}
        />
      </TabsContent>
    </Tabs>
  )
}
