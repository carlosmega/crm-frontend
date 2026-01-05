"use client"

import { cn } from "@/lib/utils"

interface FormFieldGroupProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

/**
 * FormFieldGroup - Groups related form fields with responsive grid layout
 *
 * @param columns - Number of columns on desktop (1-3), automatically responsive
 * @param className - Additional CSS classes
 *
 * @example
 * <FormFieldGroup columns={2}>
 *   <FormField name="firstname" ... />
 *   <FormField name="lastname" ... />
 * </FormFieldGroup>
 */
export function FormFieldGroup({ children, columns = 2, className }: FormFieldGroupProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}
