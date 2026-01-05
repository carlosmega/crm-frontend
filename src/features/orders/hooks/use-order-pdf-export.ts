/**
 * Order PDF Export Hook
 *
 * Hook para exportar sales orders a PDF
 */

import { useState } from 'react'
import { toast } from 'sonner'

interface UseOrderPdfExportOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook para exportar order a PDF
 *
 * @example
 * ```tsx
 * const { exportToPdf, isExporting } = useOrderPdfExport()
 *
 * <Button onClick={() => exportToPdf(orderId)} disabled={isExporting}>
 *   {isExporting ? 'Generating...' : 'Export PDF'}
 * </Button>
 * ```
 */
export function useOrderPdfExport(options?: UseOrderPdfExportOptions) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPdf = async (orderId: string) => {
    try {
      setIsExporting(true)

      // Llamar al API endpoint
      const response = await fetch(`/api/orders/${orderId}/pdf`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Log del error para debugging
        console.log('PDF Export Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })

        // Mensaje específico para orden sin productos
        if (errorData.error?.includes('no line items')) {
          throw new Error(
            'No se puede generar el PDF porque esta orden no tiene productos. Por favor agrega productos a la orden primero.'
          )
        }

        // Mensaje específico para otros errores comunes
        if (response.status === 404) {
          throw new Error('Orden no encontrada.')
        }

        if (response.status === 500) {
          throw new Error(
            'Error del servidor al generar el PDF. Por favor intenta nuevamente.'
          )
        }

        throw new Error(
          errorData.error || errorData.message || `Failed to generate PDF: ${response.statusText}`
        )
      }

      // Obtener el blob del PDF
      const blob = await response.blob()

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Order-${orderId}-${new Date().toISOString().split('T')[0]}.pdf`

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
        description: `Order exported as ${filename}`,
      })

      options?.onSuccess?.()
    } catch (error) {
      console.error('Error exporting order to PDF:', error)
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

  return {
    exportToPdf,
    isExporting,
  }
}
