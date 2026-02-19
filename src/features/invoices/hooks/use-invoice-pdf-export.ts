/**
 * Invoice PDF Export Hook
 *
 * Hook para exportar facturas a PDF
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { invoiceService } from '../api/invoice-service'
import { invoiceDetailService } from '../api/invoice-detail-service'

interface UseInvoicePdfExportOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook para exportar invoice a PDF
 *
 * @example
 * ```tsx
 * const { exportToPdf, isExporting } = useInvoicePdfExport()
 *
 * <Button onClick={() => exportToPdf(invoiceId)} disabled={isExporting}>
 *   {isExporting ? 'Generating...' : 'Export PDF'}
 * </Button>
 * ```
 */
export function useInvoicePdfExport(options?: UseInvoicePdfExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPdf = async (invoiceId: string) => {
    try {
      setIsExporting(true)

      const invoice = await invoiceService.getById(invoiceId)
      if (!invoice) throw new Error('Invoice not found')

      const invoiceLines = await invoiceDetailService.getByInvoice(invoiceId)

      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, invoiceLines }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to generate PDF: ${response.statusText}`
        )
      }

      // Obtener el blob del PDF
      const blob = await response.blob()

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Invoice-${invoiceId}-${new Date().toISOString().split('T')[0]}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear elemento <a> temporal para descargar
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Limpiar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF exported successfully', {
        description: `Invoice exported as ${filename}`,
      })

      options?.onSuccess?.()
    } catch (error) {
      console.error('Error exporting invoice to PDF:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      toast.error('Failed to export PDF', {
        description: errorMessage,
      })

      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      )
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Genera PDF como Blob sin descargar (para adjuntar a emails)
   */
  const generatePdfBlob = async (invoiceId: string): Promise<Blob> => {
    const invoice = await invoiceService.getById(invoiceId)
    if (!invoice) throw new Error('Invoice not found')

    const invoiceLines = await invoiceDetailService.getByInvoice(invoiceId)

    const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, invoiceLines }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to generate PDF: ${response.statusText}`)
    }

    return await response.blob()
  }

  return {
    exportToPdf,
    generatePdfBlob,
    isExporting,
  }
}
