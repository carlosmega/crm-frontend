/**
 * Annotation Entity (CDS: annotation)
 * Notes and file attachments linked to any business entity.
 */
export interface Annotation {
  annotationid: string
  subject?: string
  notetext?: string
  objectid?: string
  objecttypecode?: string
  filename?: string
  mimetype?: string
  filesize?: number
  documentbody?: string
  isdocument: boolean
  ownerid: string
  ownername?: string
  has_attachment?: boolean
  filesize_display?: string
  createdon: string
  modifiedon: string
  createdby?: string
  modifiedby?: string
}

export interface CreateAnnotationDto {
  objectid?: string
  objecttypecode?: string
  subject?: string
  notetext?: string
  filename?: string
  mimetype?: string
  filesize?: number
  documentbody?: string
  isdocument?: boolean
  ownerid: string
}

export interface UpdateAnnotationDto {
  subject?: string
  notetext?: string
}
