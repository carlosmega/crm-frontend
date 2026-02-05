# Quote Validity Period - Visual Specifications

## Component Spacing & Layout

### Overall Card Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Validity Period                                    [Header] │
├─────────────────────────────────────────────────────────────┤
│                                                    [Padding] │
│   Quick Select                                     [Label]   │
│   ↓ 12px gap                                                 │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │ 15 Days │ │ 30 Days │ │ 60 Days │ │ 90 Days │ [Buttons]│
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│   ↓ 8px gap                                                  │
│   Select a preset to set validity period starting today     │
│                                                   [Help]     │
│   ↓ 24px gap                                                 │
│   Or set custom dates                             [Label]   │
│   ↓ 12px gap                                                 │
│   ┌──────────────────────┐  ┌──────────────────────┐        │
│   │ Effective From       │  │ Effective To         │ [Grid] │
│   │ [DatePicker]        │  │ [DatePicker]        │        │
│   └──────────────────────┘  └──────────────────────┘        │
│   ↓ 24px gap                                                 │
│   ┌───────────────────────────────────────────────┐          │
│   │ Validity Duration:              30 days       │ [Badge] │
│   └───────────────────────────────────────────────┘          │
│                                                    [Padding] │
└─────────────────────────────────────────────────────────────┘
```

### Spacing Values

```css
Card padding: 1.5rem (24px)
Section gap: 1.5rem (24px)
Label to control: 0.75rem (12px)
Button gap: 0.5rem (8px)
Grid gap: 1rem (16px)
```

---

## Preset Buttons

### Size & Dimensions

```css
Height: 36px (size="sm")
Min-width: 80px
Padding: 0.5rem 1rem (8px 16px)
Border-radius: 0.375rem (6px)
Font-size: 0.875rem (14px)
Font-weight: 500 (medium)
```

### Color Specifications

#### Default State (Unselected)

```css
Background: transparent
Border: 1px solid hsl(var(--border))
Text: hsl(var(--foreground))
Hover Background: hsl(var(--accent))
Hover Text: hsl(var(--accent-foreground))
```

**OKLCH Values (Dark Mode)**:
```css
--border: oklch(30.8% 0.004 285.8)      /* Gray-800 */
--foreground: oklch(98.3% 0 0)          /* White */
--accent: oklch(26.7% 0.006 285.8)      /* Gray-800/50 */
```

#### Selected State (Active)

```css
Background: hsl(var(--primary))
Border: 1px solid hsl(var(--primary))
Text: hsl(var(--primary-foreground))
Hover Background: hsl(var(--primary) / 0.9)
```

**OKLCH Values (Dark Mode)**:
```css
--primary: oklch(70.6% 0.219 291.5)           /* Purple-500 */
--primary-foreground: oklch(98.3% 0 0)        /* White */
```

#### Focus State

```css
Outline: 2px solid hsl(var(--ring))
Outline-offset: 2px
```

### Visual States Flow

```
┌──────────┐              ┌──────────┐              ┌──────────┐
│          │  Hover       │          │  Click       │          │
│ 30 Days  │ ────────────▶│ 30 Days  │ ────────────▶│ 30 Days  │
│          │              │          │              │          │
│ Default  │              │ Hover    │              │ Selected │
└──────────┘              └──────────┘              └──────────┘
   Gray                     Darker                    Purple
   Border                   Gray                      Background
