"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface IconInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  iconClassName?: string
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, type, icon: Icon, iconPosition = "left", iconClassName, value, ...props }, ref) => {
    // Ensure controlled component: convert undefined to empty string
    const controlledValue = value === undefined ? '' : value

    return (
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            Icon && iconPosition === "left" && "pl-10",
            Icon && iconPosition === "right" && "pr-10",
            className
          )}
          ref={ref}
          value={controlledValue}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
          </div>
        )}
      </div>
    )
  }
)
IconInput.displayName = "IconInput"

export { IconInput }
