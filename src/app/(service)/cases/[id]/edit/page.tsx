"use client"

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCase } from '@/features/cases/hooks/use-cases'
import { useCaseMutations } from '@/features/cases/hooks/use-case-mutations'
import { CaseFormTabs } from '@/features/cases/components/case-form-tabs'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import { Button } from '@/components/ui/button'
import { Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import type { UpdateCaseDto } from '@/core/contracts'

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { case: caseData, loading } = useCase(resolvedParams.id)
  const { updateCase, updateState } = useCaseMutations()

  const handleSubmit = async (data: UpdateCaseDto) => {
    try {
      const result = await updateCase(resolvedParams.id, data)
      if (result) {
        toast.success('Case updated successfully')
        router.push(`/cases/${resolvedParams.id}`)
      } else {
        toast.error('Failed to update case')
      }
    } catch (error) {
      console.error('Error updating case:', error)
      toast.error('An error occurred while updating the case')
    }
  }

  const handleCancel = () => {
    router.push(`/cases/${resolvedParams.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">
          Case not found
        </p>
        <Button asChild>
          <Link href="/cases">Back to Cases</Link>
        </Button>
      </div>
    )
  }

  // Mobile actions
  const mobileActions = (
    <div className="flex gap-2">
      <Button
        type="submit"
        form="case-edit-form"
        size="sm"
        disabled={updateState.loading}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {updateState.loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </Button>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/cases/${caseData.incidentid}`}
        entityType="CASES"
        title={`Edit: ${caseData.ticketnumber || caseData.title}`}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Service', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: caseData.ticketnumber || caseData.title, href: `/cases/${caseData.incidentid}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* Sticky Header */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">Edit Case</h1>
                <p className="text-muted-foreground truncate">
                  {caseData.ticketnumber} - {caseData.title}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="case-edit-form"
                  disabled={updateState.loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {updateState.loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Edit Case</h1>
              <p className="text-muted-foreground truncate">
                {caseData.ticketnumber} - {caseData.title}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="case-tabs-nav-container" />
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 pb-4 pt-1">
          <CaseFormTabs
            case={caseData}
            onSubmit={handleSubmit}
            isLoading={updateState.loading}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
