# DataTable Component Structure

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  DataTableToolbar (optional, shows when rows selected)              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ [3]  3 of 10 rows selected  [Clear] │ [Export] [Assign] [🗑️]│  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DataTable                                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ [☑] Name            Company      Status    Value    Actions  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ [☑] John Doe        Acme Corp    ● Open    €50,000  [👁️][✏️]│   │
│  │ [☐] Jane Smith      Tech Inc     ● Hot     €75,000  [👁️][✏️]│   │
│  │ [☑] Bob Johnson     StartupCo    ● Warm    €25,000  [👁️][✏️]│   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DataTablePagination                                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Rows per page [20 ▼]  Showing 1 to 20 of 150 │ Page 1 of 8  │  │
│  │                                   [⏮️][◀️][▶️][⏭️]              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Tree

```
DataTable System
│
├── DataTable (Main Component)
│   ├── Table
│   │   ├── TableHeader
│   │   │   └── TableRow
│   │   │       ├── TableHead (Select All Checkbox)
│   │   │       │   └── Checkbox
│   │   │       └── TableHead (for each column)
│   │   │           ├── Column Header Text
│   │   │           └── Sort Icon (if sortable)
│   │   │
│   │   └── TableBody
│   │       └── TableRow (for each data row)
│   │           ├── TableCell (Selection Checkbox)
│   │           │   └── Checkbox
│   │           └── TableCell (for each column)
│   │               └── Custom Cell Content
│   │
│   ├── Loading State (when loading=true)
│   │   └── Skeleton Rows
│   │       └── Skeleton Cells
│   │
│   └── Empty State (when data.length=0)
│       └── Custom Empty Message
│
├── DataTableToolbar (Bulk Actions)
│   ├── Selection Info
│   │   ├── Count Badge
│   │   ├── Selection Text
│   │   └── Clear Button
│   │
│   └── Bulk Actions
│       └── Button (for each action)
│           ├── Icon
│           └── Label
│
└── DataTablePagination
    ├── Page Size Selector
    │   └── Select Dropdown
    │
    ├── Results Info
    │   └── "Showing X to Y of Z results"
    │
    └── Navigation Controls
        ├── First Page Button
        ├── Previous Page Button
        ├── Next Page Button
        └── Last Page Button
```

## State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Parent Component                         │
│                       (e.g., LeadsPage)                         │
│                                                                 │
│  State:                                                         │
│  - data: Lead[]                                                 │
│  - selectedIds: string[]                                        │
│  - page: number                                                 │
│  - pageSize: number                                             │
│  - loading: boolean                                             │
│                                                                 │
│  Handlers:                                                      │
│  - handleSelectionChange(ids: string[])                         │
│  - handlePageChange(page: number)                               │
│  - handleBulkDelete(ids: string[])                              │
│  - handleBulkExport(ids: string[])                              │
└─────────────────────────────────────────────────────────────────┘
        │                     │                      │
        │                     │                      │
        ▼                     ▼                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ DataTable    │    │ DataTable    │    │ DataTable    │
│ Toolbar      │    │              │    │ Pagination   │
│              │    │              │    │              │
│ Props:       │    │ Props:       │    │ Props:       │
│ - selected   │◄───┤ - data       │    │ - page       │
│ - total      │    │ - columns    │    │ - pageSize   │
│ - onClear    │    │ - selected   │───►│ - total      │
│ - actions    │    │ - onChange   │    │ - onChange   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Data Flow: Row Selection

```
User clicks checkbox
       │
       ▼
TableCell handles click
       │
       ▼
Calls onCheckedChange(boolean)
       │
       ▼
DataTable.handleSelectRow(rowId, checked)
       │
       ├─ If checked: Add to selectedRows array
       └─ If unchecked: Remove from selectedRows array
       │
       ▼
Calls onSelectionChange(newSelectedRows)
       │
       ▼
Parent component updates state
       │
       ▼
DataTable re-renders with updated selection
       │
       ├─ Rows with matching IDs get data-state="selected"
       └─ Toolbar appears/updates with new count
```

## Data Flow: Column Sorting

```
User clicks sortable column header
       │
       ▼
TableHead handles click event
       │
       ▼
Calls handleSort(columnId)
       │
       ▼
Updates sortConfig state:
  - Not sorted → ASC
  - ASC → DESC
  - DESC → None
       │
       ▼
useMemo recomputes sortedData:
  1. Get column definition
  2. Use custom sortFn if provided
  3. Otherwise use accessorFn values
  4. Apply type-aware comparison
  5. Apply direction (asc/desc)
       │
       ▼
Table re-renders with sorted data
       │
       └─ Sort icon updates in header
```

## Data Flow: Bulk Actions

```
User selects multiple rows
       │
       ▼
DataTableToolbar shows with count
       │
       ▼
User clicks bulk action button (e.g., Delete)
       │
       ▼
handleAction(action) called
       │
       ├─ If destructive: Show confirmation
       │  └─ User cancels → Exit
       │
       ▼
setLoadingAction(actionId) → Button shows spinner
       │
       ▼
action.onClick(selectedIds) executes
       │
       ├─ Success
       │  ├─ Clear selection
       │  ├─ Refetch data
       │  └─ setLoadingAction(null)
       │
       └─ Error
          ├─ Log error
          ├─ Show alert
          └─ setLoadingAction(null)
```

