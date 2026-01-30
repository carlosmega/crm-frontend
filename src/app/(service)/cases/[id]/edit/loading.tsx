import { Skeleton } from '@/components/ui/skeleton'

export default function EditCaseLoading() {
  return (
    <div className="flex flex-1 flex-col bg-gray-100">
      {/* Header skeleton */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="px-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="px-4 pt-4 pb-4 space-y-4">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
