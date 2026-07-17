export interface FeedbackItem {
  id: string
  mergeGroup: string
  source: string
  createMode: string
  region?: string
  dataSource?: string
  brand: string
  site: string
  productType: string
  model: string
  internal: string
  asin: string
  orderNo?: string
  expressNo?: string
  raw: string
  ai: string
  image?: string
  video?: string
  solution?: string
  level1: string
  level2: string
  level3: string
  sentiment: string
  returned: string
  exception: string
  processRoute: string
  processState: string
  feedbackUser: string
  handler: string
  date: string
  note?: string
}

export interface MergeGroup {
  mergeGroup: string
  lead: { data: FeedbackItem; confidence: number }
  members: { data: FeedbackItem; confidence: number }[]
  expanded: boolean
}

export interface WorkOrder {
  id: string
  summary: string
  relatedFeedback: string
  productLine: string
  status: string
  owner: string
  dept: string
  sla: string
  result: string
  closeReason: string
  exception: string
  requirement: string
  qa: string
  step: number
  aiAbstract: string
  closeNote: string
  inflowOperator?: string
  inflowTime?: string
  processedAt?: string
}

export interface EmergencyException {
  id: string
  level: string
  region: string
  site: string
  productLine: string
  internal: string
  creator: string
  dimension: string
  source: string
  deadline: string
  reminderLimit: string
  reminderDeadline: string
  overdue: boolean
  owner: string
  team: string
  status: string
  issue: string
  impactScope: string
  action: string
  feedback: string
  tempPlan: string
  rootCause: string
  fixPlan: string
  verifyResult: string
  step: number
}

export interface Competitor {
  id: string
  category: string
  type: string
  brand: string
  name: string
  model: string
  productType: string
  position: string
  launch: string
  platform: string
  region: string
  officialPrice: string
  dealPrice: string
  rating: string
  reviews: string
  sellingPoints: string[] | string
  specs: Record<string, string> | string
  pain: string
  channelType?: string
  asin?: string
  price?: number | string
  params?: string
  channels?: string
  tags?: string[]
  monitorStatus?: string
  archived?: boolean
  registerFields?: Record<string, string>
}

export interface CompetitorFieldDef {
  category: string
  name: string
  type: 'text' | 'select' | 'url' | 'date' | 'number' | 'lineSelect'
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface LevelRecord {
  level: string
  source: string
  content: string
  action: string
  status: string
  date: string
}

export interface MonitorSnapshot {
  [weekKey: string]: string
}

export interface CandidateLead {
  id: string
  sourceFeedback: string
  category: string
  title: string
  evidence: string
  product: string
  status: string
  nextAction: string
}

export interface RequirementPoolItem {
  id: string
  candidate: string
  title: string
  source: string
  evidence: string
  product: string
  scores: {
    userValue: number
    businessImpact: number
    feasibility: number
    competitiveImpact: number
    inventoryImpact: number
  }
  level: string
  path: string
  status: string
  owner: string
  due: string
  description: string
  painPoint: string
  expectedValue: string
  risk: string
  nextAction: string
  relatedFeedback: string
}

export interface UserRole {
  key: string
  name: string
  label: string
  scope: string
  avatar: string
}

export interface TemplateConfig {
  name: string
  values: Record<string, string | string[]>
}

export interface FilterOption {
  label: string
  value: string
}

export interface TabOption {
  key: string
  label: string
}

export interface Report {
  id: string
  title: string
  period: string
  type: string
  date: string
  summary: string
}

export interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  date: string
}
