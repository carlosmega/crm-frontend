/**
 * Data Management - Import/Export entities
 */
export const enum ImportJobStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  CompletedWithErrors = 3,
  Failed = 4,
}

export const enum ExportJobStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
}

export const enum FileFormat {
  CSV = 0,
  Excel = 1,
}

export interface ImportError {
  row: number
  field: string
  message: string
}

export interface ImportJob {
  importjobid: string
  name: string
  entitytype: string
  status: ImportJobStatus
  status_name?: string
  totalrecords: number
  successcount: number
  errorcount: number
  skipcount: number
  errors: ImportError[]
  fieldmapping: Record<string, string>
  duplicatedetection: boolean
  startedon?: string
  completedon?: string
  duration?: string
  ownerid: string
  ownername?: string
  createdon: string
}

export interface CreateImportJobDto {
  name: string
  entitytype: string
  fieldmapping: Record<string, string>
  duplicatedetection?: boolean
  ownerid: string
  data: string  // base64 CSV content
}

export interface ExportJob {
  exportjobid: string
  name: string
  entitytype: string
  status: ExportJobStatus
  status_name?: string
  totalrecords: number
  filters: Record<string, unknown>
  columns: string[]
  fileformat: FileFormat
  resultdata?: string  // base64
  startedon?: string
  completedon?: string
  duration?: string
  ownerid: string
  ownername?: string
  createdon: string
}

export interface CreateExportJobDto {
  name: string
  entitytype: string
  filters?: Record<string, unknown>
  columns: string[]
  fileformat?: number
  ownerid: string
}

export interface CrmFieldInfo {
  name: string
  label: string
  type: string
  required: boolean
}

export interface FieldMappingPreview {
  csvcolumns: string[]
  crmfields: CrmFieldInfo[]
  suggestedmapping: Record<string, string>
}
