/**
 * Team Entity (CDS: team)
 */
export const enum TeamType {
  Owner = 0,
  Access = 1,
  Security = 2,
}

export interface Team {
  teamid: string
  name: string
  description?: string
  teamtype: TeamType
  teamtype_name?: string
  administratorid: string
  administrator_name?: string
  businessunitid?: string
  isdefault: boolean
  member_count?: number
  createdon: string
  modifiedon: string
  createdby?: string
  modifiedby?: string
}

export interface CreateTeamDto {
  name: string
  description?: string
  teamtype?: number
  administratorid: string
}

export interface UpdateTeamDto {
  name?: string
  description?: string
  teamtype?: number
  administratorid?: string
}

export interface TeamMembership {
  teammembershipid: string
  teamid: string
  systemuserid: string
  user_fullname?: string
  joinedon: string
}

export interface AddTeamMemberDto {
  systemuserid: string
}
