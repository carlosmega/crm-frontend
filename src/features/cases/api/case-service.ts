/**
 * Case Service - Main Entry Point
 *
 * Switcher between backend (Django) and mock (localStorage) services
 * based on feature flag configuration.
 *
 * By default uses BACKEND (NEXT_PUBLIC_USE_BACKEND_API=true)
 * For offline development, set to false in .env.local
 */

import { featureFlags } from '@/core/config/api.config'
import { caseServiceBackend } from './case-service-backend'
import { caseServiceMock } from './case-service-mock'

/**
 * Case service instance
 *
 * - Backend mode (default): Calls Django REST API
 * - Mock mode: Uses localStorage for offline development
 *
 * Hooks and components always import from this file,
 * making the backend/mock switch transparent.
 */
export const caseService = featureFlags.useBackendAPI
  ? caseServiceBackend
  : caseServiceMock
