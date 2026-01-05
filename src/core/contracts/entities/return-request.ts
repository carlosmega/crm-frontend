import type { CustomerType } from '../enums'

/**
 * Return Request Entity
 *
 * Representa una solicitud de devolución (RMA - Return Material Authorization)
 * Basado en el proceso de devoluciones de Dynamics 365
 */

export interface ReturnRequest {
  // Identificadores
  returnrequestid: string
  rmanumber: string // Return Material Authorization number
  name: string

  // Estado
  statecode: ReturnRequestStateCode
  statuscode?: ReturnRequestStatusCode

  // Relaciones
  salesorderid?: string // Order original
  invoiceid?: string // Invoice relacionada (si existe)
  customerid: string // Customer (Account o Contact)
  customeridtype: CustomerType
  ownerid: string

  // Detalles de la devolución
  returnreason: ReturnReasonCode
  returnreasondetails?: string // Detalles adicionales
  returntypecode: ReturnTypeCode // Full refund, partial refund, exchange, store credit

  // Cantidades y montos
  totalamount: number // Total a reembolsar
  restockingfee?: number // Tarifa de reabastecimiento
  refundamount?: number // Monto final después de fees
  shippingrefund?: number // Reembolso de envío

  // Fechas
  requestdate: string // Fecha de solicitud
  approvaldate?: string // Fecha de aprobación
  completiondate?: string // Fecha de completado
  expectedreturndate?: string // Fecha esperada de recepción

  // Shipping info (devolución)
  returnshippingmethod?: string
  returntrackingnumber?: string

  // Notas
  customernotes?: string
  internalnotes?: string

  // Audit
  createdon: string
  modifiedon: string
  createdby?: string
}

/**
 * Return Request State Code
 */
export enum ReturnRequestStateCode {
  /**
   * Pending - Pendiente de aprobación
   */
  Pending = 0,

  /**
   * Approved - Aprobada, esperando devolución
   */
  Approved = 1,

  /**
   * Received - Producto recibido
   */
  Received = 2,

  /**
   * Completed - Reembolso completado
   */
  Completed = 3,

  /**
   * Rejected - Solicitud rechazada
   */
  Rejected = 4,

  /**
   * Canceled - Cancelada por cliente
   */
  Canceled = 5,
}

/**
 * Return Request Status Code (sub-estados)
 */
export enum ReturnRequestStatusCode {
  PendingReview = 1,
  Approved = 2,
  AwaitingReturn = 3,
  InTransit = 4,
  Received = 5,
  Inspecting = 6,
  ProcessingRefund = 7,
  Completed = 8,
  Rejected = 9,
  Canceled = 10,
}

/**
 * Return Reason Code
 */
export enum ReturnReasonCode {
  /**
   * Defective - Producto defectuoso
   */
  Defective = 1,

  /**
   * Wrong Item - Artículo incorrecto enviado
   */
  WrongItem = 2,

  /**
   * Damaged - Dañado durante envío
   */
  Damaged = 3,

  /**
   * Not As Described - No coincide con descripción
   */
  NotAsDescribed = 4,

  /**
   * Changed Mind - Cliente cambió de opinión
   */
  ChangedMind = 5,

  /**
   * Better Price - Encontró mejor precio
   */
  BetterPrice = 6,

  /**
   * Order Error - Error en orden
   */
  OrderError = 7,

  /**
   * Late Delivery - Entrega tardía
   */
  LateDelivery = 8,

  /**
   * No Longer Needed - Ya no necesita
   */
  NoLongerNeeded = 9,

  /**
   * Other - Otra razón
   */
  Other = 99,
}

/**
 * Return Type Code
 */
export enum ReturnTypeCode {
  /**
   * Full Refund - Reembolso completo
   */
  FullRefund = 1,

  /**
   * Partial Refund - Reembolso parcial
   */
  PartialRefund = 2,

  /**
   * Exchange - Intercambio por otro producto
   */
  Exchange = 3,

  /**
   * Store Credit - Crédito en tienda
   */
  StoreCredit = 4,

  /**
   * Replacement - Reemplazo (sin cargo)
   */
  Replacement = 5,
}

/**
 * Create Return Request DTO
 */
export interface CreateReturnRequestDto {
  name: string
  salesorderid: string
  invoiceid?: string
  customerid: string
  customeridtype: CustomerType
  ownerid: string
  returnreason: ReturnReasonCode
  returnreasondetails?: string
  returntypecode: ReturnTypeCode
  totalamount: number
  customernotes?: string
  internalnotes?: string
}

/**
 * Update Return Request DTO
 */
export interface UpdateReturnRequestDto {
  returnreasondetails?: string
  returntypecode?: ReturnTypeCode
  restockingfee?: number
  refundamount?: number
  shippingrefund?: number
  returnshippingmethod?: string
  returntrackingnumber?: string
  internalnotes?: string
}

/**
 * Approve Return Request DTO
 */
export interface ApproveReturnRequestDto {
  approvaldate: string
  expectedreturndate?: string
  internalnotes?: string
}

/**
 * Complete Return Request DTO
 */
export interface CompleteReturnRequestDto {
  completiondate: string
  refundamount: number
  internalnotes?: string
}