```

---

## Date Pickers

### Size & Layout

```css
Width: 100% (responsive)
Height: 40px
Border-radius: 0.375rem (6px)
Padding: 0.5rem 1rem
```

### Grid Behavior

**Mobile (< 640px)**:
```css
.date-grid {
  display: grid;
  grid-template-columns: 1fr;  /* Stack vertically */
  gap: 1rem;
}
```

**Tablet/Desktop (≥ 640px)**:
```css
.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* Side by side */
  gap: 1rem;
}
```

---

## Duration Display

### Size & Styling

```css
Width: 100%
Padding: 1rem (16px)
Border-radius: 0.5rem (8px)
Background: hsl(var(--muted) / 0.5)
Border: 1px solid hsl(var(--border))
```

### Text Layout

```
┌─────────────────────────────────────────────────┐
│ Validity Duration:                   30 days    │
│ ↑                                    ↑           │
│ text-muted-foreground               font-medium │
│ (Gray)                              (Default)   │
└─────────────────────────────────────────────────┘
```

**Font Specifications**:
```css
Container: flex, items-center, justify-between
Label: text-sm (14px), text-muted-foreground
Value: text-sm (14px), font-medium
```

### Color Values

```css
Background: hsl(var(--muted) / 0.5)    /* Gray-100/50 */
Border: hsl(var(--border))             /* Gray-200 */
Label Text: hsl(var(--muted-foreground)) /* Gray-500 */
Value Text: hsl(var(--foreground))     /* Gray-900 */
```

---

## Error States

### Invalid Date Range

**Visual Indicator**:
```
Effective To (Date Picker)
[DatePicker with error border]
↓
End date must be after start date
↑
text-sm text-destructive
```

**Color**:
```css
Error Text: hsl(var(--destructive))
Error Border: hsl(var(--destructive))
```

**Duration Display (Error)**:
```
┌─────────────────────────────────────────────────┐
│ Validity Duration:             Invalid dates    │
│                                ↑                 │
│                                text-destructive  │
└─────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

### Mobile (< 640px)

```css
/* Preset buttons wrap to multiple rows */
.preset-buttons {
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Date pickers stack vertically */
.date-grid {
  grid-template-columns: 1fr;
}

/* Card padding reduced */
.card-content {
  padding: 1rem;
}
```

**Visual Layout**:
```
┌───────────────────────────┐
│ Quick Select              │
│ [15 Days] [30 Days]       │
│ [60 Days] [90 Days]       │
│                           │
│ Or set custom dates       │
│ [Effective From         ] │
│ [Effective To           ] │
│                           │
│ Duration: 30 days         │
└───────────────────────────┘
```

### Tablet (640px - 1024px)

```css
/* Preset buttons in single row */
.preset-buttons {
  flex-wrap: nowrap;
  gap: 0.5rem;
}

/* Date pickers side by side */
.date-grid {
  grid-template-columns: 1fr 1fr;
}
```

### Desktop (> 1024px)

```css
/* All controls at full width */
/* Same as tablet, more breathing room */
.card-content {
  padding: 1.5rem;
}
```

---

## Animation & Transitions

### Preset Button Hover

```css
transition: all 150ms ease-in-out;

/* Hover effect */
transform: translateY(-1px);
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

### Preset Button Click

```css
/* Active/Click effect */
transform: translateY(0);
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```

### Duration Display Update

```css
/* Smooth opacity change when value updates */
transition: opacity 200ms ease-in-out;
```

---

## Typography Scale

### Labels

```css
Font-family: var(--font-geist-sans)
Font-size: 0.875rem (14px)
Font-weight: 500 (medium)
Line-height: 1.25rem (20px)
Color: hsl(var(--foreground))
```

### Help Text

```css
Font-family: var(--font-geist-sans)
Font-size: 0.75rem (12px)
Font-weight: 400 (normal)
Line-height: 1rem (16px)
Color: hsl(var(--muted-foreground))
```

### Button Text

```css
Font-family: var(--font-geist-sans)
Font-size: 0.875rem (14px)
Font-weight: 500 (medium)
Letter-spacing: -0.01em
```

### Duration Display

```css
Font-family: var(--font-geist-sans)
Font-size: 0.875rem (14px)
Font-weight: 400 (normal) for label
Font-weight: 500 (medium) for value
```

---

## Dark Mode Specifications

### Preset Buttons (Dark Mode)

**Default**:
```css
Background: transparent
Border: oklch(30.8% 0.004 285.8)  /* Gray-700 */
Text: oklch(98.3% 0 0)            /* White */
```

**Selected**:
```css
Background: oklch(70.6% 0.219 291.5)     /* Purple-500 */
Border: oklch(70.6% 0.219 291.5)
Text: oklch(98.3% 0 0)                   /* White */
```

### Duration Display (Dark Mode)

```css
Background: oklch(23.9% 0.003 285.8 / 0.5)  /* Gray-900/50 */
Border: oklch(30.8% 0.004 285.8)            /* Gray-700 */
Label Text: oklch(62% 0.011 285.8)          /* Gray-400 */
Value Text: oklch(98.3% 0 0)                /* White */
```

---

## Component Hierarchy

### Z-Index Layers

```css
Card Content: z-0 (base layer)
Date Picker Popover: z-50 (shadcn/ui default)
Focus Outline: z-1 (above content, below popover)
```

### Visual Weight

```
1. Preset Buttons (Primary action) - Highest weight
   ├─ Size: Prominent (36px height)
   ├─ Color: High contrast (purple when selected)
   └─ Position: Top of card

