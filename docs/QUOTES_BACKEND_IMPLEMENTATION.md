# Implementación de Conexión Backend para Quotes

## Resumen

Se ha implementado la conexión completa de los endpoints de quotes al frontend siguiendo la misma estrategia arquitectónica usada en leads, opportunities, contacts y accounts.

## Archivos Creados/Modificados

### 1. **quote-service-backend.ts** (NUEVO)
Implementación del servicio de quotes que se conecta al backend Django.

**Endpoints implementados:**
- `GET /quotes/` - Listar cotizaciones
- `POST /quotes/` - Crear cotización
- `POST /quotes/from-opportunity/{id}` - Crear desde opportunity
- `GET /quotes/{id}` - Obtener cotización por ID
- `PATCH /quotes/{id}` - Actualizar cotización
- `DELETE /quotes/{id}` - Eliminar cotización
- `POST /quotes/{id}/details` - Agregar producto (quote line)
- `DELETE /quotes/details/{id}` - Eliminar producto
- `POST /quotes/{id}/activate` - Activar cotización (Draft → Active)
- `POST /quotes/{id}/close` - Cerrar cotización (Win/Lose/Cancel)
- `GET /quotes/stats/summary` - Estadísticas

**Métodos principales:**
- `getAll(filters)` - Obtener todas las cotizaciones con filtros opcionales
- `getById(id)` - Obtener cotización por ID
- `create(dto)` - Crear nueva cotización
- `createFromOpportunity(opportunityId)` - Crear desde opportunity
- `update(id, dto)` - Actualizar cotización
- `delete(id)` - Eliminar cotización
- `activate(id, dto)` - Activar cotización
- `win(id, dto)` - Ganar cotización
- `lose(id, dto)` - Perder cotización
- `cancel(id, reason)` - Cancelar cotización
- `search(query)` - Buscar cotizaciones
- `getStatistics()` - Obtener estadísticas

### 2. **quote-service-mock.ts** (RENOMBRADO)
Renombrado de `quote-service.ts` a `quote-service-mock.ts` para mantener la implementación mock original.

**Cambios:**
- Renombrado export de `quoteService` a `quoteServiceMock`
- Mantiene toda la lógica mock con localStorage

### 3. **quote-service.ts** (NUEVO - Switcher)
Archivo switcher que decide entre backend y mock según configuración.

```typescript
export const quoteService = featureFlags.useBackendAPI
  ? quoteServiceBackend
  : quoteServiceMock
```

### 4. **quote-detail-service-backend.ts** (NUEVO)
Implementación del servicio de quote lines (detalles de cotización) que se conecta al backend Django.

**Endpoints implementados:**
- `GET /quotes/{id}/details` - Obtener líneas de una cotización
- `GET /quotes/details/{id}` - Obtener línea por ID
- `POST /quotes/{id}/details` - Crear línea de producto
- `PATCH /quotes/details/{id}` - Actualizar línea
- `DELETE /quotes/details/{id}` - Eliminar línea

**Métodos principales:**
- `getByQuote(quoteId)` - Obtener todas las líneas de una cotización
- `getById(id)` - Obtener línea por ID
- `create(dto)` - Crear línea de producto
- `update(id, dto)` - Actualizar línea
- `delete(id)` - Eliminar línea
- `bulkCreate(dtos)` - Crear múltiples líneas
- `deleteByQuote(quoteId)` - Eliminar todas las líneas de una quote
- `reorder(quoteId, detailIds)` - Reordenar líneas
- `getStatistics(quoteId)` - Estadísticas de líneas
- `cloneQuoteLines(sourceId, targetId)` - Clonar líneas entre quotes

**Diferencia con Mock:**
- El backend Django calcula automáticamente los totales (baseamount, extendedamount, etc.)
- No necesita llamar manualmente a `updateTotals()` como el servicio mock
- El backend actualiza los totales del Quote automáticamente al agregar/modificar/eliminar líneas

### 5. **quote-detail-service-mock.ts** (RENOMBRADO)
Renombrado de `quote-detail-service.ts` a `quote-detail-service-mock.ts`.

**Cambios:**
- Renombrado export de `quoteDetailService` a `quoteDetailServiceMock`
- Mantiene toda la lógica mock con cálculos de totales en frontend

### 6. **quote-detail-service.ts** (NUEVO - Switcher)
Archivo switcher para quote details.

```typescript
export const quoteDetailService = featureFlags.useBackendAPI
  ? quoteDetailServiceBackend
  : quoteDetailServiceMock
```

## Arquitectura Implementada

La arquitectura sigue el patrón establecido en el proyecto:

```
┌─────────────────────────────────────────┐
│  Hooks (use-quotes.ts, etc.)            │
│  - useQuotes()                          │
│  - useCreateQuote()                     │
│  - useQuoteDetails()                    │
└─────────────┬───────────────────────────┘
              │ imports
              ▼
┌─────────────────────────────────────────┐
│  Switchers                              │
│  - quote-service.ts                     │
│  - quote-detail-service.ts              │
└─────────────┬───────────────────────────┘
              │ selects based on featureFlags
              ▼
      ┌───────┴────────┐
      ▼                ▼
┌──────────────┐  ┌──────────────┐
│   Backend    │  │     Mock     │
│  Services    │  │   Services   │
└──────────────┘  └──────────────┘
      │                │
      │ apiClient      │ localStorage
      ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Django API   │  │  LocalData   │
└──────────────┘  └──────────────┘
```

## Configuración

El sistema usa la variable de entorno `NEXT_PUBLIC_USE_BACKEND_API` para decidir qué servicio usar:

