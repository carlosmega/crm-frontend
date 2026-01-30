/**
 * Case Type Code (CDS: incident casetypecode)
 *
 * Type/category of the Case.
 * Helps categorize and route cases to appropriate teams.
 */
export enum CaseTypeCode {
  Question = 1,
  Problem = 2,
  Request = 3,
}

/**
 * Get display label for case type
 */
export function getCaseTypeLabel(type: CaseTypeCode): string {
  const labels: Record<CaseTypeCode, string> = {
    [CaseTypeCode.Question]: 'Question',
    [CaseTypeCode.Problem]: 'Problem',
    [CaseTypeCode.Request]: 'Request',
  }
  return labels[type] || 'Unknown'
}

/**
 * Get icon name for case type (Lucide icon names)
 */
export function getCaseTypeIcon(type: CaseTypeCode): string {
  const icons: Record<CaseTypeCode, string> = {
    [CaseTypeCode.Question]: 'help-circle',
    [CaseTypeCode.Problem]: 'alert-triangle',
    [CaseTypeCode.Request]: 'file-text',
  }
  return icons[type] || 'help-circle'
}

/**
 * Get color for case type (for badges/indicators)
 */
export function getCaseTypeColor(type: CaseTypeCode): string {
  const colors: Record<CaseTypeCode, string> = {
    [CaseTypeCode.Question]: 'blue',
    [CaseTypeCode.Problem]: 'red',
    [CaseTypeCode.Request]: 'green',
  }
  return colors[type] || 'gray'
}
