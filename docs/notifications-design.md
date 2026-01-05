# Notification Center - UX/UI Design Specifications

## Design Overview

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (sticky top-0)                                      │
│  ┌──────────────────┐              ┌────────────┬────────┐ │
│  │ [☰] Breadcrumb   │              │ [🔔] [👤] │        │ │
│  └──────────────────┘              └────────────┴────────┘ │
└─────────────────────────────────────────────────────────────┘
                                             ↓
                                      (Click bell icon)
                                             ↓
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION CENTER (Desktop: Popover, 420px width)        │
├─────────────────────────────────────────────────────────────┤
│  Notifications                       [Mark all as read]     │
├─────────────────────────────────────────────────────────────┤
│  [  All  ] [Unread (3)] [Mentions (1)]                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [🔵 icon]  New lead assigned            [high] [•]  │  │
│  │            Acme Corp - Enterprise...              │  │
│  │            15 minutes ago      [✓ Mark read] [✕]  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [🟣 icon]  Opportunity stage changed       [•]      │  │
│  │            Enterprise Deal moved to...            │  │
│  │            2 hours ago         [✓ Mark read] [✕]  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [🟢 icon]  Quote approved                           │  │
│  │            Q-2024-001 approved by Finance...       │  │
│  │            5 hours ago         (on hover: actions)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  (scrollable, max-height: 400px)                            │
├─────────────────────────────────────────────────────────────┤
│  [View all notifications →]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Trigger Button (Bell Icon)

**States:**

**A. No Unread Notifications**
```
┌────┐
│ 🔔 │  Gray bell icon
└────┘
```

**B. Unread Notifications (1-99)**
```
┌────┐
│ 🔔 │  Bell icon with badge
└──┬─┘
   └─ (3) ← Red badge with number
          └─ Pulse animation
```

**C. Unread Notifications (99+)**
```
┌────┐
│ 🔔 │
└──┬─┘
   └─ (99+) ← Red badge
```

**Specifications:**
- **Icon**: `Bell` from lucide-react, 20px (h-5 w-5)
- **Badge**: Absolute positioned (-top-1 -right-1)
- **Badge size**: 20px diameter (h-5 w-5)
- **Badge color**: `bg-destructive` (red)
- **Text**: 10px font-bold, white text
- **Pulse**: `animate-ping` on unread state
- **Hover**: `hover:bg-accent` subtle background

**Accessibility:**
- `aria-label="Notifications (3 unread)"` when unread
- `aria-label="Notifications"` when all read

---

### 2. Notification Item Card

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ │ [icon]  Title text here (font-medium)        [priority] │
│ │         Description text here (muted)                     │
│ │         Timestamp                [Actions on hover]       │
└┴─────────────────────────────────────────────────────────────┘
 └─ Purple border (3px) when unread
```

**States:**

**A. Unread Notification**
- Background: `bg-accent/30` (light purple tint)
- Border: `border-purple-200`
- Left accent: 3px purple bar (`bg-purple-600`)
- Title: `text-foreground` (darker, bold)

**B. Read Notification**
- Background: `bg-background` (white/transparent)
- Border: `border` (default)
- No left accent bar
- Title: Normal weight

**C. Hover State**
- Background: `bg-accent/50` (slightly darker)
- Actions visible: "Mark read", "Dismiss" buttons appear

**D. High Priority Unread**
- Additional red dot indicator (top-right)
- 8px diameter, `bg-destructive`

**Spacing:**
- Padding: `p-3` (12px)
- Gap between icon and content: `gap-3` (12px)
- Vertical spacing between notifications: `space-y-2` (8px)

---

### 3. Notification Icon & Background

**Icon Sizes:**
- Icon: 16px (h-4 w-4)
- Background circle: 32px (8px padding)

**Color Mapping:**

| Type | Icon | Icon Color | Background | Example |
|------|------|------------|------------|---------|
| Lead | User | `text-blue-600` | `bg-blue-100` | 🔵 |
| Opportunity | Briefcase | `text-purple-600` | `bg-purple-100` | 🟣 |
| Quote | FileText | `text-green-600` | `bg-green-100` | 🟢 |
| Task | CheckSquare | `text-orange-600` | `bg-orange-100` | 🟠 |
| Mention | AtSign | `text-pink-600` | `bg-pink-100` | 🩷 |
| System | AlertCircle | `text-gray-600` | `bg-gray-100` | ⚫ |

**Visual Examples:**

```
Lead Notification:
┌────────────────────────────────────┐
│ ┌─────┐                            │
│ │  👤 │ New lead assigned          │
│ │blue │ Acme Corp - Enterprise...  │
│ └─────┘ 15 minutes ago             │
└────────────────────────────────────┘

