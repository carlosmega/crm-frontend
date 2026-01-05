/**
 * Quote PDF Template
 *
 * Template para generar PDFs de quotes usando @react-pdf/renderer
 * Este componente define el layout y estilo del documento PDF
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Quote } from '@/core/contracts/entities/quote'
import type { QuoteDetail } from '@/core/contracts/entities/quote-detail'
import { formatCurrency } from '../utils/quote-calculations'

// Registrar fuentes (opcional - usa fuentes por defecto si no se registran)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
// })

// Estilos del PDF
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
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  quotenumber: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
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
    borderTopColor: '#2563eb',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
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

interface QuotePdfTemplateProps {
  quote: Quote
  quoteLines: QuoteDetail[]
  companyInfo?: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
}

/**
 * Quote PDF Document Component
 *
 * Genera el documento PDF completo del quote
 */
export const QuotePdfTemplate = ({
  quote,
  quoteLines,
  companyInfo = {
    name: 'Your Company Name',
    address: '123 Business St, City, ST 12345',
    phone: '(555) 123-4567',
    email: 'sales@company.com',
  },
}: QuotePdfTemplateProps) => {
  // Calcular totales
  const subtotal = quoteLines.reduce((sum, line) => sum + line.baseamount, 0)
  const totalDiscount = quoteLines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )
  const totalTax = quoteLines.reduce((sum, line) => sum + (line.tax || 0), 0)
  const total = quote.totalamount

  // Formatear estado
  const getStateLabel = (statecode: number) => {
    switch (statecode) {
      case 0:
        return 'Draft'
      case 1:
        return 'Active'
      case 2:
        return 'Won'
      case 3:
        return 'Closed'
      default:
        return 'Unknown'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{quote.name}</Text>
          {quote.quotenumber && (
            <Text style={styles.quotenumber}>
              Quote #{quote.quotenumber}
            </Text>
          )}
          <Text style={styles.badge}>Status: {getStateLabel(quote.statecode)}</Text>
        </View>

        {/* Company & Customer Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Quote Information</Text>
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
                {quote.customeridtype === 'account' ? 'Company' : 'Contact'}
              </Text>
              <Text style={styles.infoValue}>Customer ID: {quote.customerid}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Valid From</Text>
              <Text style={styles.infoValue}>
                {new Date(quote.effectivefrom).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Valid Until</Text>
              <Text style={styles.infoValue}>
                {new Date(quote.effectiveto).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Created On</Text>
              <Text style={styles.infoValue}>
                {new Date(quote.createdon).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {quote.description && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{quote.description}</Text>
          </View>
        )}

        {/* Products Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Products & Services</Text>

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
          {quoteLines.map((line, index) => (
            <View key={line.quotedetailid} style={styles.tableRow}>
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
            {quote.freightamount && quote.freightamount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(quote.freightamount)}
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
            This quote is valid from{' '}
            {new Date(quote.effectivefrom).toLocaleDateString()} to{' '}
            {new Date(quote.effectiveto).toLocaleDateString()}
          </Text>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  )
}
