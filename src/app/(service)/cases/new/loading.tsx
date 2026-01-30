import { Skeleton } from '@/components/ui/skeleton'

export default function NewCaseLoading() {
  return (
    <div className="flex flex-1 flex-col bg-gray-100">
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Form skeleton */}
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