Opportunity Notification:
┌────────────────────────────────────┐
│ ┌───────┐                          │
│ │  💼   │ Opportunity stage changed│
│ │purple │ Enterprise Deal moved... │
│ └───────┘ 2 hours ago              │
└────────────────────────────────────┘
```

---

### 4. Tabs Navigation

**Layout:**
```
┌─────────────────────────────────────────┐
│   All     Unread (3)    Mentions (1)   │
│   ━━━                                   │
└─────────────────────────────────────────┘
```

**Tab States:**

**Active Tab:**
- Text: `text-foreground` (dark)
- Background: `bg-transparent`
- Underline: 2px solid `bg-purple-600`
- Font: `font-medium`

**Inactive Tab:**
- Text: `text-muted-foreground` (gray)
- Background: `bg-transparent`
- Hover: `hover:text-gray-900`

**Badge in Tab:**
- Size: 20px height (h-5)
- Padding: 4px horizontal (px-1)
- Background: `bg-secondary`
- Text: 10px (text-[10px])
- Position: `ml-1.5` from tab text

**Spacing:**
- Tab padding: `px-0 py-2` (8px vertical)
- Grid: `grid-cols-3` (equal width)
- Border bottom: `border-b` on container

---

### 5. Empty States

**Layout:**
```
┌───────────────────────────────┐
│                               │
│       ┌──────────┐            │
│       │          │            │
│       │   🔔     │ (icon)     │
│       │          │            │
│       └──────────┘            │
│                               │
│   No notifications            │
│   You're all caught up!       │
│                               │
└───────────────────────────────┘
```

**Specifications:**
- **Icon background**: `bg-muted` (gray-100)
- **Icon size**: 32px (h-8 w-8)
- **Padding**: 48px vertical (py-12)
- **Title**: `text-sm font-medium`
- **Description**: `text-sm text-muted-foreground`
- **Alignment**: Center aligned

**Variants:**

**All Tab - No Notifications:**
- Icon: `Bell`
- Title: "No notifications"
- Description: "You're all caught up!"

**Unread Tab - All Read:**
- Icon: `Check`
- Title: "No unread notifications"
- Description: "All notifications have been read"

**Mentions Tab - No Mentions:**
- Icon: `AtSign`
- Title: "No mentions"
- Description: "You haven't been mentioned recently"

---

### 6. Header Section

**Layout:**
```
┌──────────────────────────────────────────┐
│  Notifications    [Mark all as read]     │
└──────────────────────────────────────────┘
```

**Specifications:**
- Height: `py-3` (12px vertical padding)
- Padding: `px-4` (16px horizontal)
- Border: `border-b`
- Title: `text-sm font-semibold`
- Action button: `text-xs text-muted-foreground hover:text-foreground`

**Action Button:**
- Variant: `ghost`
- Size: `sm`
- Only visible when `unreadCount > 0`

---

### 7. Footer Section

**Layout:**
```
┌──────────────────────────────────────────┐
│  [View all notifications →]              │
└──────────────────────────────────────────┘
```

**Specifications:**
- Padding: `p-2` (8px)
- Border top: `border-t` (Separator)
- Button: Full width, centered text
- Button variant: `ghost`
- Text: `text-sm font-medium`

---

## Responsive Design

### Desktop (≥768px)

**Component:** Popover
- **Width:** 420px fixed
- **Max height:** 600px (ScrollArea height: 400px)
- **Position:** Aligned to end (right)
- **Side offset:** 8px from trigger
- **Notifications visible:** 5-6 items simultaneously

**Badge:**
- Diameter: 20px
- Font size: 10px

**Layout:**
```
                    [Bell Icon]
                         │
                         ▼
                ┌────────────────┐
                │  Popover       │
                │  w-[420px]     │
                │                │
                │  (content)     │
                │                │
                └────────────────┘
