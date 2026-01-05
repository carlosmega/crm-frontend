/**
 * Invoice PDF Template
 *
 * Template para generar PDFs de facturas usando @react-pdf/renderer
 * Este componente define el layout y estilo del documento PDF de factura
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Invoice } from '@/core/contracts/entities/invoice'
import type { InvoiceDetail } from '@/core/contracts/entities/invoice-detail'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'

// Estilos del PDF (adaptados para facturas)
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
    borderBottomColor: '#dc2626', // Rojo para invoices
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  invoicenumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fee2e2',
    color: '#991b1b',
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
  // Payment info highlight
  paymentInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderLeft: 4,
    borderLeftColor: '#dc2626',
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 11,
    color: '#475569',
  },
  paymentValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
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
    borderTopColor: '#dc2626',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991b1b',
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

interface InvoicePdfTemplateProps {
  invoice: Invoice
  invoiceLines: InvoiceDetail[]
  companyInfo?: {
    name: string
    address?: string
    phone?: string
    email?: string
    taxId?: string
  }
}

/**
 * Invoice PDF Document Component
 *
 * Genera el documento PDF completo de la factura
 */
export const InvoicePdfTemplate = ({
  invoice,
  invoiceLines,
  companyInfo = {
    name: 'Your Company Name',
    address: '123 Business St, City, ST 12345',
    phone: '(555) 123-4567',
    email: 'billing@company.com',
    taxId: 'TAX-123456',
  },
}: InvoicePdfTemplateProps) => {
  // Calcular totales
  const subtotal = invoiceLines.reduce((sum, line) => sum + line.baseamount, 0)
  const totalDiscount = invoiceLines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )
  const totalTax = invoiceLines.reduce((sum, line) => sum + (line.tax || 0), 0)
  const total = invoice.totalamount
  const balance = invoice.totalbalance || total
  const paid = invoice.totalpaid || 0

  // Formatear estado
  const getStateLabel = (statecode: number) => {
    switch (statecode) {
      case 0:
        return 'Active - Payment Due'
      case 2:
        return 'Paid'
      case 3:
        return 'Canceled'
      default:
        return 'Unknown'
    }
  }

  // Calcular si está vencida
  const isOverdue = new Date(invoice.duedate) < new Date() && invoice.statecode === 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          {invoice.invoicenumber && (
            <Text style={styles.invoicenumber}>
              Invoice #{invoice.invoicenumber}
            </Text>
          )}
          <Text style={styles.invoicenumber}>{invoice.name}</Text>
          <Text style={styles.badge}>
            {isOverdue ? 'OVERDUE' : getStateLabel(invoice.statecode)}
          </Text>
        </View>

        {/* Company & Customer Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Invoice Information</Text>
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
              {companyInfo.taxId && (
                <Text style={styles.infoValue}>Tax ID: {companyInfo.taxId}</Text>
              )}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Bill To</Text>
              {invoice.billto_name ? (
                <>
                  <Text style={styles.infoValue}>{invoice.billto_name}</Text>
                  {invoice.billto_line1 && (
                    <Text style={styles.infoValue}>{invoice.billto_line1}</Text>
                  )}
                  <Text style={styles.infoValue}>
                    {invoice.billto_city && `${invoice.billto_city}, `}
                    {invoice.billto_stateorprovince} {invoice.billto_postalcode}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.infoValue}>
                    {invoice.customeridtype === 'account' ? 'Company' : 'Contact'}
                  </Text>
                  <Text style={styles.infoValue}>Customer ID: {invoice.customerid}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Invoice Date</Text>
              <Text style={styles.infoValue}>
                {new Date(invoice.createdon).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={[styles.infoValue, isOverdue && { color: '#dc2626' }]}>
                {new Date(invoice.duedate).toLocaleDateString()}
                {isOverdue && ' (OVERDUE)'}
              </Text>
            </View>
            {invoice.datedelivered && (
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Delivered</Text>
                <Text style={styles.infoValue}>
                  {new Date(invoice.datedelivered).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Amount:</Text>
            <Text style={styles.paymentValue}>{formatCurrency(total)}</Text>
          </View>
          {paid > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount Paid:</Text>
              <Text style={styles.paymentValue}>-{formatCurrency(paid)}</Text>
            </View>
          )}
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { fontWeight: 'bold' }]}>
              Balance Due:
            </Text>
            <Text style={[styles.paymentValue, { fontSize: 13, color: '#dc2626' }]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {invoice.description && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{invoice.description}</Text>
          </View>
        )}

        {/* Invoice Lines Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Items</Text>

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
          {invoiceLines.map((line, index) => (
            <View key={line.invoicedetailid} style={styles.tableRow}>
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
            {invoice.freightamount && invoice.freightamount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.freightamount)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL DUE</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Payment is due by {new Date(invoice.duedate).toLocaleDateString()}
          </Text>
          <Text>Thank you for your business!</Text>
          {companyInfo.email && (
            <Text>Questions? Contact us at {companyInfo.email}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
