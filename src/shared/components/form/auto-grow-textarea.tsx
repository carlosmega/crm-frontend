"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoGrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const AutoGrowTextarea = React.forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  ({ className, minRows = 2, maxRows, onChange, value, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    // Ensure controlled component: convert undefined to empty string
    const controlledValue = value === undefined ? '' : value

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'

      // Calculate line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const minHeight = lineHeight * minRows
      const maxHeight = maxRows ? lineHeight * maxRows : Infinity

      // Set new height
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden'
    }, [minRows, maxRows, textareaRef])

    React.useEffect(() => {
      adjustHeight()
    }, [controlledValue, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight()
      onChange?.(e)
    }

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-[height]",
          className
        )}
        ref={textareaRef}
        onChange={handleChange}
        rows={minRows}
        value={controlledValue}
        {...props}
      />
    )
  }
)
AutoGrowTextarea.displayName = "AutoGrowTextarea"

export { AutoGrowTextarea }
