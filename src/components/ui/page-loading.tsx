import { Skeleton } from "@/components/ui/skeleton"

export function PageLoading() {
  return (
    <div className="flex h-full flex-1 flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
