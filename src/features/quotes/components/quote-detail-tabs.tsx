"use client"

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Quote } from '@/core/contracts'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useContact } from '@/features/contacts/hooks/use-contacts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { QuoteLineItemsTable } from '@/features/quotes/components/quote-line-items-table'
import { QuoteLineItemForm } from '@/features/quotes/components/quote-line-item-form'
import { QuoteTotalsSummary } from '@/features/quotes/components/quote-totals-summary'
import { CreateOrderFromQuoteButton } from '@/features/orders/components/create-order-from-quote-button'
import { ActivityTimeline } from '@/features/activities/components'
import {
  useCreateQuoteDetail,
  useUpdateQuoteDetail,
  useDeleteQuoteDetail,
} from '@/features/quotes/hooks/use-quote-details'
import type { QuoteDetail, CreateQuoteDetailDto, UpdateQuoteDetailDto } from '@/features/quotes/types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import {
  FileText,
  Package,
  Calendar,
  Link2,
  History,
  Building2,
  User,
  Clock,
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

// Dynamic imports for version features
const QuoteVersionTimeline = dynamic(
  () => import('@/features/quotes/components/quote-version-timeline').then((mod) => ({
    default: mod.QuoteVersionTimeline,
  })),
  { ssr: false }
)

export type QuoteTabId = 'general' | 'details' | 'versions' | 'related' | 'activities'

interface QuoteDetailTabsProps {
  quote: Quote
  quoteLines?: any[]
  onCompareVersions?: (fromId: string, toId: string) => void
}

/**
 * QuoteDetailTabs
 *
 * Tabbed view for Quote details.
 *
 * Tabs:
 * - General: Quote overview with key information and products
 * - Details: Validity period, dates, metadata
 * - Versions: Version timeline and history
 * - Related: Related records (opportunity)
 * - Activities: Activity timeline
 */
