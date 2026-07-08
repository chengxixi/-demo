export const filterPeriodOptions = ['近7天', '近30天', '近90天', '自定义']
export const filterBrandOptions = ['全部品牌', '云康宝', 'AF', 'GE', 'LF']
export const filterSiteOptions = ['全部站点', 'Amazon.com (US)', '天猫', '京东', '抖音']
export const filterProductTypeOptions = ['全部产品类型', '体脂秤', '人体秤', '八电极秤', '筋膜枪']
export const filterModelOptions = ['全部', 'CS20A', 'CS30B', 'BF511', 'MG20', 'MS30']
export const filterSourceOptions = ['全部', '商品评论', '退货原因', '站内信', '客服沟通', 'APP反馈']

export const defaultFilters = {
  period: '近30天',
  site: 'Amazon.com (US)',
  brand: '全部品牌',
  productType: '体脂秤',
  model: '全部',
  source: '全部',
}

export const dashboardMetricCards = [
  { label: '退货率', value: '4.38%', trend: '-0.72%', trendType: 'down-good', note1: '退货量', note2: '1,256' },
  { label: '反馈率', value: '12.67%', trend: '-1.34%', trendType: 'down-good', note1: '反馈量', note2: '3,637' },
  { label: '闭环率', value: '87.45%', trend: '+3.21%', trendType: 'up-good', note1: '已闭环', note2: '3,178' },
  { label: '响应达成率', value: '92.16%', trend: '+4.57%', trendType: 'up-good', note1: '达成', note2: '3,349' },
  { label: '异常占比', value: '6.72%', trend: '+0.89%', trendType: 'up-bad', note1: '异常工单', note2: '244' },
  { label: '差评率', value: '3.25%', trend: '-0.31%', trendType: 'down-good', note1: '差评数量', note2: '935' },
]

export const metricFormulas: Record<string, string> = {
  退货率: '退货量 / 销量',
  反馈率: '反馈量 / 销量',
  闭环率: '已闭环反馈 / 总反馈',
  响应达成率: '规定时间内响应的异常 / 异常总数',
  异常占比: '异常数量 / 反馈总数',
  差评率: '差评数量 / 评论总数',
}

export const trendLineData = [
  { label: '闭环率', color: '#16a34a', values: [82, 84, 83, 85, 86, 87, 88], width: 3 },
  { label: '响应达成率', color: '#4f46e5', values: [78, 79, 81, 82, 83, 85, 88], width: 3 },
  { label: '反馈率', color: '#f97316', values: [13.8, 14.1, 13.5, 13.2, 12.9, 12.4, 11.9], width: 2 },
  { label: '退货率', color: '#2563eb', values: [4.9, 5.1, 4.8, 4.7, 4.5, 4.4, 4.2], width: 2 },
]

export const trendXLabels = ['03/13', '03/27', '04/10', '04/24', '05/08', '05/22', '06/05']

export const modelTop5Data: [string, number, number, string, string, string, string][] = [
  ['YB-S100 八电极体脂秤', 6528, 856, '4.12%', '13.1%', '4.5分', '3.12%'],
  ['YB-201 人体成分秤', 4932, 642, '4.78%', '13.0%', '4.4分', '3.38%'],
  ['YB-301 体脂秤 Pro', 3765, 487, '4.25%', '12.9%', '4.6分', '3.01%'],
  ['YB-M3 筋膜枪 M3 Pro', 2983, 421, '3.95%', '14.1%', '4.3分', '3.21%'],
  ['YB-F1 智能体脂秤 F1', 2357, 309, '4.88%', '13.1%', '4.2分', '3.45%'],
]

export const returnVsFeedbackData: [string, number, number][] = [
  ['体脂秤', 4.38, 12.67],
  ['人体秤', 4.91, 13.24],
  ['八电极秤', 4.12, 13.01],
  ['筋膜枪', 3.28, 14.85],
  ['按摩产品', 4.75, 11.92],
]

export const level1Categories = [
  { name: '产品质量', value: 36, color: '#2563eb', mom: 4, yoy: 6 },
  { name: '产品体验', value: 28, color: '#16a34a', mom: -3, yoy: -2 },
  { name: '物流运营', value: 14, color: '#f59e0b', mom: -2, yoy: 1 },
  { name: '平台合规', value: 9, color: '#7c3aed', mom: 2, yoy: 3 },
  { name: '咨询服务', value: 8, color: '#0891b2', mom: 1, yoy: -1 },
]

export const level2Categories = [
  { name: '硬件问题', value: 24, color: '#2563eb', mom: 3, yoy: 5 },
  { name: '数据准确性', value: 20, color: '#16a34a', mom: 4, yoy: 6 },
  { name: 'APP问题', value: 16, color: '#f59e0b', mom: -1, yoy: 2 },
  { name: '包装配件', value: 13, color: '#7c3aed', mom: -3, yoy: -1 },
]

export const level3Categories = [
  { name: '测脂不准', value: 28, color: '#2563eb', mom: 5, yoy: 7 },
  { name: 'APP连接问题', value: 19, color: '#16a34a', mom: 3, yoy: 5 },
  { name: '功能改进建议', value: 16, color: '#f59e0b', mom: -2, yoy: 3 },
  { name: '包装/配件问题', value: 9, color: '#7c3aed', mom: -2, yoy: 1 },
]

export const top5ComparisonData: [string, number, number, number][] = [
  ['测脂不准', 28, 23, 21],
  ['APP连接问题', 19, 16, 14],
  ['功能改进建议', 16, 18, 13],
  ['包装/配件问题', 9, 11, 8],
]

export const comparisonLegend = [
  { label: '本期', color: '#2563eb' },
  { label: '上期', color: '#f97316' },
  { label: '去年同期', color: '#16a34a' },
]

export const emergencyTimelineData = [
  {
    id: 'EX-20260611-008',
    p: 'P1',
    dimension: '平台合规',
    source: '投诉/警告',
    response: '2小时响应 / 24小时方案',
    owner: '运营负责人 + 产品经理',
    status: '处置方案',
    issue: '玻璃碎裂投诉连续上升',
    action: '隔离相关批次，检查包装防护',
    time: '10:15',
  },
  {
    id: 'EX-20260611-007',
    p: 'P2',
    dimension: '客户伤害',
    source: '退货原因',
    response: '6小时响应 / 72小时方案',
    owner: '团队主管 + 售后负责人',
    status: '执行跟进',
    issue: '测脂不准导致退货率升高',
    action: '分析传感器数据与说明书口径',
    time: '09:42',
  },
]

export const emergencyStatusTags = ['新增', '已响应', '处理中']

export const topQualityIssues: [string, number, string, string, string, string, string][] = [
  ['测脂不准', 8, '23.6%', '+5.2pp', 'CS20A, CS30B', '李工', '72%'],
  ['APP连接问题', 6, '18.9%', '+3.1pp', 'CS20A, CS10M', '王工', '86%'],
  ['无法开机', 5, '12.7%', '-2.7pp', 'CS30B, BF511', '张工', '88%'],
  ['充电问题', 4, '9.4%', '-1.3pp', 'CS20A, CS10M', '赵工', '80%'],
]

export const qualityBoardSummary = { tasks: 12, closed: 5, overdue: 3 }

export const qualityBoardActions: [string, string, string, number, string][] = [
  ['测脂不准专项', 'CS20A/CS30B', '进行中', 72, '#2563eb'],
  ['APP连接稳定性', 'CS10/CS20A', '验证中', 86, '#16a34a'],
  ['包装防护整改', 'CS30B', '待验证', 64, '#f97316'],
]
