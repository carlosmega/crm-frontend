/**
 * CDS Contracts - Central Export Point
 *
 * 🎯 SINGLE SOURCE OF TRUTH para todos los contratos CDS
 *
 * Este es el punto de entrada único para importar cualquier tipo,
 * enum o contrato relacionado con Microsoft Dynamics 365 Sales (CDS).
 *
 * Uso:
 * ```typescript
 * import { Lead, LeadStateCode, OpportunityStateCode } from '@/core/contracts';
 * ```
 */

// ===== ENUMS =====
export * from './enums';

// ===== ENTITIES =====
export * from './entities';

// ===== API CONTRACTS =====
export * from './api';
