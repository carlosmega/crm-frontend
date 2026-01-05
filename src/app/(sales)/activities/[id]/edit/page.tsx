"use client"

import { use, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useActivity } from '@/features/activities/hooks/use-activities'
import { useUpdateActivity } from '@/features/activities/hooks/use-activity-mutations'
import type { UpdateActivityDto } from '@/core/contracts/entities/activity'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Save, X, ArrowLeft, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityFormData {
  subject: string
  description?: string
  scheduledstart?: string
  scheduledend?: string
  prioritycode?: string
}

export type ActivityEditTabId = 'details'

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: activity, isLoading: loading } = useActivity(resolvedParams.id)
  const updateMutation = useUpdateActivity()

  const [activeTab, setActiveTab] = useState<ActivityEditTabId>('details')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ActivityFormData>()

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('activity-edit-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Populate form when activity loads
  useEffect(() => {
    if (activity) {
      reset({
        subject: activity.subject,
        description: activity.description || '',
        scheduledstart: activity.scheduledstart
          ? new Date(activity.scheduledstart).toISOString().slice(0, 16)
          : '',
        scheduledend: activity.scheduledend
          ? new Date(activity.scheduledend).toISOString().slice(0, 16)
          : '',
        prioritycode: activity.prioritycode?.toString() || '1',
      })
    }
  }, [activity, reset])

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const dto: UpdateActivityDto = {
        subject: data.subject,
        description: data.description,
        scheduledstart: data.scheduledstart || undefined,
        scheduledend: data.scheduledend || undefined,
        prioritycode: data.prioritycode ? parseInt(data.prioritycode) : undefined,
      }

      await updateMutation.mutateAsync({
        id: resolvedParams.id,
        dto,
      })

      toast({
        title: 'Activity updated',
        description: 'Activity has been updated successfully',
      })

      router.push(`/activities/${resolvedParams.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update activity',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!activity) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Activity not found</p>
          <Button asChild>
            <Link href="/activities">Back to Activities</Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
              <Link href={`/activities/${resolvedParams.id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                EDIT ACTIVITY
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {activity.subject}
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending || !isDirty}
            className="h-8 shrink-0"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b">
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
                <BreadcrumbLink href={`/activities/${resolvedParams.id}`}>
                  {activity.subject}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Sticky Section with Activity Info and Actions + Tabs (Desktop Only) */}
      <div className="hidden md:block sticky top-16 z-40 bg-gray-100/98 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Activity</h1>
              <p className="text-muted-foreground mt-1">
                {activity.subject}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/activities/${resolvedParams.id}`}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={updateMutation.isPending || !isDirty}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4">
          <div id="activity-edit-tabs-nav-container" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <div className="px-4 pb-4 pt-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityEditTabId)} className="w-full">
            {/* Render tabs navigation in sticky header container via portal */}
            {tabsContainer && createPortal(
              <div className="overflow-x-auto">
                <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
                  <TabsTrigger
                    value="details"
                    className={cn(
                      "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
                      "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
                      "data-[state=inactive]:text-gray-500 hover:text-gray-900",
                      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
                    )}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Activity Details
                  </TabsTrigger>
                </TabsList>
              </div>,
              tabsContainer
            )}

            {/* ACTIVITY DETAILS TAB */}
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Details</CardTitle>
                  <CardDescription>
                    Update the activity information below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Enter activity subject"
                        {...register('subject', {
                          required: 'Subject is required',
                        })}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter activity description"
                        rows={4}
                        {...register('description')}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Scheduled Start */}
                      <div className="space-y-2">
                        <Label htmlFor="scheduledstart">Scheduled Start</Label>
                        <Input
                          id="scheduledstart"
                          type="datetime-local"
                          {...register('scheduledstart')}
                        />
                      </div>

                      {/* Scheduled End */}
                      <div className="space-y-2">
                        <Label htmlFor="scheduledend">Scheduled End</Label>
                        <Input
                          id="scheduledend"
                          type="datetime-local"
                          {...register('scheduledend')}
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="prioritycode">Priority</Label>
                      <select
                        id="prioritycode"
                        {...register('prioritycode')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="0">Low</option>
                        <option value="1">Normal</option>
                        <option value="2">High</option>
                      </select>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
