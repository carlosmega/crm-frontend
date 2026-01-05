import { useEffect, useState } from 'react'

/**
 * Hook para debouncing de valores
 * Retrasa la actualización del valor hasta que el usuario deja de escribir
 *
 * @param value - Valor a debounce
 * @param delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns Valor debounced
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebouncedValue(search, 300)
 *
 * // El filtrado solo se ejecuta 300ms después de que el usuario deja de escribir
 * const filtered = useMemo(() =>
 *   items.filter(item => item.name.includes(debouncedSearch)),
 *   [items, debouncedSearch]
 * )
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Crear timer que actualiza el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timer si el valor cambia antes de que se cumpla el delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
