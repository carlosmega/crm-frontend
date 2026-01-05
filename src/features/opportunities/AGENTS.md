# Opportunities Feature - UI/UX Design Standards

## 📋 Overview

Este documento define los **estándares de diseño UI/UX** para el módulo de Opportunities. Todos los componentes CRUD (Create, Read, Update, Delete) siguen estos patrones de forma consistente.

**Propósito**: Servir como **referencia única** para el agente UX/UI al diseñar o revisar componentes de opportunities y otros features del CRM.

---

## 🎨 Design Principles

### 1. Visual Hierarchy Consistency

**Estructura de 3 capas** en todas las vistas:

```
┌─────────────────────────────────────────────────────┐
│ Header (Sticky) - White background                 │
│ - Breadcrumb navigation                             │
│ - Sidebar trigger                                   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ Content Container - Gray background (bg-gray-100)   │
│   ┌─────────────────────────────────────────────┐   │
│   │ Info Header + Actions (Sticky on scroll)   │   │
│   │ - Entity info (name, stage, value)         │   │
│   │ - Primary/secondary action buttons         │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │ Business Process Flow (Sticky)             │   │
│   │ - Visual stage progression                  │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │ Tabs Navigation (Sticky)                   │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │ Content Cards - White background           │   │
│   │ - Forms, tables, details                    │   │
│   │ - Scrollable area                          │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2. Color Palette

**Backgrounds (CRÍTICO - Patrón de capas):**

```
┌─────────────────────────────────────────────┐
│ bg-gray-100 (Contenedor principal)          │ ← Fondo gris en TODO
│ ┌─────────────────────────────────────────┐ │
│ │ bg-background (Breadcrumb header)       │ │ ← Blanco
│ └─────────────────────────────────────────┘ │
│                                             │ ← Gris visible
│ ┌─────────────────────────────────────────┐ │
│ │ bg-white (Search card)                  │ │ ← Blanco
│ └─────────────────────────────────────────┘ │
│                                             │ ← Gris visible
│ ┌─────────────────────────────────────────┐ │
│ │ bg-card/bg-white (Table/Form cards)     │ │ ← Blanco
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Regla:** El fondo gris (`bg-gray-100`) es el **contenedor principal**. Los elementos individuales (breadcrumb, cards, tables) tienen fondo **blanco** y flotan sobre el gris.

**Aplicación específica:**
- **List View**:
  - Headers container: `shrink-0 bg-gray-100`
  - Breadcrumb header: `bg-background` (blanco)
  - Table container: `flex-1 min-h-0 bg-gray-100`
- **Detail/Edit/Create Views**:
  - Main container: `flex flex-1 flex-col overflow-y-auto bg-gray-100`
  - Sticky headers: `bg-gray-100/98 backdrop-blur-sm`
- **Cards/Tables**: `bg-white` o `bg-card` (default blanco)
- **Sticky headers transparentes**: `bg-gray-100/98 backdrop-blur-sm`

**Borders:**
- Cards: `border border-gray-200` (gris claro, consistente)
- Subtle dividers: `border-border/40`

**Accents (CRÍTICO - Botones consistentes):**
- **Primary actions**: `bg-purple-600 hover:bg-purple-700 text-white font-medium`
  - Ejemplos: Create, Save, Update, Win, Qualify
- **Secondary actions**: `border-gray-300 text-gray-700 hover:bg-gray-50`
  - Ejemplos: Cancel, Edit, Log Activity, Lose
- **Success states**: `bg-green-600`
- **Destructive**: `bg-red-600` (para Delete)

### 3. Spacing System

**Container Padding:**
```tsx
// Horizontal margins (consistent across all sections)
className="px-4"

// Vertical spacing for sections
className="pt-4 pb-4"   // Standard section spacing
className="pb-4"        // Bottom-only spacing (after sticky header)
className="pt-1"        // Minimal top spacing for content after sticky

// Card spacing
className="space-y-4"   // Between multiple cards
```

**Form Field Spacing:**
```tsx
// Form container
className="space-y-6"   // Between form fields

// Card content
className="pt-6"        // Top padding inside cards with forms
```

---

## 🏗️ Layout Patterns by View Type

### List View (`/opportunities` o `/leads`)

**Files**:
- `app/(sales)/opportunities/opportunities-client.tsx`
- `app/(sales)/leads/leads-client.tsx`

**Estructura completa con altura fija:**

