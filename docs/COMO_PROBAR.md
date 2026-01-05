# 🧪 Guía de Prueba - Integración Backend Django

## ✅ Estado Actual

### Backend Django
- ✅ **Corriendo** en http://localhost:8000
- ✅ **Login funciona** con `admin@test.com` / `admin123`
- ✅ **Endpoint /api/contacts/** responde correctamente
- ✅ **Cookies de sesión** funcionan (csrftoken + sessionid)
- ✅ **Formato de respuesta** correcto: `{success: true, data: [...]}`

### Frontend Next.js
- ✅ **Corriendo** en http://localhost:3000
- ✅ **Configurado** para usar backend Django
- ✅ **Feature flag** activo: `NEXT_PUBLIC_USE_BACKEND_API=true`

---

## 🎯 Paso a Paso: Probar la Integración

### Paso 1: Abrir la aplicación

1. Abre tu navegador (Chrome recomendado para DevTools)
2. Ve a: **http://localhost:3000**
3. Abre DevTools (F12) y ve a la pestaña **Network**

### Paso 2: Login

1. Haz clic en **"Iniciar Sesión"** o ve a http://localhost:3000/login
2. Ingresa las credenciales:
   ```
   Email: admin@test.com
   Password: admin123
   ```
3. Haz clic en **"Iniciar sesión"**

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `POST /api/auth/login`
- ✅ Status 200
- ✅ Response: `{success: true, user: {...}}`
- ✅ Cookies: `csrftoken` y `sessionid` en Application > Cookies

**✨ Resultado esperado:**
- Redirige al dashboard o página principal
- Verás tu nombre en la barra superior

### Paso 3: Ver Contactos

1. En el menú lateral, haz clic en **"Contactos"** o ve a http://localhost:3000/contacts
2. La página debería cargar

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `GET /api/contacts/`
- ✅ Status 200
- ✅ Headers incluyen `Cookie: csrftoken=...; sessionid=...`
- ✅ Response: `{success: true, data: [...]}`

**✨ Resultado esperado:**
- Lista de contactos cargada desde Django
- Si no hay contactos, verás mensaje "No hay contactos"
- Botón "Nuevo Contacto" disponible

### Paso 4: Crear un Contacto

1. Haz clic en **"Nuevo Contacto"** o **botón "+"**
2. Llena el formulario:
   ```
   Nombre: Juan
   Apellido: Pérez
   Email: juan.perez@example.com
   Teléfono: +52 555 1234567
   ```
3. Haz clic en **"Guardar"**

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `POST /api/contacts/`
- ✅ Headers incluyen `X-CSRFToken: ...` (CSRF automático)
- ✅ Body: `{"firstname": "Juan", "lastname": "Pérez", ...}`
- ✅ Status 201 (Created)
- ✅ Response: `{success: true, data: {contactid: "...", ...}}`

**✨ Resultado esperado:**
- Toast verde: "Contacto creado exitosamente"
- Redirige a lista de contactos
- El nuevo contacto aparece en la lista

### Paso 5: Editar un Contacto

1. Haz clic en un contacto de la lista
2. Haz clic en **"Editar"**
3. Cambia algún campo (ej: Email)
4. Haz clic en **"Guardar"**

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `PATCH /api/contacts/{id}`
- ✅ Headers incluyen `X-CSRFToken: ...`
- ✅ Body solo con campos modificados
- ✅ Status 200
- ✅ Response: `{success: true, data: {...}}`

**✨ Resultado esperado:**
- Toast verde: "Contacto actualizado"
- Cambios reflejados inmediatamente

### Paso 6: Buscar Contactos

1. En la lista de contactos, usa el buscador
2. Escribe: "juan" o "perez" o "example.com"

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `GET /api/contacts/?search=juan`
- ✅ Status 200
- ✅ Response filtrada con solo contactos que coinciden

**✨ Resultado esperado:**
- Lista filtrada en tiempo real
- Solo muestra contactos que coinciden

### Paso 7: Eliminar un Contacto (opcional)

1. Haz clic en un contacto
2. Haz clic en **"Eliminar"**
3. Confirma la eliminación

**🔍 Qué observar en DevTools (Network):**
- ✅ Request a `DELETE /api/contacts/{id}`
- ✅ Headers incluyen `X-CSRFToken: ...`
- ✅ Status 204 (No Content)

**✨ Resultado esperado:**
- Toast verde: "Contacto eliminado"
- El contacto desaparece de la lista

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No se pudo conectar con el servidor"

**Causa:** Django no está corriendo

**Solución:**
```bash
cd /ruta/a/tu/backend-django
python manage.py runserver 0.0.0.0:8000
```

### Problema 2: Login falla con error 401

**Causa:** Credenciales incorrectas

**Solución:**
1. Verifica las credenciales en Django
2. O crea un nuevo usuario:
   ```bash
   python manage.py createsuperuser
   ```
3. Usa esas credenciales en el login

### Problema 3: "CSRF token missing"

**Causa:** Cookies bloqueadas o CORS mal configurado

**Solución:**
1. Verifica en Django `settings.py`:
   ```python
   CORS_ALLOW_CREDENTIALS = True
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   ```
2. Limpia cookies del navegador (DevTools > Application > Clear storage)
3. Recarga la página

### Problema 4: 403 Forbidden en /contacts

**Causa:** Usuario sin permisos

**Solución:**
1. En Django admin, asigna permisos al usuario
2. O usa un superusuario (tienen todos los permisos)

### Problema 5: Los datos no se actualizan

**Causa:** Caché del navegador

**Solución:**
1. Recarga con Ctrl+Shift+R (hard reload)
2. Limpia caché en DevTools
3. Cierra sesión y vuelve a entrar

---

## 🎨 Verificar que está usando el Backend (no mock)

### Método 1: Ver Network en DevTools

Si ves requests a `http://localhost:8000/api/...` → ✅ Usando backend

Si NO ves requests → ❌ Usando mock (localStorage)

### Método 2: Verificar en Consola

1. Abre DevTools > Console
2. Escribe:
   ```javascript
   localStorage.getItem('crm_contacts')
   ```
3. Si es `null` → ✅ Usando backend
4. Si muestra datos → ❌ Usando mock

### Método 3: Ver variable de entorno

1. Abre `.env.local`
2. Verifica:
   ```
   NEXT_PUBLIC_USE_BACKEND_API=true
   ```
3. Si es `false` → está usando mock
4. Si cambias el valor, **reinicia `npm run dev`**

---

## 📊 Datos de Ejemplo para Probar

### Crear Contactos B2B (con Account)

```json
{
  "firstname": "María",
  "lastname": "García",
  "emailaddress1": "maria.garcia@acme.com",
  "telephone1": "+52 555 9876543",
  "jobtitle": "CEO",
  "parentcustomerid": "acc-001"  // ID de una cuenta existente
}
```

### Crear Contactos B2C (sin Account)

```json
{
  "firstname": "Carlos",
  "lastname": "López",
  "emailaddress1": "carlos.lopez@gmail.com",
  "mobilephone": "+52 555 1111111"
}
```

### Buscar Contactos

- Por nombre: `maria`
- Por apellido: `garcia`
- Por email: `acme.com`
- Por teléfono: `555`

---

## ✅ Checklist de Integración Exitosa

- [ ] Login funciona y redirige al dashboard
- [ ] Lista de contactos carga desde Django (ver Network tab)
- [ ] Crear contacto envía POST y muestra toast de éxito
- [ ] Editar contacto envía PATCH y actualiza datos
- [ ] Buscar filtra correctamente
- [ ] Eliminar contacto envía DELETE
- [ ] CSRF token se incluye automáticamente en mutaciones
- [ ] Cookies de sesión persisten entre páginas
- [ ] Logout limpia la sesión
- [ ] No hay errores en Console

---

## 🎉 ¿Qué sigue?

Una vez que Contacts funcione correctamente, puedes integrar otras entidades siguiendo el mismo patrón:

1. **Accounts** (Empresas)
2. **Leads** (Clientes potenciales)
3. **Opportunities** (Oportunidades)
4. **Quotes** (Cotizaciones)
5. **Orders** (Órdenes)
6. **Invoices** (Facturas)

Cada uno toma ~30 minutos usando el mismo patrón de Contacts.

---

## 🆘 ¿Necesitas ayuda?

Si algo no funciona:

1. Revisa la consola del navegador (F12 > Console)
2. Revisa Network tab para ver requests fallidos
3. Revisa los logs de Django en la terminal
4. Verifica el archivo `BACKEND_INTEGRATION.md` para más detalles

---

**¡Buena suerte! 🚀**