```

---

### Mobile (<768px)

**Component:** Sheet (slide-in from right)
- **Width:** 100vw (full screen) or `sm:max-w-md` (448px max on larger mobile)
- **Height:** Full viewport height
- **Animation:** Slide from right
- **ScrollArea height:** Increased to 500px

**Badge:**
- Diameter: 20px (larger for touch targets)
- Font size: 10px

**Layout:**
```
┌──────────────────────────────┐
│                              │ ← Full width
│  Sheet                       │
│                              │
│  [Content]                   │
│                              │
│                              │
│                              │
└──────────────────────────────┘
```

**Touch Interactions:**
- Swipe down to close Sheet
- Tap outside to close
- Larger tap targets (min 44x44px)

---

## Animation & Transitions

### 1. Badge Pulse (Unread Notifications)

```css
/* Outer ring - pulsing */
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% { transform: scale(1); opacity: 0.75; }
  75%, 100% { transform: scale(2); opacity: 0; }
}
```

### 2. Hover Transitions

```typescript
className="transition-colors"  // Smooth color transitions on hover
```

### 3. Popover/Sheet Open/Close

- **Duration:** 200ms (default shadcn/ui)
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)`

---

## Color System

### Brand Colors (CRM Theme)

```typescript
// From globals.css OKLCH color space
--purple-600: oklch(0.55 0.15 295)  // Primary purple
--destructive: oklch(0.55 0.25 27)   // Red (danger)
--accent: oklch(0.96 0.01 270)       // Light purple tint
```

### Notification Type Colors

```typescript
const colors = {
  lead: {
    icon: 'text-blue-600',        // oklch(0.55 0.15 240)
    bg: 'bg-blue-100',            // oklch(0.95 0.03 240)
  },
  opportunity: {
    icon: 'text-purple-600',      // oklch(0.55 0.15 295)
    bg: 'bg-purple-100',          // oklch(0.95 0.03 295)
  },
  quote: {
    icon: 'text-green-600',       // oklch(0.55 0.15 140)
    bg: 'bg-green-100',           // oklch(0.95 0.03 140)
  },
  // ... etc
}
```

---

## Typography

### Font Stack

- **Sans:** Geist (--font-geist-sans)
- **Mono:** Geist Mono (--font-geist-mono)

### Text Sizes

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Header title | `text-sm font-semibold` | 14px | 600 |
| Tab text | `text-sm font-medium` | 14px | 500 |
| Notification title | `text-sm font-medium` | 14px | 500 |
| Description | `text-sm text-muted-foreground` | 14px | 400 |
| Timestamp | `text-xs text-muted-foreground` | 12px | 400 |
| Badge count | `text-[10px] font-bold` | 10px | 700 |
| Action button | `text-xs` | 12px | 400 |

---

## Accessibility (WCAG 2.1 AA)

### Contrast Ratios

All text meets WCAG AA standards:
- **Normal text (14px):** 4.5:1 minimum
- **Large text (18px+):** 3:1 minimum
- **Interactive elements:** 3:1 against background

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate to bell icon |
| Enter/Space | Open/close notification panel |
| Escape | Close panel |
| Arrow Up/Down | Navigate notifications (within ScrollArea) |
| Enter (on notification) | Follow link to entity |

### Screen Reader Announcements

