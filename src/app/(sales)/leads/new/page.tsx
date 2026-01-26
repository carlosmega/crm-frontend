"use client"

import { useRouter } from 'next/navigation'
import { useLeadMutations } from '@/features/leads/hooks/use-lead-mutations'
import { LeadFormTabs } from '@/features/leads/components/lead-form-tabs'
import type { CreateLeadDto } from '@/core/contracts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function NewLeadPage() {
  const router = useRouter()
  const { createLead, loading } = useLeadMutations()

  const handleSubmit = async (data: CreateLeadDto) => {
    try {
      const newLead = await createLead(data)
      // Redirigir al detalle del registro creado
      router.push(`/leads/${newLead.leadid}`)
    } catch (error) {
      console.error('Error creating lead:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <BreadcrumbLink href="/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>New Lead</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content - Fondo gris igual que opportunities */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Page Header + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Create New Lead</h2>
                <p className="text-muted-foreground mt-1">
                  Add a new lead to your sales pipeline
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('lead-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lead
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="lead-tabs-nav-container" />
          </div>
        </div>

        {/* FORM - Tabs */}
        <div className="px-4 pb-4 pt-1">
          <LeadFormTabs
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  )
}
