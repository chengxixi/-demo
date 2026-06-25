import type { FeedbackItem, WorkOrder, EmergencyException, Competitor, UserRole, Report, KnowledgeItem, TabOption, TemplateConfig } from '@/types'

// ========== 选项数据 ==========
export const siteOptions = ['Amazon.com (US)', '天猫', '京东', '抖音']
export const feedbackTabOptions: TabOption[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'review', label: '待人工复核' },
  { key: 'done', label: '已处理' },
  { key: 'mine', label: '我反馈的' },
]
export const processRouteOptions = ['待处理', '已转工单', '已转需求', '已转异常', '已转Q&A', '已直接回复关闭']
export const processStateOptions = ['待人工复核', '待处理', '已处理']
export const returnOptions = ['否', '退货', '换货', '退货+换货', '待确认']
export const exceptionLevels = ['P0', 'P1', 'P2', 'P3', '待确认', '否']
export const sourceOptions = ['海外电商-退货反馈', '国内电商-退货反馈', '海外电商-商品评论', '国内电商-商品评论', '站内信', '客服沟通', 'APP反馈']
export const timeOptions = ['最近7天', '最近30天', '本月', '本季度', '本年']
export const brandOptions = ['云康宝', 'AF', 'LF']
export const productTypeOptions = ['体脂秤', '筋膜枪', '血压计']
export const modelOptions = ['CS20A', 'AF-30B', 'BP-02', 'MG20']
export const emergencyStepLabels = ['发现异常', '临时方案', '根因分析', '整改措施', '验证结果']
export const workOrderSteps = ['转工单', '分派责任人', '处理中', '待确认', '已闭环']

// ========== 用户角色 ==========
export const roleOptions: UserRole[] = [
  { key: 'admin', name: '管理员', label: '管理员', scope: 'all', avatar: 'AD' },
  { key: 'massagePm', name: '孙工', label: '筋膜枪产品经理', scope: 'line:CM', avatar: 'CM' },
  { key: 'scalePm', name: '李工', label: '八电极产品经理', scope: 'line:CS', avatar: 'CS' },
  { key: 'overseasFeedback', name: '张伟', label: '海外反馈人员', scope: 'region:海外', avatar: 'OS' },
  { key: 'domesticFeedback', name: '王雪', label: '国内反馈人员', scope: 'region:国内', avatar: 'CN' },
]

// ========== 模板 ==========
export const templateLibrary: TemplateConfig[] = [
  { name: '默认模板', values: { site: ['Amazon.com (US)'], brand: '云康宝', productType: '体脂秤', source: '商品评论', owner: '李工' } },
  { name: 'APP问题模板', values: { site: ['Amazon.com (US)', '天猫'], brand: 'AF', productType: '体脂秤', source: 'APP反馈', owner: '刘工' } },
  { name: '筋膜枪模板', values: { site: ['抖音', '京东'], brand: 'LF', productType: '筋膜枪', source: '商品评论', owner: '孙工' } },
]