```html
<!-- Bell button -->
<button aria-label="Notifications (3 unread)">
  <Bell />
</button>

<!-- Sheet title (hidden visually) -->
<SheetHeader className="sr-only">
  <SheetTitle>Notifications</SheetTitle>
</SheetHeader>

<!-- Empty state -->
<div role="status" aria-live="polite">
  No notifications
</div>
```

### Focus Management

- **Focus trap:** When popover/sheet is open, focus stays within
- **Return focus:** When closed, focus returns to trigger button
- **Visible focus:** All interactive elements have visible focus indicator

---

## Performance Targets

### Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Interactive | <300ms | From bell click to popover visible |
| Notification render | <50ms | Per notification item |
| Badge update | <100ms | From API response to badge update |
| Scroll smoothness | 60fps | ScrollArea scrolling |

### Optimization Techniques

1. **React.memo** on `NotificationItem`
2. **useMemo** for filtered notifications
3. **useCallback** for event handlers
4. **Virtual scrolling** for 100+ notifications
5. **Lazy loading** images if notifications include avatars
6. **Debounced polling** (30-60 second interval, not every second)

---

## Dark Mode Support

All colors use OKLCH color space with automatic dark mode variants:

**Light Mode:**
```css
--background: oklch(1 0 0);           /* White */
--foreground: oklch(0.15 0 0);        /* Near black */
--muted: oklch(0.96 0 0);             /* Gray-100 */
```

**Dark Mode:**
```css
.dark {
  --background: oklch(0.15 0 0);      /* Near black */
  --foreground: oklch(0.95 0 0);      /* Near white */
  --muted: oklch(0.25 0 0);           /* Gray-800 */
}
```

**Testing:**
- Verify all notification types are readable in dark mode
- Check badge contrast on dark background
- Ensure hover states are visible

---

## User Flow Examples

### Flow 1: View and Mark Notification as Read

```
1. User sees badge (3) on bell icon
2. User clicks bell icon
3. Popover opens, showing 3 unread notifications
4. User hovers over first notification
   → "Mark read" button appears
5. User clicks "Mark read"
   → Notification background changes to white
   → Purple left border disappears
   → Badge updates to (2)
6. User clicks outside popover
   → Popover closes
   → Badge still shows (2)
```

### Flow 2: Navigate to Related Entity

```
1. User clicks bell icon
2. Popover opens
3. User clicks on notification item (entire card)
4. Browser navigates to `/leads/lead-123`
5. Notification auto-marks as read
6. Popover closes
```

### Flow 3: Mark All as Read

```
1. User clicks bell icon
2. Popover opens with 5 unread notifications
3. User clicks "Mark all as read" in header
4. All 5 notifications change to read state
5. Badge disappears from bell icon
6. "Unread" tab shows empty state
```

### Flow 4: Mobile Experience

```
1. User taps bell icon (mobile)
2. Sheet slides in from right (full screen)
3. User swipes through tabs
4. User taps notification
5. Browser navigates to entity
6. Sheet slides out (auto-closes)
```

---

## Implementation Checklist

### Phase 1: Core UI (COMPLETED)
- [x] NotificationMenu component
- [x] Badge with counter
- [x] Pulse animation
- [x] Popover (desktop)
- [x] Sheet (mobile)
- [x] Tabs (All, Unread, Mentions)
- [x] NotificationItem component
- [x] Empty states
- [x] Mark as read action
- [x] Dismiss action
- [x] Mark all as read
- [x] Integration with PageHeader

### Phase 2: API Integration (TODO)
- [ ] Create notification service API
- [ ] Implement useNotifications hook
- [ ] Connect to backend endpoints
- [ ] Add TanStack Query caching
- [ ] Implement optimistic updates
- [ ] Add error handling

### Phase 3: Real-time Updates (TODO)
- [ ] WebSocket connection
- [ ] Subscribe to notification channel
- [ ] Handle new notification events
- [ ] Show toast on new notification
- [ ] Auto-refresh notification list