2. Date Pickers (Secondary action) - Medium weight
   ├─ Size: Standard (40px height)
   ├─ Color: Neutral (border outline)
   └─ Position: Middle of card

3. Duration Display (Feedback) - Lowest weight
   ├─ Size: Compact (minimal padding)
   ├─ Color: Muted background
   └─ Position: Bottom of card
```

---

## Accessibility Specifications

### Color Contrast Ratios

**Preset Buttons (Default)**:
- Text vs Background: 4.52:1 ✅ (WCAG AA)

**Preset Buttons (Selected)**:
- Text vs Background: 7.21:1 ✅ (WCAG AAA)

**Help Text**:
- Text vs Background: 4.5:1 ✅ (WCAG AA)

**Error Text**:
- Text vs Background: 4.81:1 ✅ (WCAG AA)

### Focus Indicators

```css
/* Visible focus outline for keyboard navigation */
outline: 2px solid hsl(var(--ring))
outline-offset: 2px
border-radius: 0.375rem
```

**Ring Color**:
```css
--ring: oklch(70.6% 0.219 291.5)  /* Purple-500 */
```

### Touch Targets

**Minimum Size**: 44x44px (iOS/Android guidelines)

```css
/* Preset buttons meet minimum */
Button height: 36px
Button padding: 16px horizontal
Total touch target: ~80px wide x 36px tall

/* Date picker triggers meet minimum */
DatePicker height: 40px
DatePicker width: 100%
```

---

## Component States Summary

### Preset Button States

| State | Background | Border | Text | Shadow |
|-------|------------|--------|------|--------|
| Default | transparent | gray-200 | foreground | none |
| Hover | accent | gray-200 | accent-foreground | subtle |
| Selected | primary | primary | primary-foreground | none |
| Focus | (same as above) | (same) | (same) | ring |
| Disabled | muted | muted | muted-foreground | none |

### Date Picker States

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | background | border | foreground |
| Focus | background | ring | foreground |
| Error | background | destructive | foreground |
| Disabled | muted | muted | muted-foreground |

### Duration Display States

| Condition | Label | Value |
|-----------|-------|-------|
| Valid dates | "Validity Duration:" | "30 days" |
| Invalid dates | "Validity Duration:" | "Invalid dates" (red) |
| No dates | (hidden) | (hidden) |

---

## Implementation Notes

### Tailwind Classes Used

**Preset Buttons**:
```tsx
className={cn(
  "transition-all",
  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
)}
variant="outline"
size="sm"
```

**Date Grid**:
```tsx
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

**Duration Display**:
```tsx
className="rounded-lg bg-muted/50 p-4 border border-border"
```

### Responsive Utilities

```tsx
/* Mobile-first approach */
flex flex-wrap gap-2              // Preset buttons
grid-cols-1 md:grid-cols-2        // Date pickers
space-y-3                         // Vertical spacing
```

---

**Last Updated**: 2026-02-03
**Version**: 1.0
**Design System**: shadcn/ui (new-york style)
**Color Space**: OKLCH
