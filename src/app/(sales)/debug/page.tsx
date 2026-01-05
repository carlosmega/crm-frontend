"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { leadService } from '@/features/leads/api/lead-service'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

function DebugContent() {
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<'idle' | 'testing' | 'complete'>('idle')
  const [browserInfo, setBrowserInfo] = useState({
    userAgent: 'Loading...',
    memory: 'N/A',
    cores: 'N/A',
    connection: 'N/A'
  })

  useEffect(() => {
    // Cargar info del navegador solo en el cliente
    setBrowserInfo({
      userAgent: navigator.userAgent,
      memory: (navigator as any).deviceMemory || 'N/A',
      cores: navigator.hardwareConcurrency?.toString() || 'N/A',
      connection: (navigator as any).connection?.effectiveType || 'N/A'
    })
  }, [])

  const runTests = async () => {
    setStatus('testing')
    const results: Record<string, number> = {}

    // Test 1: Lead Service Read
    const t1 = performance.now()
    await leadService.getAll()
    results['Lead Service getAll()'] = performance.now() - t1

    // Test 2: Client-side filtering
    const t2 = performance.now()
    const leads = await leadService.getAll()
    leads.filter(l => l.firstname.toLowerCase().includes('test'))
    results['Client Filter (mock)'] = performance.now() - t2

    // Test 3: LocalStorage read
    const t3 = performance.now()
    localStorage.getItem('crm_leads')
    results['LocalStorage read'] = performance.now() - t3

    // Test 4: Component render simulation
    const t4 = performance.now()
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    results['Array creation (100 items)'] = performance.now() - t4

    setMetrics(results)
    setStatus('complete')
  }

  const getStatusColor = (ms: number) => {
    if (ms < 10) return 'default'
    if (ms < 50) return 'secondary'
    if (ms < 200) return 'outline'
    return 'destructive'
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="text-3xl">⚡ Performance Diagnostic</CardTitle>
          <CardDescription>
            Esta página mide el rendimiento real de la aplicación en tu navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Button */}
          <div>
            <Button
              onClick={runTests}
              disabled={status === 'testing'}
              size="lg"
              className="w-full"
            >
              {status === 'testing' ? '⏳ Ejecutando tests...' : '🚀 Ejecutar Tests de Rendimiento'}
            </Button>
          </div>

          {/* Results */}
          {status !== 'idle' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados:</h3>
              {Object.entries(metrics).map(([test, time]) => (
                <div key={test} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">{test}</span>
                  <Badge variant={getStatusColor(time)}>
                    {time.toFixed(2)} ms
                  </Badge>
                </div>
              ))}

              {status === 'complete' && (
                <Card className="mt-6 bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Interpretación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong className="text-green-600">✅ &lt; 10ms:</strong> Excelente - Instantáneo</p>
                    <p><strong className="text-blue-600">ℹ️ 10-50ms:</strong> Bueno - Apenas perceptible</p>
                    <p><strong className="text-yellow-600">⚠️ 50-200ms:</strong> Aceptable - Ligeramente perceptible</p>
                    <p><strong className="text-red-600">🔴 &gt; 200ms:</strong> Problema - Causa lentitud notoria</p>

                    <div className="mt-4 p-4 bg-background rounded border-l-4 border-blue-500">
                      <p className="font-semibold">💡 Diagnóstico:</p>
                      {Object.values(metrics).some(t => t > 200) ? (
                        <p className="text-red-600">
                          Detectada operación lenta. Verifica tu conexión de red o intenta limpiar el cache del navegador (Ctrl+Shift+Delete).
                        </p>
                      ) : Object.values(metrics).every(t => t < 50) ? (
                        <p className="text-green-600">
                          ✅ Todas las operaciones son RÁPIDAS. Si sientes lentitud, puede ser:
                          <br />• Animaciones CSS lentas
                          <br />• Extensiones del navegador interfiriendo
                          <br />• GPU/Hardware del sistema
                        </p>
                      ) : (
                        <p className="text-yellow-600">
                          ⚠️ Rendimiento aceptable pero mejorable. Considera limpiar cache del navegador.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Browser Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>User Agent:</strong> {browserInfo.userAgent}</p>
              <p><strong>Memoria disponible:</strong> {browserInfo.memory} GB</p>
              <p><strong>Cores CPU:</strong> {browserInfo.cores}</p>
              <p><strong>Conexión:</strong> {browserInfo.connection}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
  )
}

export default function DebugPage() {
  return (
    <>
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Performance Debug</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <div className="container max-w-4xl py-8">
          <DebugContent />
        </div>
      </div>
    </>
  )
}
