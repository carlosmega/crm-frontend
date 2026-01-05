"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b pb-2",
          collapsible && "cursor-pointer select-none"
        )}
        onClick={handleToggle}
        role={collapsible ? "button" : undefined}
        aria-expanded={collapsible ? isOpen : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            handleToggle()
          }
        }}
      >
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {collapsible && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </div>

      {/* Section Content */}
      {collapsible ? (
        <div
          className={cn(
            "grid transition-all duration-200",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="pt-1">{children}</div>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}