```tsx
<SidebarInset className="flex flex-col h-screen overflow-hidden">
  {/* Fixed Header Section - Fondo gris, NO hace scroll */}
  <div className="shrink-0 bg-gray-100">

    {/* Breadcrumb Header - Fondo BLANCO */}
    <header className="flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Opportunities</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>

    {/* Page Title & Action - MANTENER (no redundante con breadcrumb) */}
    <div className="px-4 pt-4 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Opportunities</h2>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track opportunities
          </p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/opportunities/new">
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Link>
        </Button>
      </div>
    </div>

    {/* Search & Filters Card - Fondo BLANCO sobre gris */}
    <div className="px-4 pb-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Opportunities</SelectItem>
              {/* ... más opciones */}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Summary (si hay filtros activos) */}
        {Object.keys(columnFilters).length > 0 && (
          <DataTableFilterSummary
            filters={columnFilters}
            columns={getOpportunityColumns()}
            onRemoveFilter={handleRemoveFilter}
            onClearAllFilters={handleClearAllFilters}
          />
        )}
      </div>
    </div>
  </div>

  {/* Table Container - ALTURA FIJA, scroll interno, fondo gris */}
  <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col bg-gray-100">
    <OpportunityList
      opportunities={filteredOpportunities}
      selectedOpportunities={selectedOpportunities}
      onSelectionChange={setSelectedOpportunities}
      filters={columnFilters}
      onFiltersChange={setColumnFilters}
      loading={false}
      bulkActions={bulkActions}
      hasLoadedData={opportunities.length > 0}
    />
    {/* OpportunityList renderiza tabla con bg-card (blanco) por defecto */}
  </div>
</SidebarInset>
```

**Key Points - CRÍTICOS para altura fija:**
- ✅ **`SidebarInset`**: `h-screen overflow-hidden` - Altura completa de pantalla
- ✅ **Headers container**: `shrink-0 bg-gray-100` - NO crece/encoge, fondo gris
- ✅ **Breadcrumb header**: `bg-background` - Fondo BLANCO sobre gris
- ✅ **Table container**: `flex-1 min-h-0` - Toma TODO el espacio restante
- ✅ **Table container**: `bg-gray-100` - Fondo gris continuo
- ✅ **Page Title is NOT redundant** - Breadcrumbs (navigation) vs Page Header (identity) have different purposes
- ✅ **Search card**: `bg-white border-gray-200` - Blanco sobre gris
- ✅ **Spacing**: `px-4` horizontal, `pt-4 pb-4` vertical consistente
- ✅ **Purple primary button**: `bg-purple-600 hover:bg-purple-700`

**¿Por qué esta estructura?**

