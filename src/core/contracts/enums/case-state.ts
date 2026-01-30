/**
 * Case State Code (CDS: incident statecode)
 *
 * States of a Case (Service Request/Ticket) in Microsoft Dynamics 365 Service:
 * - Active (0): Case is open and being worked on
 * - Resolved (1): Case has been resolved/closed successfully
 * - Cancelled (2): Case was cancelled (not completed)
 */
export enum CaseStateCode {
  Active = 0,
  Resolved = 1,
  Cancelled = 2
}

/**
 * Case Status Code (CDS: incident statuscode)
 *
 * Detailed status within each state:
 * - Active state: In Progress (1), On Hold (2), Waiting for Details (3)
 * - Resolved state: Problem Solved (5), Information Provided (1000)
 * - Cancelled state: Cancelled (6), Merged (2000)
 */
export enum CaseStatusCode {
  // Active state statuses
  InProgress = 1,
  OnHold = 2,
  WaitingForDetails = 3,
  Researching = 4,

  // Resolved state statuses
  ProblemSolved = 5,
  InformationProvided = 1000,

  // Cancelled state statuses
  Cancelled = 6,
  Merged = 2000,
}

/**
 * Get display label for case state
 */
export function getCaseStateLabel(state: CaseStateCode): string {
  const labels: Record<CaseStateCode, string> = {
    [CaseStateCode.Active]: 'Active',
    [CaseStateCode.Resolved]: 'Resolved',
    [CaseStateCode.Cancelled]: 'Cancelled',
  }
  return labels[state] || 'Unknown'
}

/**
 * Get display label for case status
 */
export function getCaseStatusLabel(status: CaseStatusCode): string {
  const labels: Record<CaseStatusCode, string> = {
    [CaseStatusCode.InProgress]: 'In Progress',
    [CaseStatusCode.OnHold]: 'On Hold',
    [CaseStatusCode.WaitingForDetails]: 'Waiting for Details',
    [CaseStatusCode.Researching]: 'Researching',
    [CaseStatusCode.ProblemSolved]: 'Problem Solved',
    [CaseStatusCode.InformationProvided]: 'Information Provided',
    [CaseStatusCode.Cancelled]: 'Cancelled',
    [CaseStatusCode.Merged]: 'Merged',
  }
  return labels[status] || 'Unknown'
}

/**
 * Get color for case state (for badges/indicators)
 */
export function getCaseStateColor(state: CaseStateCode): string {
  const colors: Record<CaseStateCode, string> = {
    [CaseStateCode.Active]: 'blue',
    [CaseStateCode.Resolved]: 'green',
    [CaseStateCode.Cancelled]: 'gray',
  }
  return colors[state] || 'gray'
}

/**
 * Get default status code for a given state
 */
export function getDefaultCaseStatusCode(state: CaseStateCode): CaseStatusCode {
  const defaults: Record<CaseStateCode, CaseStatusCode> = {
    [CaseStateCode.Active]: CaseStatusCode.InProgress,
    [CaseStateCode.Resolved]: CaseStatusCode.ProblemSolved,
    [CaseStateCode.Cancelled]: CaseStatusCode.Cancelled,
  }
  return defaults[state]
}
