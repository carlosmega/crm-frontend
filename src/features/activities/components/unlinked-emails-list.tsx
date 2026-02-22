'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { useUnlinkedEmails } from '../hooks'
import { LinkToRecordDialog } from './link-to-record-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Link2, Mail, ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { UnlinkedEmail } from '@/core/contracts/entities/email'

// ============================================================================
// Memoized Row
// ============================================================================

const UnlinkedEmailRow = memo(function UnlinkedEmailRow({
  email,
  onLink,
}: {
  email: UnlinkedEmail
  onLink: (activityId: string) => void
}) {
  return (
    <TableRow>
      <TableCell className="max-w-[300px]">
        <div className="flex items-center gap-2">
          {email.directioncode ? (
            <ArrowUpRight className="size-4 text-blue-500 shrink-0" />
          ) : (
            <ArrowDownLeft className="size-4 text-green-500 shrink-0" />
          )}
          <span className="truncate font-medium">{email.subject}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
        {email.sender || '-'}
      </TableCell>
      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
        {email.to || '-'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDistanceToNow(new Date(email.createdon), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onLink(email.activityid)}
        >
          <Link2 className="size-3 mr-1" />
          Link
        </Button>
      </TableCell>
    </TableRow>
  )
})

// ============================================================================
// Main Component
// ============================================================================

export function UnlinkedEmailsList() {
  const { data: emails, isLoading, refetch } = useUnlinkedEmails()
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const handleLink = useCallback((activityId: string) => {
    setSelectedActivityId(activityId)
    setLinkDialogOpen(true)
  }, [])

  const handleLinked = useCallback(() => {
    refetch()
    setLinkDialogOpen(false)
    setSelectedActivityId(null)
  }, [refetch])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="size-12 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No unlinked emails</p>
          <p className="text-sm text-muted-foreground mt-1">
            All emails are associated with CRM records
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <UnlinkedEmailRow
                key={email.activityid}
                email={email}
                onLink={handleLink}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedActivityId && (
        <LinkToRecordDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          activityId={selectedActivityId}
          onLinked={handleLinked}
        />
      )}
    </>
  )
}
