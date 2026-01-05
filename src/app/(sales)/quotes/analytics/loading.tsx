import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading state for Quote Analytics page
 */
export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Primary KPIs skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-3 w-[80px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote Pipeline skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[180px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[90px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Metrics skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-3 w-[100px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
