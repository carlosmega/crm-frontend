# DataTable Component System

A comprehensive, reusable data table system for building professional CRM interfaces with Next.js 16, React 19, and shadcn/ui.

## Features

- **Row Selection**: Checkbox-based selection with select-all functionality
- **Column Sorting**: Click headers to sort ascending/descending with visual indicators
- **Loading States**: Skeleton loaders for better UX during data fetching
- **Empty States**: Customizable empty state messaging
- **Bulk Actions**: Toolbar with configurable bulk operations (delete, export, assign, etc.)
- **Pagination**: Full pagination controls with customizable page sizes
- **Responsive Design**: Mobile-friendly with proper breakpoints
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Type Safety**: Full TypeScript support with generics
- **Performance**: Memoized sorting and optimized re-renders

## Components

### 1. DataTable

Main table component with sorting and selection capabilities.

```tsx
import { DataTable, DataTableColumn } from '@/shared/components/data-table'

const columns: DataTableColumn<Lead>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (lead) => lead.fullname,
    sortable: true,
    cell: (lead) => <Link href={`/leads/${lead.leadid}`}>{lead.fullname}</Link>,
  },
  {
    id: 'value',
    header: 'Est. Value',
    accessorFn: (lead) => lead.estimatedvalue,
    sortable: true,
    className: 'text-right',
  },
]

<DataTable
  data={leads}
  columns={columns}
  getRowId={(lead) => lead.leadid}
  enableRowSelection
  selectedRows={selected}
  onSelectionChange={setSelected}
  loading={isLoading}
  defaultSort={{ columnId: 'name', direction: 'asc' }}
/>
```

### 2. DataTableToolbar

Toolbar for displaying selection count and bulk actions.

```tsx
import { DataTableToolbar, BulkAction } from '@/shared/components/data-table'

const bulkActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    onClick: handleBulkDelete,
    variant: 'destructive',
    destructive: true,
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: handleBulkExport,
    variant: 'outline',
  },
]

<DataTableToolbar
  selectedCount={selected.length}
  totalCount={data.length}
  selectedIds={selected}
  onClearSelection={() => setSelected([])}
  bulkActions={bulkActions}
/>
```

### 3. DataTablePagination

Pagination controls with page size selector.

```tsx
import { DataTablePagination } from '@/shared/components/data-table'

<DataTablePagination
  currentPage={page}
  totalPages={Math.ceil(total / pageSize)}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 20, 30, 50]}
/>
```

## Complete Example

Here's a full example integrating all components:

