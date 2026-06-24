// 反馈管理系统 - TypeScript 类型定义

// ==================== 反馈相关 ====================
export interface FeedbackItem {
  id: string;
  mergeGroup: string;
  source: string;
  createMode: 'AI自动创建' | '人工录入';
  brand: string;
  site: string;
  productType: string;
  model: string;
  internal: string;
  asin: string;
  raw: string;
  ai: string;
  level1: string;
  level2: string;
  level3: string;
  sentiment: string;
  returned: string;
  exception: string;
  processRoute: string;
  processState: string;
  feedbackUser: string;
  handler: string;
  date: string;
  expanded?: boolean;
}

export interface FeedbackTab {
  key: string;
  label: string;
  count: number;
}

// ==================== 工单相关 ====================
export interface WorkOrder {
  id: string;
  summary: string;
  relatedFeedback: string;
  feedbackIds: string[];
  status: string;
  owner: string;
  dept: string;
  sla: string;
  result: string;
  closeReason: string;
  exception: string;
  requirement: string;
  step: number;
}

// ==================== 异常处理相关 ====================
export interface EmergencyException {
  id: string;
  level: string;
  region: string;
  site: string;
  productLine: string;
  internal: string;
  creator: string;
  dimension: string;
  source: string;
  deadline: string;
  reminderLimit: string;
  reminderDeadline: string;
  overdue: boolean;
  owner: string;
  team: string;
  status: string;
  issue: string;
  impactScope: string;
  action: string;
  feedback: string;
  tempPlan: string;
  rootCause: string;
  fixPlan: string;
  verifyResult: string;
  step: number;
}

// ==================== 需求相关 ====================
export interface Requirement {
  id: string;
  title: string;
  source: string;
  priority: string;
  status: string;
  owner: string;
  dept: string;
  date: string;
  description: string;
}

// ==================== 竞品相关 ====================
export interface Competitor {
  name: string;
  asin: string;
  line: string;
  price: string;
  channels: string;
  params: string;
}

// ==================== 报告相关 ====================
export interface Report {
  id: string;
  title: string;
  period: string;
  type: string;
  date: string;
  summary: string;
}

// ==================== Q&A / 知识库 ====================
export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  date: string;
}

// ==================== 系统配置 ====================
export interface UserRole {
  key: string;
  name: string;
  label: string;
  scope: string;
  avatar: string;
}

export interface SystemConfig {
  period: string;
  site: string;
  brand: string;
  productType: string;
  model: string;
  source: string;
}

// ==================== 通用筛选 ====================
export interface FilterOption {
  label: string;
  value: string;
}

// ==================== 仪表盘 ====================
export interface MetricCardData {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  formula: string;
}

export interface ModelRankItem {
  model: string;
  internal: string;
  material: string;
  returnRate: string;
  feedbackRate: string;
  closeRate: string;
  responseRate: string;
  exceptionRate: string;
  negativeRate: string;
}

export type CompareMode = 'yoy' | 'mom';
