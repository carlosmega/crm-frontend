/**
 * Quote Template Service - Main Entry Point
 *
 * Este archivo actúa como switcher entre el servicio backend (Django) y el servicio mock (localStorage)
 * según la configuración de feature flags.
 *
 * Por defecto usa MOCK (NEXT_PUBLIC_USE_BACKEND_API=false)
 * Para conectar al backend Django, cambiar a true en .env.local
 */

import { featureFlags } from '@/core/config/api.config'
import { quoteTemplateServiceBackend } from './quote-template-service-backend'
import { quoteTemplateServiceMock } from './quote-template-service-mock'

/**
 * Servicio de quote templates principal
 *
 * - Backend mode: Llama a Django REST API (/api/quote-templates/)
 * - Mock mode (default): Usa localStorage para desarrollo offline
 *
 * Los hooks y componentes siempre importan de este archivo,
 * por lo que el cambio entre backend/mock es transparente.
 */
export const quoteTemplateService = featureFlags.useBackendAPI
  ? quoteTemplateServiceBackend
  : quoteTemplateServiceMock