```env
# .env.local
NEXT_PUBLIC_USE_BACKEND_API=true   # Usa backend Django (default)
# o
NEXT_PUBLIC_USE_BACKEND_API=false  # Usa mocks con localStorage
```

## Flujo de Trabajo Quote-to-Cash

La implementación soporta el flujo completo de Quote-to-Cash según CDS:

```
1. Crear Quote desde Opportunity
   POST /quotes/from-opportunity/{opportunityId}

2. Agregar productos (Quote Lines)
   POST /quotes/{quoteId}/details
   {
     productname: "...",
     quantity: "10",
     priceperunit: "100.00",
     tax: "20.00"
   }

3. Activar Quote (Draft → Active)
   POST /quotes/{quoteId}/activate
   {
     effectivefrom: "2024-01-01",
     effectiveto: "2024-03-31"
   }

4. Cerrar Quote como Won
   POST /quotes/{quoteId}/close
   {
     statuscode: 3,  // Won
     closingnotes: "Cliente firmó contrato"
   }

5. Generar Order (automático desde backend)
   El backend Django genera Order desde Quote Won
```

## Validaciones Implementadas

El servicio backend incluye las mismas validaciones que el mock:

1. **Quote Draft**:
   - ✅ Editable
   - ✅ Se pueden agregar/modificar líneas
   - ✅ Se puede eliminar
   - ✅ Se puede activar (si tiene líneas)

2. **Quote Active**:
   - ❌ No editable
   - ❌ No se pueden modificar líneas
   - ✅ Se puede cerrar como Won/Lost/Canceled

3. **Quote Won**:
   - ❌ No editable
   - ❌ No se puede cancelar
   - ✅ Genera Order automáticamente

4. **Quote Closed/Lost**:
   - ❌ No editable
   - ❌ No se puede reactivar (en backend)

## Diferencias Backend vs Mock

| Aspecto | Backend Django | Mock (localStorage) |
|---------|----------------|---------------------|
| Cálculo de totales | Automático en servidor | Manual en frontend |
| Generación de quotenumber | Automático en servidor | Manual con timestamp |
| Validaciones | En servidor + frontend | Solo frontend |
| Persistencia | Base de datos | localStorage |
| Generación de Order | Automática al Win | Requiere llamada manual |
| Performance | Red + DB | Instantáneo |

## Testing

Para probar la implementación:

### 1. Con Backend Django (default)
```bash
# Asegurar que el backend Django esté corriendo en http://localhost:8000
npm run dev

# Navegar a /quotes
# Crear, editar, activar quotes
# Agregar productos
# Cerrar como Won/Lost
```

### 2. Con Mocks (offline)
```env
# .env.local
NEXT_PUBLIC_USE_BACKEND_API=false
```

```bash
npm run dev
# Funciona sin backend - usa localStorage
```

## Hooks Disponibles

Todos los hooks existentes funcionan sin cambios:

### Quote Hooks (use-quotes.ts)
- `useQuotes()` - Obtener todas las quotes
- `useQuotesByState(statecode)` - Filtrar por estado
- `useQuotesByOpportunity(opportunityId)` - Quotes de una opportunity
- `useQuotesByCustomer(customerId)` - Quotes de un customer
- `useQuote(id)` - Quote por ID
- `useQuoteSearch(query)` - Buscar quotes
- `useQuoteStatistics()` - Estadísticas

### Quote Detail Hooks (use-quote-details.ts)
- `useQuoteDetails(quoteId)` - Líneas de una quote
- `useQuoteDetail(id)` - Línea por ID
- `useQuoteDetailStatistics(quoteId)` - Estadísticas de líneas
- `useCreateQuoteDetail()` - Mutation crear línea
- `useUpdateQuoteDetail()` - Mutation actualizar línea
- `useDeleteQuoteDetail()` - Mutation eliminar línea
- `useBulkCreateQuoteDetails()` - Mutation crear múltiples líneas
- `useReorderQuoteDetails()` - Mutation reordenar líneas

### Quote Mutation Hooks (use-quote-mutations.ts)
- `useCreateQuote()` - Crear quote
- `useCreateQuoteFromOpportunity()` - Crear desde opportunity
- `useUpdateQuote()` - Actualizar quote
- `useDeleteQuote()` - Eliminar quote
- `useActivateQuote()` - Activar quote
- `useWinQuote()` - Ganar quote
- `useLoseQuote()` - Perder quote
- `useCancelQuote()` - Cancelar quote
- `useReviseQuote()` - Revisar quote
- `useCloneQuote()` - Clonar quote

## Próximos Pasos

1. ✅ Implementación completada
2. ⏳ Testing con backend Django real
3. ⏳ Validar flujo completo Quote → Order → Invoice
4. ⏳ Ajustar transformaciones de datos si es necesario
5. ⏳ Documentar endpoints faltantes (si los hay)

## Notas Técnicas

### CSRF Token
El API client automáticamente inyecta el CSRF token en todas las peticiones de mutación (POST, PATCH, DELETE) según lo configurado en `@/core/api/client`.

### Error Handling
Los errores del backend Django se transforman automáticamente al formato `ApiErrorResponse` estándar del proyecto mediante el interceptor de axios.

### Tipos TypeScript
Todos los tipos están definidos en:
- `@/core/contracts/entities/quote.ts`
- `@/core/contracts/entities/quote-detail.ts`
- `@/core/contracts/enums/quote-state-code.ts`
- `@/core/contracts/enums/quote-status-code.ts`

## Referencias

- **NEXTJS_API_REFERENCE.md** - Documentación completa de endpoints Django
- **CLAUDE.md** - Arquitectura del proyecto y principios
- **src/features/leads/api/** - Ejemplo de referencia de implementación
- **src/features/opportunities/api/** - Ejemplo de referencia de implementación
