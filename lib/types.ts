export type ApplicationStatus =
  | 'SUBMITTED'
  | 'APPLICATION_VIEWED'
  | 'PRE_SCREENING'
  | 'FIRST_ROUND'
  | 'SECOND_ROUND'
  | 'FINAL_ROUND'
  | 'OFFER'
  | 'NO_REPLY'
  | 'WITHDRAWN'
  | 'UNSUCCESSFUL'
  | 'JOB_CLOSED'

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'CASUAL'
export type WorkMode = 'ONSITE' | 'HYBRID' | 'REMOTE'

export interface JobPlatform {
  id: string
  name: string
  is_active: boolean
  user_id: string
  created_at: string
}

export interface StatusHistory {
  id: string
  application_id: string
  status: ApplicationStatus
  changed_at: string
  note: string | null
}

export interface Application {
  id: string
  job_title: string
  company: string
  location: string
  submitted_date: string
  current_status: ApplicationStatus
  platform_id: string | null
  platform: JobPlatform | null
  job_url: string | null
  company_url: string | null
  salary_range: string | null
  job_type: JobType
  work_mode: WorkMode
  notes: string | null
  created_at: string
  updated_at: string
  status_history: StatusHistory[]
}

export interface Campaign {
  id: string
  name: string
  started_at: string
  ended_at: string | null
  is_active: boolean
  is_archived: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Stats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  byPlatform: Record<string, number>
  noReplyOver30: number
}

export interface WeeklyCount {
  week: string
  count: number
}

export interface PlatformPerformance {
  platform_id: string | null
  label: string
  total: number
  interviews: number
  offers: number
  responseRate: number
}

export interface AnalyticsStats extends Stats {
  weeklyApplications: WeeklyCount[]
  avgDaysToResponse: number
  responseRate: number
  interviewConversionRate: number
  offerRate: number
  platformPerformance: PlatformPerformance[]
  topCompanies: { company: string; count: number }[]
}

export interface SavedJob {
  id: string
  job_title: string
  company: string
  location: string | null
  platform_id: string | null
  platform: JobPlatform | null
  job_url: string | null
  company_url: string | null
  salary_range: string | null
  job_type: JobType
  work_mode: WorkMode
  notes: string | null
  deadline: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  APPLICATION_VIEWED: 'Viewed',
  PRE_SCREENING: 'Pre-Screening',
  FIRST_ROUND: '1st Round',
  SECOND_ROUND: '2nd Round',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  NO_REPLY: 'No Reply',
  WITHDRAWN: 'Withdrawn',
  UNSUCCESSFUL: 'Unsuccessful',
  JOB_CLOSED: 'Job Closed',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-[#E6F4F1] text-[#4A8C7E]',
  APPLICATION_VIEWED: 'bg-[#FAEEDA] text-[#854F0B]',
  PRE_SCREENING: 'bg-[#F0EAFB] text-[#7B3FAC]',
  FIRST_ROUND: 'bg-[#E6F4F1] text-[#0FA878]',
  SECOND_ROUND: 'bg-[#D8F0E5] text-[#1A6B5A]',
  FINAL_ROUND: 'bg-[#D1ECE0] text-[#0D9068]',
  OFFER: 'bg-[#E6F4F1] text-[#0FA878]',
  NO_REPLY: 'bg-[#F1EFF0] text-[#8AADA8]',
  WITHDRAWN: 'bg-[#F5E8E8] text-[#C0392B]',
  UNSUCCESSFUL: 'bg-[#F5E8E8] text-[#C0392B]',
  JOB_CLOSED: 'bg-[#EEF0F2] text-[#6B7A8D]',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  CASUAL: 'Casual',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
}

export const ALL_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'APPLICATION_VIEWED',
  'PRE_SCREENING',
  'FIRST_ROUND',
  'SECOND_ROUND',
  'FINAL_ROUND',
  'OFFER',
  'NO_REPLY',
  'WITHDRAWN',
  'UNSUCCESSFUL',
  'JOB_CLOSED',
]

export const STATUS_BADGE_STYLE: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-[#EBF3FB] text-[#0A66C2]',
  APPLICATION_VIEWED: 'bg-[#FBF4E8] text-[#A87820]',
  PRE_SCREENING: 'bg-[#F0EAFB] text-[#7B3FAC]',
  FIRST_ROUND: 'bg-[#FBF0EB] text-[#C4622E]',
  SECOND_ROUND: 'bg-[#FBF0EB] text-[#C4622E]',
  FINAL_ROUND: 'bg-[#FBF0EB] text-[#C4622E]',
  OFFER: 'bg-[#E6F4F1] text-[#0A7A56]',
  NO_REPLY: 'bg-[#EEF2F3] text-[#5E8088]',
  WITHDRAWN: 'bg-[#FBE8F2] text-[#A8004F]',
  UNSUCCESSFUL: 'bg-[#FBE8F2] text-[#A8004F]',
  JOB_CLOSED: 'bg-[#EEF0F2] text-[#6B7A8D]',
}
