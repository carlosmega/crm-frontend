/**
 * Reset Storage Utility
 *
 * Limpia el localStorage para reinicializar todos los datos mock
 */

import { initializeMockQuoteVersions } from '@/features/quotes/data/mock-quote-versions'

export function resetAllStorage() {
  if (typeof window === 'undefined') return

  const keys = [
    'accounts',
    'contacts',
    'leads',
    'opportunities',
    'quotes',
    'orders',
    'invoices',
    'products',
    'crm_quote_versions',
    'crm_quote_templates',
  ]

  keys.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log('✅ Storage cleared! Refresh the page to reload mock data.')
}

// Initialize mock data on load
if (typeof window !== 'undefined') {
  initializeMockQuoteVersions()
}

export function resetUserSettings() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('crm-user-settings')
  console.log('✅ Settings cleared! Refresh the page to reload default settings.')
}

export function resetEverything() {
  if (typeof window === 'undefined') return

  resetAllStorage()
  resetUserSettings()
  console.log('✅ Everything cleared! Refresh the page.')
  window.location.reload()
}

// Agregar funciones globales para fácil acceso desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).resetCRM = resetAllStorage;
  (window as any).resetSettings = resetUserSettings;
  (window as any).resetEverything = resetEverything
}
