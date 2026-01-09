---
name: generate-crud-entity
description: Generates a complete CRUD entity feature (list, detail, form, API, hooks, i18n) following Clean Architecture, CDS model patterns, and consistent UI/UX design with bg-gray-100 pages, DataTable integration, and tab standardization. Use when creating new CRM entities like Campaign, Task, or Contract.
---

# Generate CRUD Entity

Generates a complete CRUD entity feature for the CRM, following Clean Architecture, CDS model patterns, and consistent UI/UX design.

## Usage

```
/generate-crud-entity [EntityName] [optional: --with-subgrid] [optional: --b2b|--b2c|--both]
```

**Examples:**
- `/generate-crud-entity Campaign` - Generates Campaign entity
- `/generate-crud-entity Task --with-subgrid` - Generates Task entity with subgrid support
- `/generate-crud-entity Opportunity --b2b` - Generates Opportunity for B2B only

## What This Skill Generates

### 1. Feature Structure (`src/features/[entity]/`)

```
features/[entity]/
├── api/
│   ├── [entity]-api.ts           # Backend API service (axios)
│   └── [entity]-mock-api.ts      # Mock API for development
├── components/
│   ├── [entity]-list.tsx         # List view with DataTable
│   ├── [entity]-detail-tabs.tsx  # Detail view with tabs
│   ├── [entity]-form-tabs.tsx    # Form with tabs (New/Edit)
│   ├── [entity]-card.tsx         # Card component for grids
│   └── [entity]-filters.tsx      # Filter bar component
├── hooks/
│   ├── use-[entity].ts           # TanStack Query hooks (list, get)
│   └── use-[entity]-mutations.ts # TanStack Query mutations (create, update, delete)
├── data/
│   └── mock-[entities].ts        # Mock data for development
└── types/
    └── index.ts                  # TypeScript types (re-export from core/contracts)
```

### 2. App Routes (`src/app/(sales)/[entities]/`)

```
app/(sales)/[entities]/
├── page.tsx              # List view (Server Component)
├── loading.tsx           # Skeleton UI for list
├── new/
│   ├── page.tsx         # New form (Server Component wrapper)
│   └── loading.tsx      # Skeleton UI for form
└── [id]/
    ├── page.tsx         # Detail view (Server Component)
    ├── loading.tsx      # Skeleton UI for detail
    └── edit/
        ├── page.tsx     # Edit form (Server Component wrapper)
        └── loading.tsx  # Skeleton UI for form
```

### 3. i18n Translations

Adds keys to:
- `locales/en/navigation.json` - Navigation labels
- `locales/en/common.json` - Common actions/labels
- Creates `locales/en/[entity].json` - Entity-specific translations
- Same for Spanish (`locales/es/`)

### 4. Core Contracts (if not exists)

- `core/contracts/entities/[entity].ts` - Entity interface
- `core/contracts/enums/[entity]-enums.ts` - Entity enums (if needed)

## Mandatory Patterns to Follow

### Architecture Rules

1. **Server Components by Default**
   - Only add `"use client"` when using hooks or events
   - List page: Server Component
   - Detail page: Server Component
   - Form/Detail tabs: Client Components (need useState, form hooks)

2. **Clean Architecture Layers**
   ```
   app/ → features/[entity]/ → shared/ → core/
   ```
   - No cross-feature imports
   - Shared code in `/shared` only if used by 2+ features
   - Core contracts are single source of truth

3. **API Pattern**
   - Backend API: axios with interceptors
   - Server Components: native fetch with Next.js caching
   - Mock API for development (same interface as backend)

### Styling Patterns (CRITICAL)

1. **Page Backgrounds**: Always `bg-gray-100`
   ```tsx
   <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
   ```

2. **White Cards**: Always `bg-card rounded-lg border shadow-sm`
   ```tsx
   <div className="bg-card rounded-lg border shadow-sm">
   ```

3. **Section Headers**: Always `bg-gray-50`
   ```tsx
   <div className="border-b bg-gray-50">
   ```

4. **Responsive Padding**: Always `p-4 md:p-6`
   ```tsx
   <div className="p-4 md:p-6">
   ```

