/**
 * Toast Error Handler
 *
 * Utilidades para mostrar errores de API de forma amigable al usuario
 * usando el sistema de toasts (sonner)
 */

import { toast } from 'sonner'
import type { ApiErrorResponse } from '@/core/contracts/api/api-response'

/**
 * Muestra un toast de error con el mensaje de la API
 *
 * Si hay errores de validación por campo, muestra toasts adicionales
 *
 * @param error - Error de API en formato ApiErrorResponse
 */
export function showErrorToast(error: ApiErrorResponse): void {
  const { code, message, details } = error.error

  // Mostrar mensaje principal de error
  toast.error(message || 'Ha ocurrido un error')

  // Si hay errores de validación por campo, mostrarlos
  if (details && typeof details === 'object') {
    Object.entries(details).forEach(([field, errors]) => {
      if (Array.isArray(errors)) {
        errors.forEach((err) => {
          // Formatear nombre de campo (ej: emailaddress1 → Email)
          const fieldName = formatFieldName(field)
          toast.error(`${fieldName}: ${err}`)
        })
      }
    })
  }
}

/**
 * Wrapper genérico para manejar errores de operaciones async
 *
 * Ejecuta una operación y captura errores mostrando toast automáticamente
 *
 * @param operation - Función async a ejecutar
 * @param errorMessage - Mensaje de error personalizado (opcional)
 * @returns Resultado de la operación o null si hubo error
 *
 * @example
 * ```typescript
 * const contact = await handleApiError(
 *   () => contactService.create(data),
 *   'Error al crear contacto'
 * )
 *
 * if (contact) {
 *   toast.success('Contacto creado exitosamente')
 * }
 * ```
 */
export async function handleApiError<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const apiError = error as ApiErrorResponse

    if (errorMessage) {
      // Usar mensaje personalizado si se proporciona
      toast.error(errorMessage)
    } else {
      // Usar mensaje del error de API
      showErrorToast(apiError)
    }

    return null
  }
}

/**
 * Formatea nombres de campos CDS a nombres legibles en español
 *
 * @param field - Nombre del campo CDS
 * @returns Nombre formateado
 *
 * @example
 * formatFieldName('emailaddress1') // → 'Email'
 * formatFieldName('firstname') // → 'Nombre'
 * formatFieldName('parentcustomerid') // → 'Cuenta'
 */
function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    emailaddress1: 'Email',
    emailaddress2: 'Email alternativo',
    emailaddress3: 'Email adicional',
    firstname: 'Nombre',
    lastname: 'Apellido',
    telephone1: 'Teléfono',
    telephone2: 'Teléfono alternativo',
    mobilephone: 'Teléfono móvil',
    jobtitle: 'Cargo',
    parentcustomerid: 'Cuenta',
    address1_line1: 'Dirección',
    address1_city: 'Ciudad',
    address1_stateorprovince: 'Estado/Provincia',
    address1_postalcode: 'Código postal',
    address1_country: 'País',
    companyname: 'Empresa',
    websiteurl: 'Sitio web',
    name: 'Nombre',
    subject: 'Asunto',
    estimatedvalue: 'Valor estimado',
    estimatedclosedate: 'Fecha estimada de cierre',
    actualrevenue: 'Ingresos reales',
    actualclosedate: 'Fecha real de cierre',
    closeprobability: 'Probabilidad de cierre',
    description: 'Descripción',
  }

  return fieldMap[field] || formatCamelCase(field)
}

/**
 * Convierte camelCase a texto legible
 *
 * @param text - Texto en camelCase
 * @returns Texto formateado
 *
 * @example
 * formatCamelCase('firstName') // → 'First Name'
 */
function formatCamelCase(text: string): string {
  return (
    text
      // Insertar espacio antes de mayúsculas
      .replace(/([A-Z])/g, ' $1')
      // Capitalizar primera letra
      .replace(/^./, (str) => str.toUpperCase())
      // Limpiar espacios extras
      .trim()
  )
}
