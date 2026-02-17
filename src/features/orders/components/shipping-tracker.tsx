'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ShippingMethodCode,
  getShippingMethodLabel,
  requiresTracking,
} from '@/core/contracts/enums'
import { Package, Truck, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/shared/utils/formatters'
import { useTranslation } from '@/shared/hooks/use-translation'

/**
 * Shipping Tracker Component
 *
 * Enhanced shipping tracking con:
 * - Tracking number input
 * - Shipping method selector
 * - Status timeline (simulated carrier updates)
 * - Estimated delivery date
 */

interface ShippingStatus {
  status: string
  location?: string
  timestamp: string
  description: string
  icon: typeof Package
  color: string
}

interface ShippingTrackerProps {
  orderId: string
  shippingMethod?: ShippingMethodCode
  trackingNumber?: string
  shipDate?: string
  estimatedDeliveryDate?: string
  onUpdateTracking?: (data: {
    shippingMethod: ShippingMethodCode
    trackingNumber: string
  }) => Promise<void>
}

// Simulated tracking timeline
function generateTrackingTimeline(
  trackingNumber: string,
  shipDate: string
): ShippingStatus[] {
  const baseDate = new Date(shipDate)

  return [
    {
      status: 'Order Processed',
      location: 'Warehouse',
      timestamp: baseDate.toISOString(),
      description: 'Order has been processed and ready for shipment',
      icon: Package,
      color: 'text-blue-500',
    },
    {
      status: 'Picked Up',
      location: 'Distribution Center',
      timestamp: new Date(
        baseDate.getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      description: 'Package picked up by carrier',
      icon: Truck,
      color: 'text-blue-500',
    },
    {
      status: 'In Transit',
      location: 'Regional Hub',
      timestamp: new Date(
        baseDate.getTime() + 48 * 60 * 60 * 1000
      ).toISOString(),
      description: 'Package in transit to destination',
      icon: MapPin,
      color: 'text-orange-500',
    },
    {
      status: 'Out for Delivery',
      location: 'Local Facility',
      timestamp: new Date(
        baseDate.getTime() + 72 * 60 * 60 * 1000
      ).toISOString(),
      description: 'Package out for delivery',
      icon: Truck,
      color: 'text-green-500',
    },
    {
      status: 'Delivered',
      location: 'Customer Address',
      timestamp: new Date(
        baseDate.getTime() + 96 * 60 * 60 * 1000
      ).toISOString(),
      description: 'Package delivered successfully',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ]
}

export function ShippingTracker({
  orderId,
  shippingMethod,
  trackingNumber: initialTrackingNumber,
  shipDate = new Date().toISOString(),
  estimatedDeliveryDate,
  onUpdateTracking,
}: ShippingTrackerProps) {
  const { t } = useTranslation('orders')
  const [isEditing, setIsEditing] = useState(!initialTrackingNumber)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '')
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethodCode | undefined>(
    shippingMethod
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedMethod || !trackingNumber) return

    setIsSaving(true)
    try {
      await onUpdateTracking?.({
        shippingMethod: selectedMethod,
        trackingNumber,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating tracking:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const timeline =
    trackingNumber && shipDate
      ? generateTrackingTimeline(trackingNumber, shipDate)
      : []

  const needsTracking = selectedMethod && requiresTracking(selectedMethod)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('tracker.title')}
            </CardTitle>
            <CardDescription>{t('tracker.description')}</CardDescription>
          </div>
          {!isEditing && onUpdateTracking && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t('tracker.updateTracking')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tracking Info Form */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipping-method">{t('tracker.shippingMethod')}</Label>
              <Select
                value={selectedMethod?.toString()}
                onValueChange={(val) =>
                  setSelectedMethod(Number(val) as ShippingMethodCode)
                }
              >
                <SelectTrigger id="shipping-method">
                  <SelectValue placeholder={t('tracker.selectShippingMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ShippingMethodCode.Ground,
                    ShippingMethodCode.Overnight,
                    ShippingMethodCode.TwoDay,
                    ShippingMethodCode.Express,
                    ShippingMethodCode.Economy,
                    ShippingMethodCode.International,
                    ShippingMethodCode.SameDay,
                    ShippingMethodCode.Freight,
                    ShippingMethodCode.WillCall,
                  ].map((method) => (
                    <SelectItem key={method} value={method.toString()}>
                      {getShippingMethodLabel(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsTracking && (
              <div className="space-y-2">
                <Label htmlFor="tracking-number">{t('tracker.trackingNumber')}</Label>
                <Input
                  id="tracking-number"
                  placeholder={t('tracker.enterTracking')}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('tracker.carrierHint')}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !selectedMethod || (needsTracking && !trackingNumber)}
              >
                {isSaving ? t('tracker.saving') : t('tracker.save')}
              </Button>
              {!initialTrackingNumber && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('tracker.carrier')}</span>
              <span className="text-sm">{selectedMethod && getShippingMethodLabel(selectedMethod)}</span>
            </div>
            {trackingNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('tracker.trackingHash')}</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {trackingNumber}
                </code>
              </div>
            )}
            {estimatedDeliveryDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('tracker.estDelivery')}</span>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(estimatedDeliveryDate)}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {!isEditing && trackingNumber && timeline.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-4">{t('tracker.trackingHistory')}</h4>
              <div className="space-y-4">
                {timeline.map((status, index) => {
                  const Icon = status.icon
                  const isCompleted = new Date(status.timestamp) <= new Date()
                  const isCurrent =
                    isCompleted &&
                    (index === timeline.length - 1 ||
                      new Date(timeline[index + 1].timestamp) > new Date())

                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            isCompleted
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted bg-background text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`h-full w-0.5 ${
                              isCompleted ? 'bg-primary' : 'bg-muted'
                            }`}
                            style={{ minHeight: '40px' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold ${
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {status.status}
                          </p>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              {t('tracker.current')}
                            </Badge>
                          )}
                        </div>
                        {status.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {status.location}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {status.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isCompleted
                            ? formatDate(status.timestamp)
                            : `${t('tracker.expected')} ${formatDate(status.timestamp)}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* No Tracking Info */}
        {!isEditing && !trackingNumber && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('tracker.noTracking')}</p>
            <p className="text-sm">{t('tracker.addTracking')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
