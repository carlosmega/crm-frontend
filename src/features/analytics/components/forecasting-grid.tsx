"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useForecastingControls } from '../hooks/use-forecasting'
import { formatCurrency } from '@/shared/utils/formatters'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import type { ForecastingPeriodType } from '../utils/forecasting-calculations'

/**
 * ForecastingGrid Component
 *
 * Table showing sales forecast by period with export functionality
 */
export function ForecastingGrid() {
  const {
    forecast,
    accuracy,
    loading,
    periodType,
    setPeriodType,
    periods,
    setPeriods,
  } = useForecastingControls()

  const [exportLoading, setExportLoading] = useState(false)

  const handleExportCSV = () => {
    setExportLoading(true)

    try {
      // CSV headers
      const headers = [
        'Period',
        'Best Case',
        'Likely',
        'Worst Case',
        'Actual',
        'Opportunities',
        'Variance (Likely vs Actual)',
      ]

      // CSV rows
      const rows = forecast.map(f => {
        const variance = f.actual > 0 ? f.likely - f.actual : 0
        return [
          f.period,
          f.bestCase.toFixed(2),
          f.likely.toFixed(2),
          f.worstCase.toFixed(2),
          f.actual.toFixed(2),
          f.opportunityCount,
          variance.toFixed(2),
        ]
      })

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `forecast-${periodType}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Forecast</CardTitle>
          <CardDescription>Revenue projections by period</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sales Forecast</CardTitle>
            <CardDescription>Revenue projections by period</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={periodType}
              onValueChange={(value) => setPeriodType(value as ForecastingPeriodType)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={periods.toString()}
              onValueChange={(value) => setPeriods(parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodType === 'monthly' ? (
                  <>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="2">2 quarters</SelectItem>
                    <SelectItem value="4">4 quarters</SelectItem>
                    <SelectItem value="8">8 quarters</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={exportLoading || forecast.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Accuracy Summary */}
        {accuracy && (
          <div className="mt-4 flex gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Likely Accuracy:</span>
              <Badge variant="secondary">{accuracy.likelyAccuracy.toFixed(1)}%</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Best Case Accuracy:</span>
              <Badge variant="secondary">{accuracy.bestCaseAccuracy.toFixed(1)}%</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Worst Case Accuracy:</span>
              <Badge variant="secondary">{accuracy.worstCaseAccuracy.toFixed(1)}%</Badge>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {forecast.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No forecast data available
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Best Case</TableHead>
                  <TableHead className="text-right">Likely</TableHead>
                  <TableHead className="text-right">Worst Case</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Opps</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecast.map((f, index) => {
                  const variance = f.actual > 0 ? f.likely - f.actual : null
                  const variancePercent = f.actual > 0 ? (variance! / f.actual) * 100 : null

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{f.period}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(f.bestCase)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(f.likely)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatCurrency(f.worstCase)}
                      </TableCell>
                      <TableCell className="text-right">
                        {f.actual > 0 ? (
                          <span className="font-medium">{formatCurrency(f.actual)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.opportunityCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {variance !== null ? (
                          <div className="flex items-center justify-end gap-1">
                            {variance > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : variance < 0 ? (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            ) : null}
                            <span
                              className={
                                variance > 0
                                  ? 'text-green-600'
                                  : variance < 0
                                  ? 'text-red-600'
                                  : ''
                              }
                            >
                              {formatCurrency(Math.abs(variance))}
                              {variancePercent !== null && (
                                <span className="text-xs ml-1">
                                  ({variancePercent > 0 ? '+' : ''}
                                  {variancePercent.toFixed(1)}%)
                                </span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Best Case:</strong> Sum of opportunities with close probability ≥ 75%</p>
          <p><strong>Likely:</strong> Weighted pipeline (estimated value × close probability)</p>
          <p><strong>Worst Case:</strong> Only opportunities with 100% close probability</p>
          <p><strong>Actual:</strong> Sum of won opportunities that closed in the period</p>
          <p><strong>Variance:</strong> Difference between Likely forecast and Actual (positive = over-forecast, negative = under-forecast)</p>
        </div>
      </CardContent>
    </Card>
  )
}
