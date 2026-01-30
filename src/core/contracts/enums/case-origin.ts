/**
 * Case Origin Code (CDS: incident caseorigincode)
 *
 * Channel through which the Case was created.
 * Helps track which channels generate the most support requests.
 */
export enum CaseOriginCode {
  Phone = 1,
  Email = 2,
  Web = 3,
  Facebook = 2483,
  Twitter = 3986,
  IoT = 700610000,
}

/**
 * Get display label for case origin
 */
export function getCaseOriginLabel(origin: CaseOriginCode): string {
  const labels: Record<CaseOriginCode, string> = {
    [CaseOriginCode.Phone]: 'Phone',
    [CaseOriginCode.Email]: 'Email',
    [CaseOriginCode.Web]: 'Web',
    [CaseOriginCode.Facebook]: 'Facebook',
    [CaseOriginCode.Twitter]: 'Twitter',
    [CaseOriginCode.IoT]: 'IoT Alert',
  }
  return labels[origin] || 'Unknown'
}

/**
 * Get icon name for case origin (Lucide icon names)
 */
export function getCaseOriginIcon(origin: CaseOriginCode): string {
  const icons: Record<CaseOriginCode, string> = {
    [CaseOriginCode.Phone]: 'phone',
    [CaseOriginCode.Email]: 'mail',
    [CaseOriginCode.Web]: 'globe',
    [CaseOriginCode.Facebook]: 'facebook',
    [CaseOriginCode.Twitter]: 'twitter',
    [CaseOriginCode.IoT]: 'cpu',
  }
  return icons[origin] || 'help-circle'
}

/**
 * Get color for case origin (for badges/indicators)
 */
export function getCaseOriginColor(origin: CaseOriginCode): string {
  const colors: Record<CaseOriginCode, string> = {
    [CaseOriginCode.Phone]: 'green',
    [CaseOriginCode.Email]: 'blue',
    [CaseOriginCode.Web]: 'purple',
    [CaseOriginCode.Facebook]: 'indigo',
    [CaseOriginCode.Twitter]: 'sky',
    [CaseOriginCode.IoT]: 'orange',
  }
  return colors[origin] || 'gray'
}
