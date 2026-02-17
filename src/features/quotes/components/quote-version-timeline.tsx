'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { QuoteVersion } from '@/core/contracts'
import { QuoteVersionChangeType } from '@/core/contracts'
import { useQuoteVersions } from '../hooks/use-quote-versions'
import {
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Edit,
  XCircle,
  RotateCcw,
  Package,
  DollarSign,
  Plus,
  Trash2,
  Percent,
} from 'lucide-react'
import { formatCurrency } from '../utils/quote-calculations'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteVersionTimelineProps {
  quoteid: string
  onCompareVersions?: (fromId: string, toId: string) => void
  onRestoreVersion?: (versionId: string) => void
}

/**
 * Quote Version Timeline
 *
 * Muestra el historial de cambios de un Quote en formato timeline
 */
export function QuoteVersionTimeline({
  quoteid,
  onCompareVersions,
  onRestoreVersion,
}: QuoteVersionTimelineProps) {
  const { data: versions, isLoading } = useQuoteVersions({ quoteid })
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const { t } = useTranslation('quotes')

  const handleSelectVersion = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId))
    } else {
      if (selectedVersions.length >= 2) {
        // Replace oldest selection
        setSelectedVersions([selectedVersions[1], versionId])
      } else {
        setSelectedVersions([...selectedVersions, versionId])
      }
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      // Compare older → newer
      const [v1, v2] = selectedVersions
      const version1 = versions?.find((v) => v.quoteversionid === v1)
      const version2 = versions?.find((v) => v.quoteversionid === v2)

      if (version1 && version2) {
        const older =
          version1.versionnumber < version2.versionnumber ? version1 : version2
        const newer =
          version1.versionnumber > version2.versionnumber ? version1 : version2
        onCompareVersions(older.quoteversionid, newer.quoteversionid)
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="min-h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>{t('versionTimeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!versions || versions.length === 0) {
    return (
      <Card className="min-h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>{t('versionTimeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('versionTimeline.empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('versionTimeline.emptyDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('versionTimeline.title')} ({versions.length})</CardTitle>
          {selectedVersions.length === 2 && onCompareVersions && (
            <Button size="sm" onClick={handleCompare}>
              {t('versionTimeline.compareSelected')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {versions.map((version, index) => {
              const isSelected = selectedVersions.includes(version.quoteversionid)
              const isLatest = index === 0

              return (
                <VersionTimelineItem
                  key={version.quoteversionid}
                  version={version}
                  isLatest={isLatest}
                  isSelected={isSelected}
                  onSelect={() => handleSelectVersion(version.quoteversionid)}
                  onRestore={onRestoreVersion}
                />
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/**
 * Individual timeline item
 */
function VersionTimelineItem({
  version,
  isLatest,
  isSelected,
  onSelect,
  onRestore,
}: {
  version: QuoteVersion
  isLatest: boolean
  isSelected: boolean
  onSelect: () => void
  onRestore?: (versionId: string) => void
}) {
  const { t } = useTranslation('quotes')
  const icon = getChangeTypeIcon(version.changetype)
  const color = getChangeTypeColor(version.changetype)

  return (
    <div
      className={`relative border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onClick={onSelect}
    >
      {/* Timeline connector line */}
      {!isLatest && (
        <div className="absolute left-[29px] top-[-16px] w-[2px] h-[16px] bg-border" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">
                  {t('versionTimeline.version')} {version.versionnumber}
                </h4>
                <ChangeTypeBadge changetype={version.changetype} />
                {isLatest && <Badge variant="default">{t('versionTimeline.latest')}</Badge>}
              </div>
              {version.changedescription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {version.changedescription}
                </p>
              )}
            </div>

            {onRestore && !isLatest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore(version.quoteversionid)
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
            <div>
              <span className="font-medium">{t('versionTimeline.date')}:</span>{' '}
              {new Date(version.createdon).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">{t('versionTimeline.by')}:</span> {version.createdby}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>
                {version.versiondata.lines.length} {version.versiondata.lines.length !== 1 ? t('versionTimeline.products') : t('versionTimeline.product')}
                {' '}({version.versiondata.lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0)} {t('versionTimeline.units')})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatCurrency(Number(version.versiondata.totalamount) || 0)}
              </span>
            </div>
          </div>

          {/* Changed fields */}
          {version.changedfields && version.changedfields.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {version.changedfields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          )}

          {/* Change reason */}
          {version.changereason && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {t('versionTimeline.reason')}: {version.changereason}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Change type badge
 */
function ChangeTypeBadge({ changetype }: { changetype: QuoteVersionChangeType }) {
  const { t } = useTranslation('quotes')
  const labels: Record<QuoteVersionChangeType, string> = {
    [QuoteVersionChangeType.Created]: t('versionTimeline.changeTypes.created'),
    [QuoteVersionChangeType.Updated]: t('versionTimeline.changeTypes.updated'),
    [QuoteVersionChangeType.Activated]: t('versionTimeline.changeTypes.activated'),
    [QuoteVersionChangeType.Won]: t('versionTimeline.changeTypes.won'),
    [QuoteVersionChangeType.Lost]: t('versionTimeline.changeTypes.lost'),
    [QuoteVersionChangeType.Revised]: t('versionTimeline.changeTypes.revised'),
    [QuoteVersionChangeType.Canceled]: t('versionTimeline.changeTypes.canceled'),
    [QuoteVersionChangeType.ProductAdded]: t('versionTimeline.changeTypes.productAdded'),
    [QuoteVersionChangeType.ProductRemoved]: t('versionTimeline.changeTypes.productRemoved'),
    [QuoteVersionChangeType.ProductUpdated]: t('versionTimeline.changeTypes.productUpdated'),
    [QuoteVersionChangeType.DiscountApplied]: t('versionTimeline.changeTypes.discountApplied'),
    [QuoteVersionChangeType.PriceChanged]: t('versionTimeline.changeTypes.priceChanged'),
  }

  const variants: Record<QuoteVersionChangeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [QuoteVersionChangeType.Created]: 'default',
    [QuoteVersionChangeType.Updated]: 'secondary',
    [QuoteVersionChangeType.Activated]: 'default',
    [QuoteVersionChangeType.Won]: 'default',
    [QuoteVersionChangeType.Lost]: 'destructive',
    [QuoteVersionChangeType.Revised]: 'secondary',
    [QuoteVersionChangeType.Canceled]: 'destructive',
    [QuoteVersionChangeType.ProductAdded]: 'default',
    [QuoteVersionChangeType.ProductRemoved]: 'destructive',
    [QuoteVersionChangeType.ProductUpdated]: 'secondary',
    [QuoteVersionChangeType.DiscountApplied]: 'default',
    [QuoteVersionChangeType.PriceChanged]: 'secondary',
  }

  return (
    <Badge variant={variants[changetype]} className="text-xs">
      {labels[changetype]}
    </Badge>
  )
}

/**
 * Get icon for change type
 */
function getChangeTypeIcon(changetype: QuoteVersionChangeType) {
  const icons: Record<QuoteVersionChangeType, React.ReactElement> = {
    [QuoteVersionChangeType.Created]: <FileText className="h-5 w-5" />,
    [QuoteVersionChangeType.Updated]: <Edit className="h-5 w-5" />,
    [QuoteVersionChangeType.Activated]: <CheckCircle className="h-5 w-5" />,
    [QuoteVersionChangeType.Won]: <TrendingUp className="h-5 w-5" />,
    [QuoteVersionChangeType.Lost]: <TrendingDown className="h-5 w-5" />,
    [QuoteVersionChangeType.Revised]: <RotateCcw className="h-5 w-5" />,
    [QuoteVersionChangeType.Canceled]: <XCircle className="h-5 w-5" />,
    [QuoteVersionChangeType.ProductAdded]: <Plus className="h-5 w-5" />,
    [QuoteVersionChangeType.ProductRemoved]: <Trash2 className="h-5 w-5" />,
    [QuoteVersionChangeType.ProductUpdated]: <Edit className="h-5 w-5" />,
    [QuoteVersionChangeType.DiscountApplied]: <Percent className="h-5 w-5" />,
    [QuoteVersionChangeType.PriceChanged]: <DollarSign className="h-5 w-5" />,
  }

  return icons[changetype]
}

/**
 * Get color classes for change type
 */
function getChangeTypeColor(changetype: QuoteVersionChangeType): string {
  const colors: Record<QuoteVersionChangeType, string> = {
    [QuoteVersionChangeType.Created]: 'bg-blue-500/10 text-blue-600',
    [QuoteVersionChangeType.Updated]: 'bg-gray-500/10 text-gray-600',
    [QuoteVersionChangeType.Activated]: 'bg-green-500/10 text-green-600',
    [QuoteVersionChangeType.Won]: 'bg-green-500/10 text-green-600',
    [QuoteVersionChangeType.Lost]: 'bg-red-500/10 text-red-600',
    [QuoteVersionChangeType.Revised]: 'bg-purple-500/10 text-purple-600',
    [QuoteVersionChangeType.Canceled]: 'bg-red-500/10 text-red-600',
    [QuoteVersionChangeType.ProductAdded]: 'bg-green-500/10 text-green-600',
    [QuoteVersionChangeType.ProductRemoved]: 'bg-red-500/10 text-red-600',
    [QuoteVersionChangeType.ProductUpdated]: 'bg-yellow-500/10 text-yellow-600',
    [QuoteVersionChangeType.DiscountApplied]: 'bg-blue-500/10 text-blue-600',
    [QuoteVersionChangeType.PriceChanged]: 'bg-orange-500/10 text-orange-600',
  }

  return colors[changetype]
}
