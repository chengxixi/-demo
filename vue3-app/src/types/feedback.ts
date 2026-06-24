/** 反馈状态 */
export type FeedbackStatus = 'pending' | 'processing' | 'resolved';

/** 反馈状态筛选（含全部） */
export type FeedbackStatusFilter = 'all' | FeedbackStatus;

/** 优先级 */
export type FeedbackPriority = 'P0' | 'P1' | 'P2' | 'P3';

/** 反馈来源渠道 */
export type FeedbackSource =
  | '商品评论'
  | '退货原因'
  | '站内信'
  | '客服沟通'
  | 'APP反馈'
  | '社媒'
  | 'Vine'
  | '天使用户'
  | '投诉/警告';

/** 情绪 */
export type Sentiment = '负面' | '中性' | '正面';

/** 是否退货 */
export type IsReturn = '是' | '否';

/** 异常等级建议 */
export type AnomalyLevel = '无' | 'P1建议' | 'P2建议' | 'P3建议';

/** 处理去向 */
export type Disposition =
  | '待分流'
  | '已生成工单'
  | '转异常'
  | '生成候选需求'
  | '已加入Q&A';

/** 反馈记录 */
export interface FeedbackItem {
  id: string;
  title: string;
  source: FeedbackSource;
  site: string;
  brand: string;
  productType: string;
  salesModel: string;
  internalModel: string;
  asin: string;
  originalSummary: string;
  aiSummary: string;
  categoryL1: string;
  categoryL2: string;
  categoryL3: string;
  sentiment: Sentiment;
  isReturn: IsReturn;
  anomalyLevel: AnomalyLevel;
  disposition: Disposition;
  owner: string;
  createdAt: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  summary: string;
  tags: string[];
}

/** 全局筛选条件 */
export interface GlobalFilters {
  timeRange: 'today' | '7d' | '30d' | '90d' | 'custom';
  site: string;
  brand: string;
  productType: string;
  salesModel: string;
  source: string;
  compareMode: '环比' | '同比';
}

/** 仪表盘指标 */
export interface DashboardMetrics {
  returnRate: number;
  feedbackRate: number;
  closeRate: number;
  responseRate: number;
  anomalyRate: number;
  negativeRate: number;
}

/** 工单 */
export interface TicketItem {
  id: string;
  title: string;
  sourceFeedbackId: string;
  status: '待处理' | '处理中' | '待确认' | '已闭环';
  priority: FeedbackPriority;
  assignee: string;
  createdAt: string;
  deadline: string;
  category: string;
}

/** 异常记录 */
export interface ExceptionItem {
  id: string;
  title: string;
  sourceFeedbackId: string;
  level: 'P0' | 'P1' | 'P2' | 'P3';
  status: '待响应' | '处理中' | '已升级' | '已关闭';
  assignee: string;
  createdAt: string;
  deadline: string;
  impact: string;
  rootCause: string;
}

/** 候选需求线索 */
export interface CandidateLead {
  id: string;
  sourceFeedbackId: string;
  category: string;
  title: string;
  evidenceSummary: string;
  applicableProduct: string;
  status: '待处理' | '已合并' | '补证据' | '已评分';
}

/** 产品需求 */
export interface ProductRequirement {
  id: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  source: string;
  businessValue: number;
  userImpact: number;
  feasibility: number;
  urgency: number;
  strategicFit: number;
  totalScore: number;
  status: '待评审' | '评审中' | '已通过' | '已拒绝' | '开发中';
  owner: string;
  createdAt: string;
  tags: string[];
}

/** 竞品产品 */
export interface CompetitorProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  specs: Record<string, string>;
}

/** 舆情监测 */
export interface SentimentItem {
  id: string;
  platform: string;
  content: string;
  sentiment: Sentiment;
  date: string;
  competitor: string;
  keywords: string[];
}

/** 市场监控 */
export interface MarketMonitorItem {
  id: string;
  competitor: string;
  product: string;
  price: number;
  rating: number;
  reviewCount: number;
  bsr: number;
  lastUpdated: string;
  change: string;
}
