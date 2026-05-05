export type ApplicationStatus =
  | 'SUBMITTED'
  | 'APPLICATION_VIEWED'
  | 'FIRST_ROUND'
  | 'SECOND_ROUND'
  | 'FINAL_ROUND'
  | 'OFFER'
  | 'NO_REPLY'
  | 'WITHDRAWN'

export type Platform = 'SEEK' | 'INDEED' | 'LINKEDIN' | 'COMPANY'
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'CASUAL'
export type WorkMode = 'ONSITE' | 'HYBRID' | 'REMOTE'

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
  platform: Platform
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

export interface Stats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  byPlatform: Record<Platform, number>
}

export interface WeeklyCount {
  week: string
  count: number
}

export interface PlatformPerformance {
  platform: string
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
  platform: Platform
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
  FIRST_ROUND: '1st Round',
  SECOND_ROUND: '2nd Round',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  NO_REPLY: 'No Reply',
  WITHDRAWN: 'Withdrawn',
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPLICATION_VIEWED: 'bg-purple-100 text-purple-800',
  FIRST_ROUND: 'bg-yellow-100 text-yellow-800',
  SECOND_ROUND: 'bg-orange-100 text-orange-800',
  FINAL_ROUND: 'bg-indigo-100 text-indigo-800',
  OFFER: 'bg-green-100 text-green-800',
  NO_REPLY: 'bg-gray-100 text-gray-600',
  WITHDRAWN: 'bg-red-100 text-red-800',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  SEEK: 'Seek',
  INDEED: 'Indeed',
  LINKEDIN: 'LinkedIn',
  COMPANY: 'Company Website',
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
  'FIRST_ROUND',
  'SECOND_ROUND',
  'FINAL_ROUND',
  'OFFER',
  'NO_REPLY',
  'WITHDRAWN',
]

export const STATUS_BADGE_STYLE: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-[#E6F1FB] text-[#185FA5]',
  APPLICATION_VIEWED: 'bg-[#FAEEDA] text-[#854F0B]',
  FIRST_ROUND: 'bg-[#E1F5EE] text-[#0F6E56]',
  SECOND_ROUND: 'bg-[#D8F0E5] text-[#0A5C47]',
  FINAL_ROUND: 'bg-[#D1ECE0] text-[#085040]',
  OFFER: 'bg-[#EAF3DE] text-[#3B6D11]',
  NO_REPLY: 'bg-[#F1EFE8] text-[#5F5E5A]',
  WITHDRAWN: 'bg-[#F5E8E8] text-[#8B3030]',
}
