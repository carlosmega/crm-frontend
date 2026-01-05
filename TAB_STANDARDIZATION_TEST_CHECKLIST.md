# Tab Standardization - Testing Checklist

## Overview
This checklist ensures all tab implementations across the 8 CRM entities follow consistent naming, structure, and behavior patterns.

---

## Phase 1-2: Detail View Tab Naming (COMPLETED ✅)

### Entities Tested

| Entity | First Tab | Activities Tab | Status |
|--------|-----------|----------------|--------|
| Contacts | ✅ General | ✅ Activities | PASS |
| Leads | ✅ General | ✅ Activities | PASS |
| Opportunities | ✅ General | ✅ Activities | PASS |
| Quotes | ✅ General | ✅ Activities | PASS |
| Orders | ✅ General | ✅ Activities | PASS |
| Invoices | ✅ General | ✅ Activities | PASS |
| Accounts | ✅ General | ✅ Activities | PASS |
| Products | ✅ General | ✅ Activities | PASS |

### Verification Points
- [x] All entities use "General" (not "Summary", "Basic Info", etc.)
- [x] Activities tab is always last
- [x] Activities use ActivityTimeline component (not placeholders)
- [x] Products Activities tab is enabled (was previously disabled)

---

## Phase 3: Form Tab Standardization (COMPLETED ✅)

### Products
**Files Modified:**
- `src/features/products/components/product-form-tabs.tsx` (CREATED)
- `src/features/products/components/product-form.tsx` (MODIFIED - added section filtering)
- `src/app/(sales)/products/[id]/edit/page.tsx` (MODIFIED - container ID)

**Tab Structure:**
- ✅ General (Basic Information + Pricing)
- ✅ Inventory (Stock management)

**Verification:**
- [x] Container ID: `product-tabs-nav-container`
- [x] Portal rendering to sticky header
- [x] Section filtering works (`general` | `inventory` | `all`)
- [x] Conditional rendering based on active tab

### Quotes
**Files Modified:**
- `src/features/quotes/components/quote-form-tabs.tsx` (CREATED)
- `src/features/quotes/components/quote-form.tsx` (MODIFIED - added section filtering)
- `src/app/(sales)/quotes/[id]/edit/page.tsx` (MODIFIED - container ID)

**Tab Structure:**
- ✅ General (Basic Info + Customer Info)
- ✅ Validity (Validity Period dates)

**Verification:**
- [x] Container ID: `quote-tabs-nav-container`
- [x] Portal rendering to sticky header
- [x] Section filtering works (`general` | `validity` | `all`)
- [x] Form fields grouped logically

### Invoices
**Files Modified:**
- `src/app/(sales)/invoices/[id]/edit/page.tsx` (MODIFIED - renamed tabs + container ID)

**Tab Structure:**
- ✅ General (Description + Due Date) - renamed from "Basic Info"
- ✅ Details (Billing Address) - renamed from "Billing Address"

**Verification:**
- [x] Container ID: `invoice-tabs-nav-container`
- [x] Tab IDs updated: `general` | `details` (was `basic` | `billing`)
- [x] Tab labels updated: "General" | "Details"
- [x] Portal rendering to sticky header
- [x] Inline form (no separate component - acceptable)

---

## Phase 4: Complex Entities (COMPLETED ✅)

### Opportunities
**Status:** Already Implemented ✅

**Files Verified:**
- `src/features/opportunities/components/opportunity-form.tsx` (EXISTING - verified structure)
- `src/app/(sales)/opportunities/[id]/edit/page.tsx` (EXISTING - verified usage)

**Tab Structure (BPF Stages):**
- ✅ General (Basic opportunity info)
- ✅ Qualify (Budget, timeframe, needs)
- ✅ Develop (Solution, competitors)
- ✅ Propose (Presentation dates, contacts)
- ✅ Close (Actual values, close status)

**Verification:**
- [x] Container ID: `opportunity-tabs-nav-container`
- [x] Portal rendering to sticky header
- [x] Uses OpportunityTabsNavigation shared component
- [x] BPF stages properly implemented
- [x] Form sections separated correctly

### Accounts Sub-Grids
**Files Created:**
- `src/features/accounts/components/account-contacts-subgrid.tsx` (CREATED)
- `src/features/accounts/components/account-opportunities-subgrid.tsx` (CREATED)

**Files Modified:**
- `src/features/accounts/components/account-detail-tabs.tsx` (MODIFIED - enabled tabs)
- `src/features/accounts/components/index.ts` (MODIFIED - added exports)

**Tab Structure:**
- ✅ General (Contact + Business info)
- ✅ Related Contacts (Sub-grid with filtering)
- ✅ Related Opportunities (Sub-grid with filtering)
- ✅ Activities

**Verification:**
- [x] Contacts tab enabled (was disabled)
- [x] Opportunities tab enabled (was disabled)
- [x] Contacts filtered by `parentcustomerid`
- [x] Opportunities filtered by `customerid` + `customeridtype === 'account'`
- [x] Empty states with "Add First..." buttons
- [x] Loading states with spinners
- [x] Error handling
- [x] "New Contact" / "New Opportunity" buttons in headers

---

## Universal Patterns to Test

