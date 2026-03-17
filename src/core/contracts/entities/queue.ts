/**
 * Queue Entity (CDS: queue)
 */
export const enum QueueTypeCode {
  Public = 0,
  Private = 1,
}

export const enum QueueStateCode {
  Active = 0,
  Inactive = 1,
}

export const enum QueueItemStateCode {
  Active = 0,
  Inactive = 1,
}

export interface Queue {
  queueid: string
  name: string
  description?: string
  queuetypecode: QueueTypeCode
  statecode: QueueStateCode
  state_name?: string
  type_name?: string
  allowemailcredentials: boolean
  ownerid: string
  ownername?: string
  item_count?: number
  createdon: string
  modifiedon: string
}

export interface CreateQueueDto {
  name: string
  description?: string
  queuetypecode?: number
  ownerid: string
}

export interface UpdateQueueDto {
  name?: string
  description?: string
  queuetypecode?: number
}

export interface QueueItem {
  queueitemid: string
  queueid: string
  objectid: string
  objecttypecode: string
  title?: string
  enteredon: string
  workerid?: string
  workername?: string
  workedon?: string
  statecode: QueueItemStateCode
  state_name?: string
}

export interface AddToQueueDto {
  objectid: string
  objecttypecode: string
  title?: string
}
