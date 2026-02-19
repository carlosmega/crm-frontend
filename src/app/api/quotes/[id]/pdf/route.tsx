/**
 * Quote PDF Export API Route
 *
 * GET /api/quotes/[id]/pdf
 *
 * Genera y devuelve un PDF del quote especificado
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { QuotePdfTemplate } from '@/features/quotes/components/quote-pdf-template'
import { quoteService } from '@/features/quotes/api/quote-service'
import { quoteDetailService } from '@/features/quotes/api/quote-detail-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * Generate PDF from quote data
 */
async function generateQuotePdf(quote: any, quoteLines: any[], id: string) {
  if (!quoteLines || quoteLines.length === 0) {
    return NextResponse.json(
      { error: 'Quote has no line items. Cannot generate PDF.' },
      { status: 400 }
    )
  }

  const pdfStream = await renderToStream(
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

  const chunks: Buffer[] = []
  for await (const chunk of pdfStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const pdfBuffer = Buffer.concat(chunks)

  const filename = `Quote-${quote.quotenumber || id}-${new Date().toISOString().split('T')[0]}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  })
}

/**
 * GET /api/quotes/[id]/pdf
 *
 * Backend mode: Fetches data from services
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const quote = await quoteService.getById(id)
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    const quoteLines = await quoteDetailService.getByQuote(id)

    return generateQuotePdf(quote, quoteLines, id)
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/quotes/[id]/pdf
 *
 * Receives quote data in request body (works when backend auth isn't forwarded)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { quote, quoteLines } = body

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote data is required in request body' },
        { status: 400 }
      )
    }

    return generateQuotePdf(quote, quoteLines || [], id)
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
