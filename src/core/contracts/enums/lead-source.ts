/**
 * Lead Source Code
 *
 * Origen del Lead (cómo llegó el contacto inicial)
 */
export enum LeadSourceCode {
  Advertisement = 1,
  Employee_Referral = 2,
  External_Referral = 3,
  Partner = 4,
  Public_Relations = 5,
  Seminar = 6,
  Trade_Show = 7,
  Web = 8,
  Word_of_Mouth = 9,
  Other = 10
}

/**
 * Lead Source Labels
 *
 * Human-readable labels for Lead Source codes
 */
export const LeadSourceLabels: Record<LeadSourceCode, string> = {
  [LeadSourceCode.Advertisement]: 'Advertisement',
  [LeadSourceCode.Employee_Referral]: 'Employee Referral',
  [LeadSourceCode.External_Referral]: 'External Referral',
  [LeadSourceCode.Partner]: 'Partner',
  [LeadSourceCode.Public_Relations]: 'Public Relations',
  [LeadSourceCode.Seminar]: 'Seminar',
  [LeadSourceCode.Trade_Show]: 'Trade Show',
  [LeadSourceCode.Web]: 'Web',
  [LeadSourceCode.Word_of_Mouth]: 'Word of Mouth',
  [LeadSourceCode.Other]: 'Other',
}
