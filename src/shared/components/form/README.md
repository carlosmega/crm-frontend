# Form Components - Quick Reference

> Minimalist, beautiful form components for the CRM application

---

## Installation & Usage

### Import Components

```tsx
import {
  FormSection,
  FormFieldGroup,
  IconInput,
  AutoGrowTextarea
} from '@/shared/components/form'
```

---

## Components

### 1. FormSection

Collapsible section container with title and description.

```tsx
<FormSection
  title="Contact Details"
  description="Phone numbers and website"
  collapsible
  defaultOpen={true}
>
  {/* Your form fields */}
</FormSection>
```

**Props:**
- `title`: Section heading (required)
- `description`: Helper text (optional)
- `collapsible`: Enable collapse (default: false)
- `defaultOpen`: Initial state (default: true)

---

### 2. FormFieldGroup

Responsive grid for related fields.

```tsx
<FormFieldGroup columns={2}>
  <FormField name="firstname" ... />
  <FormField name="lastname" ... />
</FormFieldGroup>
```

**Props:**
- `columns`: 1 | 2 | 3 (default: 2)
- Mobile: always 1 column
- Tablet: up to 2 columns
- Desktop: up to 3 columns

---

### 3. IconInput

Input with icon prefix/suffix.

```tsx
import { Mail } from 'lucide-react'

<IconInput
  type="email"
  icon={Mail}
  placeholder="email@example.com"
  className="border-muted focus-visible:ring-1 focus-visible:ring-primary/20"
/>
```

**Common Icons:**
- `Mail` - Email
- `Phone` - Phone
- `Smartphone` - Mobile
- `Globe` - Website
- `Euro` - Currency

---

### 4. AutoGrowTextarea

Textarea that grows with content.

```tsx
<AutoGrowTextarea
  placeholder="Add notes..."
  minRows={3}
  maxRows={10}
  className="border-muted focus-visible:ring-1 focus-visible:ring-primary/20"
/>
```

**Props:**
- `minRows`: Initial height (default: 2)
- `maxRows`: Max height before scroll (optional)

---

## Standard Field Styling

All fields should use consistent classes:

```tsx
// Input fields
className="h-10 border-muted focus-visible:ring-1 focus-visible:ring-primary/20"

// Labels
className="text-xs font-medium text-muted-foreground"

// Error messages
className="text-xs"

// Required indicator
<span className="text-destructive">*</span>
```

---

## Complete Example

```tsx
import { useForm } from 'react-hook-form'
import { FormSection, FormFieldGroup, IconInput, AutoGrowTextarea } from '@/shared/components/form'
import { Mail, Phone } from 'lucide-react'

export function MyForm() {
  return (
    <form className="space-y-8">
      {/* Core fields - no section */}
      <div className="space-y-6">
        <FormFieldGroup columns={2}>
          <FormField name="firstname" ... />
          <FormField name="lastname" ... />
        </FormFieldGroup>

        <FormField
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <IconInput
                  type="email"
                  icon={Mail}
                  className="border-muted focus-visible:ring-1 focus-visible:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Optional section - collapsible */}
      <FormSection
        title="Contact Details"
        description="Additional contact information"
        collapsible
        defaultOpen={false}
      >
        <FormField
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Phone
              </FormLabel>
              <FormControl>
                <IconInput
                  type="tel"
                  icon={Phone}
                  className="border-muted focus-visible:ring-1 focus-visible:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FormSection>

      {/* Notes field */}
      <FormField
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Notes
            </FormLabel>
            <FormControl>
              <AutoGrowTextarea
                placeholder="Add notes..."
                minRows={3}
                maxRows={10}
                className="border-muted focus-visible:ring-1 focus-visible:ring-primary/20"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </form>
  )
}
```

---

## Design Principles

1. **Minimalism**: Less visual weight, more whitespace
2. **Progressive Disclosure**: Hide optional fields by default
3. **Consistency**: Same styling across all forms
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Responsive**: Mobile-first approach

---

## Need More Details?

See `FORM_DESIGN_SYSTEM.md` in project root for:
- Complete design system documentation
- Before/after comparisons
- Accessibility guidelines
- Migration guide
- Reusable patterns