```
┌─────────────────────────────────────┐
│ SidebarInset (h-screen)             │
│ ┌─────────────────────────────────┐ │
│ │ shrink-0 bg-gray-100 (NO crece) │ │ ← Headers fijos
│ │ - Breadcrumb (bg-background)    │ │
│ │ - Page Title                    │ │
│ │ - Search Card (bg-white)        │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ flex-1 min-h-0 bg-gray-100      │ │ ← Tabla con altura fija
│ │ (toma espacio restante)         │ │
│ │                                 │ │
│ │ [Tabla con scroll interno]      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

La tabla NO crece ilimitadamente, usa EXACTAMENTE el espacio vertical disponible.

---

### Detail View (`/opportunities/[id]`)

**File**: `app/(sales)/opportunities/[id]/page.tsx`

```tsx
<>
  {/* Fixed Header - WHITE */}
  <header className="sticky top-0 z-50 h-16 border-b bg-background">
    <Breadcrumb>...</Breadcrumb>
  </header>

  {/* Content - GRAY BACKGROUND */}
  <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">

    {/* STICKY HEADER SECTION - GRAY */}
    <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">

      {/* Info Header + Action Buttons */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <OpportunityInfoHeader opportunity={opportunity} />

          <div className="flex gap-2">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Win Opportunity
            </Button>
            <Button variant="outline">Lose Opportunity</Button>
            <Button variant="outline">Edit</Button>
          </div>
        </div>
      </div>

      {/* Business Process Flow */}
      <SalesBusinessProcessFlow />

      {/* Tabs Navigation Container */}
      <div className="px-4">
        <div id="opportunity-tabs-nav-container" />
      </div>
    </div>

    {/* SCROLLABLE CONTENT - WHITE CARDS */}
    <div className="px-4 pb-4 pt-1">
      <OpportunityDetailTabs />  {/* Renders white cards */}
    </div>
  </div>
</>
```

**Key Points:**
- ✅ Sticky header con info + BPF + tabs (permanece visible al scroll)
- ✅ Fondo gris con transparencia + backdrop blur (`bg-gray-100/98 backdrop-blur-sm`)
- ✅ Cards de contenido con fondo blanco en área scrollable
- ✅ Actions alineados a la derecha del header

---

### Edit View (`/opportunities/[id]/edit`)

**File**: `app/(sales)/opportunities/[id]/edit/page.tsx`

```tsx
<>
  {/* Mobile Header - WHITE */}
  <header className="md:hidden sticky top-0 z-50 bg-white border-b">
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs font-semibold text-purple-600 uppercase">
        EDIT OPPORTUNITY
      </p>
      <Button className="bg-purple-600 hover:bg-purple-700">
        Save
      </Button>
    </div>
  </header>

  {/* Desktop Header - WHITE */}
  <header className="hidden md:flex sticky top-0 z-50 h-16 border-b">
    <Breadcrumb>...</Breadcrumb>
  </header>

  {/* Content - GRAY BACKGROUND */}
  <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">

    {/* STICKY SECTION - GRAY */}
    <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">

      {/* Info + Actions */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <OpportunityInfoHeader opportunity={opportunity} />

          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Business Process Flow */}
      <SalesBusinessProcessFlow />

      {/* Tabs Navigation */}
      <div className="px-4">
        <div id="opportunity-tabs-nav-container" />
      </div>
    </div>

    {/* FORM CONTENT - WHITE CARDS */}
    <div className="px-4 pb-4 pt-1">
      <OpportunityForm hideActions />  {/* Renders cards with fields */}
    </div>
  </div>
</>
```

**Key Points:**
- ✅ Mobile: Header compacto con acciones principales (Save/Cancel)
- ✅ Desktop: Acciones en el área de info header
- ✅ Formulario con `hideActions={true}` - botones en sticky header
- ✅ Mismo patrón de sticky header que detail view

---

### Create View (`/opportunities/new`)

**File**: `app/(sales)/opportunities/new/page.tsx`

```tsx
<>
  {/* Headers (igual que Edit) */}

  {/* Content - GRAY BACKGROUND */}
  <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">

    {/* STICKY SECTION - GRAY */}
    <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">

      {/* Page Header + Actions */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Create New Opportunity</h1>
            <p className="text-muted-foreground mt-1">
              Add a new opportunity to your sales pipeline
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Opportunity
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* FORM - WHITE CARD */}
    <div className="px-4 pb-4 pt-1">
      <Card>
        <CardContent className="pt-6">
          <Form>
            {/* Form fields with space-y-6 */}
          </Form>
        </CardContent>
      </Card>
    </div>
  </div>
</>
```

**Key Points:**
- ✅ Más simple que Edit (sin BPF ni tabs - no hay opportunity existente)
- ✅ Page title + description en sticky header
- ✅ Form completo en un solo Card blanco

---

## 🧩 Reusable Components

### 1. OpportunityInfoHeader

**File**: `features/opportunities/components/opportunity-info-header.tsx`

Muestra información clave de la opportunity de forma compacta:

```tsx
<OpportunityInfoHeader opportunity={opportunity} />
```

**Renders:**
- Nombre de opportunity (truncado en mobile)
- Customer name + tipo (Account/Contact)
- Sales stage badge + probability
- Estimated value + close date
- Owner info

**Usage**: Detail view, Edit view

---

### 2. SalesBusinessProcessFlow

**File**: `shared/components/sales-business-process-flow.tsx`

Visualización horizontal de stages con indicador de progreso:

```tsx
<SalesBusinessProcessFlow
  entityType="opportunity"
  entityState={{
    currentStage: opportunity.salesstage,
    stateCode: opportunity.statecode,
    id: opportunity.opportunityid,
    name: opportunity.name,
    closeReason: opportunity.closestatus,
  }}
  onStageClick={(stageId) => {
    // Navigate to tab or trigger action
  }}
/>
```

**Visual**: Purple progress bar con stages: Qualify → Develop → Propose → Close

**Usage**: Detail view, Edit view

---

### 3. OpportunityTabsNavigation

**File**: `shared/components/opportunity-tabs-navigation.tsx`

Tabs horizontales con iconos que se renderizan via portal:

```tsx
{/* In form or detail component */}
<Tabs value={activeTab} onValueChange={setActiveTab}>
  {tabsContainer && createPortal(
    <OpportunityTabsNavigation
      tabs={[
        { id: 'general', label: 'General', icon: User },
        { id: 'qualify', label: 'Qualify', icon: Target },
        // ...
      ]}
    />,
    tabsContainer
  )}

  <TabsContent value="general">...</TabsContent>
</Tabs>

{/* In page layout */}
<div id="opportunity-tabs-nav-container" />
```

**Purpose**: Tabs navigation permanece en sticky header mientras contenido hace scroll

**Usage**: Detail view, Edit view

---

### 4. DataTableWithToolbar

**File**: `shared/components/data-table/data-table-with-toolbar.tsx`

Tabla con selección, filtros, sorting y bulk actions:

```tsx
<DataTableWithToolbar
  data={opportunities}
  columns={columns}
  getRowId={(opp) => opp.opportunityid}
  enableRowSelection
  selectedRows={selectedIds}
  onSelectionChange={setSelectedIds}
  enableFiltering
  filters={columnFilters}
  onFiltersChange={setColumnFilters}
  loading={loading}
  bulkActions={bulkActions}
  emptyState={emptyStateComponent}
/>
```

**Automatic styling**: `bg-card border border-border shadow-sm`

**Usage**: List view

---

## 🎯 Button Patterns

### Primary Actions

```tsx
// Create, Save, Win, Submit
<Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
  <Save className="mr-2 h-4 w-4" />
  Save Changes
</Button>
```

### Secondary Actions

```tsx
// Edit, Log Activity, View Details
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  <Edit className="mr-2 h-4 w-4" />
  Edit
</Button>
```

### Destructive Actions

```tsx
// Delete, Lose Opportunity
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  <XCircle className="mr-2 h-4 w-4" />
  Lose Opportunity
</Button>
```

### Mobile Compact

```tsx
// Icon-only en mobile header
<Button size="sm" className="bg-purple-600 hover:bg-purple-700">
  <Save className="h-4 w-4" />
</Button>
```

---

## 📱 Responsive Patterns

### Desktop (md+)

- Headers sticky con altura `h-16`
- Info + Actions lado a lado (flex-row justify-between)
- Tabs navigation visible
- Business Process Flow completo

### Mobile (<md)

- Header compacto con acciones principales (Save/Cancel)
- Info + Actions apilados (flex-col)
- Tabs navigation puede colapsar
- BPF puede simplificarse

```tsx
{/* Desktop Layout */}
<div className="hidden md:flex items-start justify-between gap-4">
  <OpportunityInfoHeader />
  <div className="flex gap-2">{/* Actions */}</div>
</div>

{/* Mobile Layout */}
<div className="md:hidden space-y-4">
  <OpportunityInfoHeader />
  <div className="flex flex-col gap-2">{/* Actions stacked */}</div>
</div>
```

---

## ✅ Form Field Patterns

### Card-based Sections

```tsx
<div className="space-y-4">
  {/* Basic Information Card */}
  <Card>
    <CardHeader>
      <CardTitle className="text-base font-semibold">
        Basic Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField ... />
      <FormFieldGroup columns={2}>
        <FormField ... />
        <FormField ... />
      </FormFieldGroup>
    </CardContent>
  </Card>

  {/* Sales Details Card */}
  <Card>...</Card>
</div>
```

### Field Labels

```tsx
<FormLabel className="text-sm font-medium">
  Opportunity Name <span className="text-destructive">*</span>
</FormLabel>
```

### Field Descriptions

```tsx
<FormDescription className="text-xs text-muted-foreground">
  A descriptive name for this sales opportunity
</FormDescription>
```

### Input Heights

```tsx
<Input className="h-10" />           // Standard height
<Select><SelectTrigger className="h-10" /></Select>
<Button className="h-10" />           // Match input height
```

---

## 🎨 Empty States

### No Data (First Time)

```tsx
<EmptyState
  icon={Target}
  title="No opportunities yet"
  description="Start tracking your sales pipeline by creating your first opportunity."
  action={{ href: '/opportunities/new', label: 'Create Your First Opportunity' }}
  helpText="Tip: Opportunities move through stages as you progress toward winning the deal."
  size="large"
/>
```

### No Results (With Filters)

```tsx
<EmptyState
  icon={Filter}
  title="No opportunities match your filters"
  description="Try adjusting your search criteria or filters."
  action={{ href: '/opportunities/new', label: 'Create New Opportunity' }}
  secondaryAction={{
    label: 'Clear Filters',
    onClick: () => onFiltersChange({}),
  }}
  size="default"
/>
```

---

## 🚀 Performance Best Practices

### 1. Memoization

```tsx
// Formatters at module level (created once)
const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

// Callbacks memoized
const formatCurrency = useCallback((value?: number) => {
  if (!value) return '-'
  return CURRENCY_FORMATTER.format(value)
}, [])

// Columns memoized
const columns = useMemo(() => [...], [formatCurrency, formatDate])
```

### 2. Dynamic Imports

```tsx
// Heavy components lazy-loaded
const OpportunityForm = dynamic(
  () => import('./opportunity-form').then(m => ({ default: m.OpportunityForm })),
  {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false
  }
)
```

### 3. Debounced Search

```tsx
const [searchQuery, setSearchQuery] = useState('')
const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

// Use debouncedSearchQuery for filtering
```

---

## 📊 Data Flow Patterns

### Optimistic Updates

```tsx
// Update UI immediately, rollback on error
const handleUpdate = async (data) => {
  const previousData = opportunity

  // Optimistically update UI
  setOpportunity(data)

  try {
    await updateOpportunity(id, data)
  } catch (error) {
    // Rollback on error
    setOpportunity(previousData)
    showError(error)
  }
}
```

### Refetch After Mutations

```tsx
const { opportunity, refetch } = useOpportunity(id)

const handleStageChange = async () => {
  await moveToNextStage(id)
  refetch()  // Refresh data after mutation
}
```

---

## 🔗 Navigation Patterns

### Breadcrumb Structure

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/opportunities">Opportunities</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Back Navigation

```tsx
// Router back (preserves history)
const handleCancel = () => {
  router.back()
}

// Explicit redirect
const handleSuccess = (id: string) => {
  router.push(`/opportunities/${id}`)
}
```

---

## 🎯 Accessibility

### Screen Reader Labels

```tsx
<Button title="Edit opportunity" aria-label="Edit opportunity">
  <Edit className="h-4 w-4" />
</Button>
```

### Form Validation

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Opportunity Name <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <Input {...field} aria-required="true" />
      </FormControl>
      <FormMessage />  {/* Error shown to screen readers */}
    </FormItem>
  )}
/>
```

---

## 📝 Naming Conventions

### Component Files

```
opportunity-list.tsx              // List view component
opportunity-form.tsx              // Form component (create/edit)
opportunity-info-header.tsx    // Info display component
opportunity-detail-tabs.tsx    // Detail view tabs
opportunity-status-badge.tsx      // Status indicator
opportunity-stage-badge.tsx       // Sales stage indicator
```

### Page Files

```
app/(sales)/opportunities/
├── page.tsx                      // List view
├── new/page.tsx                  // Create view
├── [id]/page.tsx                 // Detail view
├── [id]/edit/page.tsx            // Edit view
└── [id]/close/page.tsx           // Close view (Win/Lose)
```

---

## 🔄 Migration Checklist

When creating/updating CRUD views for other entities (Leads, Accounts, Contacts, etc.):

### **List View (CRÍTICO - Altura fija)**
- [ ] `SidebarInset`: `h-screen overflow-hidden`
- [ ] Headers container: `shrink-0 bg-gray-100` (NO crece/encoge)
- [ ] Breadcrumb header: `bg-background` (blanco sobre gris)
- [ ] Page title section: `px-4 pt-4 pb-4` con fondo gris
- [ ] Search card: `bg-white border-gray-200 shadow-sm` dentro de `px-4 pb-4`
- [ ] Table container: `flex-1 min-h-0 px-4 pb-4 flex flex-col bg-gray-100`
- [ ] Purple primary button: `bg-purple-600 hover:bg-purple-700`
- [ ] Input sin `bg-background` extra (usa default)

### **Detail/Edit/Create Views**
- [ ] Main container: `flex flex-1 flex-col overflow-y-auto bg-gray-100`
- [ ] Sticky header: `bg-gray-100/98 backdrop-blur-sm`
- [ ] Info + Actions en sticky header con `px-4 pt-4 pb-4`
- [ ] Business Process Flow si la entidad tiene stages
- [ ] Tabs navigation via portal (`createPortal`) en sticky header
- [ ] Content cards: `px-4 pb-4 pt-1` con cards blancos

### **Formularios y Cards**
- [ ] Cards: `bg-white` o `bg-card` (blanco por defecto)
- [ ] Card borders: `border border-gray-200`
- [ ] Form spacing: `space-y-6` entre fields, `space-y-4` entre cards
- [ ] Form validation con `FormMessage`
- [ ] Input height: `h-10` consistente

### **Botones (CRÍTICO)**
- [ ] Primary actions: `bg-purple-600 hover:bg-purple-700 text-white font-medium`
  - Create, Save, Update, Win, Qualify
- [ ] Secondary actions: `border-gray-300 text-gray-700 hover:bg-gray-50`
  - Cancel, Edit, Log Activity, Lose
- [ ] Destructive: `bg-red-600` para Delete

### **Spacing Consistente**
- [ ] Horizontal: `px-4` en todas las secciones
- [ ] Vertical: `pt-4 pb-4` para secciones estándar
- [ ] Content después de sticky: `pt-1` (mínimo)

### **Performance**
- [ ] Memoize formatters (module-level `Intl.NumberFormat`, etc.)
- [ ] Memoize columns con `useMemo`
- [ ] Memoize callbacks con `useCallback`
- [ ] Dynamic imports para componentes pesados (forms, wizards)
- [ ] Debounced search con `useDebouncedValue`

### **UX/UI**
- [ ] Breadcrumb navigation completo
- [ ] Mobile responsive (hidden md:flex patterns)
- [ ] Empty states (no data / no results with filters)
- [ ] Loading states con Skeleton
- [ ] Error states con ErrorState component
- [ ] Accessibility (aria-label, title en botones icon)

### **Verificación Final**
- [ ] Compare visualmente con Opportunities/Leads - debe ser IDÉNTICO
- [ ] Fondo gris visible entre elementos blancos
- [ ] Tabla con altura fija (NO scroll infinito)
- [ ] Headers NO hacen scroll (shrink-0)
- [ ] Botones purple/gray consistentes

---

## 🎓 Learning Resources

### Key Files to Study

1. **List View Pattern**:
   - `app/(sales)/opportunities/opportunities-client.tsx`
   - `features/opportunities/components/opportunity-list.tsx`

2. **Detail View Pattern**:
   - `app/(sales)/opportunities/[id]/page.tsx`
   - `features/opportunities/components/opportunity-detail-tabs.tsx`

3. **Edit View Pattern**:
   - `app/(sales)/opportunities/[id]/edit/page.tsx`
   - `features/opportunities/components/opportunity-form.tsx`

4. **Form Sections**:
   - `features/opportunities/components/sections/general-info-section.tsx`
   - `features/opportunities/components/sections/qualify-stage-section.tsx`

5. **Shared Components**:
   - `shared/components/data-table/data-table-with-toolbar.tsx`
   - `shared/components/sales-business-process-flow.tsx`
   - `shared/components/opportunity-tabs-navigation.tsx`
   - `shared/components/empty-state.tsx`

---

## 🐛 Common Issues & Solutions

### Issue: Sticky header doesn't stick

**Solution**: Ensure parent has `overflow-y-auto` and sticky element has `position: sticky` with `top-0`

```tsx
<div className="overflow-y-auto">  {/* Parent must have overflow */}
  <div className="sticky top-0 z-40">  {/* Sticky child */}
    {/* Content */}
  </div>
</div>
```

### Issue: Tabs navigation doesn't render

**Solution**: Ensure portal container exists in DOM before rendering

```tsx
const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

useEffect(() => {
  const container = document.getElementById('opportunity-tabs-nav-container')
  setTabsContainer(container)
}, [])

{tabsContainer && createPortal(<TabsNavigation />, tabsContainer)}
```

### Issue: Form doesn't submit on button click

**Solution**: Ensure button triggers form submit via form ID

```tsx
<form id="opportunity-edit-form" onSubmit={handleSubmit}>...</form>

<Button onClick={() => {
  const form = document.getElementById('opportunity-edit-form') as HTMLFormElement
  form?.requestSubmit()
}}>
  Save
</Button>
```

---

## 📚 Related Documentation

- **CLAUDE.md** - Overall architecture and CDS model
- **Shared Components** - Reusable UI components (`shared/components/`)
- **shadcn/ui** - Base component library documentation
- **Tailwind CSS v4** - Utility classes reference

---

**Last Updated**: 2025-01-24
**Maintained By**: UX/UI Design Agent
**Version**: 1.0.0
