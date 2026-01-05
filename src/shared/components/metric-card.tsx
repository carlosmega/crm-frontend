import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  iconClassName?: string
  iconBgClassName?: string
  valueClassName?: string
  className?: string
  trend?: number
  trendLabel?: string
  valuePrefix?: string
  valueSuffix?: string
}

/**
 * MetricCard Component
 *
 * Standardized card component for displaying metrics across the application.
 * Uses consistent spacing and styling based on the dashboard design.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Revenue"
 *   value="$45,231.89"
 *   description="20% from last month"
 *   icon={DollarSign}
 *   iconClassName="text-green-600"
 *   iconBgClassName="bg-green-100"
 *   trend={12.5}
 *   trendLabel="vs last month"
 * />
 * ```
 */
export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  iconBgClassName,
  valueClassName,
  className,
  trend,
  trendLabel,
  valuePrefix = '',
  valueSuffix = '',
}: MetricCardProps) {
  const isPositiveTrend = trend && trend > 0
  const isNegativeTrend = trend && trend < 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            iconBgClassName || "bg-muted"
          )}>
            <Icon className={cn("h-4 w-4", iconClassName || "text-muted-foreground")} />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className={cn("text-xl font-bold", valueClassName)}>
          {valuePrefix}
          {value}
          {valueSuffix}
        </div>
        {(description || trend !== undefined) && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {description && (
              <p className="text-xs text-muted-foreground leading-tight">
                {description}
              </p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {isPositiveTrend && <TrendingUp className="h-3 w-3 text-green-600" />}
                {isNegativeTrend && <TrendingDown className="h-3 w-3 text-red-600" />}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositiveTrend && "text-green-600",
                    isNegativeTrend && "text-red-600",
                    !isPositiveTrend && !isNegativeTrend && "text-muted-foreground"
                  )}
                >
                  {trend > 0 ? '+' : ''}
                  {trend.toFixed(1)}%
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
