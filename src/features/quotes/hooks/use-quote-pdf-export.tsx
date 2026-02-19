/**
 * Quote PDF Export Hook
 *
 * Hook para exportar quotes a PDF
 * Soporta dos modos:
 * 1. Backend mode: Llama al API route /api/quotes/[id]/pdf
 * 2. Mock mode: Genera PDF en cliente con datos de localStorage
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { QuotePdfTemplate } from '../components/quote-pdf-template'
import { quoteService } from '../api/quote-service'
import { quoteDetailService } from '../api/quote-detail-service'
import { featureFlags } from '@/core/config/api.config'

interface UseQuotePdfExportOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook para exportar quote a PDF
 *
 * @example
 * ```tsx
 * const { exportToPdf, isExporting } = useQuotePdfExport()
 *
 * <Button onClick={() => exportToPdf(quoteId)} disabled={isExporting}>
 *   {isExporting ? 'Generating...' : 'Export PDF'}
 * </Button>
 * ```
 */
export function useQuotePdfExport(options?: UseQuotePdfExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPdf = async (quoteId: string) => {
    try {
      setIsExporting(true)

      // En modo mock, generar PDF en cliente
      // En modo backend, usar API route
      if (!featureFlags.useBackendAPI) {
        await exportToPdfClient(quoteId)
      } else {
        await exportToPdfServer(quoteId)
      }

      options?.onSuccess?.()
    } catch (error) {
      console.error('Error exporting quote to PDF:', error)
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
   * Genera PDF en el servidor usando API route
   * Pasa datos via POST para evitar problemas de autenticacion en API routes
   */
  const exportToPdfServer = async (quoteId: string) => {
    const quote = await quoteService.getById(quoteId)
    if (!quote) throw new Error('Quote not found')

    const quoteLines = await quoteDetailService.getByQuote(quoteId)

    const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, quoteLines }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to generate PDF: ${response.statusText}`
      )
    }

    const blob = await response.blob()

    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `Quote-${quoteId}-${new Date().toISOString().split('T')[0]}.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    downloadBlob(blob, filename)

    toast.success('PDF exported successfully', {
      description: `Quote exported as ${filename}`,
    })
  }

  /**
   * Genera PDF en el cliente usando @react-pdf/renderer
   */
  const exportToPdfClient = async (quoteId: string) => {
    // Obtener quote y sus líneas desde el servicio
    const quote = await quoteService.getById(quoteId)
    if (!quote) {
      throw new Error('Quote not found')
    }

    const quoteLines = await quoteDetailService.getByQuote(quoteId)
    if (quoteLines.length === 0) {
      throw new Error('Quote has no line items. Cannot generate PDF.')
    }

    // Generar PDF en cliente
    const pdfDocument = (
      <QuotePdfTemplate
        quote={quote}
        quoteLines={quoteLines}
        companyInfo={{
          name: 'Your Company Name',
          address: '123 Business St, City, ST 12345',
          phone: '(555) 123-4567',
          email: 'sales@company.com',
        }}
      />
    )

    const blob = await pdf(pdfDocument).toBlob()
    const filename = `Quote-${quote.quotenumber || quoteId}-${new Date().toISOString().split('T')[0]}.pdf`

    downloadBlob(blob, filename)

    toast.success('PDF exported successfully', {
      description: `Quote exported as ${filename}`,
    })
  }

  /**
   * Descarga un blob como archivo
   */
  const downloadBlob = (blob: Blob, filename: string) => {
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
  }

  /**
   * Genera PDF como Blob sin descargar (para adjuntar a emails)
   */
  const generatePdfBlob = async (quoteId: string): Promise<Blob> => {
    const quote = await quoteService.getById(quoteId)
    if (!quote) throw new Error('Quote not found')

    const quoteLines = await quoteDetailService.getByQuote(quoteId)
    if (quoteLines.length === 0) throw new Error('Quote has no line items.')

    if (!featureFlags.useBackendAPI) {
      const pdfDocument = (
        <QuotePdfTemplate
          quote={quote}
          quoteLines={quoteLines}
          companyInfo={{
            name: 'Your Company Name',
            address: '123 Business St, City, ST 12345',
            phone: '(555) 123-4567',
            email: 'sales@company.com',
          }}
        />
      )

      return await pdf(pdfDocument).toBlob()
    } else {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote, quoteLines }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate PDF: ${response.statusText}`)
      }
      return await response.blob()
    }
  }

  return {
    exportToPdf,
    generatePdfBlob,
    isExporting,
  }
}
