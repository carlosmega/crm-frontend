/**
 * Case Priority Code (CDS: incident prioritycode)
 *
 * Priority levels for Cases in Microsoft Dynamics 365 Service.
 * Higher priority cases typically have shorter SLA response times.
 */
export enum CasePriorityCode {
  High = 1,
  Normal = 2,
  Low = 3,
}

/**
 * Get display label for case priority
 */
export function getCasePriorityLabel(priority: CasePriorityCode): string {
  const labels: Record<CasePriorityCode, string> = {
    [CasePriorityCode.High]: 'High',
    [CasePriorityCode.Normal]: 'Normal',
    [CasePriorityCode.Low]: 'Low',
  }
  return labels[priority] || 'Unknown'
}

/**
 * Get color for case priority (for badges/indicators)
 */
export function getCasePriorityColor(priority: CasePriorityCode): string {
  const colors: Record<CasePriorityCode, string> = {
    [CasePriorityCode.High]: 'red',
    [CasePriorityCode.Normal]: 'yellow',
    [CasePriorityCode.Low]: 'green',
  }
  return colors[priority] || 'gray'
}

/**
 * Check if priority requires alert/attention
 */
export function isCasePriorityUrgent(priority: CasePriorityCode): boolean {
  return priority === CasePriorityCode.High
}
