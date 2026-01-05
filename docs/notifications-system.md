# Notification System - Documentation

## Overview

The Notification Center is a comprehensive system for displaying and managing user notifications in the CRM application. It features a responsive design with different UI patterns for desktop (Popover) and mobile (Sheet).

---

## Features

### Core Functionality

- **Real-time Badge Counter**: Shows unread notification count (max 99+)
- **Pulse Animation**: Visual indicator for unread notifications
- **Three Tabs**: All, Unread, Mentions
- **Individual Actions**: Mark as read, Dismiss
- **Bulk Actions**: Mark all as read
- **Responsive Design**: Popover (desktop), Sheet (mobile)
- **Empty States**: Custom messages for each tab
- **Link Integration**: Click notification to navigate to related entity
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `lead` | User | Blue | Lead assignment, status changes |
| `opportunity` | Briefcase | Purple | Opportunity stage changes, wins/losses |
| `quote` | FileText | Green | Quote approval, activation |
| `task` | CheckSquare | Orange | Task reminders, due dates |
| `mention` | AtSign | Pink | User mentions in comments |
| `system` | AlertCircle | Gray | System notifications, reports |

---

## Architecture

### Component Structure

```
notification-menu.tsx
├── NotificationMenu (Main Component)
│   ├── Trigger Button (Bell icon + Badge)
│   ├── Desktop: Popover
│   └── Mobile: Sheet
│
├── NotificationContent (Shared Content)
│   ├── Header (Title + Mark all as read)
│   ├── Tabs (All | Unread | Mentions)
│   ├── ScrollArea (Notification List)
│   └── Footer (View all link)
│
├── NotificationItem (Individual Notification)
│   ├── Icon + Background
│   ├── Title + Description
│   ├── Timestamp (relative)
│   ├── Priority Indicator
│   └── Actions (Mark read, Dismiss)
│
└── EmptyState (No Notifications)
    ├── Icon
    ├── Title
    └── Description
```

### Responsive Behavior

**Desktop (≥768px)**:
```typescript
<Popover>
  <PopoverContent className="w-[420px]">
    <NotificationContent />
  </PopoverContent>
</Popover>
```

**Mobile (<768px)**:
```typescript
<Sheet side="right">
  <SheetContent className="w-full sm:max-w-md">
    <NotificationContent />
  </SheetContent>
</Sheet>
```

---

## Data Model

### Notification Interface

```typescript
interface Notification {
  id: string                      // Unique identifier
  type: NotificationType          // 'lead' | 'opportunity' | 'quote' | 'task' | 'mention' | 'system'
  title: string                   // Main heading (e.g., "New lead assigned")
  description: string             // Details (e.g., "Acme Corp - Enterprise Software inquiry")
  timestamp: Date                 // When notification was created
  isRead: boolean                 // Read/unread status
  priority: NotificationPriority  // 'low' | 'medium' | 'high'

  // Optional context (for navigation)
  relatedEntityId?: string        // ID of the related entity
  relatedEntityType?: string      // 'lead' | 'opportunity' | 'quote' | 'order'
  relatedEntityName?: string      // Display name
  actionUrl?: string              // Link to navigate to
  actor?: {                       // Who triggered the notification
    name: string
    avatarUrl?: string
  }
}
```

### Example Notifications

#### 1. Lead Assignment
```typescript
{
  id: 'notif-123',
  type: 'lead',
  title: 'New lead assigned',
  description: 'Acme Corp - Enterprise Software inquiry',
  timestamp: new Date(),
  isRead: false,
  priority: 'high',
  relatedEntityId: 'lead-456',
  relatedEntityType: 'lead',
  relatedEntityName: 'Acme Corp',
  actionUrl: '/leads/lead-456',
  actor: {
    name: 'John Smith',
  }
}
```

#### 2. Opportunity Stage Change
```typescript
{
  id: 'notif-456',
  type: 'opportunity',
  title: 'Opportunity stage changed',
  description: 'Enterprise Deal moved to Propose (75%)',
  timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  isRead: false,
  priority: 'medium',
  relatedEntityId: 'opp-789',
  relatedEntityType: 'opportunity',
  relatedEntityName: 'Enterprise Deal',
  actionUrl: '/opportunities/opp-789',
  actor: {
    name: 'Sarah Johnson',
  }
}
```

