/**
 * CDS Entities - Central Export Point
 *
 * Single Source of Truth para todas las entidades de CDS
 */

// ===== CORE ENTITIES =====

// SystemUser (Authentication & Authorization)
export type {
  SystemUser,
  CreateSystemUserDto,
  UpdateSystemUserDto,
  SystemUserSummary,
  UserSession
} from './system-user';
export { UserRole, UserStatus, getUserRoleDisplayName, isAdminUser, isManagerUser } from './system-user';

// AuditLog (Security & Compliance)
export type {
  AuditLog,
  CreateAuditLogDto,
  AuditLogQueryParams,
  AuditStats,
  AuditFieldChange
} from './audit-log';
export { AuditAction, getAuditActionDisplayName, formatFieldChange, isSensitiveAuditAction } from './audit-log';

// Lead
export type { Lead, CreateLeadDto, UpdateLeadDto, QualifyLeadDto, QualifyLeadResponse } from './lead';

// Opportunity
export type {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  CloseOpportunityDto
} from './opportunity';

// Account
export type { Account, CreateAccountDto, UpdateAccountDto } from './account';

// Contact
export type { Contact, CreateContactDto, UpdateContactDto } from './contact';

// ===== QUOTE-TO-CASH ENTITIES =====

// Quote
export type {
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto
} from './quote';

// Quote Detail
export type {
  QuoteDetail,
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto
} from './quote-detail';

// Quote Template
export type {
  QuoteTemplate,
  CreateQuoteTemplateDto,
  UpdateQuoteTemplateDto,
  ApplyTemplateDto
} from './quote-template';
export { QuoteTemplateCategory } from './quote-template';

// Quote Version
export type {
  QuoteVersion,
  CreateQuoteVersionDto,
  QuoteVersionComparison,
  QuoteVersionQueryParams
} from './quote-version';
export { QuoteVersionChangeType } from './quote-version';

// Order
export type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  FulfillOrderDto
} from './order';

// Order Detail
export type {
  OrderDetail,
  CreateOrderDetailDto,
  UpdateOrderDetailDto
} from './order-detail';

// Invoice
export type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  MarkInvoicePaidDto
} from './invoice';

// Invoice Detail
export type {
  InvoiceDetail,
  CreateInvoiceDetailDto,
  UpdateInvoiceDetailDto
} from './invoice-detail';

// ===== PRODUCT CATALOG =====

// Product
export type { Product, CreateProductDto, UpdateProductDto } from './product';

// Price List
export type { PriceList, CreatePriceListDto, UpdatePriceListDto } from './price-list';

// Price List Item
export type {
  PriceListItem,
  CreatePriceListItemDto,
  UpdatePriceListItemDto
} from './price-list-item';

// ===== ACTIVITIES =====

// Activity (Base)
export type {
  Activity,
  CreateActivityDto,
  UpdateActivityDto,
  CompleteActivityDto
} from './activity';

// Email
export type {
  Email,
  CreateEmailDto,
  SendEmailDto,
  LinkEmailDto,
  UnlinkedEmail,
  MatchSuggestionsResponse,
  MatchSuggestion,
  MatchedContact,
  MatchedAccount,
  CandidateOpportunity,
} from './email';
export type { EmailMatchMethod } from './email';

// Phone Call
export type {
  PhoneCall,
  CreatePhoneCallDto,
  LogCompletedPhoneCallDto
} from './phone-call';

// Task
export type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  CompleteTaskDto
} from './task';

// Appointment
export type {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto
} from './appointment';

// ===== SERVICE MODULE ENTITIES =====

// Case (Service Request/Ticket)
export type {
  Case,
  CreateCaseDto,
  UpdateCaseDto,
  ResolveCaseDto,
  CancelCaseDto
} from './case';

// ===== COLLABORATION & NOTES =====

// Annotation (Notes & Attachments)
export type {
  Annotation,
  CreateAnnotationDto,
  UpdateAnnotationDto
} from './annotation';

// ===== COMPETITION =====

// Competitor
export type {
  Competitor,
  CreateCompetitorDto,
  UpdateCompetitorDto,
  CompetitorOpportunity
} from './competitor';
export { CompetitorStateCode } from './competitor';

// ===== TEAMS & QUEUES =====

// Team
export type {
  Team,
  CreateTeamDto,
  UpdateTeamDto,
  TeamMembership,
  AddTeamMemberDto
} from './team';
export { TeamType } from './team';

// Queue
export type {
  Queue,
  CreateQueueDto,
  UpdateQueueDto,
  QueueItem,
  AddToQueueDto
} from './queue';
export { QueueTypeCode, QueueStateCode, QueueItemStateCode } from './queue';

// ===== GOALS & METRICS =====

// Goal
export type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalMetric,
  CreateGoalMetricDto
} from './goal';
export { GoalStateCode, GoalStatusCode, FiscalPeriod, MetricType } from './goal';

// ===== VIEWS & DATA MANAGEMENT =====

// SavedView
export type {
  SavedView,
  CreateSavedViewDto,
  UpdateSavedViewDto,
  ShareViewDto,
  FetchCriteria
} from './saved-view';
export { ViewType, LayoutType } from './saved-view';

// Data Management (Import/Export)
export type {
  ImportJob,
  CreateImportJobDto,
  ExportJob,
  CreateExportJobDto,
  ImportError,
  CrmFieldInfo,
  FieldMappingPreview
} from './data-management';
export { ImportJobStatus, ExportJobStatus, FileFormat } from './data-management';