### Phase 4: Advanced Features (TODO)
- [ ] Notification preferences page
- [ ] Sound alerts (opt-in)
- [ ] Desktop push notifications
- [ ] Filter by date range
- [ ] Search notifications
- [ ] Snooze functionality

---

## Design Decisions & Rationale

### Why Popover for Desktop?

**Pros:**
- Lightweight component (no full-page overlay)
- Fast open/close animations
- Stays close to trigger button (spatial consistency)
- Allows interaction with rest of page while open

**Cons:**
- Limited height (max 600px)
- Can be cut off by viewport edges (handled with `align="end"`)

**Alternative considered:** Dialog/Modal
- Rejected: Too heavy for quick notification checking

---

### Why Sheet for Mobile?

**Pros:**
- Full-screen experience on small devices
- More comfortable for touch interactions
- Familiar pattern (Gmail, Slack mobile)
- Easy swipe-to-close gesture

**Cons:**
- Takes full focus (can't interact with page)

**Alternative considered:** Bottom Sheet
- Rejected: Harder to reach tabs at top with thumb

---

### Why Tabs Instead of Filters?

**Pros:**
- Clear visual separation of notification types
- Quick switching between views
- Badge counts visible per category
- Common pattern (Gmail, LinkedIn)

**Cons:**
- Mutually exclusive (can't see "Unread Mentions")

**Future improvement:** Combine filters (e.g., "Unread" + "Mentions")

---

### Why Pulse Animation?

**Pros:**
- Subtle, non-intrusive attention grabber
- Indicates "new" without being annoying
- Industry standard (Facebook, Twitter)

**Cons:**
- Can be distracting for users with ADHD

**Accessibility:** Can be disabled with `prefers-reduced-motion` CSS media query

```typescript
@media (prefers-reduced-motion: reduce) {
  .animate-ping {
    animation: none;
  }
}
```

---

## Comparison with Industry Standards

### Gmail Notifications

**Similarities:**
- Badge counter on icon
- Popover dropdown
- Mark as read action
- Tabs (Primary, Social, Promotions)

**Differences:**
- Gmail uses Dialog on mobile, we use Sheet
- Gmail shows email previews, we show entity details

---

### Slack Notifications

**Similarities:**
- Red badge with count
- Grouped by type (All, Mentions, Threads)
- Real-time updates via WebSocket
- Mark all as read

**Differences:**
- Slack uses dedicated notifications page, we use popover
- Slack has more complex threading model

---

### LinkedIn Notifications

**Similarities:**
- Bell icon with badge
- Dropdown popover (desktop)
- Multiple tabs
- Inline actions (dismiss, save)

**Differences:**
- LinkedIn has infinite scroll, we use pagination
- LinkedIn shows more visual content (profile pictures, post previews)

---

## Future Considerations

### Internationalization (i18n)

All strings should be translatable:

```typescript
const t = useTranslations('notifications')

<h2>{t('title')}</h2>
<Button>{t('markAllAsRead')}</Button>
```

**Supported languages (future):**
- English (default)
- Spanish
- French
- German

---

### Analytics Tracking

Track user interactions:

```typescript
// Track notification clicks
analytics.track('notification_clicked', {
  notification_id: notification.id,
  notification_type: notification.type,
  is_read: notification.isRead,
})

// Track badge clicks
analytics.track('notification_center_opened', {
  unread_count: unreadCount,
})
```

**Metrics to measure:**
- Notification open rate
- Click-through rate per type
- Time to mark as read
- Dismiss rate

---

## Conclusion

The Notification Center is designed to be:

- **User-friendly:** Intuitive, familiar patterns
- **Performant:** Optimized rendering, minimal re-renders
- **Accessible:** WCAG 2.1 AA compliant, keyboard navigable
- **Responsive:** Adaptive UI for mobile and desktop
- **Scalable:** Ready for real-time updates, large notification volumes
- **Maintainable:** Clean component architecture, well-documented

**Next steps:**
1. Connect to real API
2. Implement real-time updates via WebSocket
3. Add user preferences page
4. Gather user feedback and iterate
