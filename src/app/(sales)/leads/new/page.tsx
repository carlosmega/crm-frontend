"use client"

import { useRouter } from 'next/navigation'
import { useLeadMutations } from '@/features/leads/hooks/use-lead-mutations'
import { LeadFormTabs } from '@/features/leads/components/lead-form-tabs'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateLeadDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

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
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/leads"
        entityType="NEW LEAD"
        title="New Lead"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('lead-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: 'New Lead' },
        ]}
      />

      {/* Content - Fondo gris igual que opportunities */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY SECTION - Page Header + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Create New Lead</h2>
                <p className="text-muted-foreground mt-1">
                  Add a new lead to your sales pipeline
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Cancel
                </Button>
                <Button
                  data-testid="create-lead-button"
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
