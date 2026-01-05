/**
 * Order PDF Template
 *
 * Template para generar PDFs de sales orders usando @react-pdf/renderer
 * Este componente define el layout y estilo del documento PDF de orden
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Order } from '@/core/contracts/entities/order'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'

// Estilos del PDF (reutilizando y adaptando del Quote template)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Header section
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#16a34a', // Verde para orders
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
  },
  ordernumber: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 8,
  },
  // Info section
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoColumn: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'medium',
  },
  // Table styles
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottom: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: '#1e293b',
  },
  // Column widths
  col1: { width: '5%' }, // #
  col2: { width: '40%' }, // Product
  col3: { width: '10%', textAlign: 'right' }, // Qty
  col4: { width: '15%', textAlign: 'right' }, // Price
  col5: { width: '15%', textAlign: 'right' }, // Discount
  col6: { width: '15%', textAlign: 'right' }, // Total
  // Totals section
  totalsSection: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: '45%',
    borderTop: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'medium',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: 2,
    borderTopColor: '#16a34a',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
  },
  // Shipping section
  shippingSection: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  shippingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  shippingText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  // Description
  description: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 1.4,
  },
})

interface OrderPdfTemplateProps {
  order: Order
  orderLines: OrderDetail[]
  companyInfo?: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
}

/**
 * Order PDF Document Component
 *
 * Genera el documento PDF completo de la orden de compra
 */
export const OrderPdfTemplate = ({
  order,
  orderLines,
  companyInfo = {
    name: 'Your Company Name',
    address: '123 Business St, City, ST 12345',
    phone: '(555) 123-4567',
    email: 'orders@company.com',
  },
}: OrderPdfTemplateProps) => {
  // Calcular totales
  const subtotal = orderLines.reduce((sum, line) => sum + line.baseamount, 0)
  const totalDiscount = orderLines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )
  const totalTax = orderLines.reduce((sum, line) => sum + (line.tax || 0), 0)
  const total = order.totalamount

  // Formatear estado
  const getStateLabel = (statecode: number) => {
    switch (statecode) {
      case 0:
        return 'Active'
      case 1:
        return 'Submitted'
      case 2:
        return 'Canceled'
      case 3:
        return 'Fulfilled'
      case 4:
        return 'Invoiced'
      default:
        return 'Unknown'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SALES ORDER</Text>
          {order.ordernumber && (
            <Text style={styles.ordernumber}>
              Order #{order.ordernumber}
            </Text>
          )}
          <Text style={styles.ordernumber}>{order.name}</Text>
          <Text style={styles.badge}>Status: {getStateLabel(order.statecode)}</Text>
        </View>

        {/* Company & Customer Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>{companyInfo.name}</Text>
              {companyInfo.address && (
                <Text style={styles.infoValue}>{companyInfo.address}</Text>
              )}
              {companyInfo.phone && (
                <Text style={styles.infoValue}>{companyInfo.phone}</Text>
              )}
              {companyInfo.email && (
                <Text style={styles.infoValue}>{companyInfo.email}</Text>
              )}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>To</Text>
              <Text style={styles.infoValue}>
                {order.customeridtype === 'account' ? 'Company' : 'Contact'}
              </Text>
              <Text style={styles.infoValue}>Customer ID: {order.customerid}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdon).toLocaleDateString()}
              </Text>
            </View>
            {order.submitdate && (
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Submit Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.submitdate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {order.requestdeliveryby && (
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Requested Delivery</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.requestdeliveryby).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Shipping Information */}
        {order.shipto_name && (
          <View style={styles.shippingSection}>
            <Text style={styles.shippingTitle}>Shipping Address</Text>
            <Text style={styles.shippingText}>{order.shipto_name}</Text>
            {order.shipto_line1 && (
              <Text style={styles.shippingText}>{order.shipto_line1}</Text>
            )}
            {order.shipto_line2 && (
              <Text style={styles.shippingText}>{order.shipto_line2}</Text>
            )}
            <Text style={styles.shippingText}>
              {order.shipto_city && `${order.shipto_city}, `}
              {order.shipto_stateorprovince} {order.shipto_postalcode}
            </Text>
            {order.shipto_country && (
              <Text style={styles.shippingText}>{order.shipto_country}</Text>
            )}
          </View>
        )}

        {/* Description */}
        {order.description && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{order.description}</Text>
          </View>
        )}

        {/* Order Lines Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Order Items</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>
              Product/Service
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>Discount</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>
              Line Total
            </Text>
          </View>

          {/* Table Rows */}
          {orderLines.map((line, index) => (
            <View key={line.salesorderdetailid} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {line.productdescription || 'Product'}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {line.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                {formatCurrency(line.priceperunit)}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {formatCurrency(line.manualdiscountamount || 0)}
              </Text>
              <Text style={[styles.tableCell, styles.col6]}>
                {formatCurrency(line.extendedamount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>
                  -{formatCurrency(totalDiscount)}
                </Text>
              </View>
            )}
            {totalTax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(totalTax)}
                </Text>
              </View>
            )}
            {order.freightamount && order.freightamount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(order.freightamount)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for your business! This order was created on{' '}
            {new Date(order.createdon).toLocaleDateString()}
          </Text>
          {order.requestdeliveryby && (
            <Text>
              Requested delivery date:{' '}
              {new Date(order.requestdeliveryby).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
