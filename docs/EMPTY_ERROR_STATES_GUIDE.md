# Empty & Error States Design Guide

## Overview

This guide documents the enhanced empty and error state components for the CRM application. These components provide a professional, user-friendly experience when data is unavailable or errors occur.

---

## Enhanced Components

### 1. ErrorState Component

**Location:** `src/shared/components/error-state.tsx`

The ErrorState component now includes:

- **Error code badges** - Display technical error codes for debugging
- **Animated gradient backgrounds** - Subtle pulse animation for visual interest
- **Contextual icons** - Different icons for different error types
- **Help action section** - Quick links to dashboard, help center, and support
- **Secondary actions** - Additional navigation options
- **Responsive design** - Optimized for mobile, tablet, and desktop

#### New Features

1. **Error Code Display**
   ```tsx
   <ErrorState
     title="Connection Failed"
     message="Unable to connect to server"
     errorCode="ERR_NETWORK"
   />
   ```

2. **Help Actions**
   ```tsx
   <ErrorState
     title="Server Error"
     message="An unexpected error occurred"
     showHelpActions={true}
   />
   ```
   This displays:
   - Go to Dashboard
   - Help Center
   - Contact Support

3. **Secondary Actions**
   ```tsx
   <ErrorState
     title="Failed to Load"
     message="Unable to retrieve data"
     onRetry={refetch}
     secondaryAction={{
       label: 'Go to Dashboard',
       href: '/dashboard'
     }}
   />
   ```

#### Usage Examples

**Network Error (Full Page)**
```tsx
<ErrorState
  title="Connection Problem"
  message="Unable to connect to the server. Please check your network connection."
  icon={WifiOff}
  errorCode="ERR_NETWORK"
  onRetry={() => refetch()}
  variant="full"
  secondaryAction={{
    label: 'Go to Dashboard',
    href: '/dashboard'
  }}
/>
```

**Authentication Error**
```tsx
<ErrorState
  title="Authentication Required"
  message="Your session has expired. Please log in again."
  icon={Lock}
  errorCode="ERR_AUTH"
  showHelpActions={true}
  variant="full"
/>
```

**Inline Error**
```tsx
<ErrorState
  title="Save Failed"
  message="Unable to save your changes"
  onRetry={handleSave}
  errorCode="ERR_SAVE"
  variant="inline"
/>
```

---

### 2. EmptyState Component

**Location:** `src/shared/components/empty-state.tsx`

The EmptyState component now includes:

- **Getting Started badges** - Visual indicators for first-time users
- **Multi-layer gradients** - Enhanced depth and visual appeal
- **Custom action icons** - Specify icons for primary and secondary actions
- **Suggestions list** - Quick tips to guide users
- **Enhanced help text** - Additional context and tips
- **Responsive sizing** - Adaptive text and spacing

#### New Features

1. **Badge Display**
   ```tsx
   <EmptyState
     icon={UserPlus}
     title="No leads yet"
     description="Start your sales pipeline"
     badge="Getting Started"
   />
   ```

2. **Suggestions List**
   ```tsx
   <EmptyState
     icon={UserPlus}
     title="No leads yet"
     description="Start your sales pipeline"
     suggestions={[
       'Import from CSV files',
       'Add manually from meetings',
       'Connect to marketing tools'
     ]}
   />
   ```

3. **Custom Action Icons**
   ```tsx
   <EmptyState
     icon={Filter}
     title="No results"
     description="Try adjusting filters"
     action={{
       label: 'Create New',
       href: '/leads/new',
       icon: UserPlus
     }}
     secondaryAction={{
       label: 'Clear Filters',
       onClick: clearFilters,
       icon: Filter
     }}
   />
   ```

#### Usage Examples

**First-Time User (Onboarding)**
```tsx
<EmptyState
  icon={UserPlus}
  title="No leads yet"
  description="Start building your sales pipeline by adding your first lead. Leads represent potential customers and are the first step in the sales process."
  action={{
    href: '/leads/new',
    label: 'Create Your First Lead',
    icon: UserPlus
  }}
  badge="Getting Started"
  suggestions={[
    'Import leads from CSV or Excel files',
    'Capture leads from web forms and landing pages',
    'Add leads manually from business cards or meetings',
    'Connect with marketing automation tools',
  ]}
  helpText="Pro tip: Leads with complete contact information convert 3x faster."
  size="large"
/>
```

**Filtered Results (No Matches)**
```tsx
<EmptyState
  icon={Filter}
  title="No leads match your filters"
  description="Try adjusting your search criteria or filters to find what you're looking for."
  action={{
    href: '/leads/new',
    label: 'Create New Lead',
    icon: UserPlus
  }}
  secondaryAction={{
    label: 'Clear All Filters',
    onClick: () => clearFilters(),
    icon: Filter
  }}
  suggestions={[
    'Broaden your search by removing some filters',
    'Check for typos in your search query',
    'Try searching by company name instead of contact name',
  ]}
  size="default"
/>
```

**Simple Empty State**
```tsx
<EmptyState
  icon={Package}
  title="No quotes found"
  description="Get started by creating your first quote"
  action={{
    label: "New Quote",
    href: "/quotes/new"
  }}
  size="default"
/>
```

---

## Implementation in Leads Page

### Error Handling (leads-client.tsx)

