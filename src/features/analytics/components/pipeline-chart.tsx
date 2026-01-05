"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePipelineMetrics } from '../hooks/use-pipeline-metrics'
import { formatCurrency } from '@/shared/utils/formatters'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const STAGE_COLORS = {
  Qualify: '#3b82f6',   // blue
  Develop: '#a855f7',   // purple
  Propose: '#f97316',   // orange
  Close: '#22c55e',     // green
}

/**
 * PipelineChart Component
 *
 * Bar chart showing pipeline value by sales stage
 */
export function PipelineChart() {
  const { pipelineByStage, loading } = usePipelineMetrics()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
          <CardDescription>Value distribution across sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!pipelineByStage || pipelineByStage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
          <CardDescription>Value distribution across sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No pipeline data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = pipelineByStage.map(stage => ({
    name: stage.stageName,
    'Total Value': stage.totalValue,
    'Weighted Value': stage.weightedValue,
    count: stage.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline by Stage</CardTitle>
        <CardDescription>Value distribution across sales stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
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
                    <div className="font-semibold mb-2">{data.name}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Count:</span>
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
            <Bar
              dataKey="Total Value"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-total-${index}`}
                  fill={STAGE_COLORS[entry.name as keyof typeof STAGE_COLORS]}
                  opacity={0.6}
                />
              ))}
            </Bar>
            <Bar
              dataKey="Weighted Value"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-weighted-${index}`}
                  fill={STAGE_COLORS[entry.name as keyof typeof STAGE_COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
