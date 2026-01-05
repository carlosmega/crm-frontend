/**
 * Mock API Delay Utility
 *
 * Simulates network delay only in production or when explicitly enabled
 * In development, returns immediately for faster DX
 */

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const ENABLE_MOCK_DELAY = process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === 'true'

/**
 * Simulates network delay
 * - Development: NO delay (instant response)
 * - Production: Adds realistic delay
 * - Can be forced with NEXT_PUBLIC_ENABLE_MOCK_DELAY=true env var
 */
export const mockDelay = async (ms: number = 0): Promise<void> => {
  // ✅ OPTIMIZACIÓN: NO delays en ningún ambiente para testing
  // En producción real usarás API real, no mocks
  return Promise.resolve()

  // CÓDIGO ORIGINAL COMENTADO (descomentar si necesitas delays)
  // if (IS_DEVELOPMENT && !ENABLE_MOCK_DELAY) {
  //   return Promise.resolve()
  // }
  // return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Predefined delays for common operations
 */
export const MOCK_DELAYS = {
  /** Quick read operations (getAll, getById) */
  READ: 100,

  /** Create/Update operations */
  WRITE: 200,

  /** Complex operations (qualify lead, create quote) */
  COMPLEX: 300,

  /** Search operations */
  SEARCH: 150,
} as const
