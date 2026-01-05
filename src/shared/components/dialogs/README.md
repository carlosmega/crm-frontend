# Dialogs - Componentes de Diálogo Reutilizables

Componentes de diálogo personalizados basados en shadcn/ui para confirmaciones y alertas.

## ConfirmChangeDialog

Diálogo de confirmación personalizado para cuando se necesita confirmar un cambio que afecta relaciones entre entidades.

### Características

- ✅ Estilo consistente con shadcn/ui
- ✅ Muestra el valor actual que será cambiado
- ✅ Incluye sección de notas/advertencias
- ✅ Estado de carga (loading)
- ✅ Totalmente personalizable

### Uso Básico

```tsx
import { ConfirmChangeDialog } from '@/shared/components/dialogs'

function MyComponent() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  const handleConfirm = async () => {
    // Tu lógica aquí
    await updateRecord(pendingItem)
    setConfirmOpen(false)
  }

  return (
    <ConfirmChangeDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Change Primary Account?"
      message="This contact is already linked to another account."
      currentValue="account-123-456"
      currentValueLabel="Current Primary Account"
      note="A contact can only have ONE primary account."
      onConfirm={handleConfirm}
      onCancel={() => setConfirmOpen(false)}
      confirmText="Yes, Change Account"
    />
  )
}
```

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `open` | `boolean` | Sí | - | Estado de apertura del diálogo |
| `onOpenChange` | `(open: boolean) => void` | Sí | - | Callback cuando cambia el estado |
| `title` | `string` | Sí | - | Título del diálogo |
| `message` | `string` | Sí | - | Mensaje principal |
| `currentValue` | `string` | No | - | Valor actual que será cambiado |
| `currentValueLabel` | `string` | No | "Current Value" | Label para el valor actual |
| `note` | `string` | No | - | Nota o advertencia adicional |
| `onConfirm` | `() => void` | Sí | - | Callback cuando se confirma |
| `onCancel` | `() => void` | Sí | - | Callback cuando se cancela |
| `confirmText` | `string` | No | "Yes, Continue" | Texto del botón de confirmación |
| `cancelText` | `string` | No | "Cancel" | Texto del botón de cancelar |
| `isLoading` | `boolean` | No | `false` | Estado de carga |

### Ejemplos de Uso

#### 1. Cambiar Contact de Account

```tsx
<ConfirmChangeDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Change Primary Account?"
  message={`${contact.name} is already linked to another account.`}
  currentValue={contact.parentcustomerid}
  currentValueLabel="Current Primary Account"
  note="A contact can only have ONE primary account."
  onConfirm={handleChangeAccount}
  onCancel={() => setConfirmOpen(false)}
  confirmText="Yes, Change Account"
/>
```

#### 2. Cambiar Owner de Opportunity

```tsx
<ConfirmChangeDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Change Opportunity Owner?"
  message={`${opportunity.name} will be reassigned to a new owner.`}
  currentValue={currentOwner.name}
  currentValueLabel="Current Owner"
  note="The new owner will receive all notifications and tasks related to this opportunity."
  onConfirm={handleChangeOwner}
  onCancel={() => setConfirmOpen(false)}
  confirmText="Yes, Reassign"
/>
```

#### 3. Mover Quote a otra Opportunity

```tsx
<ConfirmChangeDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Move Quote to Different Opportunity?"
  message={`This quote is currently associated with "${currentOpportunity.name}".`}
  currentValue={currentOpportunity.opportunityid}
  currentValueLabel="Current Opportunity"
  note="Moving this quote will update all related references and timeline events."
  onConfirm={handleMoveQuote}
  onCancel={() => setConfirmOpen(false)}
  confirmText="Yes, Move Quote"
  isLoading={isMoving}
/>
```

#### 4. Sin mostrar valor actual (confirmación simple)

```tsx
<ConfirmChangeDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete Record?"
  message="Are you sure you want to delete this record? This action cannot be undone."
  note="All related data will also be deleted."
  onConfirm={handleDelete}
  onCancel={() => setConfirmOpen(false)}
  confirmText="Yes, Delete"
  cancelText="Keep Record"
/>
```

## Estilos

El componente usa:
- **Badge ámbar** (amber-50/200/700/900) para mostrar valores actuales (advertencia)
- **Badge azul** (blue-50/200/900) para notas informativas
- **Botón púrpura** (purple-600/700) para confirmación
- **Layout responsive** con espaciado consistente

## Cuándo Usar

✅ **Usar cuando:**
- Cambias una relación entre entidades (e.g., contact → account)
- Reasignas ownership de registros
- Mueves registros entre contenedores
- Necesitas mostrar el valor actual que será reemplazado

❌ **No usar cuando:**
- Solo necesitas un mensaje simple (usa Toast)
- La acción es reversible fácilmente
- No hay pérdida de datos o cambio de relación

## Mantenimiento

Este componente es **reutilizable** y debe mantenerse **genérico**.

Si necesitas funcionalidad específica para una entidad, considera:
1. Crear un wrapper component específico
2. O agregar props opcionales al componente base

**No** modifiques el componente base para casos específicos.
