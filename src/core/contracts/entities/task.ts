import type { ActivityStateCode } from '../enums';

/**
 * Task Activity Entity
 *
 * Representa una tarea o to-do item.
 */
export interface Task {
  // Primary Key
  activityid: string;

  // State & Status
  statecode: ActivityStateCode;
  statuscode?: number;

  // Task Information
  subject: string;                      // REQUIRED: Asunto de la tarea
  description?: string;                 // Descripción detallada

  // Progress
  percentcomplete?: number;             // Porcentaje completado (0-100)

  // Regarding (Polimórfico)
  regardingobjectid?: string;           // Lead/Opportunity/Account/Contact ID
  regardingobjectidtype?: string;

  // Scheduling
  scheduledstart?: string;              // Fecha de inicio
  scheduledend?: string;                // Fecha de vencimiento
  actualdurationminutes?: number;
  actualstart?: string;
  actualend?: string;

  // Priority
  prioritycode?: number;                // Low (0), Normal (1), High (2)

  // Ownership
  ownerid: string;

  // Categorization
  category?: string;                    // Categoría de la tarea
  subcategory?: string;

  // Audit Fields
  createdon: string;
  modifiedon: string;
  createdby?: string;
  modifiedby?: string;
}

/**
 * Create Task DTO
 */
export interface CreateTaskDto {
  subject: string;
  description?: string;
  regardingobjectid?: string;
  regardingobjectidtype?: string;
  scheduledstart?: string;
  scheduledend?: string;                // Due date
  prioritycode?: number;
  category?: string;
  ownerid: string;
}

/**
 * Update Task DTO
 */
export interface UpdateTaskDto {
  subject?: string;
  description?: string;
  percentcomplete?: number;
  scheduledstart?: string;
  scheduledend?: string;
  prioritycode?: number;
  category?: string;
}

/**
 * Complete Task DTO
 */
export interface CompleteTaskDto {
  statecode: ActivityStateCode.Completed;
  percentcomplete: 100;
  actualend: string;
}
