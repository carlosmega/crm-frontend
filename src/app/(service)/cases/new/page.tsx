"use client"

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCaseMutations } from '@/features/cases/hooks/use-case-mutations'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { CreateCaseDto } from '@/core/contracts'

// Dynamic import for CaseFormTabs
const CaseFormTabs = dynamic(
  () => import('@/features/cases/components/case-form-tabs').then(m => ({ default: m.CaseFormTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    ),
    ssr: false
  }
)

export default function NewCasePage() {
  const router = useRouter()
  const { createCase, createState } = useCaseMutations()

  const handleSubmit = async (data: CreateCaseDto) => {
    try {
      const newCase = await createCase(data)
      if (newCase) {
        toast.success('Case created successfully')
        router.push(`/cases/${newCase.incidentid}`)
      } else {
        toast.error('Failed to create case')
      }
    } catch (error) {
      console.error('Error creating case:', error)
      toast.error('An error occurred while creating the case')
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/cases"
        entityType="NEW CASE"
        title="New Case"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('case-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={createState.loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Service', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: 'New Case' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Case</h1>
                  <p className="text-muted-foreground mt-1">
                    Create a new customer support case
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('case-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={createState.loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {createState.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Case
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Case</h1>
              <p className="text-muted-foreground mt-1">
                Create a new customer support case
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="case-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <CaseFormTabs
            onSubmit={handleSubmit}
            isLoading={createState.loading}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