5. **NO Card Wrapper on Pages**: `*FormTabs` and `*DetailTabs` go directly on page
   ```tsx
   // ✅ CORRECT
   <div className="bg-gray-100">
     <EntityFormTabs /> {/* Component has its own cards */}
   </div>

   // ❌ WRONG
   <div className="bg-gray-100">
     <div className="bg-card"> {/* Don't wrap tabs in card */}
       <EntityFormTabs />
     </div>
   </div>
   ```

### Component Patterns

1. **DataTable Integration**
   ```tsx
   import { DataTable } from "@/shared/components/data-table/data-table"
   import { columns } from "./[entity]-columns"

   <DataTable
     columns={columns}
     data={entities}
     searchKey="name"
     searchPlaceholder="Search entities..."
   />
   ```

2. **Bulk Actions** (Integrated, NOT Fixed Footer)
   ```tsx
   // Renders at top of table when items selected
   {selectedItems.length > 0 && (
     <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b">
       <div className="flex items-center gap-3">
         <Badge variant="secondary">{selectedItems.length}</Badge>
         <span className="text-sm font-medium">{selectedItems.length} selected</span>
       </div>
       <div className="flex gap-2">
         <Button variant="outline" size="sm">Action 1</Button>
         <Button variant="destructive" size="sm">Delete</Button>
       </div>
     </div>
   )}
   ```

3. **Tabs Pattern** (Portal Rendering)
   ```tsx
   import { createPortal } from "react-dom"

   // Tabs render in sticky header via portal
   {typeof window !== 'undefined' && tabsPortalRef.current && createPortal(
     <Tabs value={activeTab} onValueChange={setActiveTab}>
       <TabsList>
         <TabsTrigger value="general">General</TabsTrigger>
         <TabsTrigger value="activities">Activities</TabsTrigger>
       </TabsList>
     </Tabs>,
     tabsPortalRef.current
   )}
   ```

4. **Tab Naming Standards**
   - First tab: ALWAYS "General" (id: `general`)
   - Last tab: ALWAYS "Activities" (id: `activities`)
   - Other tabs: Entity-specific (e.g., "Products", "Quotes")

### TypeScript Patterns

1. **Use Core Contracts**
   ```tsx
   import type { Lead } from "@/core/contracts/entities/lead"
   import { LeadStatus, LeadSource } from "@/core/contracts/enums/lead-enums"

   // ✅ CORRECT: Use existing types
   const lead: Lead = { ... }

   // ❌ WRONG: Don't create new types
   interface MyLead { ... } // NO!
   ```

2. **Enum Pattern**
   ```tsx
   // In core/contracts/enums/[entity]-enums.ts
   export enum EntityStatus {
     Open = 1,
     InProgress = 2,
     Completed = 3,
     Cancelled = 4,
   }

   export const EntityStatusLabels: Record<EntityStatus, string> = {
     [EntityStatus.Open]: 'Open',
     [EntityStatus.InProgress]: 'In Progress',
     [EntityStatus.Completed]: 'Completed',
     [EntityStatus.Cancelled]: 'Cancelled',
   }
   ```

### TanStack Query Patterns

1. **Query Hooks** (`use-[entity].ts`)
   ```tsx
   import { useQuery } from '@tanstack/react-query'
   import { entityApi } from '../api/entity-api'

   export function useEntities() {
     return useQuery({
       queryKey: ['entities'],
       queryFn: entityApi.getAll,
     })
   }

   export function useEntity(id: string) {
     return useQuery({
       queryKey: ['entity', id],
       queryFn: () => entityApi.getById(id),
       enabled: !!id,
     })
   }
   ```

2. **Mutation Hooks** (`use-[entity]-mutations.ts`)
   ```tsx
   import { useMutation, useQueryClient } from '@tanstack/react-query'
   import { entityApi } from '../api/entity-api'

   export function useCreateEntity() {
     const queryClient = useQueryClient()

     return useMutation({
       mutationFn: entityApi.create,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['entities'] })
       },
     })
   }
   ```

### Performance Patterns

1. **Memoization**
   ```tsx
   import { memo, useMemo, useCallback } from 'react'

   // List items
   export const EntityCard = memo(function EntityCard({ entity }: Props) {
     // ...
   })

   // Expensive calculations
   const filteredData = useMemo(() =>
     data.filter(item => item.status === filter),
     [data, filter]
   )

   // Event handlers
   const handleClick = useCallback(() => {
     // ...
   }, [dependency])
   ```

