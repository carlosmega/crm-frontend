/**
 * Product Service - Switcher
 *
 * Selects between backend and mock implementation based on feature flags
 */

import { featureFlags } from '@/core/config/api.config'
import { productServiceBackend } from './product-service-backend'
import { productServiceMock } from './product-service-mock'

/**
 * Product Service
 *
 * - Backend: Django REST API via axios
 * - Mock: In-memory mock data
 *
 * Switched via NEXT_PUBLIC_USE_BACKEND_API env variable
 */
export const productService = featureFlags.useBackendAPI
  ? productServiceBackend
  : productServiceMock
