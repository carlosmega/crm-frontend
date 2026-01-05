/**
 * Lead State Code (CORREGIDO)
 *
 * Estados de Lead en Microsoft Dynamics 365 Sales:
 * - Open (0): Lead activo en proceso
 * - Qualified (1): Lead calificado → Opportunity creada
 * - Disqualified (2): Lead descalificado (no viable)
 *
 * ⚠️ IMPORTANTE: Lead calificado cambia a Qualified (1), NO a Inactive
 */
export enum LeadStateCode {
  Open = 0,
  Qualified = 1,
  Disqualified = 2
}
