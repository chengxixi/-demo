import type { Report, KnowledgeItem } from '@/types';

// ========== 报告数据 ==========
export const reportData: Report[] = [
    {
        id: 'RPT-001',
        title: '用户反馈周报 (6/16-6/22)',
        period: '2026-06-16 ~ 2026-06-22',
        type: '周报',
        date: '2026-06-23',
        summary: '本周反馈总量上升，退货率略有下降，筋膜枪类噪音问题持续。',
    },
    {
        id: 'RPT-002',
        title: '异常统计分析月报',
        period: '2026年6月',
        type: '月报',
        date: '2026-06-01',
        summary: 'P0/P1异常件数同比持平，玻璃碎裂和测脂不准为高发问题。',
    },
    {
        id: 'RPT-003',
        title: '有效信息转需求清单',
        period: '2026年Q2',
        type: '需求',
        date: '2026-06-15',
        summary: '本季度已转需求线索 12 条，进入规划评审阶段 3 条。',
    },
];

// ========== Q&A数据 ==========
export const knowledgeData: KnowledgeItem[] = [
    {
        id: 'QA-001',
        question: '体脂秤无法开机怎么办？',
        answer: '请检查电池是否装反或电量不足。更换新电池后仍无法开机，请联系售后处理。部分型号需长按电源键 3 秒。',
        category: '产品质量',
        tags: ['无法开机', '电池', '硬件'],
        date: '2026-06-18',
    },
    {
        id: 'QA-002',
        question: 'APP无法同步测量数据？',
        answer: '请确认蓝牙已打开且设备在 1 米范围内。尝试关闭APP后重新打开，或重启手机蓝牙。如仍无法同步，请卸载重装APP。',
        category: '产品体验',
        tags: ['数据同步', 'APP', '蓝牙'],
        date: '2026-06-17',
    },
    {
        id: 'QA-003',
        question: '测脂数据不准确怎么办？',
        answer: '请在硬质平地上测量，双脚与电极片充分接触。测量前避免剧烈运动，保持脚底干燥。不同设备间存在误差，建议以趋势为准。',
        category: '数据准确性',
        tags: ['测脂不准', '使用指引'],
        date: '2026-06-16',
    },
    {
        id: 'QA-004',
        question: '筋膜枪使用时有异响？',
        answer: '低档位噪音正常范围为 40-50dB。如出现金属摩擦声或异常尖鸣，请立即停止使用并联系售后。',
        category: '产品体验',
        tags: ['噪音', '筋膜枪', '异响'],
        date: '2026-06-15',
    },
    {
        id: 'QA-005',
        question: '血压计袖带尺寸如何选择？',
        answer: '标准袖带适用上臂围 22-32cm，大号袖带适用 32-42cm。请根据臂围选择合适尺寸，袖带过小会导致测量值偏高。',
        category: '咨询服务',
        tags: ['袖带', '血压计', '配件'],
        date: '2026-06-14',
    },
];

// ========== 用户角色 ==========
export const userRoleData: UserRole[] = roleOptions;
