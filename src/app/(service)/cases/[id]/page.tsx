"use client"

import { use, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCase } from '@/features/cases/hooks/use-cases'
import { useCaseMutations } from '@/features/cases/hooks/use-case-mutations'
import { CaseStatusBadge } from '@/features/cases/components/case-status-badge'
import { CasePriorityBadge } from '@/features/cases/components/case-priority-badge'
import { CaseOriginBadge } from '@/features/cases/components/case-origin-badge'
import { LogActivityButton } from '@/features/activities/components'
import { CreateActivityDialog } from '@/features/activities/components/create-activity-dialog'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import { CaseStateCode } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreVertical,
  FileText,
  RefreshCcw,
  Building2,
  User,
  Ticket,
} from 'lucide-react'
import { toast } from 'sonner'

// Dynamic import for detail tabs
const CaseDetailTabs = dynamic(
  () =>
    import('@/features/cases/components/case-detail-tabs').then((mod) => ({
      default: mod.CaseDetailTabs,
    })),
  { ssr: false }
)

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { case: caseData, loading, refetch } = useCase(resolvedParams.id)
  const {
    deleteCase,
    resolveCase,
    cancelCase,
    reopenCase,
    resolveState,
    cancelState,
    reopenState,
  } = useCaseMutations()
  const [createActivityDialogOpen, setCreateActivityDialogOpen] = useState(false)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolutionType, setResolutionType] = useState('')
  const [resolutionSummary, setResolutionSummary] = useState('')

  const mutating =
    resolveState.loading || cancelState.loading || reopenState.loading

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this case?')) {
      try {
        await deleteCase(resolvedParams.id)
        toast.success('Case deleted successfully')
        router.push('/cases')
      } catch (error) {
        console.error('Error deleting case:', error)
        toast.error('Failed to delete case')
      }
    }
  }

  const handleResolve = async () => {
    if (!resolutionType || !resolutionSummary) {
      toast.error('Please fill in all resolution fields')
      return
    }

    try {
      const result = await resolveCase(resolvedParams.id, {
        resolutiontype: resolutionType,
        resolutionsummary: resolutionSummary,
      })
      if (result) {
        toast.success('Case resolved successfully')
        setResolveDialogOpen(false)
        refetch()
      } else {
        toast.error('Failed to resolve case')
      }
    } catch (error) {
      console.error('Error resolving case:', error)
      toast.error('Failed to resolve case')
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this case?')) {
      try {
        const result = await cancelCase(resolvedParams.id)
        if (result) {
          toast.success('Case cancelled')
          refetch()
        } else {
          toast.error('Failed to cancel case')
        }
      } catch (error) {
        console.error('Error cancelling case:', error)
        toast.error('Failed to cancel case')
      }
    }
  }

  const handleReopen = async () => {
    if (confirm('Are you sure you want to reopen this case?')) {
      try {
        const result = await reopenCase(resolvedParams.id)
        if (result) {
          toast.success('Case reopened')
          refetch()
        } else {
          toast.error('Failed to reopen case')
        }
      } catch (error) {
        console.error('Error reopening case:', error)
        toast.error('Failed to reopen case')
      }
    }
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

  // Mobile actions dropdown
  const mobileActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href={`/cases/${caseData.incidentid}/edit`}
            className="flex items-center cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCreateActivityDialogOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Log Activity
        </DropdownMenuItem>
        {caseData.statecode === CaseStateCode.Active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setResolveDialogOpen(true)}
              disabled={mutating}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve Case
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCancel} disabled={mutating}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Case
            </DropdownMenuItem>
          </>
        )}
        {caseData.statecode !== CaseStateCode.Active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReopen} disabled={mutating}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reopen Case
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={mutating}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/cases"
        entityType="CASES"
        title={caseData.ticketnumber || caseData.title}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Service', href: '/dashboard' },
          { label: 'Cases', href: '/cases' },
          { label: caseData.ticketnumber || caseData.title },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Sticky Header */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Case Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Case Info */}
                <div className="flex items-center gap-3 mb-2">
                  {caseData.ticketnumber && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                      <span className="font-mono text-sm">
                        {caseData.ticketnumber}
                      </span>
                    </div>
                  )}
                  <CaseStatusBadge
                    statecode={caseData.statecode}
                    statuscode={caseData.statuscode}
                  />
                  <CasePriorityBadge priority={caseData.prioritycode} />
                  <CaseOriginBadge origin={caseData.caseorigincode} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {caseData.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {caseData.customerid_type === 'account' ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{caseData.customername || 'Unknown Customer'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {caseData.statecode === CaseStateCode.Active && (
                  <>
                    <Button
                      onClick={() => setResolveDialogOpen(true)}
                      disabled={mutating}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Resolve Case
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={mutating}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
                {caseData.statecode !== CaseStateCode.Active && (
                  <Button
                    variant="outline"
                    onClick={handleReopen}
                    disabled={mutating}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reopen
                  </Button>
                )}
                <LogActivityButton
                  regardingId={caseData.incidentid}
                  regardingType="case"
                  regardingName={caseData.title}
                  showQuickActions
                />
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link href={`/cases/${caseData.incidentid}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={mutating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {caseData.ticketnumber && (
                  <span className="font-mono text-sm text-muted-foreground">
                    {caseData.ticketnumber}
                  </span>
                )}
                <CaseStatusBadge
                  statecode={caseData.statecode}
                  statuscode={caseData.statuscode}
                />
                <CasePriorityBadge priority={caseData.prioritycode} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {caseData.customerid_type === 'account' ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>{caseData.customername || 'Unknown Customer'}</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="case-tabs-nav-container" />
          </div>
        </div>

        {/* Content - Case Details */}
        <div className="px-4 pb-4 pt-1">
          <CaseDetailTabs case={caseData} />
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Case</DialogTitle>
            <DialogDescription>
              Provide resolution details for this case.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resolutionType">Resolution Type</Label>
              <Input
                id="resolutionType"
                placeholder="e.g., Problem Solved, Information Provided"
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolutionSummary">Resolution Summary</Label>
              <Textarea
                id="resolutionSummary"
                placeholder="Describe how the issue was resolved..."
                rows={4}
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolveState.loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {resolveState.loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Resolve Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Activity Dialog */}
      <CreateActivityDialog
        open={createActivityDialogOpen}
        onOpenChange={setCreateActivityDialogOpen}
        regardingId={caseData.incidentid}
        regardingType="case"
        regardingName={caseData.title}
      />
    </>
  )
}
