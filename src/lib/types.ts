export type UserRole = 'hustler' | 'entrepreneur'

export interface Profile {
  id: string
  role: UserRole
  name: string
  email: string
  mobile: string | null
  location: string | null
  heard_from: string | null
  avatar_url: string | null
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Hustler {
  id: string
  skill: string
  is_active: boolean
  rating: number
  completed_briefs: number
  bio: string | null
  portfolio_url: string | null
  created_at: string
}

export interface Entrepreneur {
  id: string
  startup_name: string
  industry: string | null
  website: string | null
  created_at: string
}

export interface Brief {
  id: string
  entrepreneur_id: string
  title: string
  description: string
  skill: string
  budget: number
  urgency: 'Urgent' | 'Normal'
  location_pref: string
  status: 'active' | 'matched' | 'closed'
  created_at: string
}

export interface Match {
  id: string
  brief_id: string
  hustler_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export type HustlerWithProfile = Hustler & { profiles: Profile }
export type BriefWithEntrepreneur = Brief & {
  entrepreneurs: Entrepreneur & { profiles: Profile }
}

export const SKILLS = [
  'Design',
  'Development',
  'Marketing',
  'Content Writing',
  'Video Editing',
  'Social Media',
  'Finance',
  'Legal',
  'Other',
] as const

export type Skill = (typeof SKILLS)[number]

export const HEARD_FROM = [
  'Instagram',
  'LinkedIn',
  'Friend / Referral',
  'Google',
  'Twitter / X',
  'Other',
] as const