#### 3. Task Reminder
```typescript
{
  id: 'notif-789',
  type: 'task',
  title: 'Task due today',
  description: 'Follow up with John Doe regarding proposal',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  isRead: false,
  priority: 'medium',
  actionUrl: '/activities/task-321',
}
```

#### 4. User Mention
```typescript
{
  id: 'notif-012',
  type: 'mention',
  title: 'You were mentioned',
  description: '@you mentioned in Opportunity: Cloud Migration Project',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  isRead: true,
  priority: 'low',
  relatedEntityId: 'opp-999',
  relatedEntityType: 'opportunity',
  actionUrl: '/opportunities/opp-999',
  actor: {
    name: 'Mike Davis',
  }
}
```

---

## Integration Guide

### 1. Add to PageHeader

The NotificationMenu is already integrated into the PageHeader component:

```typescript
// src/components/layout/page-header.tsx
import { NotificationMenu } from '@/components/layout/notification-menu'

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  return (
    <header>
      {/* ... */}
      <div className="flex items-center gap-2 px-4">
        <NotificationMenu />  {/* ← Notifications */}
        <UserMenu variant="full" />
      </div>
    </header>
  )
}
```

### 2. Connect to Real API

Replace mock data with real API calls:

```typescript
// src/features/notifications/hooks/use-notifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../api/notification-service'

export function useNotifications() {
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
    refetchInterval: 30000, // Poll every 30 seconds
  })

  // Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Dismiss notification
  const dismissMutation = useMutation({
    mutationFn: notificationService.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    dismiss: dismissMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  }
}
```

```typescript
// Update NotificationMenu to use the hook
export function NotificationMenu() {
  const {
    notifications,
    markAsRead,
    dismiss,
    markAllAsRead
  } = useNotifications()

  // ... rest of the component
}
```

### 3. Backend API Service

```typescript
// src/features/notifications/api/notification-service.ts
import { apiClient } from '@/core/api/client'
import type { Notification } from '@/components/layout/notification-menu'

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications')
    return response.data
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async dismiss(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all')
  },
}
```

### 4. Backend Endpoints (Django)

```python
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoints for user notifications
    """
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Only show notifications for current user
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-timestamp')

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def read_all(self, request):
        """Mark all notifications as read"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'count': count})
```

---

## Real-Time Updates (WebSocket)

For real-time notifications, integrate with WebSocket:

```typescript
// src/features/notifications/hooks/use-notification-subscription.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { webSocketClient } from '@/core/websocket/client'

export function useNotificationSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = webSocketClient.subscribe('notifications')

    channel.on('new_notification', (notification) => {
      // Add new notification to cache
      queryClient.setQueryData(['notifications'], (old: any) =>
        [notification, ...(old || [])]
      )

      // Show toast
      toast.success(notification.title)
    })

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}
```

---

## Styling Customization

### Color Schemes

Modify notification type colors:

```typescript
function getNotificationIconColor(type: NotificationType): string {
  const colorMap = {
    lead: 'text-blue-600',          // Change to your brand color
    opportunity: 'text-purple-600',  // CRM primary color
    quote: 'text-green-600',
    task: 'text-orange-600',
    mention: 'text-pink-600',
    system: 'text-gray-600',
  }
  return colorMap[type] || 'text-gray-600'
}
```

### Badge Position

Adjust badge position on bell icon:

```typescript
<span className="absolute -top-1 -right-1 ...">  {/* Default */}
<span className="absolute top-0 right-0 ...">     {/* Alternative */}
```

### Animation Speed

Control pulse animation:

```typescript
{/* Default */}
<span className="animate-ping rounded-full bg-destructive opacity-75" />

{/* Slower */}
<span className="animate-pulse rounded-full bg-destructive opacity-75" />
```

---

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate to bell icon
- **Enter/Space**: Open notification panel
- **Arrow Down/Up**: Navigate between notifications (within ScrollArea)
- **Escape**: Close panel

### Screen Reader Support

