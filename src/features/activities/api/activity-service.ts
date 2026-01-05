/**
 * Activity Service - Switcher
 *
 * Selects between backend and mock implementation based on feature flags
 */

import { featureFlags } from '@/core/config/api.config'
import { activityServiceBackend } from './activity-service-backend'
import { activityServiceMock } from './activity-service-mock'

/**
 * Activity Service
 *
 * - Backend: Django REST API via axios
 * - Mock: In-memory mock data with localStorage
 *
 * Switched via NEXT_PUBLIC_USE_BACKEND_API env variable
 *
 * Soporta todos los tipos: Email, PhoneCall, Task, Appointment, Meeting
 * Regarding polimórfico (Lead, Opportunity, Account, Contact)
 */
export const activityService = featureFlags.useBackendAPI
  ? activityServiceBackend
  : activityServiceMock
