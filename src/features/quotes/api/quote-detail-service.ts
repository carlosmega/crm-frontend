/**
 * Quote Detail Service - Main Entry Point
 *
 * Este archivo actúa como switcher entre el servicio backend (Django) y el servicio mock (localStorage)
 * según la configuración de feature flags.
 *
 * Por defecto usa el BACKEND (NEXT_PUBLIC_USE_BACKEND_API=true)
 * Para desarrollo offline, cambiar a false en .env.local
 */

import { featureFlags } from '@/core/config/api.config'
import { quoteDetailServiceBackend } from './quote-detail-service-backend'
import { quoteDetailServiceMock } from './quote-detail-service-mock'

/**
 * Servicio de quote details principal
 *
 * - Backend mode (default): Llama a Django REST API
 * - Mock mode: Usa localStorage para desarrollo offline
 *
 * Los hooks y componentes siempre importan de este archivo,
 * por lo que el cambio entre backend/mock es transparente.
 */
export const quoteDetailService = featureFlags.useBackendAPI
  ? quoteDetailServiceBackend
  : quoteDetailServiceMock
