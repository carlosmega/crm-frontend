/**
 * Competitor Entity (CDS: competitor)
 */
export const enum CompetitorStateCode {
  Active = 0,
  Inactive = 1,
}

export interface Competitor {
  competitorid: string
  name: string
  websiteurl?: string
  tickersymbol?: string
  stockexchange?: string
  reportedrevenue?: number
  reportedmarketcap?: number
  address1_city?: string
  address1_stateorprovince?: string
  address1_country?: string
  strengths?: string
  weaknesses?: string
  overview?: string
  keyproduct?: string
  statecode: CompetitorStateCode
  state_name?: string
  ownerid: string
  ownername?: string
  createdon: string
  modifiedon: string
  createdby?: string
  modifiedby?: string
}

export interface CreateCompetitorDto {
  name: string
  websiteurl?: string
  tickersymbol?: string
  stockexchange?: string
  reportedrevenue?: number
  reportedmarketcap?: number
  address1_city?: string
  address1_stateorprovince?: string
  address1_country?: string
  strengths?: string
  weaknesses?: string
  overview?: string
  keyproduct?: string
  ownerid: string
}

export interface UpdateCompetitorDto {
  name?: string
  websiteurl?: string
  tickersymbol?: string
  stockexchange?: string
  reportedrevenue?: number
  reportedmarketcap?: number
  address1_city?: string
  address1_stateorprovince?: string
  address1_country?: string
  strengths?: string
  weaknesses?: string
  overview?: string
  keyproduct?: string
}

export interface CompetitorOpportunity {
  competitoropportunityid: string
  competitorid: string
  opportunityid: string
  createdon: string
}
