# Guía de Pruebas Manuales - Funcionalidades Recientes

**Fecha**: 2026-02-12
**Funcionalidades**: Customer validation, Order date naming, Quote→Order 1:1

---

## PREPARACIÓN

1. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Abrir navegador**: http://localhost:3000

3. **Login**:
   - Email: test@example.com
   - Password: password123

---

## TEST 1: Quote Customer Validation ⭐ CRÍTICO

### Objetivo
Verificar que NO se puede crear una Quote sin asignar un Customer (Account o Contact).

### Pasos Detallados

1. **Navegar a Templates**
   - URL: http://localhost:3000/quotes/templates
   - Verificar que se muestren los templates disponibles

2. **Seleccionar un Template**
   - Click en "Use Template" en cualquier template (ej: "Enterprise Package")
   - Debe navegar al formulario de Quote

3. **Dejar Customer vacío**
   - ⚠️ **NO seleccionar ningún Account o Contact**
   - Dejar el campo "Customer" vacío
   - Puedes llenar otros campos (Name, Description, etc.)

4. **Intentar crear la Quote**
   - Click en botón "Create Quote"

5. **Verificar Validación**
   ✅ **Resultado Esperado**:
   - El formulario NO debe enviarse
   - Debe aparecer mensaje de error: "Please select a customer (Account or Contact) for this quote"
   - El campo Customer debe tener borde rojo
   - El foco debe ir al selector de Customer
   - La pestaña debe cambiar a "General" (donde está el campo Customer)

   ❌ **Error si**:
   - La Quote se crea sin customer
   - No aparece mensaje de error
   - El botón está deshabilitado permanentemente

### Casos de Borde

**Caso 1**: Seleccionar customer y luego quitarlo
- Seleccionar un Account
- Click en X para quitar el customer
- Intentar crear Quote
- Debe mostrar error de validación

**Caso 2**: Cambiar de Account a Contact
- Seleccionar un Account
- Cambiar a Contact
- Verificar que el selector se limpie correctamente
- Seleccionar un Contact válido
- Debe permitir crear la Quote

---

## TEST 2: Quote Edit - Customer Preselection ⭐ CRÍTICO

### Objetivo
Verificar que al editar una Quote, el Customer se muestra correctamente con todos sus datos.

### Pasos Detallados

1. **Crear Quote con Account**
   - Ir a: http://localhost:3000/quotes/templates
   - Usar template "Enterprise Package"
   - **Seleccionar un Account** (ej: "Acme Corporation")
   - Click "Create Quote"
   - Esperar creación exitosa

2. **Ir a Edit Mode**
   - En la Quote detail page, click en "Edit"
   - Debe navegar a `/quotes/{id}/edit`

3. **Verificar Customer Display**
   ✅ **Resultado Esperado**:
   - Campo Customer debe mostrar:
     - ✅ Nombre completo del Account (ej: "Acme Corporation")
     - ✅ Email del Account
     - ✅ Teléfono del Account (si existe)
     - ✅ Avatar/Icono del Account

   ❌ **Error si**:
   - Solo se ve un icono sin texto
   - El campo aparece vacío
   - Aparece "undefined" o datos incompletos

4. **Probar con Contact**
   - Crear otra Quote usando un Contact en vez de Account
   - Editar esa Quote
   - Verificar que los datos del Contact se muestren correctamente:
     - Nombre completo (First Name + Last Name)
     - Email
     - Teléfono móvil o fijo

### Casos de Borde

**Caso 1**: Account sin email
- Editar Quote con Account que no tiene email
- Debe mostrar el nombre, aunque no haya email

**Caso 2**: Contact sin teléfono
- Editar Quote con Contact sin teléfono
- Debe mostrar nombre y email correctamente

---

## TEST 3: Order Name with Creation Date ⭐ NUEVA FUNCIONALIDAD

### Objetivo
Verificar que los Orders generados desde Quotes incluyan la fecha de creación en el nombre.

### Pasos Detallados

1. **Preparar Quote Won**
   - Opción A: Usar Quote existente en estado Won
     - URL: http://localhost:3000/quotes/quote-002

   - Opción B: Crear y ganar una Quote
     - Crear Quote desde template
     - Activar Quote
     - Win Quote

2. **Crear Order desde Quote**
   - En Quote detail page, buscar botón "Create Order from Quote"
   - Click en el botón
   - Confirmar en el diálogo que aparece

3. **Verificar Order Name**
   - El Order debe crearse y navegar a Order detail
   - **Verificar el nombre del Order**:

   ✅ **Formato Esperado**:
   ```
   {Nombre de la Quote} - {DD-MM-YYYY}
   ```

   **Ejemplo**:
   ```
   CRM Enterprise Implementation - Acme Corp - 12-02-2026
   Enterprise Software License - TechStart Inc - 12-02-2026
   ```

   - La fecha debe ser la fecha actual en formato español (día-mes-año)
   - Debe incluir guiones como separadores

4. **Verificar en Order List**
   - Ir a: http://localhost:3000/orders
   - Buscar el Order recién creado en la tabla
   - El nombre debe incluir la fecha

### Casos de Borde

**Caso 1**: Crear múltiples Orders en diferentes días
- Crear Order hoy
- (Simular) Crear Order mañana
- Ambos deben tener fechas diferentes

**Caso 2**: Quote con nombre muy largo
- Quote name: "CRM Enterprise Implementation for Global Corporation with Advanced Features"
- Order name debe incluir todo + fecha

---

## TEST 4: Quote → Order 1:1 Relationship ⭐ CRÍTICO

### Objetivo
Verificar que solo se puede crear 1 Order activo por Quote.

### ESCENARIO A: Primera creación (Sin Orders previos)

