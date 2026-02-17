'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, Truck, DollarSign } from 'lucide-react'
import type { Order } from '@/core/contracts/entities/order'
import {
  getPaymentTermsLabel,
  getPaymentTermsDays,
  getPaymentMethodLabel,
  getFreightTermsLabel,
  PaymentTermsCode,
  FreightTermsCode,
} from '@/core/contracts/enums'
import { useTranslation } from '@/shared/hooks/use-translation'

interface PaymentInfoCardProps {
  order: Order
}

/**
 * Determina quién paga el flete basado en el FreightTermsCode
 */
const getFreightPayer = (freightTerms?: FreightTermsCode): 'buyer' | 'seller' | 'none' => {
  if (!freightTerms) return 'none'

  switch (freightTerms) {
    case FreightTermsCode.FOB: // Free On Board - Buyer pays
      return 'buyer'
    case FreightTermsCode.NoCharge: // No charge
      return 'none'
    case FreightTermsCode.CIF: // Cost, Insurance, Freight - Seller pays
    case FreightTermsCode.Prepaid: // Prepaid by seller
      return 'seller'
    default:
      return 'none'
  }
}

/**
 * Payment Info Card
 *
 * Muestra información de pago del pedido:
 * - Payment Terms
 * - Payment Method
 * - Freight Terms (con badge indicando quién paga)
 * - Due Date (calculado)
 */
export function PaymentInfoCard({ order }: PaymentInfoCardProps) {
  const { t } = useTranslation('orders')

  // Calculate due date based on payment terms
  const calculateDueDate = (orderDate: string, paymentTerms?: PaymentTermsCode): string | null => {
    if (!paymentTerms) return null

    const daysToAdd = getPaymentTermsDays(paymentTerms)
    if (daysToAdd === 0) return null

    const baseDate = new Date(orderDate)
    const dueDate = new Date(baseDate)
    dueDate.setDate(dueDate.getDate() + daysToAdd)

    return dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const dueDate = order.paymenttermscode
    ? calculateDueDate(order.createdon, order.paymenttermscode)
    : null

  const freightPayer = getFreightPayer(order.freighttermscode)

  const hasPaymentInfo = order.paymenttermscode || order.paymentmethodcode || order.freighttermscode

  if (!hasPaymentInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            {t('detail.paymentInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('detail.noPaymentInfo')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          {t('detail.paymentInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Terms */}
        {order.paymenttermscode && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t('detail.paymentTerms')}
            </div>
            <Badge variant="secondary" className="font-normal">
              {getPaymentTermsLabel(order.paymenttermscode)}
            </Badge>
          </div>
        )}

        {/* Payment Method */}
        {order.paymentmethodcode && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t('detail.paymentMethod')}
            </div>
            <Badge variant="secondary" className="font-normal">
              {getPaymentMethodLabel(order.paymentmethodcode)}
            </Badge>
          </div>
        )}

        {/* Freight Terms */}
        {order.freighttermscode && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t('detail.freightTerms')}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                <Truck className="h-3 w-3 mr-1.5" />
                {getFreightTermsLabel(order.freighttermscode)}
              </Badge>
              {freightPayer === 'buyer' && (
                <Badge variant="outline" className="font-normal text-blue-600 border-blue-300">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {t('detail.buyerPays')}
                </Badge>
              )}
              {freightPayer === 'seller' && (
                <Badge variant="outline" className="font-normal text-green-600 border-green-300">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {t('detail.sellerPays')}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t('detail.dueDate')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{dueDate}</span>
              <span className="text-xs text-muted-foreground">
                {t('detail.calculatedDueDate')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
