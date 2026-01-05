"use client"

import { use } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useActivity } from '@/features/activities/hooks/use-activities'
import {
  useCompleteActivity,
  useCancelActivity,
  useDeleteActivity
} from '@/features/activities/hooks/use-activity-mutations'
import { ActivityInfoHeader } from '@/features/activities/components/activity-info-header'
import { ActivityStateCode } from '@/core/contracts/enums'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react'

// Dynamic import for activity detail tabs
const ActivityDetailTabs = dynamic(
  () => import('@/features/activities/components/activity-detail-tabs').then(mod => ({ default: mod.ActivityDetailTabs })),
  { ssr: false }
)

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: activity, isLoading: loading } = useActivity(resolvedParams.id)
  const completeMutation = useCompleteActivity()
  const cancelMutation = useCancelActivity()
  const deleteMutation = useDeleteActivity()

  const mutating = completeMutation.isPending || cancelMutation.isPending || deleteMutation.isPending

  const handleComplete = async () => {
    if (confirm('Mark this activity as completed?')) {
      try {
        await completeMutation.mutateAsync({
          id: resolvedParams.id,
          dto: {
            statecode: ActivityStateCode.Completed,
            actualend: new Date().toISOString(),
          }
        })
        window.location.reload()
      } catch (error) {
        console.error('Error completing activity:', error)
      }
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this activity?')) {
      try {
        await cancelMutation.mutateAsync(resolvedParams.id)
        window.location.reload()
      } catch (error) {
        console.error('Error canceling activity:', error)
      }
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteMutation.mutateAsync(resolvedParams.id)
        router.push('/activities')
      } catch (error) {
        console.error('Error deleting activity:', error)
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

  if (!activity) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">Activity not found</p>
        <Button asChild>
          <Link href="/activities">Back to Activities</Link>
        </Button>
      </div>
    )
  }

  const isOpen = activity.statecode === ActivityStateCode.Open || activity.statecode === ActivityStateCode.Scheduled

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Back Button + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <Link href="/activities">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                ACTIVITIES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {activity.subject}
              </h1>
            </div>
          </div>

          {/* RIGHT: Hamburger + Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Navigation Menu */}
            <SidebarTrigger className="h-8 w-8" />

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 mx-1" />

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isOpen && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/activities/${resolvedParams.id}/edit`} className="flex items-center cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleComplete} disabled={mutating}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCancel} disabled={mutating}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleDelete} disabled={mutating} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <BreadcrumbLink href="/activities">Activities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{activity.subject}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content - Fondo gris igual que accounts */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Activity Info Header + Actions + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Activity Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <ActivityInfoHeader activity={activity} className="border-0 p-0" />
              </div>
              <div className="flex gap-2">
                {isOpen && (
                  <>
                    <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Link href={`/activities/${resolvedParams.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button onClick={handleComplete} disabled={mutating} className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={mutating} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
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

            {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
            <div className="md:hidden">
              <ActivityInfoHeader activity={activity} className="border-0 p-0" />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="activity-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with activity details */}
        <div className="px-4 pb-4 pt-1">
          <ActivityDetailTabs activity={activity} />
        </div>
      </div>
    </>
  )
}
