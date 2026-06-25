/**
 * 通用选项数据（平台、分类、产品等下拉选项）
 */
import type { UserRole, TabOption, TemplateConfig } from '@/types';

export const siteOptions = ['Amazon.com (US)', '天猫', '京东', '抖音'];
export const feedbackTabOptions: TabOption[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'review', label: '待人工复核' },
    { key: 'done', label: '已处理' },
    { key: 'mine', label: '我反馈的' },
];
export const processRouteOptions = [
    '待处理',
    '已转工单',
    '已转需求',
    '已转异常',
    '已转Q&A',
    '已直接回复关闭',
];
export const processStateOptions = ['待人工复核', '待处理', '已处理'];
export const returnOptions = ['否', '退货', '换货', '退货+换货', '待确认'];
export const exceptionLevels = ['P0', 'P1', 'P2', 'P3', '待确认', '否'];
export const sourceOptions = [
    '海外电商-退货反馈',
    '国内电商-退货反馈',
    '海外电商-商品评论',
    '国内电商-商品评论',
    '站内信',
    '客服沟通',
    'APP反馈',
];
export const timeOptions = ['最近7天', '最近30天', '本月', '本季度', '本年'];
export const brandOptions = ['云康宝', 'AF', 'LF'];
export const productTypeOptions = ['体脂秤', '筋膜枪', '血压计'];
export const modelOptions = ['CS20A', 'AF-30B', 'BP-02', 'MG20'];
export const emergencyStepLabels = ['发现异常', '临时方案', '根因分析', '整改措施', '验证结果'];
export const workOrderSteps = ['转工单', '分派责任人', '处理中', '待确认', '已闭环'];
export const roleOptions: UserRole[] = [
    { key: 'admin', name: '管理员', label: '管理员', scope: 'all', avatar: 'AD' },
    { key: 'massagePm', name: '孙工', label: '筋膜枪产品经理', scope: 'line:CM', avatar: 'CM' },
    { key: 'scalePm', name: '李工', label: '八电极产品经理', scope: 'line:CS', avatar: 'CS' },
    {
        key: 'overseasFeedback',
        name: '张伟',
        label: '海外反馈人员',
        scope: 'region:海外',
        avatar: 'OS',
    },
    {
        key: 'domesticFeedback',
        name: '王雪',
        label: '国内反馈人员',
        scope: 'region:国内',
        avatar: 'CN',
    },
];
export const templateLibrary: TemplateConfig[] = [
    {
        name: '默认模板',
        values: {
            site: ['Amazon.com (US)'],
            brand: '云康宝',
            productType: '体脂秤',
            source: '商品评论',
            owner: '李工',
        },
    },
    {
        name: 'APP问题模板',
        values: {
            site: ['Amazon.com (US)', '天猫'],
            brand: 'AF',
            productType: '体脂秤',
            source: 'APP反馈',
            owner: '刘工',
        },
    },
    {
        name: '筋膜枪模板',
        values: {
            site: ['抖音', '京东'],
            brand: 'LF',
            productType: '筋膜枪',
            source: '商品评论',
            owner: '孙工',
        },
    },
];
export const userRoleData: UserRole[] = roleOptions;