// ========== 反馈数据（与原始数据完全一致） ==========
export const feedbackData: FeedbackItem[] = [
  {
    id: 'CS-20260618-0001',
    mergeGroup: 'CS20A_POWER',
    source: '商品评论',
    createMode: 'AI自动创建',
    brand: '云康宝',
    site: 'Amazon.com (US)',
    productType: '体脂秤',
    model: 'CS20A',
    internal: 'YL-CS20A-8',
    asin: 'B0CS20AUS1',
    raw: 'Scale stopped powering on after two weeks, replacing batteries did not help.',
    ai: '体脂秤使用两周后无法开机，更换电池无效。',
    level1: '产品质量',
    level2: '硬件问题',
    level3: '无法开机',
    sentiment: '负向',
    returned: '退货',
    exception: 'P2',
    processRoute: '待处理',
    processState: '待处理',
    feedbackUser: '张伟',
    handler: '李工',
    date: '2026-06-18',
  },
  {
    id: 'CS-20260618-0002',
    mergeGroup: 'CS20A_POWER',
    source: '退货原因',
    createMode: 'AI自动创建',
    brand: '云康宝',
    site: 'Amazon.com (US)',
    productType: '体脂秤',
    model: 'CS20A',
    internal: 'YL-CS20A-8',
    asin: 'B0CS20AUS1',
    raw: 'Customer returned the scale because it could not turn on after battery replacement.',
    ai: '客户因更换电池后仍无法开机而退货。',
    level1: '产品质量',
    level2: '硬件问题',
    level3: '无法开机',
    sentiment: '负向',
    returned: '退货',
    exception: 'P2',
    processRoute: '已转工单',
    processState: '已处理',
    feedbackUser: '李娜',
    handler: '系统',
    date: '2026-06-18',
  },
  {
    id: 'CS-20260617-0003',
    source: 'APP反馈',
    createMode: 'AI自动创建',
    brand: 'AF',
    site: 'Amazon.com (US)',
    productType: '体脂秤',
    model: 'AF-30B',
    internal: 'AF-CS30B-CN',
    asin: 'B0AF30BUS1',
    raw: '用户反馈体脂率数据与健身房设备差异较大，希望确认算法。',
    ai: '体脂率数据偏差较大，需要复核算法或测量引导。',
    level1: '产品体验',
    level2: '数据准确性',
    level3: '测脂不准',
    sentiment: '负向',
    returned: '否',
    exception: '待确认',
    processRoute: '待处理',
    processState: '待人工复核',
    feedbackUser: '陈晨',
    handler: '刘工',
    date: '2026-06-17',
    mergeGroup: '',
  },
  {
    id: 'CS-20260616-0004',
    source: '客服沟通',
    createMode: '人工录入',
    brand: '云康宝',
    site: '京东',
    productType: '血压计',
    model: 'BP-02',
    internal: 'YK-BP02-CN',
    asin: '-',
    raw: '用户咨询袖带尺寸是否适合上臂围 42cm，需要客服跟进配件建议。',
    ai: '咨询大臂围用户的袖带适配问题。',
    level1: '咨询服务',
    level2: '配件适配',
    level3: '袖带尺寸',
    sentiment: '中性',
    returned: '否',
    exception: '否',
    processRoute: '已直接回复关闭',
    processState: '已处理',
    feedbackUser: '王雪',
    handler: '王工',
    date: '2026-06-16',
    mergeGroup: '',
  },
  {
    id: 'CM-20260615-0005',
    mergeGroup: 'MG20_NOISE',
    source: '商品评论',
    createMode: 'AI自动创建',
    brand: 'LF',
    site: '抖音',
    productType: '筋膜枪',
    model: 'MG20',
    internal: 'LF-MG20-DY',
    asin: '-',
    raw: '三档运行时噪音明显，夜间使用会影响家人休息。',
    ai: '筋膜枪高档位噪音明显，影响夜间使用体验。',
    level1: '产品体验',
    level2: '功能效果',
    level3: '噪音偏大',
    sentiment: '负向',
    returned: '否',
    exception: 'P3',
    processRoute: '待处理',
    processState: '待处理',
    feedbackUser: '赵敏',
    handler: '孙工',
    date: '2026-06-15',
  },
  {
    id: 'CM-20260615-0006',
    mergeGroup: 'MG20_NOISE',
    source: '客服沟通',
    createMode: '人工录入',
    brand: 'LF',
    site: '京东',
    productType: '筋膜枪',
    model: 'MG20',
    internal: 'LF-MG20-JD',
    asin: '-',
    raw: '用户反馈使用高档位时声音偏尖，询问是否属于正常现象。',
    ai: '高档位声音偏尖，需确认电机和结构噪音表现。',
    level1: '产品体验',
    level2: '功能效果',
    level3: '噪音偏大',
    sentiment: '负向',
    returned: '否',
    exception: 'P3',
    processRoute: '已转异常',
    processState: '已处理',
    feedbackUser: '周杰',
    handler: '孙工',
    date: '2026-06-15',
  },
]

