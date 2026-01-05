import { toast } from 'sonner'

/**
 * Standardized toast helpers for consistent messaging across the app
 *
 * @example
 * ```typescript
 * import { toastHelpers } from '@/shared/utils/toast-helpers'
 *
 * toastHelpers.success('Quote created!', 'Quote QUO-001 has been created successfully')
 * toastHelpers.error('Failed to save', 'Please check your inputs')
 * toastHelpers.warning('Missing data', 'Consider adding line items before activating')
 * ```
 */
export const toastHelpers = {
  /**
   * Show success toast notification
   */
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 4000
    })
  },

  /**
   * Show error toast notification
   */
  error: (title: string, description?: string, error?: Error) => {
    toast.error(title, {
      description: description || error?.message,
      duration: 6000 // Longer duration for errors
    })
  },

  /**
   * Show warning toast notification (permissive validation)
   */
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 5000 // Medium duration for warnings
    })
  },

  /**
   * Show info toast notification
   */
  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      duration: 4000
    })
  },

  /**
   * Show loading toast that can be dismissed
   */
  loading: (title: string, description?: string) => {
    return toast.loading(title, { description })
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  }
}
