"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Cloud, CloudOff, Loader2, RefreshCw, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGraphConnectionStatus,
  useGraphConnect,
  useGraphSync,
  useGraphDisconnect,
} from '../hooks/use-graph-sync'

/**
 * GraphSyncPanel — Card showing Microsoft Graph connection status and sync controls.
 *
 * States:
 * - Not connected: Cloud icon + "Connect Office 365" button
 * - Connected: email + last sync info + "Sync Now" / "Disconnect" buttons
 * - Syncing: spinner + "Syncing emails..."
 *
 * Handles OAuth callback query params (?graph_connected=true, ?graph_error=...)
 */
export function GraphSyncPanel() {
  const searchParams = useSearchParams()
  const { data: status, isLoading } = useGraphConnectionStatus()
  const connectMutation = useGraphConnect()
  const syncMutation = useGraphSync()
  const disconnectMutation = useGraphDisconnect()

  // Handle OAuth callback query params
  useEffect(() => {
    const connected = searchParams.get('graph_connected')
    const error = searchParams.get('graph_error')

    if (connected === 'true') {
      toast.success('Office 365 connected successfully')
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('graph_connected')
      window.history.replaceState({}, '', url.toString())
    }

    if (error) {
      toast.error(`Office 365 connection failed: ${error}`)
      const url = new URL(window.location.href)
      url.searchParams.delete('graph_error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Handle sync completion toast
  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(
            `Synced ${result.new_emails} new email${result.new_emails !== 1 ? 's' : ''} ` +
            `(${result.matched_emails} matched, ${result.unmatched_emails} unlinked)`
          )
        } else {
          toast.error('Email sync encountered errors')
        }
      },
      onError: () => {
        toast.error('Failed to sync emails')
      },
    })
  }

  const handleDisconnect = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Office 365 disconnected')
      },
      onError: () => {
        toast.error('Failed to disconnect')
      },
    })
  }

  if (isLoading) {
    return null
  }

  const isSyncing = syncMutation.isPending

  // Format relative time
  const formatTimeAgo = (isoString: string | null) => {
    if (!isoString) return null
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (!status?.connected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Office 365 Email Sync</p>
              <p className="text-xs text-muted-foreground">
                Connect your Microsoft account to sync emails
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Cloud className="mr-2 h-4 w-4" />
            )}
            Connect Office 365
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-medium">
              {status.microsoft_email}
            </p>
            <p className="text-xs text-muted-foreground">
              {status.last_sync_on
                ? `Last sync ${formatTimeAgo(status.last_sync_on)} (${status.last_sync_count} emails)`
                : 'Not synced yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            title="Disconnect Office 365"
          >
            <Unplug className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  )
}
