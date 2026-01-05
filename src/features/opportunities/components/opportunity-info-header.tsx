"use client"

import type { Opportunity } from '@/core/contracts'
import { OpportunityStateCode } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Flame, Building2, User as UserIcon } from 'lucide-react'

interface OpportunityInfoHeaderProps {
  opportunity: Opportunity
  className?: string
}

export function OpportunityInfoHeader({
  opportunity,
  className
}: OpportunityInfoHeaderProps) {
  // Determine priority badge
  const getPriorityBadge = () => {
    const value = opportunity.estimatedvalue || 0
    if (value > 100000) {
      return { icon: Flame, text: 'Hot', color: 'text-red-500' }
    }
    return { icon: Flame, text: 'Warm', color: 'text-orange-500' }
  }

  const priority = getPriorityBadge()
  const PriorityIcon = priority.icon

  return (
    <>
      {/* Desktop View - Original Layout */}
      <div className={cn("hidden md:block space-y-3", className)}>
        {/* Main Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {opportunity.name}
          </h1>
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase bg-purple-100 text-purple-700 border-0 px-3 py-1"
          >
            Sales Opportunity
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs font-semibold uppercase bg-gray-100 text-gray-700 border-0 px-3 py-1"
          >
            OPPORTUNITY
          </Badge>
        </div>

        {/* Info Pills */}
        <div className="flex items-center gap-4 text-sm">
          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <PriorityIcon className={cn("w-4 h-4", priority.color)} />
            <span className="font-medium text-gray-900">{priority.text}</span>
          </div>

          {/* Origin/Source */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="font-medium">Origin:</span>
            <span className="text-gray-900 font-medium">
              {opportunity.customeridtype === 'account' ? 'B2B' : 'B2C'}
            </span>
          </div>

          {/* State */}
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold uppercase border-0 px-3 py-1",
              opportunity.statecode === OpportunityStateCode.Open && "bg-green-100 text-green-700",
              opportunity.statecode === OpportunityStateCode.Won && "bg-emerald-100 text-emerald-700",
              opportunity.statecode === OpportunityStateCode.Lost && "bg-red-100 text-red-700"
            )}
          >
            {opportunity.statecode === OpportunityStateCode.Open && 'OPEN'}
            {opportunity.statecode === OpportunityStateCode.Won && 'WON'}
            {opportunity.statecode === OpportunityStateCode.Lost && 'LOST'}
          </Badge>

          {/* Customer/Company */}
          {opportunity.customerid && (
            <div className="flex items-center gap-1.5">
              {opportunity.customeridtype === 'account' ? (
                <Building2 className="w-4 h-4 text-gray-600" />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-gray-900 font-medium">
                Customer Account
              </span>
            </div>
          )}
        </div>

        {/* Owner */}
        {opportunity.ownerid && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4 text-purple-600" />
            <span className="font-medium">Propietario:</span>
            <span className="text-gray-900 font-medium">
              {opportunity.ownerid.slice(0, 2)} {opportunity.ownerid.slice(0, 15)}...
            </span>
          </div>
        )}
      </div>

      {/* Mobile View - Card Layout */}
      <Card className="md:hidden">
        <CardContent className="p-4 space-y-3">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs font-semibold uppercase bg-purple-100 text-purple-700 border-0 px-3 py-1"
            >
              Sales Opportunity
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs font-semibold uppercase bg-gray-100 text-gray-700 border-0 px-3 py-1"
            >
              OPPORTUNITY
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {opportunity.name}
          </h1>

          {/* Info Pills */}
          <div className="flex items-center gap-3 text-sm flex-wrap">
            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <PriorityIcon className={cn("w-4 h-4", priority.color)} />
              <span className="font-medium text-gray-900">{priority.text}</span>
            </div>

            {/* Origin/Source */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="font-medium">Origin:</span>
              <span className="text-gray-900 font-medium">
                {opportunity.customeridtype === 'account' ? 'B2B' : 'B2C'}
              </span>
            </div>

            {/* State */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold uppercase border-0 px-3 py-1",
                opportunity.statecode === OpportunityStateCode.Open && "bg-green-100 text-green-700",
                opportunity.statecode === OpportunityStateCode.Won && "bg-emerald-100 text-emerald-700",
                opportunity.statecode === OpportunityStateCode.Lost && "bg-red-100 text-red-700"
              )}
            >
              {opportunity.statecode === OpportunityStateCode.Open && 'OPEN'}
              {opportunity.statecode === OpportunityStateCode.Won && 'WON'}
              {opportunity.statecode === OpportunityStateCode.Lost && 'LOST'}
            </Badge>
          </div>

          {/* Owner */}
          {opportunity.ownerid && (
            <div className="flex items-center gap-2 text-sm text-gray-600 pt-1">
              <UserIcon className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Propietario:</span>
              <span className="text-gray-900 font-medium truncate">
                {opportunity.ownerid.slice(0, 2)} {opportunity.ownerid.slice(0, 15)}...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
