"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePipelineMetrics } from '../hooks/use-pipeline-metrics'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * PipelineTrendChart Component
 *
 * Line chart showing pipeline trend over last 6 months
 */
export function PipelineTrendChart() {
  const { pipelineTrend, loading } = usePipelineMetrics()
  const formatCurrency = useCurrencyFormat()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Trend</CardTitle>
          <CardDescription>Pipeline value over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!pipelineTrend || pipelineTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Trend</CardTitle>
          <CardDescription>Pipeline value over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No trend data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = pipelineTrend.map(point => ({
    month: point.month,
    'Total Value': point.totalValue,
    'Weighted Value': point.weightedValue,
    count: point.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Trend</CardTitle>
        <CardDescription>Pipeline value over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value.toString()
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="font-semibold mb-2">{data.month}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Opportunities:</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">{formatCurrency(data['Total Value'])}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Weighted:</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(data['Weighted Value'])}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="Total Value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Weighted Value"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
