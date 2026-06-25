// 反馈数据类型
export interface FeedbackItem {
  id: string
  mergeGroup: string
  source: string
  createMode: string
  brand: string
  site: string
  productType: string
  model: string
  internal: string
  asin: string
  raw: string
  ai: string
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
}

// 合并组
export interface MergeGroup {
  mergeGroup: string
  lead: { data: FeedbackItem; confidence: number }
  members: { data: FeedbackItem; confidence: number }[]
  expanded: boolean
}

// 工单
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
}

// 异常
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

// 竞品
export interface Competitor {
  name: string
  asin: string
  line: string
  price: string
  channels: string
  params: string
}

// 用户角色
export interface UserRole {
  key: string
  name: string
  label: string
  scope: string
  avatar: string
}

// 模板
export interface TemplateConfig {
  name: string
  values: Record<string, string | string[]>
}

// 过滤选项
export interface FilterOption {
  label: string
  value: string
}

// Tab 选项
export interface TabOption {
  key: string
  label: string
}

// 报告
export interface Report {
  id: string
  title: string
  period: string
  type: string
  date: string
  summary: string
}

// Q&A
export interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  date: string
}
