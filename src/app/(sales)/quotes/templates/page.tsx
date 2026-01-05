'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  useQuoteTemplates,
  useDeleteQuoteTemplate,
} from '@/features/quotes/hooks/use-quote-templates'
import { Package, Plus, Pencil, Trash2, Users, User, FileText } from 'lucide-react'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import { EmptyState } from '@/shared/components/empty-state'

export default function QuoteTemplatesPage() {
  const router = useRouter()
  const { data: templates, isLoading } = useQuoteTemplates()
  const deleteTemplate = useDeleteQuoteTemplate()

  const handleDelete = (templateId: string, templateName: string) => {
    if (confirm(`Are you sure you want to delete "${templateName}"?`)) {
      deleteTemplate.mutate(templateId)
    }
  }

  return (
    <SidebarInset>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quote Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage reusable quote templates for faster quote creation
            </p>
          </div>
        </div>

        {/* Templates Grid */}
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
                <Card key={template.quotetemplateid} className="group hover:shadow-lg transition-shadow">
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
                    <div className="flex gap-2 pt-2 border-t">
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
    </SidebarInset>
  )
}