1. **Setup**
   - Ir a Quote Won sin Orders: http://localhost:3000/quotes/quote-002

2. **Verificar Estado Inicial**
   ✅ **Resultado Esperado**:
   - Botón "Create Order from Quote" debe estar **ENABLED**
   - NO debe haber alertas de "Order already exists"
   - El botón debe tener color primary (azul)

3. **Crear Order**
   - Click en "Create Order from Quote"
   - Debe aparecer diálogo de confirmación con:
     - Título: "Create Order from Quote"
     - Bullet points explicando el proceso
     - Botones: Cancel + Create Order
   - Click en "Create Order"

4. **Verificar Navegación**
   - Debe crear Order exitosamente
   - Debe navegar a Order detail page: `/orders/{order-id}`
   - Debe mostrar toast de éxito

### ESCENARIO B: Order ya existe (Active)

1. **Regresar a Quote**
   - Desde Order detail, click en Quote number/link
   - O navegar manualmente: `/quotes/quote-002`

2. **Verificar Botón Disabled**
   ✅ **Resultado Esperado**:
   - Botón "Create Order from Quote" debe estar **DISABLED**
   - Color del botón: outline/gris
   - Debe aparecer Alert azul:
     ```
     ℹ️ Order already exists for this quote
     An order has already been created from this quote.
     [Link al Order existente] →
     ```

3. **Verificar Link al Order**
   - Click en el link del Order en el Alert
   - Debe navegar al Order detail
   - URL debe ser: `/orders/{order-id}`

### ESCENARIO C: Order Cancelado existe

1. **Preparar Order Cancelado**
   - Ir al Order creado en Escenario A
   - Cancelar el Order (si hay botón Cancel)
   - O usar Order mock data que ya esté cancelado

2. **Regresar a Quote**
   - Navegar a la Quote original

3. **Verificar Estado**
   ✅ **Resultado Esperado**:
   - Botón "Create Order from Quote" debe estar **ENABLED** nuevamente
   - Debe aparecer Warning amarillo:
     ```
     ⚠️ A cancelled order was previously created from this quote.
     You can create a new order.
     ```
   - Se puede crear un nuevo Order (reemplaza el cancelado)

### ESCENARIO D: Multiple Quotes, Multiple Orders

1. **Crear Orders desde 3 Quotes diferentes**
   - Quote A → Order 1 (Active)
   - Quote B → Order 2 (Active)
   - Quote C → Order 3 (Cancelled)

2. **Verificar Independencia**
   - Cada Quote debe controlar su propio Order
   - Quote A: botón disabled (tiene Order Active)
   - Quote B: botón disabled (tiene Order Active)
   - Quote C: botón enabled (Order Cancelled)

---

## CHECKLIST DE VALIDACIÓN FINAL

### Funcionalidad General
- [ ] Build pasa sin errores (`npm run build`)
- [ ] Dev server corre sin errores (`npm run dev`)
- [ ] No hay console errors en navegador
- [ ] Navegación entre páginas funciona

### Customer Validation
- [ ] No se puede crear Quote sin Customer
- [ ] Mensaje de error aparece correctamente
- [ ] Foco va al campo Customer
- [ ] Error desaparece al seleccionar Customer

### Customer Preselection
- [ ] Account se muestra al editar Quote
- [ ] Contact se muestra al editar Quote
- [ ] Nombre completo visible
- [ ] Email y teléfono visibles (si existen)

### Order Date Naming
- [ ] Order name incluye fecha de creación
- [ ] Formato DD-MM-YYYY correcto
- [ ] Fecha es la actual
- [ ] Nombre completo Quote + fecha

### Quote→Order 1:1
- [ ] Solo 1 Order activo por Quote
- [ ] Botón disabled después de crear Order
- [ ] Alert muestra link al Order existente
- [ ] Permite crear nuevo Order si anterior está Cancelled

### i18n (Bonus)
- [ ] Cambiar idioma a español
- [ ] Todos los textos en español
- [ ] Error messages en español
- [ ] Cambiar a inglés
- [ ] Todos los textos en inglés

---

## ERRORES COMUNES Y SOLUCIONES

### Error 1: Customer no aparece al editar
**Síntoma**: Solo se ve icono, sin nombre
**Causa**: Hooks useAccount/useContact no están cargando datos
**Solución**: Verificar que quote.customerid y quote.customeridtype existen

### Error 2: Validación no funciona
**Síntoma**: Quote se crea sin customer
**Causa**: handleFormSubmit no está validando
**Solución**: Verificar que customerid esté inicializado en defaultValues

### Error 3: Order name sin fecha
**Síntoma**: Order name = Quote name (sin fecha)
**Causa**: createFromQuote no está agregando fecha
**Solución**: Verificar order-service-mock.ts línea 358-368

### Error 4: Multiple Orders desde misma Quote
**Síntoma**: Se pueden crear múltiples Orders activos
**Causa**: useOrdersByQuote no está filtrando correctamente
**Solución**: Verificar que hasActiveOrders excluya OrderStateCode.Canceled

---

## REPORTAR BUGS

Si encuentras algún bug, documenta:

1. **URL** donde ocurre
2. **Pasos** para reproducir
3. **Resultado esperado** vs **Resultado actual**
4. **Screenshots** si es posible
5. **Console errors** (F12 → Console tab)
6. **Network errors** (F12 → Network tab)

**Formato de reporte**:
```
## Bug: [Título descriptivo]

**URL**: /quotes/new
**Pasos**:
1. Abrir formulario de Quote
2. Dejar Customer vacío
3. Click en Create Quote

**Esperado**: Error de validación
**Actual**: Quote se crea sin customer

**Console errors**:
[Pegar errores aquí]
```

---

**Happy Testing! 🧪**

_Última actualización: 2026-02-12_