// ========== 工单数据 ==========
export const workOrderData: WorkOrder[] = [
  {
    id: 'TK-20260611-0342',
    summary: 'CS20A 无法开机问题批量分析——分析用户测量日志，排查电池仓接触设计和PCB电源管理模块',
    relatedFeedback: 'FB-20260611-00122',
    productLine: '八电极产品线',
    status: '处理中',
    owner: '王工',
    dept: '产品部',
    sla: '18h 22m',
    result: '分析测量日志',
    closeReason: '-',
    exception: '否',
    requirement: '预留',
    qa: '否',
    step: 3,
    aiAbstract: 'CS20A型号自2026年6月起集中收到无法开机反馈，累计已合并2条同类反馈。初步排查指向电池仓弹片接触不良与PCB电源管理模块低温失效。建议：(1) 隔离当前批次电池仓组件，安排供应商复测弹片回弹力；(2) PCB layout增加电源管理模块滤波电容；(3) QA增加-10°C低温开机循环测试。',
    closeNote: '',
  },
  {
    id: 'TK-20260611-0339',
    summary: 'APP版本兼容排查——AF-30B出现数据同步失败，需排查Android 14兼容性',
    relatedFeedback: 'FB-20260611-00121',
    productLine: '体脂秤产品线',
    status: '待确认',
    owner: '刘工',
    dept: '研发部',
    sla: '31h 10m',
    result: 'APP版本兼容排查',
    closeReason: '-',
    exception: '否',
    requirement: '否',
    qa: '否',
    step: 4,
    aiAbstract: 'AF-30B在Android 14系统上出现BLE连接超时和数据同步失败问题。初步分析指向Android 14新增的蓝牙权限模型变化。建议：(1) 适配Android 14的BLUETOOTH_CONNECT权限；(2) 增加重连重试机制；(3) 发布热修复版本。',
    closeNote: '',
  },
  {
    id: 'TK-20260610-0318',
    summary: '血压计袖带尺寸适配指引——补充大臂围用户的选购建议和配件方案',
    relatedFeedback: 'FB-20260610-00117',
    productLine: '人体秤产品线',
    status: '已闭环',
    owner: '孙工',
    dept: '产品部',
    sla: '完成',
    result: '补充使用指导与Listing说明',
    closeReason: '已回复',
    exception: '否',
    requirement: '预留',
    qa: '否',
    step: 5,
    aiAbstract: 'BP-02血压计标准袖带适用上臂围22-32cm，多位大臂围用户反馈测量不适。已补充：(1) Listing增加袖带尺寸选择指引；(2) 开发大号袖带可选配件；(3) Q&A增加视频指引。建议后续产品迭代时标配双尺寸袖带。',
    closeNote: '已补充Listing说明，用户已确认满意。',
  },
]

// ========== 异常数据 ==========
export const emergencyData: EmergencyException[] = [
  {
    id: 'P1-20260611-008',
    level: 'P1',
    region: '海外',
    site: 'Amazon',
    productLine: '八电极秤',
    internal: 'GE31002B1-CS',
    creator: '陈晨',
    dimension: '平台合规',
    source: '投诉/舆情',
    deadline: '已超时 2h',
    reminderLimit: '2h',
    reminderDeadline: '2026-06-05 12:00',
    overdue: true,
    owner: '陈总',
    team: '海外运营+产品经理',
    status: '临时方案超时',
    issue: '玻璃碎裂投诉连续上升',
    impactScope: 'GE31002B1-CS 批次 2026Q1，约500台',
    action: '隔离相关批次，检查包装防护',
    feedback: 'CS-20260618-合并（2条数据）',
    tempPlan: '',
    rootCause: '待根因分析',
    fixPlan: '待整改措施',
    verifyResult: '待验证',
    step: 0,
  },
  {
    id: 'P0-20260611-007',
    level: 'P0',
    region: '国内',
    site: '京东',
    productLine: '体脂秤',
    internal: 'FT31002A2',
    creator: '张伟',
    dimension: '客户伤害',
    source: '退货原因',
    deadline: '剩余 1h 30m',
    reminderLimit: '2h',
    reminderDeadline: '2026-06-05 08:45',
    overdue: false,
    owner: '刘海州',
    team: '售后负责人+质量负责人',
    status: '临时方案输出',
    issue: '测脂不准导致退货率升高',
    impactScope: 'FT31002A2 全批次，约2000台',
    action: '暂停相关投放，输出说明书修订',
    feedback: 'CS-20260617-0003',
    tempPlan: '售后先行解释并补发测量指引',
    rootCause: '传感器数据与说明书口径不一致',
    fixPlan: '优化测量引导和算法提示',
    verifyResult: '待验证',
    step: 2,
  },
]

