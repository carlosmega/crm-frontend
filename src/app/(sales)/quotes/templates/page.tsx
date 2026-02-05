'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import {
  useQuoteTemplates,
  useDeleteQuoteTemplate,
} from '@/features/quotes/hooks/use-quote-templates'
import { QuoteTemplateDetailSheet } from '@/features/quotes/components/quote-template-detail-sheet'
import type { QuoteTemplate } from '@/core/contracts'
import { Package, Plus, Trash2, Users, User, FileText, Eye } from 'lucide-react'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import { EmptyState } from '@/shared/components/empty-state'

export default function QuoteTemplatesPage() {
  const router = useRouter()
  const { data: templates, isLoading } = useQuoteTemplates()
  const deleteTemplate = useDeleteQuoteTemplate()
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleOpenSheet = (template: QuoteTemplate) => {
    setSelectedTemplate(template)
    setSheetOpen(true)
  }

  const handleDelete = (templateId: string, templateName: string) => {
    if (confirm(`Are you sure you want to delete "${templateName}"?`)) {
      deleteTemplate.mutate(templateId)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                QUOTES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                Templates
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Quotes', href: '/quotes' },
            { label: 'Templates' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Quote Templates</h2>
              <p className="text-muted-foreground">
                Manage reusable quote templates for faster quote creation
              </p>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 hidden md:flex">
              <Link href="/quotes/new">
                <Plus className="mr-2 h-4 w-4" />
                New Quote
              </Link>
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                // Calculate total
                const total = template.templatedata.lines.reduce((sum, line) => {
                  const baseAmount = line.quantity * line.priceperunit
                  const discount = line.manualdiscountamount || 0
                  const tax = line.tax || 0
                  return sum + (baseAmount - discount + tax)
                }, 0)

                return (
                  <Card
                    key={template.quotetemplateid}
                    className="group hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleOpenSheet(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        {template.category && (
                          <Badge variant="secondary" className="capitalize">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Items</div>
                          <div className="font-medium">{template.templatedata.lines.length}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-semibold">{formatCurrency(total)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Visibility</div>
                          <div className="flex items-center gap-1">
                            {template.isshared ? (
                              <>
                                <Users className="h-3 w-3" />
                                <span>Shared</span>
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                <span>Private</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Usage</div>
                          <div className="font-medium">{template.usagecount}×</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/quotes/new?templateId=${template.quotetemplateid}`)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Use Template
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenSheet(template)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(template.quotetemplateid, template.name)}
                          disabled={deleteTemplate.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No templates yet"
              description="Create your first quote template to speed up quote creation"
              action={{
                label: 'Create Quote to Save as Template',
                href: '/quotes/new',
              }}
            />
          )}
        </div>
      </div>

      {/* Template Detail Sheet */}
      <QuoteTemplateDetailSheet
        template={selectedTemplate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
