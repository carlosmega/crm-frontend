# BPF Quick Reference Card

## Import Statements

```tsx
// Generic BPF Component
import { BusinessProcessFlow, type BPFStageWithFields } from '@/shared/components/business-process-flow'

// Lead-specific BPF
import { LeadBusinessProcessFlow } from '@/features/leads/components/lead-business-process-flow'

// BPF Field Badge
import { BPFFieldBadge } from '@/shared/components/bpf-field-badge'
```

---

## Basic Usage

### 1. Lead Edit Page (with sticky BPF)

```tsx
<Card>
  <CardContent className="pt-6">
    {/* Sticky BPF Header */}
    <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6
                    bg-background/95 backdrop-blur border-b px-6 py-4">
      <LeadBusinessProcessFlow
        lead={lead}
        showStageDetails={true}
      />
    </div>

    {/* Form */}
    <LeadForm lead={lead} onSubmit={handleSubmit} />
  </CardContent>
</Card>
```

### 2. Generic BPF (custom stages)

```tsx
const stages: BPFStageWithFields[] = [
  {
    id: 'qualify',
    name: 'Qualify',
    description: 'Gather budget and contact info',
    status: 'active',
    helpText: 'Complete these fields to qualify...',
    fields: [
      { name: 'budget', label: 'Budget Amount', completed: true, required: true },
      { name: 'timeframe', label: 'Timeframe', completed: false, required: false },
    ],
  },
  // ... more stages
]

<BusinessProcessFlow
  stages={stages}
  onStageClick={(id) => console.log('Clicked:', id)}
  onNextStage={() => console.log('Next stage!')}
  compact={false}
  showStageDetails={true}
/>
```

### 3. BPF Field Badge

```tsx
<FormLabel className="flex items-center">
  Budget Amount
  <BPFFieldBadge stageName="Qualify" />
</FormLabel>
```

---

## Props Reference

### BusinessProcessFlow

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stages` | `BPFStageWithFields[]` | required | Array of stages with field tracking |
| `className` | `string` | - | Additional CSS classes |
| `onStageClick` | `(id: string) => void` | - | Callback when stage clicked |
| `onNextStage` | `() => void` | - | Callback for "Next Stage" button |
| `compact` | `boolean` | `false` | Ultra-compact mode (no details) |
| `showStageDetails` | `boolean` | `true` | Show expandable details panel |

### LeadBusinessProcessFlow

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lead` | `Lead` | - | Lead entity (optional) |
| `className` | `string` | - | Additional CSS classes |
| `compact` | `boolean` | `false` | Compact mode |
| `showStageDetails` | `boolean` | `true` | Show details panel |

### BPFFieldBadge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stageName` | `string` | `"BPF"` | Stage name to display |
| `className` | `string` | - | Additional CSS classes |

---

## Type Definitions

### BPFStage

```tsx
interface BPFStage {
  id: string
  name: string
  description?: string
}
```

### BPFStageStatus

```tsx
type BPFStageStatus = 'completed' | 'active' | 'pending'
```

### BPFStageWithStatus

```tsx
interface BPFStageWithStatus extends BPFStage {
  status: BPFStageStatus
}
```

### BPFStageField

```tsx
interface BPFStageField {
  name: string          // Field identifier
  label: string         // Display label
  completed: boolean    // Is field filled?
  required?: boolean    // Show asterisk?
}
```

### BPFStageWithFields

```tsx
interface BPFStageWithFields extends BPFStageWithStatus {
  fields?: BPFStageField[]
  helpText?: string
}
```

---

## Common Patterns

### Pattern 1: BPF Section in Form

```tsx
<FormSection
  title="Qualification Assessment"
  description="Qualify Stage - Complete these fields..."
  collapsible
  defaultOpen={true}
  className="bg-primary/5 border-l-4 border-l-primary rounded-r-lg pl-4"
>
  <FormField name="budget">
    <FormLabel className="flex items-center">
      Budget Amount
      <BPFFieldBadge stageName="Qualify" />
    </FormLabel>
    {/* Field control */}
  </FormField>
</FormSection>
```

### Pattern 2: Real-Time Field Tracking

```tsx
export function MyBPF({ entity }) {
  // Get form context
  let form: ReturnType<typeof useFormContext> | null = null
  try {
    form = useFormContext()
  } catch {
    // Outside form context
  }

  // Watch field values
  const budget = form?.watch?.('budget') ?? entity?.budget

  // Define stages with dynamic completion
  const stages: BPFStageWithFields[] = [{
    id: 'qualify',
    name: 'Qualify',
    status: 'active',
    fields: [
      {
        name: 'budget',
        label: 'Budget Amount',
        completed: !!budget && Number(budget) > 0,
        required: true,
      },
    ],
  }]

  return <BusinessProcessFlow stages={stages} />
}
```

### Pattern 3: Conditional Alerts

```tsx
// Show alert for qualified leads
if (lead.statecode === LeadStateCode.Qualified) {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <CheckCircle2 className="h-4 w-4 text-primary" />
      <AlertDescription>
        This lead has been qualified and converted to an opportunity.
      </AlertDescription>
    </Alert>
  )
}
```

