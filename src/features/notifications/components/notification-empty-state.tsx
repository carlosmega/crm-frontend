import { Bell, Check, AtSign } from 'lucide-react'

interface NotificationEmptyStateProps {
  type: 'all' | 'unread' | 'mentions'
}

export function NotificationEmptyState({ type }: NotificationEmptyStateProps) {
  const config = {
    all: {
      icon: Bell,
      title: 'No notifications yet',
      description: "You're all caught up! New notifications will appear here.",
    },
    unread: {
      icon: Check,
      title: 'No unread notifications',
      description: 'All your notifications have been read. Great job staying on top of things!',
    },
    mentions: {
      icon: AtSign,
      title: 'No mentions',
      description: "You haven't been mentioned in any notifications recently.",
    },
  }

  const { icon: Icon, title, description } = config[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  )
}
