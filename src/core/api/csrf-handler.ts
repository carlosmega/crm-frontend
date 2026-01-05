/**
 * CSRF Token Handler
 *
 * Manejo de tokens CSRF para protección contra Cross-Site Request Forgery
 * Django envía el token como cookie 'csrftoken' y espera recibirlo en el header 'X-CSRFToken'
 */

/**
 * Extrae el token CSRF de las cookies del navegador
 *
 * @returns Token CSRF o null si no existe
 */
export function getCsrfToken(): string | null {
  // Verificación de seguridad para SSR (Next.js)
  if (typeof document === 'undefined') return null

  const name = 'csrftoken'
  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(value)
    }
  }

  return null
}

/**
 * Determina si un método HTTP requiere token CSRF
 *
 * Django requiere CSRF en métodos de mutación: POST, PUT, PATCH, DELETE
 *
 * @param method - Método HTTP (puede ser undefined en algunos casos)
 * @returns true si el método requiere CSRF token
 */
export function shouldIncludeCsrfToken(method?: string): boolean {
  if (!method) return false

  const upperMethod = method.toUpperCase()
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)
}
