"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PageErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}

export function PageError({ error, reset, title = "Something went wrong" }: PageErrorProps) {
  return (
    <div className="flex h-full flex-1 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message || "An unexpected error occurred. Please try again."}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        </div>

        {error.digest && (
          <p className="text-center text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