The leads page now has intelligent error detection:

```tsx
// Determine error type and customize message
const isNetworkError = error.toLowerCase().includes('network')
const isAuthError = error.toLowerCase().includes('auth')
const isServerError = error.toLowerCase().includes('500')

// Customize message based on error type
if (isNetworkError) {
  errorTitle = 'Connection Problem'
  errorIcon = WifiOff
  errorCode = 'ERR_NETWORK'
} else if (isAuthError) {
  errorTitle = 'Authentication Required'
  errorCode = 'ERR_AUTH'
}

// Display enhanced error state
<ErrorState
  title={errorTitle}
  message={errorMessage}
  icon={errorIcon}
  errorCode={errorCode}
  onRetry={refetch}
  showHelpActions={!isNetworkError}
  secondaryAction={{
    label: 'Go to Dashboard',
    href: '/dashboard'
  }}
/>
```

### Empty State Context (lead-list.tsx)

The leads list intelligently differentiates between:

1. **First-time empty** - No leads exist, show onboarding
2. **Filtered empty** - Leads exist but filters exclude them

```tsx
const emptyState = useMemo(() => {
  // No leads at all (first time)
  if (!hasLoadedData || (leads.length === 0 && !hasActiveFilters)) {
    return <EmptyState ... badge="Getting Started" suggestions={...} />
  }

  // No results with active filters
  return <EmptyState ... secondaryAction={{ label: 'Clear Filters' }} />
}, [hasLoadedData, leads.length, hasActiveFilters])
```

---

## Visual Enhancements

### 1. Gradient Backgrounds

Both components use multi-layer gradient blurs for depth:

```tsx
{/* Multi-layer gradient blur for depth */}
<div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-150" />
<div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-125" />
```

### 2. Animated Elements

Error states include subtle pulse animation:

```tsx
<div className="absolute inset-0 rounded-full bg-destructive/20 blur-3xl animate-pulse" />
```

### 3. Badge Styling

Badges use OKLCH color space for consistent appearance:

```tsx
<Badge
  variant="outline"
  className="mb-4 bg-primary/5 border-primary/20 text-primary gap-1.5"
>
  <Sparkles className="h-3 w-3" />
  {badge}
</Badge>
```

---

## Accessibility Features

All components meet WCAG 2.1 AA standards:

1. **Keyboard Navigation** - All buttons and links are keyboard accessible
2. **Screen Reader Support** - Semantic HTML and ARIA labels
3. **Color Contrast** - Meets 4.5:1 minimum ratio
4. **Focus Indicators** - Clear visible focus states
5. **Responsive Text** - Scales appropriately on all devices

---

## Color Tokens Used

Components use the project's OKLCH color system:

- `bg-background` - Page background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-primary` - Action buttons
- `bg-destructive` - Error indicators
- `border-border` - Borders and dividers

---

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Full-width buttons
- Reduced padding
- Smaller icon sizes

### Tablet (640-1024px)
- Responsive button groups
- Adaptive text sizes
- Balanced spacing

### Desktop (> 1024px)
- Centered max-width content
- Larger icons and text
- Horizontal button layout
- Generous whitespace

---

## Best Practices

### When to Use ErrorState

1. **Network failures** - Connection issues, timeouts
2. **Authentication errors** - Session expired, unauthorized
3. **Server errors** - 500 errors, API failures
4. **Data loading failures** - Failed to fetch data

### When to Use EmptyState

1. **First-time users** - No data created yet (use `badge="Getting Started"`)
2. **Filtered results** - No matches for current filters (include `secondaryAction` to clear filters)
3. **Deleted items** - All items removed (suggest creating new)
4. **Search results** - No matches found (provide search tips)

### Component Selection Guide

| Scenario | Component | Variant | Features |
|----------|-----------|---------|----------|
| Network error | ErrorState | full | errorCode, retry, secondary action |
| Auth error | ErrorState | full | showHelpActions, errorCode |
| Save failed | ErrorState | inline | retry button |
| No data (first time) | EmptyState | large | badge, suggestions, helpText |
| No filter results | EmptyState | default | secondaryAction (clear filters) |
| Deleted all | EmptyState | default | action (create new) |

---

## Testing Recommendations

1. **Test all error types** - Network, auth, server, unknown
2. **Test empty states** - First-time, filtered, deleted
3. **Test responsive behavior** - Mobile, tablet, desktop
4. **Test keyboard navigation** - Tab through all interactive elements
5. **Test screen readers** - Verify ARIA labels and semantic HTML
6. **Test dark mode** - Ensure colors work in both themes

---

## Future Enhancements

Potential improvements for future iterations:

1. **Illustration system** - Custom SVG illustrations for each state
2. **Animation library** - Micro-interactions and transitions
3. **Contextual help** - Inline help popovers
4. **Error tracking** - Automatic error logging to monitoring service
5. **A/B testing** - Test different messaging and CTAs
6. **Localization** - Multi-language support
7. **Analytics** - Track error rates and user actions

---

## Questions or Issues?

For questions about these components or to report issues:

1. Check this documentation first
2. Review component source code and comments
3. Test with different props and scenarios
4. Consult with the UX/UI team for design decisions
5. File an issue in the project repository

---

**Last Updated:** 2025-12-22
**Maintained By:** CRM Development Team
