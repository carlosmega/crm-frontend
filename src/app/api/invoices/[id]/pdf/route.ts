/**
 * Invoice PDF Export API Route
 *
 * GET /api/invoices/[id]/pdf
 *
 * Genera y devuelve un PDF de la factura especificada
 */

import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { InvoicePdfTemplate } from '@/features/invoices/components/invoice-pdf-template'
import { invoiceService } from '@/features/invoices/api/invoice-service'
import { invoiceDetailService } from '@/features/invoices/api/invoice-detail-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/invoices/[id]/pdf
 *
 * Genera PDF de la factura
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Validar ID
    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Obtener invoice y sus líneas en paralelo
    const [invoice, invoiceLines] = await Promise.all([
      invoiceService.getById(id),
      invoiceDetailService.getByInvoice(id),
    ])

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Validar que la factura tenga líneas
    if (invoiceLines.length === 0) {
      return NextResponse.json(
        { error: 'Invoice has no line items. Cannot generate PDF.' },
        { status: 400 }
      )
    }

    // Generar PDF usando el template
    const pdfStream = await renderToStream(
      createElement(InvoicePdfTemplate, {
        invoice,
        invoiceLines,
        companyInfo: {
          name: 'Your Company Name',
          address: '123 Business St, City, ST 12345',
          phone: '(555) 123-4567',
          email: 'billing@company.com',
          taxId: 'TAX-123456789',
        },
      }) as any
    )

    // Convertir stream a buffer
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Generar nombre de archivo
    const filename = `Invoice-${invoice.invoicenumber || id}-${new Date().toISOString().split('T')[0]}.pdf`

    // Devolver PDF con headers apropiados
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
