# Business Process Flow - Visual Design Guide

## Component Anatomy

### 1. Stage Bar (Horizontal Layout)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌───────────┐ ── ┌───────────┐ ── ┌───────────┐ ── ┌───────────┐  │
│  │ ✓ Qualify │    │ ● Develop │    │ ○ Propose │    │ ○ Close   │  │
│  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │
│   Completed        Active           Pending          Pending         │
│                                                                       │
│                     [Hide Details ▼]  [Next Stage →]                 │
└─────────────────────────────────────────────────────────────────────┘
```

**Visual States:**
- **Completed:** ✓ Green filled, solid border
- **Active:** ● Primary color, subtle pulse animation
- **Pending:** ○ Gray, low opacity

**Interactions:**
- Hover: Scale 105%, cursor pointer (active/completed only)
- Click: Navigate to stage (if implemented)
- Info Icon: Hover to see stage description tooltip

---

### 2. Stage Details Panel (Expandable)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ℹ Complete these fields to assess budget, timeline, and decision-   │
│   making authority. This helps determine if the lead should advance │
│   to an opportunity.                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE REQUIREMENTS                           3 of 5 completed (60%) │
│                                                                       │
│  ☐ Budget Amount        ☑ Budget Status      ☑ Purchase Timeframe   │
│  ☐ Need Analysis        ☐ Decision Maker                            │
├─────────────────────────────────────────────────────────────────────┤
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░  60%                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Help Text** (top) - Contextual guidance with info icon
2. **Field Checklist** (middle) - Grid of checkboxes, completed fields highlighted
3. **Progress Bar** (bottom) - Visual percentage with label

**Colors:**
- Panel Background: `bg-muted/30` (subtle gray tint)
- Completed Fields: `bg-primary/10 text-primary` (highlighted)
- Incomplete Fields: `bg-background text-muted-foreground` (neutral)
- Progress Bar: `bg-primary` (filled), `bg-muted` (track)

---

### 3. BPF Field Badge

```
┌─────────────────────────────────────┐
│  Budget Amount [🎯 QUALIFY]         │
│  ┌─────────────────────────────┐   │
│  │ 100000                      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Badge Design:**
- Size: `text-[10px]` uppercase
- Icon: Target/bullseye icon (`Target` from lucide-react)
- Colors: `bg-primary/10 text-primary border border-primary/20`
- Position: Inline with label, `ml-1.5`

**Tooltip (on hover):**
```
┌───────────────────────────────────────────────┐
│ This field is part of the Qualify stage in   │
│ the Business Process Flow                     │
└───────────────────────────────────────────────┘
```

---

### 4. Form Section Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│ ║  Qualification Assessment                                         │
│ ║  Qualify Stage - Complete these fields to assess if this lead    │
│ ║  should advance                                                   │
│ ║                                                                   │
│ ║  Budget Amount [🎯 QUALIFY]    Budget Status [🎯 QUALIFY]         │
│ ║  ┌────────────────────┐         ┌────────────────────┐           │
│ ║  │ €                  │         │ Select status      │           │
│ ║  └────────────────────┘         └────────────────────┘           │
│ ║                                                                   │
│ ║  Purchase Timeframe [🎯 QUALIFY]                                  │
│ ║  ┌────────────────────────────────────────────────┐              │
│ ║  │ Q2 2025                                        │              │
│ ║  └────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
       ↑
  Left accent border in primary color
```

**Section Styling:**
- Left Border: `border-l-4 border-l-primary` (4px solid primary)
- Background: `bg-primary/5` (5% opacity primary tint)
- Padding: `pl-4` additional left padding
- Corner: `rounded-r-lg` (rounded on right side only)

---

### 5. Sticky Header Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ BPF Stage Bar (sticky, always visible)                        ┃ │
│ ┃ ┌─────┐ ── ┌─────┐ ── ┌─────┐ ── ┌─────┐                     ┃ │
│ ┃ │  ✓  │    │  ●  │    │  ○  │    │  ○  │                     ┃ │
│ ┃ └─────┘    └─────┘    └─────┘    └─────┘                     ┃ │
│ ┃                                                                ┃ │
│ ┃ [Expandable Details Panel - if open]                          ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Form Content (scrollable)                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ First Name                 Last Name                          │  │
│  │ ┌─────────────┐            ┌─────────────┐                   │  │
│  │ │ John        │            │ Doe         │                   │  │
│  │ └─────────────┘            └─────────────┘                   │  │
│  │                                                               │  │
│  │ Email                                                         │  │
│  │ ┌───────────────────────────────────────────┐                │  │
│  │ │ 📧 john.doe@example.com                   │                │  │
│  │ └───────────────────────────────────────────┘                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ... (more form sections) ...                                        │
│                                                                       │
│  ║  Qualification Assessment [BPF Section]                           │
│  ║  ... (BPF fields with badges) ...                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Sticky Implementation:**
```tsx
<div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6
                bg-background/95 backdrop-blur
                supports-[backdrop-filter]:bg-background/60
                border-b px-6 py-4">
  <LeadBusinessProcessFlow />
