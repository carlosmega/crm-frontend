import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
      {/* Header Skeleton */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border">
          <div className="border-b p-4">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Filters Skeleton */}
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          {/* Notification List Skeleton */}
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