// ========== 竞品数据 ==========
export const competitorData: Competitor[] = [
  { name: 'Withings Body Scan', asin: 'B0WITHINGS', line: '八电极秤', price: '$349.95', channels: 'Amazon / 独立站', params: '分段身体成分 / 心率 / 血管年龄 / 高端健康管理' },
  { name: 'RENPHO Elis 1 Smart Scale', asin: 'B0RENPHO1', line: '体脂秤', price: '$39.99', channels: 'Amazon / Walmart', params: '低价高评价 / App趋势 / 家庭多人' },
  { name: '华为 智能体脂秤 3 Pro', asin: 'HW-SCALE3P', line: '八电极秤', price: '¥399', channels: '天猫 / 京东 / 抖音', params: '华为生态 / 八电极分段测量 / 大促流量强' },
]

// ========== 报告数据 ==========
export const reportData: Report[] = [
  { id: 'RPT-001', title: '用户反馈周报 (6/16-6/22)', period: '2026-06-16 ~ 2026-06-22', type: '周报', date: '2026-06-23', summary: '本周反馈总量上升，退货率略有下降，筋膜枪类噪音问题持续。' },
  { id: 'RPT-002', title: '异常统计分析月报', period: '2026年6月', type: '月报', date: '2026-06-01', summary: 'P0/P1异常件数同比持平，玻璃碎裂和测脂不准为高发问题。' },
  { id: 'RPT-003', title: '有效信息转需求清单', period: '2026年Q2', type: '需求', date: '2026-06-15', summary: '本季度已转需求线索 12 条，进入规划评审阶段 3 条。' },
]

// ========== Q&A数据 ==========
export const knowledgeData: KnowledgeItem[] = [
  { id: 'QA-001', question: '体脂秤无法开机怎么办？', answer: '请检查电池是否装反或电量不足。更换新电池后仍无法开机，请联系售后处理。部分型号需长按电源键 3 秒。', category: '产品质量', tags: ['无法开机', '电池', '硬件'], date: '2026-06-18' },
  { id: 'QA-002', question: 'APP无法同步测量数据？', answer: '请确认蓝牙已打开且设备在 1 米范围内。尝试关闭APP后重新打开，或重启手机蓝牙。如仍无法同步，请卸载重装APP。', category: '产品体验', tags: ['数据同步', 'APP', '蓝牙'], date: '2026-06-17' },
  { id: 'QA-003', question: '测脂数据不准确怎么办？', answer: '请在硬质平地上测量，双脚与电极片充分接触。测量前避免剧烈运动，保持脚底干燥。不同设备间存在误差，建议以趋势为准。', category: '数据准确性', tags: ['测脂不准', '使用指引'], date: '2026-06-16' },
  { id: 'QA-004', question: '筋膜枪使用时有异响？', answer: '低档位噪音正常范围为 40-50dB。如出现金属摩擦声或异常尖鸣，请立即停止使用并联系售后。', category: '产品体验', tags: ['噪音', '筋膜枪', '异响'], date: '2026-06-15' },
  { id: 'QA-005', question: '血压计袖带尺寸如何选择？', answer: '标准袖带适用上臂围 22-32cm，大号袖带适用 32-42cm。请根据臂围选择合适尺寸，袖带过小会导致测量值偏高。', category: '咨询服务', tags: ['袖带', '血压计', '配件'], date: '2026-06-14' },
]

// ========== 用户角色 ==========
export const userRoleData: UserRole[] = roleOptions

// ========== 仪表盘 - 过滤栏选项 ==========
export const filterPeriodOptions = ['近7天', '近30天', '近90天', '自定义']
export const filterBrandOptions = ['全部品牌', '云康宝', 'AF', 'GE', 'LF']
export const filterSiteOptions = ['全部站点', 'Amazon.com (US)', '天猫', '京东', '抖音']
export const filterProductTypeOptions = ['全部产品类型', '体脂秤', '人体秤', '八电极秤', '筋膜枪', '按摩产品']
export const filterModelOptions = ['全部', 'CS20A', 'CS30B', 'BF511', 'MG20', 'MS30']
export const filterSourceOptions = ['全部', '商品评论', '退货原因', '站内信', '客服沟通', 'APP反馈', '社媒', 'Vine', '天使用户', '投诉/警告']

export const defaultFilters = {
  period: '近30天',
  site: 'Amazon.com (US)',
  brand: '全部品牌',
  productType: '体脂秤',
  model: '全部',
  source: '全部',
}

