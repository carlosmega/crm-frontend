/**
 * Opportunity Service - Main Entry Point
 *
 * Este archivo actúa como switcher entre el servicio backend (Django) y el servicio mock (memoria)
 * según la configuración de feature flags.
 *
 * Por defecto usa el BACKEND (NEXT_PUBLIC_USE_BACKEND_API=true)
 * Para desarrollo offline, cambiar a false en .env.local
 */

import { featureFlags } from '@/core/config/api.config'
import { opportunityServiceBackend } from './opportunity-service-backend'
import { opportunityServiceMock } from './opportunity-service-mock'

/**
 * Servicio de opportunities principal
 *
 * - Backend mode (default): Llama a Django REST API
 * - Mock mode: Usa memoria para desarrollo offline
 *
 * Los hooks y componentes siempre importan de este archivo,
 * por lo que el cambio entre backend/mock es transparente.
 */
export const opportunityService = featureFlags.useBackendAPI
  ? opportunityServiceBackend
  : opportunityServiceMock