### Portal Rendering
**All detail/edit pages should:**
- [ ] Have container element with ID: `{entity}-tabs-nav-container`
- [ ] Use `createPortal` to render tabs navigation
- [ ] Container placed in sticky header section
- [ ] Tabs render correctly on mount
- [ ] Tabs navigation syncs with content

### Tab Naming Convention
**Consistency check:**
- [ ] First tab is always "General" (never "Summary", "Basic", etc.)
- [ ] Related tabs use full name: "Related Contacts", "Related Opportunities"
- [ ] Activities tab always last (except in form views where it's excluded)
- [ ] Tab IDs are lowercase: `general`, `contacts`, `opportunities`, `activities`

### Section Filtering (Forms)
**For entities with form tabs:**
- [ ] Type exported: `{Entity}FormSection = 'section1' | 'section2' | 'all'`
- [ ] Default value: `section = 'all'`
- [ ] Conditional rendering: `showSection1 = section === 'all' || section === 'section1'`
- [ ] Proper wrapping with `{showSection && ( ... )}`

### Styling Consistency
**All tabs should use:**
```tsx
className={cn(
  "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
  "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
  "data-[state=inactive]:text-gray-500 hover:text-gray-900",
  "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
)}
```

---

## Functional Testing

### Navigation Testing
- [ ] Clicking tab changes visible content
- [ ] URL hash updates when tab changes (if implemented)
- [ ] Back button respects tab state (if implemented)
- [ ] Mobile tabs scroll horizontally without breaking

### Data Loading
- [ ] Sub-grids load data on tab activation
- [ ] Loading states show spinners
- [ ] Error states show error messages
- [ ] Empty states show helpful prompts

### Form Validation
- [ ] Form validation works across all tabs
- [ ] Error messages display in correct tab
- [ ] Submit works regardless of active tab
- [ ] Required fields validated properly

### Performance
- [ ] No excessive re-renders when switching tabs
- [ ] Portal rendering doesn't cause layout shift
- [ ] Large lists use virtualization (if implemented)
- [ ] Tab switches feel instant (< 100ms)

---

## Visual Testing

### Desktop (> 768px)
- [ ] Tabs display horizontally
- [ ] Active tab has purple underline
- [ ] Inactive tabs are gray with hover state
- [ ] Tab content has proper spacing
- [ ] Sticky header doesn't overlap content

### Mobile (< 768px)
- [ ] Tabs scroll horizontally
- [ ] Active tab visible after scroll
- [ ] Touch targets are adequate (44px min)
- [ ] Mobile header shows entity name
- [ ] Save button accessible in mobile header

### Dark Mode (if implemented)
- [ ] Tab colors adjust properly
- [ ] Purple accent remains visible
- [ ] Content cards have proper contrast
- [ ] No white flash on tab switch

---

## Browser Compatibility

### Chrome/Edge (Chromium)
- [ ] Tabs render correctly
- [ ] Portal works properly
- [ ] No console errors
- [ ] Smooth animations

### Firefox
- [ ] Tabs render correctly
- [ ] Portal works properly
- [ ] No console errors
- [ ] Smooth animations

### Safari
- [ ] Tabs render correctly
- [ ] Portal works properly
- [ ] No console errors
- [ ] Smooth animations

---

## Regression Testing

### Pre-existing Features
- [ ] Contact creation still works
- [ ] Lead qualification flow works
- [ ] Opportunity BPF stages work
- [ ] Quote line items editable
- [ ] Order fulfillment works
- [ ] Invoice payment marking works
- [ ] Account hierarchy works
- [ ] Product inventory tracking works

### Data Integrity
- [ ] Form submissions save all fields
- [ ] Tab switches don't lose form data
- [ ] Validation errors persist across tabs
- [ ] No data loss on page refresh

---

## Documentation Checklist

- [ ] CLAUDE.md updated with final tab structures
- [ ] Tab naming conventions documented
- [ ] Section filtering pattern documented
- [ ] Portal rendering pattern documented
- [ ] Sub-grid implementation pattern documented
- [ ] Examples for each entity type provided
- [ ] Migration guide for future entities

---

## Sign-off

### Phase 1-2: Detail View Standardization
- [x] Completed by: AI Assistant
- [x] Verified by: Pending user verification
- [x] Status: COMPLETE

### Phase 3: Form Tabs - Simple Entities
- [x] Completed by: AI Assistant
- [x] Verified by: Pending user verification
- [x] Status: COMPLETE

### Phase 4: Form Tabs - Complex Entities
- [x] Completed by: AI Assistant
- [x] Verified by: Pending user verification
- [x] Status: COMPLETE

### Phase 5: Testing & Documentation
- [ ] Completed by: In Progress
- [ ] Verified by: Pending
- [ ] Status: IN PROGRESS

---

## Known Issues / Future Improvements

### Identified During Implementation
1. **Invoice form structure**: Uses inline form instead of separate component (acceptable but different pattern)
2. **Quote/Order edit pages**: Have custom tab structure at page level (Quote Details | Products)
3. **Products edit page**: Has three-tab custom implementation (Basic | Pricing | Inventory)

### Recommendations
1. Consider creating `invoice-form.tsx` component for consistency
2. Evaluate if Quote/Order page-level tabs should be refactored to match pattern
3. Monitor performance of sub-grids with large datasets (100+ records)
4. Consider lazy-loading sub-grid data only when tab is activated

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Status**: Testing & Documentation Phase