// ========== 仪表盘 - 指标卡片（含 note1/note2） ==========
export const dashboardMetricCards = [
  { label: '退货率', value: '4.38%', trend: '-0.72%', trendType: 'down-good', note1: '退货量', note2: '1,256' },
  { label: '反馈率', value: '12.67%', trend: '-1.34%', trendType: 'down-good', note1: '反馈量', note2: '3,637' },
  { label: '闭环率', value: '87.45%', trend: '+3.21%', trendType: 'up-good', note1: '已闭环', note2: '3,178' },
  { label: '响应达成率', value: '92.16%', trend: '+4.57%', trendType: 'up-good', note1: '达成', note2: '3,349' },
  { label: '异常占比', value: '6.72%', trend: '+0.89%', trendType: 'up-bad', note1: '异常工单', note2: '244' },
  { label: '差评率', value: '3.25%', trend: '-0.31%', trendType: 'down-good', note1: '差评数量', note2: '935' },
]

export const metricFormulas: Record<string, string> = {
  '退货率': '计算公式：退货量/销量',
  '反馈率': '计算公式：反馈量/销量',
  '闭环率': '计算公式：反馈单据关闭数量/总反馈量（关闭指关闭、转需求、转异常或直接关闭）',
  '响应达成率': '计算公式：P0/P1/P2/P3异常在规定时间内响应的达成情况',
  '异常占比': '计算公式：产生的异常数量/反馈总数',
  '差评率': '计算公式：差评数量/评论总数',
}

// ========== 仪表盘 - 关键指标趋势折线图 ==========
export const trendLineData = [
  { label: '闭环率', color: '#22a06b', values: [82, 84, 83, 85, 86, 86, 87, 88, 87, 89, 88, 90, 91], width: 3 },
  { label: '响应达成率', color: '#6d5dfc', values: [78, 79, 81, 80, 82, 83, 82, 84, 85, 84, 86, 87, 88], width: 3 },
  { label: '反馈率', color: '#ff8a00', values: [13.8, 14.1, 13.5, 14.8, 14, 13.6, 13.2, 12.9, 13.4, 12.8, 12.4, 12.1, 11.9], width: 2 },
  { label: '退货率', color: '#1f73e8', values: [4.9, 5.1, 4.8, 5, 4.7, 4.6, 4.8, 4.5, 4.6, 4.4, 4.5, 4.3, 4.2], width: 2 },
]
export const trendXLabels = ['03/13', '03/27', '04/10', '04/24', '05/08', '05/22', '06/05']

// ========== 仪表盘 - 产品型号表现 TOP5 ==========
export const modelTop5Data: [string, number, number, string, string, string, string][] = [
  ['YB-S100 八电极体脂秤', 6528, 856, '4.12%', '13.1%', '4.5分', '3.12%'],
  ['YB-201 人体成分秤', 4932, 642, '4.78%', '13.0%', '4.4分', '3.38%'],
  ['YB-301 体脂秤 Pro', 3765, 487, '4.25%', '12.9%', '4.6分', '3.01%'],
  ['YB-M3 筋膜枪 M3 Pro', 2983, 421, '3.95%', '14.1%', '4.3分', '3.21%'],
  ['YB-F1 智能体脂秤 F1', 2357, 309, '4.88%', '13.1%', '4.2分', '3.45%'],
]

// ========== 仪表盘 - 退货率 vs 反馈率（按产品类型） ==========
export const returnVsFeedbackData: [string, number, number][] = [
  ['体脂秤', 4.38, 12.67],
  ['人体秤', 4.91, 13.24],
  ['八电极秤', 4.12, 13.01],
  ['筋膜枪', 3.28, 14.85],
  ['按摩产品', 4.75, 11.92],
]

// ========== 仪表盘 - 一级反馈分类 ==========
export const level1Categories = [
  { name: '产品质量', value: 36, color: '#1f73e8', mom: 4, yoy: 6 },
  { name: '产品体验', value: 28, color: '#22a06b', mom: -3, yoy: -2 },
  { name: '物流运营', value: 14, color: '#ffb020', mom: -2, yoy: 1 },
  { name: '平台合规', value: 9, color: '#8b5cf6', mom: 2, yoy: 3 },
  { name: '咨询服务', value: 8, color: '#06b6d4', mom: 1, yoy: -1 },
  { name: '其他', value: 5, color: '#94a3b8', mom: -2, yoy: -7 },
]

