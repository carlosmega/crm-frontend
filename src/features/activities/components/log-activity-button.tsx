'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Mail,
  Phone,
  CheckSquare,
  Calendar,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { CreateActivityDialog } from './create-activity-dialog'
import { ActivityTypeCode } from '@/core/contracts/enums'

interface LogActivityButtonProps {
  regardingId: string
  regardingType: 'lead' | 'opportunity' | 'account' | 'contact' | 'quote' | 'order'
  regardingName: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showQuickActions?: boolean
}

/**
 * Log Activity Button Component
 *
 * Botón reutilizable para crear actividades desde cualquier entidad.
 * Incluye quick actions para Email, Phone Call, Task, y Meeting.
 *
 * @example
 * ```tsx
 * <LogActivityButton
 *   regardingId={lead.leadid}
 *   regardingType="lead"
 *   regardingName={lead.fullname}
 *   showQuickActions
 * />
 * ```
 */
export function LogActivityButton({
  regardingId,
  regardingType,
  regardingName,
  variant = 'outline',
  size = 'default',
  showQuickActions = true,
}: LogActivityButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityTypeCode | undefined>()

  const handleQuickAction = (activityType: ActivityTypeCode) => {
    setSelectedActivityType(activityType)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedActivityType(undefined)
  }

  if (!showQuickActions) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>

        <CreateActivityDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          regardingId={regardingId}
          regardingType={regardingType}
          regardingName={regardingName}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size}>
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleQuickAction(ActivityTypeCode.Email)}>
            <Mail className="h-4 w-4 mr-2 text-blue-600" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-xs text-muted-foreground">Send an email</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickAction(ActivityTypeCode.PhoneCall)}>
            <Phone className="h-4 w-4 mr-2 text-green-600" />
            <div>
              <p className="font-medium">Phone Call</p>
              <p className="text-xs text-muted-foreground">Log a call</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickAction(ActivityTypeCode.Task)}>
            <CheckSquare className="h-4 w-4 mr-2 text-orange-600" />
            <div>
              <p className="font-medium">Task</p>
              <p className="text-xs text-muted-foreground">Create a task</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickAction(ActivityTypeCode.Appointment)}>
            <Calendar className="h-4 w-4 mr-2 text-purple-600" />
            <div>
              <p className="font-medium">Meeting</p>
              <p className="text-xs text-muted-foreground">Schedule a meeting</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickAction(ActivityTypeCode.Note)}>
            <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
            <div>
              <p className="font-medium">Note</p>
              <p className="text-xs text-muted-foreground">Add a quick note</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Other Activity...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateActivityDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        regardingId={regardingId}
        regardingType={regardingType}
        regardingName={regardingName}
      />
    </>
  )
}
