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
  { id: 'TK-20260611-0342', relatedFeedback: 'FB-20260611-00122', status: '处理中', owner: '王工', dept: '产品部', sla: '18h 22m', result: '分析测量日志', closeReason: '-', exception: '否', requirement: '预留', step: 3 },
  { id: 'TK-20260611-0339', relatedFeedback: 'FB-20260611-00121', status: '待确认', owner: '刘工', dept: '研发部', sla: '31h 10m', result: 'APP版本兼容排查', closeReason: '-', exception: '否', requirement: '否', step: 4 },
  { id: 'TK-20260610-0318', relatedFeedback: 'FB-20260610-00117', status: '已闭环', owner: '孙工', dept: '产品部', sla: '完成', result: '补充使用指导与Listing说明', closeReason: '已回复', exception: '否', requirement: '预留', step: 5 },
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

// ========== 型号排名数据 ==========
export const modelRankingData = [
  { model: 'YB-CS10 入门体脂秤', sales: '2,116', feedback: '286', returnRate: '4.36%', feedbackRate: '3.04%', rating: '4.4分' },
  { model: 'YB-BF511 八电极体脂秤', sales: '1,984', feedback: '251', returnRate: '4.09%', feedbackRate: '2.92%', rating: '4.5分' },
  { model: 'YB-MS30 深层筋膜枪', sales: '1,736', feedback: '218', returnRate: '3.87%', feedbackRate: '2.75%', rating: '4.3分' },
  { model: 'YB-S30 人体秤', sales: '1,514', feedback: '176', returnRate: '3.62%', feedbackRate: '2.41%', rating: '4.6分' },
  { model: 'YB-F2 智能体脂秤 F2', sales: '1,206', feedback: '139', returnRate: '3.44%', feedbackRate: '2.18%', rating: '4.5分' },
  { model: 'YB-S100 八电极体脂秤', sales: '2,342', feedback: '312', returnRate: '4.51%', feedbackRate: '3.16%', rating: '4.3分' },
  { model: 'YB-201 人体成分秤', sales: '1,890', feedback: '234', returnRate: '3.98%', feedbackRate: '2.65%', rating: '4.4分' },
  { model: 'YB-301 体脂秤 Pro', sales: '1,567', feedback: '198', returnRate: '3.75%', feedbackRate: '2.48%', rating: '4.2分' },
  { model: 'YB-M3 筋膜枪 M3 Pro', sales: '1,432', feedback: '176', returnRate: '3.21%', feedbackRate: '2.12%', rating: '4.4分' },
  { model: 'YB-F1 智能体脂秤 F1', sales: '2,098', feedback: '268', returnRate: '4.22%', feedbackRate: '2.88%', rating: '4.5分' },
]

// ========== 指标卡片数据 ==========
export const metricCards = [
  { label: '退货率', value: '4.38%', delta: '-0.72%', color: 'blue' },
  { label: '反馈率', value: '12.67%', delta: '-1.34%', color: 'blue' },
  { label: '闭环率', value: '87.45%', delta: '+3.21%', color: 'green' },
  { label: '响应达成率', value: '92.16%', delta: '+4.57%', color: 'green' },
  { label: '异常占比', value: '6.72%', delta: '+0.89%', color: 'red' },
  { label: '差评率', value: '3.25%', delta: '-0.31%', color: 'blue' },
]

export const metricFormulas: Record<string, string> = {
  '退货率': '计算公式：退货量/销量',
  '反馈率': '计算公式：反馈量/销量',
  '闭环率': '计算公式：反馈单据关闭数量/总反馈量（关闭指关闭、转需求、转异常或直接关闭）',
  '响应达成率': '计算公式：P0/P1/P2/P3异常在规定时间内响应的达成情况',
  '异常占比': '计算公式：产生的异常数量/反馈总数',
  '差评率': '计算公式：差评数量/评论总数',
}
