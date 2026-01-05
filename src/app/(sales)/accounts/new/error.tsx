"use client"

import { PageError } from "@/components/ui/page-error"

export default function NewAccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <PageError error={error} reset={reset} title="Failed to load new account form" />
}