## Styling Classes

### DataTable
```
Container:        rounded-md border
Table:            w-full caption-bottom text-sm
Header Row:       [&_tr]:border-b
Body Row:         hover:bg-muted/50 data-[state=selected]:bg-muted
                  border-b transition-colors
Head Cell:        h-10 px-2 text-left align-middle font-medium
Data Cell:        p-2 align-middle
Sortable Header:  cursor-pointer select-none hover:bg-muted/50
```

### DataTableToolbar
```
Container:        rounded-md border bg-muted/50 p-3
                  animate-in fade-in-0 slide-in-from-top-1
Count Badge:      size-7 rounded-full bg-primary/10
                  text-xs font-semibold text-primary
Clear Button:     h-7 px-2 text-xs
Action Buttons:   h-8 (size-sm)
```

### DataTablePagination
```
Container:        flex items-center justify-between gap-4 px-2 py-4
Page Size:        w-[70px] h-8
Info Text:        text-sm text-muted-foreground
Nav Buttons:      variant-outline size-icon-sm
```

## Responsive Breakpoints

```
Mobile (< 640px):
- Toolbar: vertical stack
- Pagination: vertical stack
- Table: horizontal scroll

Tablet (640px - 1024px):
- Toolbar: horizontal layout
- Pagination: horizontal layout
- Table: full width with proper spacing

Desktop (> 1024px):
- All elements: horizontal layout
- Optimal spacing and sizing
```

## Color Tokens Used

```
Background:
- bg-background         (main background)
- bg-muted             (selected rows)
- bg-muted/50          (hover states)
- bg-primary/10        (count badge)
- bg-primary           (checkboxes, primary buttons)

Text:
- text-foreground      (main text)
- text-muted-foreground (secondary text)
- text-primary         (primary actions)
- text-primary-foreground (text on primary bg)

Borders:
- border               (default border color)
- border-primary       (checkbox border)

States:
- hover:bg-accent
- focus-visible:ring-ring
- data-[state=selected]:bg-muted
```

## Accessibility Attributes

### DataTable
```html
<table>
  <thead>
    <tr>
      <th>
        <Checkbox
          aria-label="Select all rows"
          role="checkbox"
          aria-checked={allSelected}
        />
      </th>
      <th
        role="columnheader"
        aria-sort={sortConfig ? "ascending" : "descending"}
      >
        Column Name
      </th>
    </tr>
  </thead>
  <tbody>
    <tr data-state={isSelected ? "selected" : undefined}>
      <td>
        <Checkbox
          aria-label="Select row {id}"
          role="checkbox"
          aria-checked={isSelected}
        />
      </td>
      <td role="cell">Data</td>
    </tr>
  </tbody>
</table>
```

### DataTableToolbar
```html
<div role="toolbar" aria-label="Bulk actions">
  <Button aria-label="Clear selection">Clear</Button>
  <Button aria-label="Delete selected items">Delete</Button>
</div>
```

### DataTablePagination
```html
<nav role="navigation" aria-label="Pagination">
  <Button
    aria-label="Go to first page"
    disabled={!canGoPrevious}
  />
  <Button
    aria-label="Go to previous page"
    disabled={!canGoPrevious}
  />
  <span aria-current="page">Page {current} of {total}</span>
  <Button
    aria-label="Go to next page"
    disabled={!canGoNext}
  />
  <Button
    aria-label="Go to last page"
    disabled={!canGoNext}
  />
</nav>
```

## Event Handlers

### User Actions
```
Click checkbox       → handleSelectRow(rowId, checked)
Click header checkbox → handleSelectAll(checked)
Click column header  → handleSort(columnId)
Click bulk action    → handleAction(action)
Click clear button   → onClearSelection()
Click page button    → onPageChange(page)
Change page size     → onPageSizeChange(size)
Click row            → onRowClick(row) [optional]
```

### Component Events
```
onSelectionChange    → (selectedIds: string[]) => void
onPageChange         → (page: number) => void
onPageSizeChange     → (size: number) => void
onRowClick           → (row: TData) => void
action.onClick       → (selectedIds: string[]) => void | Promise<void>
```

## Performance Optimizations

```typescript
// Memoized sorting
const sortedData = React.useMemo(() => {
  // Expensive sorting operation
  return sortData(data, sortConfig)
}, [data, sortConfig])

// Memoized callbacks
const handleSort = React.useCallback((columnId: string) => {
  setSortConfig(/* ... */)
}, [])

const handleSelectAll = React.useCallback((checked: boolean) => {
  onSelectionChange?.(checked ? allIds : [])
}, [sortedData, onSelectionChange])

// Event delegation
<div onClick={(e) => e.stopPropagation()}>
  {/* Prevent row click when clicking actions */}
</div>
```

## File Size Summary

```
checkbox.tsx               ~30 lines   (shadcn/ui component)
data-table.tsx            ~330 lines   (main table component)
data-table-toolbar.tsx    ~140 lines   (bulk actions toolbar)
data-table-pagination.tsx ~170 lines   (pagination controls)
index.ts                   ~15 lines   (barrel export)
README.md                 ~500 lines   (documentation)
COMPONENT_STRUCTURE.md    ~400 lines   (this file)

Total: ~1,585 lines
```

---

This structure provides a scalable, maintainable foundation for all data tables in the CRM application.
