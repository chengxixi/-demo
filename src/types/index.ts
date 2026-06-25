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
  sellingPoints: string[] | string  // array or string separated by " / "
  specs: Record<string, string> | string
  pain: string
  // 登记字段
  channelType?: string
  asin?: string
  price?: number | string
  params?: string
  channels?: string
  tags?: string[]
  // 监控状态
  monitorStatus?: string      // 正常监控 / 已解除监控 / 已归档
  archived?: boolean
  registerFields?: Record<string, string>
}

// 竞品登记参数字段定义
export interface CompetitorFieldDef {
  category: string
  name: string
  type: 'text' | 'select' | 'url' | 'date' | 'number' | 'lineSelect'
  required: boolean
  options?: string[]
  placeholder?: string
}

// L1-L4 监控记录
export interface LevelRecord {
  level: string
  source: string
  content: string
  action: string
  status: string
  date: string
}

// 竞品监控快照
export interface MonitorSnapshot {
  [weekKey: string]: string
}

// 候选线索
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

// 产品需求池
export interface RequirementPoolItem {
  id: string
  candidate: string
  title: string
  source: string
  evidence: string
  product: string
  scores: { userValue: number; businessImpact: number; feasibility: number; competitiveImpact: number; inventoryImpact: number }
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
