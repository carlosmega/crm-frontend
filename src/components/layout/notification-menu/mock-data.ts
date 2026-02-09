import type { Notification } from './types'

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New lead assigned',
    description: 'Acme Corp - Enterprise Software inquiry',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    isRead: false,
    priority: 'high',
    relatedEntityId: 'lead-123',
    relatedEntityType: 'lead',
    relatedEntityName: 'Acme Corp',
    actionUrl: '/leads/lead-123',
    actor: {
      name: 'John Smith',
      avatarUrl: undefined,
    },
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Opportunity stage changed',
    description: 'Enterprise Deal moved to Propose (75%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    priority: 'medium',
    relatedEntityId: 'opp-456',
    relatedEntityType: 'opportunity',
    relatedEntityName: 'Enterprise Deal',
    actionUrl: '/opportunities/opp-456',
    actor: {
      name: 'Sarah Johnson',
    },
  },
  {
    id: '3',
    type: 'quote',
    title: 'Quote approved',
    description: 'Q-2024-001 approved by Finance Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    priority: 'high',
    relatedEntityId: 'quote-789',
    relatedEntityType: 'quote',
    relatedEntityName: 'Q-2024-001',
    actionUrl: '/quotes/quote-789',
  },
  {
    id: '4',
    type: 'task',
    title: 'Task due today',
    description: 'Follow up with John Doe regarding proposal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    priority: 'medium',
    actionUrl: '/activities/task-321',
  },
  {
    id: '5',
    type: 'mention',
    title: 'You were mentioned',
    description: '@you mentioned in Opportunity: Cloud Migration Project',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
    priority: 'low',
    relatedEntityId: 'opp-999',
    relatedEntityType: 'opportunity',
    actionUrl: '/opportunities/opp-999',
    actor: {
      name: 'Mike Davis',
    },
  },
]
