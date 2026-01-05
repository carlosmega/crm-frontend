import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-4xl py-8">
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}
