/**
 * SavedView Entity (CDS: savedquery/userquery)
 */
export const enum ViewType {
  Personal = 0,
  System = 1,
  Shared = 2,
}

export const enum LayoutType {
  Grid = 0,
  Card = 1,
  Kanban = 2,
}

export interface FetchCriteria {
  filters?: Array<{
    field: string
    operator: string
    value: unknown
  }>
  sortby?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  columns?: string[]
}

export interface SavedView {
  savedviewid: string
  name: string
  description?: string
  entitytype: string
  viewtype: ViewType
  viewtype_name?: string
  fetchcriteria: FetchCriteria
  isdefault: boolean
  ispinned: boolean
  layouttype: LayoutType
  layouttype_name?: string
  ownerid: string
  ownername?: string
  createdon: string
  modifiedon: string
}

export interface CreateSavedViewDto {
  name: string
  description?: string
  entitytype: string
  fetchcriteria: FetchCriteria
  viewtype?: number
  isdefault?: boolean
  ispinned?: boolean
  layouttype?: number
  ownerid: string
}

export interface UpdateSavedViewDto {
  name?: string
  description?: string
  fetchcriteria?: FetchCriteria
  isdefault?: boolean
  ispinned?: boolean
  layouttype?: number
}

export interface ShareViewDto {
  userids: string[]
}
