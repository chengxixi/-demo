import type { TabOption, TemplateConfig, UserRole } from '@/types'

export const siteOptions = ['亚马逊', '天猫', '抖音', '京东']

export const feedbackTabOptions: TabOption[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'review', label: '待人工复核' },
  { key: 'done', label: '已处理' },
  { key: 'mine', label: '我的反馈' },
]

export const processRouteOptions = [
  '待处理',
  '已转工单',
  '已转需求',
  '已转异常',
  '已转Q&A',
  '已直接回复关闭',
]

export const processStateOptions = ['待人工复核', '待处理', '已处理']
export const returnOptions = ['退货', '换货', '无需退换货']
export const exceptionLevels = ['P0', 'P1', 'P2', 'P3', '无异常']
export const sourceOptions = ['商品评论', '退货反馈', '客服沟通', '站内信', 'APP反馈']
export const timeOptions = ['最近7天', '最近30天', '本月', '本季度', '本年']
export const brandOptions = ['云康宝', 'AF', 'GE', 'LOT']
export const productTypeOptions = ['体脂秤', '八电极', '筋膜枪']
export const modelOptions = ['CS10A', 'CS10B', 'CS10F', 'CS20F', 'CS20M']
export const emergencyStepLabels = ['临时方案处理', '根因分析', '整改措施', '验证结果', '关闭归档']
export const workOrderSteps = ['转工单', '处理中', '待确认', '已直接关闭']

export const roleOptions: UserRole[] = [
  { key: 'admin', name: '管理员', label: '系统管理员', scope: 'all', avatar: 'AD' },
  { key: 'scalePm', name: '李工', label: '体脂秤产品经理', scope: 'line:scale', avatar: 'CS' },
  { key: 'massagePm', name: '孙工', label: '筋膜枪产品经理', scope: 'line:massage', avatar: 'CM' },
  { key: 'overseasFeedback', name: '张伟', label: '海外反馈人员', scope: 'region:overseas', avatar: 'OS' },
  { key: 'domesticFeedback', name: '王雪', label: '国内反馈人员', scope: 'region:domestic', avatar: 'CN' },
]

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
      owner: '王工',
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
]

export const userRoleData: UserRole[] = roleOptions
