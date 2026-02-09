/**
 * Order PDF Export API Route
 *
 * GET /api/orders/[id]/pdf - Backend mode (fetches data from services)
 * POST /api/orders/[id]/pdf - Mock mode (receives data in body)
 *
 * Genera y devuelve un PDF de la orden especificada.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { OrderPdfTemplate } from '@/features/orders/components/order-pdf-template'
import { orderService } from '@/features/orders/api/order-service'
import { orderDetailService } from '@/features/orders/api/order-detail-service'
import type { Order } from '@/core/contracts/entities/order'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * Generate PDF from order data
 */
async function generateOrderPdf(order: Order, orderLines: OrderDetail[], id: string) {
  // Validar que la orden tenga líneas
  if (!orderLines || orderLines.length === 0) {
    return NextResponse.json(
      { error: 'Order has no line items. Cannot generate PDF.' },
      { status: 400 }
    )
  }

  // Generar PDF usando el template
  const pdfStream = await renderToStream(
    createElement(OrderPdfTemplate, {
      order,
      orderLines,
      companyInfo: {
        name: 'Your Company Name',
        address: '123 Business St, City, ST 12345',
        phone: '(555) 123-4567',
        email: 'orders@company.com',
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
  const filename = `Order-${order.ordernumber || id}-${new Date().toISOString().split('T')[0]}.pdf`

  // Devolver PDF con headers apropiados
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
 * GET /api/orders/[id]/pdf
 *
 * Backend mode: Fetches data from services (works when backend is connected)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Obtener order y líneas en paralelo
    const [order, orderLines] = await Promise.all([
      orderService.getById(id),
      orderDetailService.getByOrder(id),
    ])

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return generateOrderPdf(order, orderLines, id)
  } catch (error) {
    console.error('Error generating order PDF:', error)
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
 * POST /api/orders/[id]/pdf
 *
 * Mock mode: Receives data in request body (works with localStorage mock)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Obtener datos del body
    const body = await request.json()
    const { order, orderLines } = body as { order: Order; orderLines: OrderDetail[] }

    if (!order) {
      return NextResponse.json(
        { error: 'Order data is required in request body' },
        { status: 400 }
      )
    }

    return generateOrderPdf(order, orderLines || [], id)
  } catch (error) {
    console.error('Error generating order PDF:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
