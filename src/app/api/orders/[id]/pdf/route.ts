/**
 * Order PDF Export API Route
 *
 * GET /api/orders/[id]/pdf
 *
 * Genera y devuelve un PDF de la orden especificada
 */

import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { OrderPdfTemplate } from '@/features/orders/components/order-pdf-template'
import { orderService } from '@/features/orders/api/order-service'
import { orderDetailService } from '@/features/orders/api/order-detail-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/orders/[id]/pdf
 *
 * Genera PDF de la orden
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Validar ID
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Obtener cookies de autenticación del request del usuario
    const cookies = request.headers.get('cookie') || ''

    // Obtener order y sus líneas pasando las cookies
    // Nota: La variable de entorno ya incluye /api al final
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const orderUrl = `${baseUrl}/orders/${id}`

    console.log('Fetching order from:', orderUrl)
    console.log('Cookies present:', cookies ? 'Yes' : 'No')

    const orderResponse = await fetch(orderUrl, {
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    console.log('Order response status:', orderResponse.status)

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}))
      console.log('Order fetch error:', errorData)
      return NextResponse.json(
        {
          error: errorData.error?.message || 'Failed to fetch order',
          details: errorData
        },
        { status: orderResponse.status }
      )
    }

    const orderData = await orderResponse.json()
    const order = orderData
    const orderLines = orderData.order_details || []

    // Validar que la orden tenga líneas
    if (orderLines.length === 0) {
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
        // TODO: Obtener company info desde configuración o base de datos
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