```typescript
<Button
  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
>
  {/* Announces: "Notifications (5 unread)" */}
</Button>

<SheetHeader className="sr-only">
  <SheetTitle>Notifications</SheetTitle>
  {/* Hidden visually, read by screen readers */}
</SheetHeader>
```

### ARIA Attributes

- `aria-label`: Descriptive labels for buttons
- `role="region"`: Define notification regions
- `aria-live="polite"`: Announce new notifications

---

## Performance Considerations

### Optimization Strategies

1. **Pagination**: Load only recent 20-50 notifications
2. **Virtual Scrolling**: Use `@tanstack/react-virtual` for 100+ items
3. **Memoization**: Wrap `NotificationItem` in `React.memo`
4. **Debounced Polling**: Avoid excessive API calls

```typescript
// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual'

const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: notifications.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // Estimated notification height
})

<div ref={parentRef} className="h-[400px] overflow-auto">
  {virtualizer.getVirtualItems().map(virtualItem => (
    <NotificationItem
      key={notifications[virtualItem.index].id}
      notification={notifications[virtualItem.index]}
    />
  ))}
</div>
```

---

## Testing

### Unit Tests

```typescript
// __tests__/notification-menu.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationMenu } from '@/components/layout/notification-menu'

describe('NotificationMenu', () => {
  it('displays unread count badge', () => {
    render(<NotificationMenu />)
    const badge = screen.getByText('5')
    expect(badge).toBeInTheDocument()
  })

  it('opens popover on click', () => {
    render(<NotificationMenu />)
    const button = screen.getByRole('button', { name: /notifications/i })
    fireEvent.click(button)
    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
  })

  it('marks notification as read', () => {
    render(<NotificationMenu />)
    // Open popover
    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
    // Click "Mark read" button
    const markReadButton = screen.getAllByText('Mark read')[0]
    fireEvent.click(markReadButton)
    // Verify notification is marked as read (no purple border)
    // ...
  })
})
```

---

## Future Enhancements

### Phase 2 Features

- [ ] **Notification Preferences**: User can choose which types to receive
- [ ] **Sound Alerts**: Audio notification for high-priority items
- [ ] **Desktop Notifications**: Browser push notifications
- [ ] **Filter by Date**: "Today", "This Week", "Older"
- [ ] **Search**: Full-text search within notifications
- [ ] **Rich Content**: Support images, attachments
- [ ] **Snooze**: Temporarily hide notification
- [ ] **Templates**: Customizable notification templates per type

### Phase 3 Features

- [ ] **AI-Powered Insights**: "3 urgent tasks need attention"
- [ ] **Smart Grouping**: Group related notifications (e.g., all Lead updates)
- [ ] **Digest Mode**: Email summary of unread notifications
- [ ] **Collaborative**: @mention teammates, assign tasks from notifications

---

## Troubleshooting

### Issue: Badge count not updating

**Solution**: Ensure TanStack Query cache is invalidated after mutations.

```typescript
const markAsReadMutation = useMutation({
  mutationFn: notificationService.markAsRead,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  },
})
```

### Issue: Popover not closing on mobile

**Solution**: Use `Sheet` for mobile instead of `Popover`. The component already handles this with `isMobile` state.

### Issue: Notifications not appearing in real-time

**Solution**: Implement WebSocket subscription or use polling with `refetchInterval`.

```typescript
useQuery({
  queryKey: ['notifications'],
  queryFn: notificationService.getAll,
  refetchInterval: 30000, // Poll every 30 seconds
})
```

---

## Related Files

- `src/components/layout/notification-menu.tsx` - Main component
- `src/components/layout/page-header.tsx` - Header integration
- `src/components/ui/popover.tsx` - shadcn/ui Popover
- `src/components/ui/sheet.tsx` - shadcn/ui Sheet
- `src/components/ui/tabs.tsx` - shadcn/ui Tabs
- `src/components/ui/badge.tsx` - shadcn/ui Badge

---

## References

- [shadcn/ui Popover](https://ui.shadcn.com/docs/components/popover)
- [shadcn/ui Sheet](https://ui.shadcn.com/docs/components/sheet)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [date-fns](https://date-fns.org/docs/formatDistanceToNow)
