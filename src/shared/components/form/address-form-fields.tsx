"use client"

import { useEffect, useState, useRef } from 'react'
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldGroup } from '@/shared/components/form'
import { usePostalCodeLookup } from '@/shared/hooks/use-postal-code-lookup'
import { Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressFieldNames {
  line1: string
  line2: string
  city: string
  stateOrProvince: string
  postalCode: string
  country: string
}

interface AddressFormFieldsProps<T extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<T>
  /** Nombres de los campos del formulario (para mapear a los campos de dirección) */
  fieldNames: AddressFieldNames
  /** Si es true, muestra la funcionalidad de autocompletado por código postal (solo México) */
  enablePostalCodeLookup?: boolean
}

/**
 * AddressFormFields - Campos de dirección con autocompletado para México
 *
 * Cuando el usuario ingresa un código postal mexicano de 5 dígitos,
 * consulta la API de COPOMEX y permite seleccionar la colonia.
 * Autocompleta: Colonia, Ciudad, Estado y País.
 *
 * @example
 * ```tsx
 * <AddressFormFields
 *   form={form}
 *   fieldNames={{
 *     line1: 'address1_line1',
 *     line2: 'address1_line2',
 *     city: 'address1_city',
 *     stateOrProvince: 'address1_stateorprovince',
 *     postalCode: 'address1_postalcode',
 *     country: 'address1_country',
 *   }}
 *   enablePostalCodeLookup
 * />
 * ```
 */
export function AddressFormFields<T extends FieldValues>({
  form,
  fieldNames,
  enablePostalCodeLookup = true,
}: AddressFormFieldsProps<T>) {
  const [showColoniaSelector, setShowColoniaSelector] = useState(false)
  const lastLookedUpCode = useRef<string>('')

  const { colonias, isLoading, error, lookup, clear, selectColonia } = usePostalCodeLookup({
    onSuccess: (data) => {
      // Precompletar estado y país (son iguales para todas las colonias del mismo CP)
      const first = data[0]
      form.setValue(fieldNames.stateOrProvince as Path<T>, first.estado as T[Path<T>])
      form.setValue(fieldNames.country as Path<T>, first.pais as T[Path<T>])

      if (data.length === 1) {
        // Si solo hay una colonia, autocompletar automáticamente
        const addressData = selectColonia(first)
        form.setValue(fieldNames.line2 as Path<T>, addressData.line2 as T[Path<T>])
        form.setValue(fieldNames.city as Path<T>, addressData.line2 as T[Path<T>]) // Usar colonia como ciudad
        setShowColoniaSelector(false)
      } else if (data.length > 1) {
        // Si hay múltiples colonias, mostrar selector
        setShowColoniaSelector(true)
        // Limpiar el campo de colonia para que el usuario seleccione
        form.setValue(fieldNames.line2 as Path<T>, '' as T[Path<T>])
        form.setValue(fieldNames.city as Path<T>, '' as T[Path<T>])
      }
    },
  })

  // Observar cambios en el código postal
  const postalCode = form.watch(fieldNames.postalCode as Path<T>)

  useEffect(() => {
    const code = typeof postalCode === 'string' ? postalCode : ''

    // Solo consultar si el código cambió y tiene 5 dígitos
    if (enablePostalCodeLookup && code.length === 5 && code !== lastLookedUpCode.current) {
      lastLookedUpCode.current = code
      lookup(code)
    } else if (code.length !== 5 && lastLookedUpCode.current !== '') {
      lastLookedUpCode.current = ''
      clear()
      setShowColoniaSelector(false)
    }
  }, [postalCode, enablePostalCodeLookup]) // Removidas lookup y clear de las dependencias

  const handleColoniaSelect = (coloniaName: string) => {
    const selected = colonias.find(c => c.asentamiento === coloniaName)
    if (selected) {
      const addressData = selectColonia(selected)
      form.setValue(fieldNames.line2 as Path<T>, addressData.line2 as T[Path<T>])
      form.setValue(fieldNames.city as Path<T>, addressData.city as T[Path<T>])
      form.setValue(fieldNames.stateOrProvince as Path<T>, addressData.state as T[Path<T>])
      form.setValue(fieldNames.country as Path<T>, addressData.country as T[Path<T>])
    }
  }

  return (
    <div className="space-y-4">
      {/* Address Line 1 */}
      <FormField
        control={form.control}
        name={fieldNames.line1 as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Calle y Número
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Av. Insurgentes Sur 1234"
                className="h-10"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Postal Code + Colonia Selector Row */}
      <FormFieldGroup columns={2}>
        <FormField
          control={form.control}
          name={fieldNames.postalCode as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Código Postal
                {enablePostalCodeLookup && (
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    (autocompletado MX)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="03100"
                    className={cn(
                      "h-10",
                      enablePostalCodeLookup && "pr-8"
                    )}
                    maxLength={5}
                    {...field}
                    value={field.value ?? ''}
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!isLoading && colonias.length > 0 && (
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </FormControl>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Colonia - Selector o Input */}
        <FormField
          control={form.control}
          name={fieldNames.line2 as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Colonia
                {showColoniaSelector && colonias.length > 1 && (
                  <span className="ml-1 text-xs text-blue-600 font-normal">
                    ({colonias.length} opciones)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                {showColoniaSelector && colonias.length > 1 ? (
                  <Select
                    value={field.value as string || ''}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleColoniaSelect(value)
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecciona colonia..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colonias.map((colonia) => (
                        <SelectItem
                          key={colonia.asentamiento}
                          value={colonia.asentamiento}
                        >
                          <span className="flex items-center gap-2">
                            <span>{colonia.asentamiento}</span>
                            <span className="text-xs text-muted-foreground">
                              ({colonia.tipoAsentamiento})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Del Valle Centro"
                    className="h-10"
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FormFieldGroup>

      {/* City + State Row */}
      <FormFieldGroup columns={2}>
        <FormField
          control={form.control}
          name={fieldNames.city as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Ciudad / Municipio
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Benito Juárez"
                  className="h-10"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={fieldNames.stateOrProvince as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Estado
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ciudad de México"
                  className="h-10"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FormFieldGroup>

      {/* Country */}
      <FormField
        control={form.control}
        name={fieldNames.country as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              País
            </FormLabel>
            <FormControl>
              <Input
                placeholder="México"
                className="h-10"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  )
}
