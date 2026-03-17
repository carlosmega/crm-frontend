/**
 * Goal Entity (CDS: goal)
 */
export const enum GoalStateCode {
  Active = 0,
  Inactive = 1,
  Closed = 2,
}

export const enum GoalStatusCode {
  Open = 0,
  InProgress = 1,
  Achieved = 2,
  NotAchieved = 3,
  Closed = 4,
}

export const enum FiscalPeriod {
  Q1 = 1,
  Q2 = 2,
  Q3 = 3,
  Q4 = 4,
  Annual = 5,
  Monthly = 6,
}

export const enum MetricType {
  Amount = 0,
  Count = 1,
}

export interface GoalMetric {
  goalmetricid: string
  name: string
  metrictype: MetricType
  amountdatatype: number
  description?: string
  createdon: string
}

export interface CreateGoalMetricDto {
  name: string
  metrictype: number
  amountdatatype?: number
  description?: string
}

export interface Goal {
  goalid: string
  title: string
  description?: string
  goalmetricid: string
  goalownerid: string
  goalownername?: string
  manageid?: string
  managername?: string
  parentgoalid?: string
  fiscalperiod: FiscalPeriod
  fiscalyear: number
  targetmoney: number
  targetinteger: number
  actualmoney: number
  actualinteger: number
  inprogressmoney: number
  inprogressinteger: number
  percentage: number
  statecode: GoalStateCode
  statuscode: GoalStatusCode
  state_name?: string
  status_name?: string
  goalstartdate: string
  goalenddate: string
  lastrollupon?: string
  is_achieved?: boolean
  progress_display?: string
  days_remaining?: number
  ownerid: string
  ownername?: string
  createdon: string
  modifiedon: string
}

export interface CreateGoalDto {
  title: string
  description?: string
  goalmetricid: string
  goalownerid: string
  manageid?: string
  parentgoalid?: string
  fiscalperiod: number
  fiscalyear: number
  targetmoney?: number
  targetinteger?: number
  goalstartdate: string
  goalenddate: string
  ownerid: string
}

export interface UpdateGoalDto {
  title?: string
  description?: string
  targetmoney?: number
  targetinteger?: number
  actualmoney?: number
  actualinteger?: number
}