```tsx
"use client"

import { useState } from 'react'
import {
  DataTable,
  DataTableColumn,
  DataTableToolbar,
  DataTablePagination,
  BulkAction,
} from '@/shared/components/data-table'
import { Trash2, Download, UserPlus } from 'lucide-react'

interface Lead {
  leadid: string
  fullname: string
  companyname: string
  estimatedvalue: number
  // ... other fields
}

export function LeadsTable() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Fetch data
  const { data, loading, total } = useLeads({ page, pageSize })

  // Column definitions
  const columns: DataTableColumn<Lead>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (lead) => lead.fullname,
      sortable: true,
      cell: (lead) => (
        <Link href={`/leads/${lead.leadid}`} className="font-medium hover:underline">
          {lead.fullname}
        </Link>
      ),
    },
    {
      id: 'company',
      header: 'Company',
      accessorFn: (lead) => lead.companyname,
      sortable: true,
    },
    {
      id: 'value',
      header: 'Est. Value',
      accessorFn: (lead) => lead.estimatedvalue,
      sortable: true,
      className: 'text-right',
      cell: (lead) => formatCurrency(lead.estimatedvalue),
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: handleBulkExport,
      variant: 'outline',
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: UserPlus,
      onClick: handleBulkAssign,
      variant: 'outline',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: handleBulkDelete,
      variant: 'destructive',
      destructive: true,
      confirmMessage: 'Are you sure you want to delete the selected leads?',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      <DataTableToolbar
        selectedCount={selectedLeads.length}
        totalCount={data.length}
        selectedIds={selectedLeads}
        onClearSelection={() => setSelectedLeads([])}
        bulkActions={bulkActions}
      />

      {/* Data Table */}
      <DataTable
        data={data}
        columns={columns}
        getRowId={(lead) => lead.leadid}
        enableRowSelection
        selectedRows={selectedLeads}
        onSelectionChange={setSelectedLeads}
        loading={loading}
        defaultSort={{ columnId: 'name', direction: 'asc' }}
      />

      {/* Pagination */}
      <DataTablePagination
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
```

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | Required | Array of data to display |
| `columns` | `DataTableColumn<TData>[]` | Required | Column definitions |
| `getRowId` | `(row: TData) => string` | Required | Function to get unique row ID |
| `enableRowSelection` | `boolean` | `false` | Enable checkbox selection |
| `selectedRows` | `string[]` | `[]` | Array of selected row IDs |
| `onSelectionChange` | `(ids: string[]) => void` | - | Selection change callback |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingRows` | `number` | `5` | Number of skeleton rows |
| `emptyState` | `ReactNode` | Default | Custom empty state |
| `onRowClick` | `(row: TData) => void` | - | Row click handler |
| `getRowClassName` | `(row: TData) => string` | - | Custom row classes |
| `defaultSort` | `{ columnId: string, direction: 'asc' \| 'desc' }` | `null` | Initial sort |

### DataTableColumn Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique column identifier |
| `header` | `string` | Yes | Column header text |
| `accessorFn` | `(row: TData) => any` | No | Value accessor for sorting |
| `cell` | `(row: TData) => ReactNode` | No | Custom cell renderer |
| `sortable` | `boolean` | No | Enable sorting |
| `sortFn` | `(a: TData, b: TData) => number` | No | Custom sort function |
| `className` | `string` | No | Cell CSS classes |
| `headerClassName` | `string` | No | Header CSS classes |

### BulkAction Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique action identifier |
| `label` | `string` | Yes | Action button label |
| `icon` | `LucideIcon` | No | Icon component |
| `onClick` | `(ids: string[]) => void \| Promise<void>` | Yes | Action handler |
| `variant` | `ButtonVariant` | No | Button variant |
| `destructive` | `boolean` | No | Show confirmation |
| `confirmMessage` | `string` | No | Custom confirmation |

### DataTablePagination Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | Yes | Current page (1-indexed) |
| `totalPages` | `number` | Yes | Total number of pages |
| `pageSize` | `number` | Yes | Items per page |
| `totalItems` | `number` | Yes | Total item count |
| `onPageChange` | `(page: number) => void` | Yes | Page change callback |
| `onPageSizeChange` | `(size: number) => void` | Yes | Page size callback |
| `pageSizeOptions` | `number[]` | No | Available page sizes |
| `disabled` | `boolean` | No | Disable controls |
| `showPageSize` | `boolean` | `true` | Show size selector |
| `showTotal` | `boolean` | `true` | Show total count |

## Sorting Behavior

The DataTable component supports intelligent sorting for different data types:

- **Strings**: Case-insensitive alphabetical sorting
- **Numbers**: Numeric comparison
- **Dates**: Chronological sorting
- **Null/Undefined**: Always sorted to the end

You can provide custom sort functions for complex sorting logic:

```tsx
{
  id: 'status',
  header: 'Status',
  sortable: true,
  sortFn: (a, b) => {
    const order = { open: 1, qualified: 2, disqualified: 3 }
    return order[a.statecode] - order[b.statecode]
  },
}
```

## Selection Behavior

- Click checkbox to select/deselect individual rows
- Click header checkbox to select/deselect all visible rows
- Selected rows maintain state across sorting
- Visual feedback with highlighted background
- Selection count displayed in toolbar
- Clear selection button removes all selections

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **ARIA Labels**: Proper labels for screen readers
- **Focus Indicators**: Clear focus states for all controls
- **Semantic HTML**: Proper table structure with thead/tbody
- **Color Contrast**: WCAG AA compliant color ratios
- **Role Attributes**: Proper roles for checkboxes and buttons

### Keyboard Shortcuts

- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Space`: Toggle checkbox selection
- `Enter`: Activate button/link
- `Escape`: Close confirmations

## Performance Considerations

- **Memoization**: Sorted data is memoized to prevent unnecessary recalculations
- **Lazy Rendering**: Only visible rows are rendered
- **Event Delegation**: Efficient event handling for large datasets
- **Debounced Actions**: Bulk actions are debounced to prevent race conditions

## Styling

The components use Tailwind CSS v4 and inherit from your shadcn/ui theme:

- Uses semantic color tokens (`bg-background`, `text-foreground`, etc.)
- Supports dark mode via `.dark` class
- Responsive breakpoints (`sm:`, `md:`, `lg:`)
- Consistent spacing scale (`space-y-4`, `gap-6`, `p-4`)

### Customization

You can customize styles using className props:

```tsx
<DataTable
  columns={[
    {
      id: 'name',
      header: 'Name',
      className: 'font-bold text-primary',
      headerClassName: 'bg-muted',
    },
  ]}
/>
```

## Architecture Compliance

These components follow the project's clean architecture:

- **Location**: `/shared/components/data-table/` (used by 2+ features)
- **Dependencies**: Only imports from `@/components/ui` and `@/lib/utils`
- **Type Safety**: Full TypeScript generics for type safety
- **Reusability**: Generic components work with any entity type
- **Separation of Concerns**: Data fetching is external, components only handle presentation

## Migration Guide

### From Old LeadList to DataTable

**Before:**
```tsx
<LeadList leads={leads} onDelete={handleDelete} />
```

**After:**
```tsx
<DataTable
  data={leads}
  columns={leadColumns}
  getRowId={(lead) => lead.leadid}
  enableRowSelection
  selectedRows={selected}
  onSelectionChange={setSelected}
/>
```

## Future Enhancements

Potential improvements for future iterations:

- Column resizing and reordering
- Advanced filtering UI
- Column visibility toggle
- CSV export built-in
- Virtual scrolling for large datasets
- Saved views and preferences
- Multi-column sorting
- Inline editing
- Expandable rows

## Support

For questions or issues with the DataTable components, please:

1. Check this documentation
2. Review the example implementation in `/features/leads/components/lead-list.tsx`
3. Consult the project's CLAUDE.md for architecture guidelines

---

**Created**: 2025-10-24
**Version**: 1.0.0
**License**: MIT