2. **Dynamic Imports**
   ```tsx
   import dynamic from 'next/dynamic'

   const EntityModal = dynamic(() => import('./entity-modal'), {
     loading: () => <Skeleton className="h-96" />
   })
   ```

### Form Patterns

1. **React Hook Form + Zod**
   ```tsx
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import * as z from 'zod'

   const formSchema = z.object({
     name: z.string().min(1, "Name is required"),
     // ...
   })

   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
     defaultValues: entity || { ... }
   })
   ```

2. **Form Layout** (Two-column responsive)
   ```tsx
   <form onSubmit={form.handleSubmit(onSubmit)}>
     <div className="grid gap-6 md:grid-cols-2">
       <FormField ... />
       <FormField ... />
     </div>
   </form>
   ```

### Loading States

1. **Skeleton UI** (`loading.tsx`)
   ```tsx
   import { Skeleton } from "@/components/ui/skeleton"

   export default function Loading() {
     return (
       <div className="flex flex-1 flex-col bg-gray-100">
         <div className="p-4 md:p-6">
           <Skeleton className="h-8 w-48" />
         </div>
         <div className="px-4 pb-4 md:px-6 md:pb-6">
           <Skeleton className="h-96 w-full" />
         </div>
       </div>
     )
   }
   ```

### Error Handling

1. **Error Boundary** (`error.tsx`)
   ```tsx
   'use client'

   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <div className="flex flex-col items-center justify-center p-8">
         <h2 className="text-xl font-semibold">Something went wrong!</h2>
         <Button onClick={reset}>Try again</Button>
       </div>
     )
   }
   ```

## Checklist Before Generation

Before generating a new entity, verify:

- [ ] Entity name follows CDS conventions (singular, PascalCase)
- [ ] Entity doesn't already exist in `src/features/`
- [ ] Core contract doesn't exist in `core/contracts/entities/`
- [ ] Route doesn't conflict with existing routes
- [ ] i18n keys are unique and don't conflict
- [ ] Entity fits within CDS model (Lead, Opportunity, Account, Contact, Quote, Order, Invoice, Product, Activity, etc.)

## Post-Generation Steps

After generating the entity:

1. **Add to Navigation**
   - Update `src/components/sidebar/navigation-data-i18n.tsx`
   - Add icon from `lucide-react`
   - Add to appropriate section (sales, customers, quoteToCash, etc.)

2. **Test the Entity**
   ```bash
   npm run dev
   # Navigate to /[entities]
   # Test: List, Create, Detail, Edit, Delete
   # Test: Filters, Search, Bulk actions
   # Test: Loading states, Error states
   # Test: Mobile responsiveness
   ```

3. **Update Documentation** (if needed)
   - Add entity to `docs/IMPLEMENTATION_STATUS.md`
   - Add entity to `docs/CDS_MODEL.md` (if new CDS entity)

## Example Generation Flow

When user runs `/generate-crud-entity Campaign`:

1. Create `src/features/campaigns/` with all subdirectories
2. Generate API services (backend + mock)
3. Generate components (list, detail, form, card, filters)
4. Generate hooks (queries + mutations)
5. Generate mock data
6. Create page routes with loading/error states
7. Add i18n keys
8. Create core contract (if doesn't exist)
9. Show summary of generated files
10. Provide next steps (add to navigation, test)

## Important Notes

- **NO Card wrappers**: `*FormTabs` and `*DetailTabs` components already have their own card structure
- **Background consistency**: Page = bg-gray-100, Cards = bg-card, Section headers = bg-gray-50
- **Tab names**: First = "General", Last = "Activities"
- **Bulk actions**: Integrated at top (not fixed footer)
- **Server Components**: Default unless hooks/events needed
- **Mock data**: Always generate for development/demo
- **TypeScript**: Strict typing, use core contracts
- **Performance**: React.memo for lists, useMemo for calculations
- **Responsive**: Mobile-first (p-4 md:p-6)
- **Accessibility**: aria-labels, keyboard navigation, screen reader support

---

**Generated entities will be production-ready, following the exact patterns, styles, and architecture of the existing CRM features.**