// ========== 仪表盘 - 二级反馈分类 ==========
export const level2Categories = [
  { name: '硬件问题', value: 24, color: '#1f73e8', mom: 3, yoy: 5 },
  { name: '数据准确性', value: 20, color: '#22a06b', mom: 4, yoy: 6 },
  { name: 'APP问题', value: 16, color: '#ffb020', mom: -1, yoy: 2 },
  { name: '包装配件', value: 13, color: '#8b5cf6', mom: -3, yoy: -1 },
  { name: '功能效果', value: 11, color: '#06b6d4', mom: 2, yoy: 3 },
  { name: '其他', value: 16, color: '#94a3b8', mom: -5, yoy: -15 },
]

// ========== 仪表盘 - 三级反馈分类 ==========
export const level3Categories = [
  { name: '测脂不准', value: 28, color: '#1f73e8', mom: 5, yoy: 7 },
  { name: 'APP连接问题', value: 19, color: '#22a06b', mom: 3, yoy: 5 },
  { name: '功能需求/改进建议', value: 16, color: '#ffb020', mom: -2, yoy: 3 },
  { name: '包装/配件问题', value: 9, color: '#8b5cf6', mom: -2, yoy: 1 },
  { name: '说明书/标识问题', value: 6, color: '#06b6d4', mom: 1, yoy: -1 },
  { name: '其他问题', value: 4, color: '#94a3b8', mom: 0, yoy: -2 },
]

// ========== 仪表盘 - 前5大三级反馈比例对比 ==========
export const top5ComparisonData: [string, number, number, number][] = [
  ['测脂不准', 28, 23, 21],
  ['APP连接问题', 19, 16, 14],
  ['功能需求/改进建议', 16, 18, 13],
  ['包装/配件问题', 9, 11, 8],
  ['说明书/标识问题', 6, 5, 7],
]
export const comparisonLegend = [
  { label: '本期', color: '#1f73e8' },
  { label: '上期', color: '#ff8a00' },
  { label: '去年同期', color: '#22a06b' },
]

// ========== 仪表盘 - 紧急异常动态 ==========
export const emergencyTimelineData = [
  { id: 'EX-20260611-008', p: 'P1', dimension: '平台合规', source: '投诉/警告', response: '2小时响应 / 24小时方案', owner: '运营负责人 + 产品经理', status: '处置方案', issue: '玻璃碎裂投诉连续上升', action: '隔离相关批次，检查包装防护', time: '10:15' },
  { id: 'EX-20260611-007', p: 'P2', dimension: '客户伤害', source: '退货原因', response: '6小时响应 / 72小时方案', owner: '团队主管 + 售后负责人', status: '执行跟进', issue: '测脂不准导致退货率升高', action: '分析传感器数据与说明书误导', time: '09:42' },
  { id: 'EX-20260610-004', p: 'P3', dimension: '运营优化', source: 'APP反馈', response: '24小时响应 / 常规处理', owner: '客服专员', status: '案例归档', issue: '单位切换咨询高频', action: 'Q&A新增视频指引', time: '08:30' },
]
export const emergencyStatusTags = ['新增', '已响应', '处理中']

// ========== 仪表盘 - TOP质量问题 ==========
export const topQualityIssues: [string, number, string, string, string, string, string][] = [
  ['测脂不准', 8, '23.6%', '+5.2pp', 'CS20A, CS30B', '李工', '72%'],
  ['APP连接问题', 6, '18.9%', '+3.1pp', 'CS20A, CS10M', '王工', '86%'],
  ['无法开机', 5, '12.7%', '-2.7pp', 'CS30B, BF511', '张工', '88%'],
  ['充电问题', 4, '9.4%', '-1.3pp', 'CS20A, CS10M', '赵工', '80%'],
  ['蓝牙断连/不稳定', 5, '8.8%', '-1.6pp', 'CS20A, CS30B', '刘工', '92%'],
]

// ========== 仪表盘 - 质量改善动作看板 ==========
export const qualityBoardSummary = { tasks: 12, closed: 5, overdue: 3 }
export const qualityBoardActions: [string, string, string, number, string][] = [
  ['测脂不准专项', 'CS20A/CS30B', '进行中', 72, '#1f73e8'],
  ['APP连接稳定性', 'CS10/CS20A', '验证中', 86, '#22a06b'],
  ['包装防护整改', 'CS30B', '待验证', 64, '#ff8a00'],
]