### Pattern 4: Mobile-Responsive Layout

```tsx
{/* Desktop */}
<div className="hidden md:block">
  {/* Horizontal stage bar */}
</div>

{/* Mobile */}
<div className="md:hidden space-y-3">
  {/* Vertical stage list */}
</div>
```

---

## Styling Utilities

### Stage State Colors

```tsx
// Active
className="bg-primary/10 border-primary text-primary"

// Completed
className="bg-primary border-primary text-primary-foreground"

// Pending
className="bg-muted/50 border-muted-foreground/20 text-muted-foreground"
```

### BPF Section Accent

```tsx
className="bg-primary/5 border-l-4 border-l-primary rounded-r-lg pl-4"
```

### Sticky Header

```tsx
className="sticky top-0 z-10 -mx-6 -mt-6 mb-6
           bg-background/95 backdrop-blur
           supports-[backdrop-filter]:bg-background/60
           border-b px-6 py-4"
```

### Expandable Panel

```tsx
className={cn(
  "grid transition-all duration-200 ease-in-out",
  expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
)}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate through interactive elements |
| `Enter` | Activate button/toggle panel |
| `Space` | Activate button/toggle panel |
| `Escape` | Close tooltips/popovers |

---

## Accessibility Checklist

- [ ] All interactive elements have `role` attribute
- [ ] Stage buttons have descriptive `aria-label`
- [ ] Details panel has `aria-expanded` state
- [ ] Progress bar has `role="progressbar"` with `aria-valuenow`
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Touch targets are minimum 44x44px
- [ ] Screen reader announces state changes

---

## Common Issues & Solutions

### Issue: BPF doesn't update when form fields change

**Solution:** Ensure `LeadBusinessProcessFlow` is rendered inside `<Form>` component so `useFormContext()` works.

```tsx
<Form {...form}>
  <form>
    {/* BPF must be inside form for real-time tracking */}
    <LeadBusinessProcessFlow lead={lead} />
    {/* Form fields */}
  </form>
</Form>
```

### Issue: Sticky positioning not working

**Solution:** Check parent container has scrollable overflow.

```tsx
// Parent must allow scrolling
<div className="overflow-auto">
  <Card>
    <CardContent>
      {/* Sticky BPF */}
      <div className="sticky top-0 ...">
        <LeadBusinessProcessFlow />
      </div>
    </CardContent>
  </Card>
</div>
```

### Issue: Backdrop blur not visible

**Solution:** Some browsers don't support `backdrop-filter`. The CSS includes a fallback:

```tsx
className="bg-background/95 backdrop-blur
           supports-[backdrop-filter]:bg-background/60"
```

### Issue: Mobile layout too cramped

**Solution:** Reduce stage count or use compact mode on mobile.

```tsx
<BusinessProcessFlow
  stages={stages}
  compact={isMobile} // Toggle based on viewport
/>
```

---

## Performance Tips

1. **Memoize stages array** if computed from props:
   ```tsx
   const stages = useMemo(() => getStages(), [lead.statecode])
   ```

2. **Use `compact` mode** for summary views:
   ```tsx
   <BusinessProcessFlow stages={stages} compact={true} />
   ```

3. **Debounce field watches** for expensive operations:
   ```tsx
   const budget = useDebounce(form.watch('budget'), 300)
   ```

4. **Lazy-load details panel** if data is heavy:
   ```tsx
   {showDetails && <DetailsPanel />}
   ```

---

## Testing Examples

### Unit Test (Field Completion)

```tsx
describe('LeadBusinessProcessFlow', () => {
  it('should mark field as completed when value exists', () => {
    const lead = { budgetamount: 50000 }
    const { getByText } = render(<LeadBusinessProcessFlow lead={lead} />)

    // Expand details
    fireEvent.click(getByText('Show Details'))

    // Check field is marked completed
    expect(getByText('Budget Amount')).toHaveClass('text-primary')
  })
})
```

### Integration Test (Form Interaction)

```tsx
it('should update completion as user fills fields', async () => {
  const { getByLabelText, getByText } = render(
    <Form>
      <LeadBusinessProcessFlow lead={lead} />
      <LeadForm lead={lead} />
    </Form>
  )

  // Initially 0%
  expect(getByText('0%')).toBeInTheDocument()

  // Fill budget field
  const budgetInput = getByLabelText('Budget Amount')
  await userEvent.type(budgetInput, '50000')

  // Should update to 20% (1 of 5 fields)
  await waitFor(() => {
    expect(getByText('20%')).toBeInTheDocument()
  })
})
```

---

## Related Files

- `src/shared/components/business-process-flow.tsx` - Generic BPF component
- `src/features/leads/components/lead-business-process-flow.tsx` - Lead-specific implementation
- `src/shared/components/bpf-field-badge.tsx` - Field badge component
- `src/features/leads/components/lead-form.tsx` - Form with BPF integration
- `src/app/(sales)/leads/[id]/edit/page.tsx` - Edit page with sticky BPF

---

**Version:** 1.0.0
**Last Updated:** 2025-10-25
**Maintained By:** CRM Development Team