</div>
```

**Key Properties:**
- `sticky top-0` - Stays at top when scrolling
- `z-10` - Above form content
- `-mx-6 -mt-6` - Negative margins to extend to card edges
- `backdrop-blur` - Blurs content behind (depth effect)
- `bg-background/95` - 95% opaque background

---

## Color Palette

### Stage States

```css
/* Active Stage */
.stage-active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

/* Completed Stage */
.stage-completed {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Pending Stage */
.stage-pending {
  background: hsl(var(--muted) / 0.5);
  border-color: hsl(var(--muted-foreground) / 0.2);
  color: hsl(var(--muted-foreground));
}
```

### BPF Elements

```css
/* BPF Section Accent */
.bpf-section {
  background: hsl(var(--primary) / 0.05);
  border-left: 4px solid hsl(var(--primary));
}

/* BPF Field Badge */
.bpf-badge {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary) / 0.2);
}

/* Completed Field (in checklist) */
.field-completed {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

/* Incomplete Field (in checklist) */
.field-incomplete {
  background: hsl(var(--background));
  color: hsl(var(--muted-foreground));
}
```

---

## Spacing System

### Stage Bar
- **Stage Chip Padding:** `px-3 py-1.5` (12px horizontal, 6px vertical)
- **Icon Size:** `w-5 h-5` (20px)
- **Gap between elements:** `gap-2` (8px)
- **Connector width:** `min-w-[12px] max-w-[40px]` (flexible)
- **Bar padding:** `py-3` (12px top/bottom)

### Details Panel
- **Panel padding:** `pt-3 pb-4 px-4` (12px top, 16px bottom, 16px sides)
- **Help text margin:** `mb-3 pb-3` (12px margin, 12px padding)
- **Field checklist gap:** `gap-2` (8px between items)
- **Progress bar margin:** `mt-3 pt-3` (12px top)

### Form Integration
- **Section spacing:** `space-y-6` (24px between sections)
- **Field spacing:** `space-y-4` (16px within sections)
- **Field group gap:** `gap-3` (12px in grids)
- **BPF section left padding:** `pl-4` (16px, in addition to border)

---

## Typography Scale

```css
/* Stage Names */
.stage-name {
  font-size: 0.875rem;    /* text-sm (14px) */
  font-weight: 500;       /* font-medium */
  line-height: 1.25rem;   /* leading-5 */
}

/* Section Titles */
.section-title {
  font-size: 0.875rem;    /* text-sm (14px) */
  font-weight: 500;       /* font-medium */
  line-height: 1.25rem;   /* leading-5 */
}

/* Section Descriptions */
.section-description {
  font-size: 0.75rem;     /* text-xs (12px) */
  color: hsl(var(--muted-foreground));
}

/* Field Labels */
.field-label {
  font-size: 0.875rem;    /* text-sm (14px) */
  font-weight: 500;       /* font-medium */
}

/* BPF Badge */
.bpf-badge-text {
  font-size: 0.625rem;    /* text-[10px] (10px) */
  font-weight: 600;       /* font-semibold */
  text-transform: uppercase;
  letter-spacing: 0.05em; /* tracking-wide */
}

/* Help Text */
.help-text {
  font-size: 0.875rem;    /* text-sm (14px) */
  line-height: 1.5rem;    /* leading-6 */
  color: hsl(var(--muted-foreground));
}

/* Progress Badge */
.progress-badge {
  font-size: 0.75rem;     /* text-xs (12px) */
  font-weight: 600;       /* font-semibold */
}
```

---

## Animation Timings

```css
/* Stage Chip Hover */
.stage-chip {
  transition: all 200ms ease;
}
.stage-chip:hover {
  transform: scale(1.05);
}

/* Details Panel Expand/Collapse */
.details-panel {
  transition: all 200ms ease-in-out;
  /* Uses CSS Grid for smooth height animation */
}

/* Progress Bar Fill */
.progress-fill {
  transition: width 300ms ease-out;
}

/* Checkbox State */
.checkbox {
  transition: all 200ms ease;
}

/* Connector Line */
.connector-line {
  transition: all 200ms ease;
}
```

---

## Responsive Breakpoints

### Desktop (md and above - ≥768px)
- Horizontal stage bar with inline actions
- Details panel below stage bar
- Grid layout for field checklist (up to 3 columns)
- Full-width form fields in 2-column grid

### Mobile (below md - <768px)
- Vertical stage list (stacked)
- Simpler field summary (count only)
- Single-column field checklist
- Full-width form fields (single column)

```tsx
// Desktop
<div className="hidden md:block">
  {/* Horizontal stage bar */}
</div>

// Mobile
<div className="md:hidden">
  {/* Vertical stage list */}
</div>
```

---

## Icon Usage

### Stage Icons
- **Completed:** `Check` (checkmark) from lucide-react
- **Active:** Solid circle (filled `Circle` with `fill="currentColor"`)
- **Pending:** Hollow circle (`Circle` outline only)

### UI Icons
- **Collapse:** `ChevronDown` (rotates 180° when expanded)
- **Expand:** `ChevronRight`
- **Info:** `Info` (for help text)
- **Target:** `Target` (for BPF badges)
- **Success Alert:** `CheckCircle2` (qualified lead)
- **Error Alert:** `XCircle` (disqualified lead)

### Size Guidelines
- Stage icons: `w-5 h-5` (20px) on desktop, `w-4 h-4` (16px) on mobile
- Button icons: `w-3.5 h-3.5` (14px)
- Badge icons: `w-2.5 h-2.5` (10px)
- Alert icons: `w-4 h-4` (16px)

---

## Accessibility Features

### Keyboard Navigation
- **Tab:** Navigate through interactive elements
- **Enter/Space:** Activate buttons, expand/collapse panels
- **Arrow Keys:** (Future) Navigate between stages

### Screen Reader Announcements
```html
<!-- Stage Button -->
<button role="button" aria-label="Qualify stage, active, 3 of 5 fields completed">
  <span aria-hidden="true">● Qualify</span>
</button>

<!-- Details Panel -->
<div role="region" aria-label="Stage details" aria-expanded="true">
  <!-- Content -->
</div>

<!-- Progress -->
<div role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
  60%
</div>
```

### Focus States
- All interactive elements have visible focus rings
- Focus ring: `focus-visible:ring-2 focus-visible:ring-primary`
- Skip to content links (if needed)

---

## Dark Mode Support

All colors use CSS variables from the design system:

```css
/* Automatically adapts to dark mode via .dark class */
:root {
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  /* ... etc */
}

.dark {
  --primary: 217 91% 60%;
  --primary-foreground: 222 47% 11%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20.2% 65.1%;
  /* ... etc */
}
```

**Result:** BPF automatically looks great in both light and dark modes without extra CSS.

---

## Best Practices

### Do's ✓
- Keep stage names concise (1-2 words)
- Provide clear help text for each stage
- Mark required fields in the checklist
- Use real-time updates for field completion
- Test with real user data (not lorem ipsum)
- Maintain consistent spacing throughout
- Use semantic HTML (buttons, sections, etc.)

### Don'ts ✗
- Don't use more than 5 stages (cognitive overload)
- Don't hide critical information in collapsed panels
- Don't use stage colors for decoration only
- Don't forget mobile responsiveness
- Don't override accessibility features
- Don't hardcode colors (use design tokens)
- Don't skip loading/error states

---

## Testing Scenarios

### Visual Regression Tests
1. BPF with 0% completion
2. BPF with 50% completion
3. BPF with 100% completion
4. BPF collapsed vs. expanded
5. BPF on mobile viewport
6. BPF in dark mode
7. BPF with qualified lead alert
8. BPF with disqualified lead alert

### Interaction Tests
1. Click stage chip (active/completed)
2. Expand/collapse details panel
3. Scroll page (test sticky positioning)
4. Hover field badges (tooltip appears)
5. Tab through interactive elements
6. Fill form fields (real-time updates)
7. Submit form (completion preserved)

### Accessibility Tests
1. Screen reader announces stages correctly
2. Keyboard navigation works smoothly
3. Focus indicators are visible
4. Color contrast meets WCAG AA
5. Touch targets are minimum 44x44px
6. Reduced motion respected (prefers-reduced-motion)

---

## Implementation Checklist

- [x] `business-process-flow.tsx` - Generic BPF component
- [x] `lead-business-process-flow.tsx` - Lead-specific implementation
- [x] `bpf-field-badge.tsx` - Field badge component
- [x] `lead-form.tsx` - Form with BPF integration
- [x] `edit/page.tsx` - Sticky BPF layout
- [x] `alert.tsx` - Alert component for status messages
- [x] Type definitions (`BPFStageField`, `BPFStageWithFields`)
- [x] Form context integration (react-hook-form)
- [x] Real-time field tracking
- [x] Mobile responsive layout
- [x] Dark mode support
- [x] Accessibility features
- [x] Animation/transitions
- [x] Documentation

---

**Last Updated:** 2025-10-25
**Design System:** shadcn/ui (New York style)
**Color Base:** Neutral with primary accent
**Fonts:** Geist (sans), Geist Mono (mono)
