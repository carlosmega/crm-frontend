import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl p-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
