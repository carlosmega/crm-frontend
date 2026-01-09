import Link from 'next/link'
import { Bell, Check, AtSign, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationEmptyStateProps {
  type: 'all' | 'unread' | 'mentions'
}

export function NotificationEmptyState({ type }: NotificationEmptyStateProps) {
  const config = {
    all: {
      icon: Bell,
      title: 'No notifications yet',
      description: "You're all caught up! New notifications will appear here when there's activity on your leads, opportunities, and tasks.",
      action: { label: 'Notification Settings', href: '/settings/notifications', icon: Settings }
    },
    unread: {
      icon: Check,
      title: 'All caught up!',
      description: 'You have no unread notifications. Great job staying on top of things!',
      action: null
    },
    mentions: {
      icon: AtSign,
      title: 'No mentions',
      description: "You haven't been mentioned in any notifications recently.",
      action: null
    },
  }

  const { icon: Icon, title, description, action } = config[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 md:p-6 mb-4">
        <Icon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {action && (
        <Button variant="outline" asChild>
          <Link href={action.href}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  )
}