export function QuoteDetailTabs({ quote, quoteLines = [], onCompareVersions }: QuoteDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<QuoteTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')

  // Fetch customer data (Account or Contact)
  const isAccountCustomer = quote.customeridtype === 'account'
  const { account, loading: accountLoading } = useAccount(isAccountCustomer ? quote.customerid : '')
  const { contact, loading: contactLoading } = useContact(!isAccountCustomer ? quote.customerid : '')

  // Dialog state for adding/editing products
  const [showLineItemForm, setShowLineItemForm] = useState(false)
  const [editingLine, setEditingLine] = useState<QuoteDetail | undefined>()

  // Mutations for quote line items
  const { mutate: createQuoteDetail, isPending: isCreating } = useCreateQuoteDetail()
  const { mutate: updateQuoteDetail, isPending: isUpdating } = useUpdateQuoteDetail()
  const { mutate: deleteQuoteDetail } = useDeleteQuoteDetail()

  // Check if quote can be edited (only Draft state)
  const canEdit = quote.statecode === 0

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('quote-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Handlers for product management
  const handleAddProduct = useCallback(() => {
    setEditingLine(undefined)
    setShowLineItemForm(true)
  }, [])

  const handleEditProduct = useCallback((line: QuoteDetail) => {
    setEditingLine(line)
    setShowLineItemForm(true)
  }, [])

  const handleDeleteProduct = useCallback((lineId: string) => {
    if (confirm(t('detailTabs.confirmRemoveProduct'))) {
      deleteQuoteDetail({ id: lineId, quoteId: quote.quoteid })
    }
  }, [deleteQuoteDetail, quote.quoteid])

  const handleLineItemSubmit = useCallback((data: CreateQuoteDetailDto | UpdateQuoteDetailDto) => {
    if (editingLine) {
      updateQuoteDetail(
        { id: editingLine.quotedetailid, data: data as UpdateQuoteDetailDto },
        { onSuccess: () => setShowLineItemForm(false) }
      )
    } else {
      createQuoteDetail(data as CreateQuoteDetailDto, {
        onSuccess: () => setShowLineItemForm(false)
      })
    }
  }, [editingLine, createQuoteDetail, updateQuoteDetail])

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
          {tc('tabs.general')}
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
          value="versions"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Clock className="w-4 h-4 mr-2" />
          {tc('tabs.versions')}
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
          {tc('tabs.related')}
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
          {tc('tabs.activities')}
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QuoteTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isAccountCustomer ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  {tc('sections.customerInfo')}
                </span>
                <Badge variant="outline" className="capitalize font-normal">
                  {quote.customeridtype}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isAccountCustomer ? accountLoading : contactLoading) ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : isAccountCustomer && account ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">{account.name}</p>
                      {account.industrycode !== undefined && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {String(account.industrycode).replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/accounts/${account.accountid}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={t('detailTabs.viewAccount')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm">
                    {account.emailaddress1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.emailaddress1}</span>
                      </div>
                    )}
                    {account.telephone1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.telephone1}</span>
                      </div>
                    )}
                    {account.websiteurl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.websiteurl}</span>
                      </div>
                    )}
                    {(account.address1_city || account.address1_country) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {[account.address1_city, account.address1_stateorprovince, account.address1_country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/accounts/${account.accountid}`}
                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {t('detailTabs.viewAccountDetails')}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : !isAccountCustomer && contact ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">
                        {contact.fullname || `${contact.firstname} ${contact.lastname}`}
                      </p>
                      {contact.jobtitle && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{contact.jobtitle}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/contacts/${contact.contactid}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={t('detailTabs.viewContact')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm">
                    {contact.emailaddress1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{contact.emailaddress1}</span>
                      </div>
                    )}
                    {(contact.telephone1 || contact.mobilephone) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{contact.mobilephone || contact.telephone1}</span>
                      </div>
                    )}
                    {(contact.address1_city || contact.address1_country) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {[contact.address1_city, contact.address1_stateorprovince, contact.address1_country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/contacts/${contact.contactid}`}
                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {t('detailTabs.viewContactDetails')}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>{t('detailTabs.customerDataNotAvailable')}</p>
                  <p className="font-mono text-xs mt-1">{quote.customerid}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Totals */}
          <QuoteTotalsSummary quote={quote} />
        </div>

        {/* Create Order Section (if Quote is Won) */}
        {quote.statecode === 2 && quoteLines.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('detailTabs.nextStepTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {quote.opportunityid
                  ? t('detailTabs.nextStepDescriptionWithOpp')
                  : t('detailTabs.nextStepDescription')}
              </p>
              <CreateOrderFromQuoteButton
                quote={quote}
                quoteLines={quoteLines.map((line) => ({
                  productid: line.productid,
                  productdescription: line.productdescription,
                  quantity: line.quantity,
                  priceperunit: line.priceperunit,
                  manualdiscountamount: line.manualdiscountamount,
                  tax: line.tax,
                }))}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Description Card */}
        {quote.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('detailTabs.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{quote.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {tc('tabs.products')} ({quoteLines.length})
              </CardTitle>
              {canEdit && (
                <Button onClick={handleAddProduct} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('detailTabs.addProduct')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <QuoteLineItemsTable
              quoteLines={quoteLines}
              canEdit={canEdit}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </CardContent>
        </Card>

        {/* Quote Line Item Form Dialog */}
        <QuoteLineItemForm
          quoteId={quote.quoteid}
          quoteLine={editingLine}
          open={showLineItemForm}
          onOpenChange={setShowLineItemForm}
          onSubmit={handleLineItemSubmit}
          isSubmitting={isCreating || isUpdating}
        />
      </TabsContent>

      {/* DETAILS TAB */}
      <TabsContent value="details" className="mt-0 space-y-4">
        {/* Validity Period Card */}
        {(quote.effectivefrom || quote.effectiveto) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('form.validityPeriod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.effectiveFrom')}</p>
                <p className="font-medium">{formatDate(quote.effectivefrom)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('detailTabs.effectiveTo')}</p>
                <p className="font-medium">{formatDate(quote.effectiveto)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('detailTabs.metadata')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <p className="text-muted-foreground">{tc('labels.created')}</p>
              <p className="font-medium">
                {new Date(quote.createdon).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{tc('labels.lastModified')}</p>
              <p className="font-medium">
                {new Date(quote.modifiedon).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* VERSIONS TAB */}
      <TabsContent value="versions" className="mt-0">
        <QuoteVersionTimeline
          quoteid={quote.quoteid}
          onCompareVersions={onCompareVersions}
        />
      </TabsContent>

      {/* RELATED TAB */}
      <TabsContent value="related" className="mt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{tc('sections.relatedRecords')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.opportunityid && (
              <div>
                <p className="text-sm text-muted-foreground">{tc('entities.opportunity')}</p>
                <Link
                  href={`/opportunities/${quote.opportunityid}`}
                  className="text-sm hover:underline text-primary font-medium"
                >
                  {t('detailTabs.viewOpportunity')}
                </Link>
              </div>
            )}
            {!quote.opportunityid && (
              <p className="text-sm text-muted-foreground">{t('detailTabs.noRelated')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={quote.quoteid}
          regardingType="quote"
          regardingName={quote.name}
        />
      </TabsContent>
    </Tabs>
  )
}
