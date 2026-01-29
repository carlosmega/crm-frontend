"use client"

import { useState, useCallback } from 'react'
import {
  lookupPostalCode,
  isValidMexicanPostalCode,
  type PostalCodeInfo,
} from '@/shared/services/postal-code-service'

interface UsePostalCodeLookupOptions {
  /** Callback cuando se obtiene información del código postal */
  onSuccess?: (data: PostalCodeInfo[]) => void
  /** Callback cuando hay un error */
  onError?: (error: string) => void
  /** Delay en ms antes de consultar (para evitar muchas requests mientras se escribe) */
  debounceMs?: number
}

interface UsePostalCodeLookupReturn {
  /** Lista de colonias/asentamientos disponibles para el código postal */
  colonias: PostalCodeInfo[]
  /** Indica si está cargando */
  isLoading: boolean
  /** Mensaje de error si hay alguno */
  error: string | null
  /** Consulta un código postal */
  lookup: (postalCode: string) => Promise<void>
  /** Limpia los resultados */
  clear: () => void
  /** Selecciona una colonia y devuelve los datos para rellenar el formulario */
  selectColonia: (colonia: PostalCodeInfo) => {
    line2: string // Colonia va en line2
    city: string
    state: string
    country: string
  }
}

/**
 * Hook para consultar códigos postales de México
 *
 * @example
 * ```tsx
 * const { colonias, isLoading, lookup, selectColonia } = usePostalCodeLookup({
 *   onSuccess: (data) => console.log('Found:', data.length, 'colonias')
 * })
 *
 * // Cuando el usuario ingresa un código postal
 * const handlePostalCodeChange = (value: string) => {
 *   if (value.length === 5) {
 *     lookup(value)
 *   }
 * }
 *
 * // Cuando el usuario selecciona una colonia
 * const handleSelectColonia = (colonia: PostalCodeInfo) => {
 *   const addressData = selectColonia(colonia)
 *   form.setValue('address1_line2', addressData.line2)
 *   form.setValue('address1_city', addressData.city)
 *   form.setValue('address1_stateorprovince', addressData.state)
 *   form.setValue('address1_country', addressData.country)
 * }
 * ```
 */
export function usePostalCodeLookup(
  options: UsePostalCodeLookupOptions = {}
): UsePostalCodeLookupReturn {
  const { onSuccess, onError } = options

  const [colonias, setColonias] = useState<PostalCodeInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = useCallback(async (postalCode: string) => {
    // Validar formato antes de consultar
    if (!isValidMexicanPostalCode(postalCode)) {
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await lookupPostalCode(postalCode)

    setIsLoading(false)

    if (result.success) {
      setColonias(result.data)
      onSuccess?.(result.data)
    } else {
      setColonias([])
      setError(result.error || 'Error desconocido')
      onError?.(result.error || 'Error desconocido')
    }
  }, [onSuccess, onError])

  const clear = useCallback(() => {
    setColonias([])
    setError(null)
  }, [])

  const selectColonia = useCallback((colonia: PostalCodeInfo) => {
    return {
      line2: colonia.asentamiento, // Colonia/asentamiento va en line2
      city: colonia.ciudad || colonia.asentamiento, // Si no hay ciudad, usar la colonia
      state: colonia.estado,
      country: colonia.pais,
    }
  }, [])

  return {
    colonias,
    isLoading,
    error,
    lookup,
    clear,
    selectColonia,
  }
}
