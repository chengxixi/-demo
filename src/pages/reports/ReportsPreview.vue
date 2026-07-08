<script setup lang="ts">
import { computed } from 'vue'
import type { Report } from '@/types'

const props = defineProps<{
  open: boolean
  report: Report | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const isCompetitorReport = computed(() => props.report?.type.includes('竞品') ?? false)

const competitorSummaryCards = [
  { title: '本月新增竞品', value: 12, desc: '品牌竞品 8 / ODM竞品 4' },
  { title: '触发提醒', value: 6, desc: '价格、排名、功能变化和舆情波动' },
  { title: '转需求机会', value: 4, desc: '已进入需求池评估' },
  { title: '实物分析', value: 2, desc: '拆机分析和产品体验待完成' },
]

const productLineRows = [
  { line: '八电极秤', added: 5, alert: 3, change: 'Withings 新增心率/血管年龄卖点', action: '启动实物分析' },
  { line: '体脂秤', added: 4, alert: 2, change: 'RENPHO 低价促销延续', action: '关注价格带下探' },
  { line: '筋膜枪', added: 3, alert: 1, change: '热敷与低噪音卖点升温', action: '专项对标低噪音结构' },
]

const competitorChangeRows = [
  { type: '价格变化', product: 'Withings Body Scan', evidence: 'Amazon到手价下降约12%，BSR进入TOP20', impact: '高端八电极价格锚点下移' },
  { type: '排名变化', product: '华为智能体脂秤 3 Pro', evidence: '京东大促排名升至类目第3', impact: '国内高端秤卖点需复盘' },
  { type: '功能变化', product: '筋膜枪 Mini Pro', evidence: '新增热敷功能与低噪音短视频素材', impact: '可能影响新品功能优先级' },
]

const negativeThemeRows = [
  { theme: '连接失败', product: 'RENPHO Elis 1', source: 'Amazon差评', action: '沉淀蓝牙连接避坑需求' },
  { theme: '测量波动', product: 'Withings Body Scan', source: 'Amazon / Reddit', action: '对比算法说明和测量引导' },
  { theme: '噪声偏尖', product: '筋膜枪 Mini Pro', source: '抖音评论', action: '转专项对标低噪音结构' },
]

const reportOutputRows = [
  {
    name: '竞品收集月报',
    content: '按产品线汇总新增竞品、触发提醒、价格/排名/功能变化、差评TOP、品牌影响评估。',
    trigger: '系统月初创建 / 每日刷新',
    type: '月报',
  },
  {
    name: '拆机分析报告',
    content: '记录结构、材质、包装、配件、专利/法规风险和可借鉴点，必须上传拆机附件。',
    trigger: '进入实物分析后生成',
    type: '拆机报告',
  },
  {
    name: '竞品机会报告',
    content: '将监控变化、舆情痛点和参数差异沉淀为可转需求机会。',
    trigger: 'L3/L4提醒后生成',
    type: '机会报告',
  },
  {
    name: '专项对标报告',
    content: '围绕价格、功能、卖点、包装或渠道策略形成可执行结论。',
    trigger: 'PM判断后生成',
    type: '专项报告',
  },
]

const feedbackRows = [
  { name: '反馈量', value: '3,637', action: '按来源、站点、型号拆分' },
  { name: 'TOP问题', value: '无法开机 / 测脂不准 / 噪声偏大', action: '转异常、转工单或转需求' },
  { name: '闭环情况', value: '已处理 82%', action: '复盘逾期和待复核反馈' },
]

function closeModal() {
  emit('update:open', false)
}
</script>

<template>
  <a-modal
    :open="props.open"
    :title="props.report?.title || '报告预览'"
    width="900px"
    @cancel="closeModal"
  >
    <template v-if="props.report">
      <a-descriptions bordered size="small" :column="2" class="mb-4">
        <a-descriptions-item label="报告编号">{{ props.report.id }}</a-descriptions-item>
        <a-descriptions-item label="报告周期">{{ props.report.period }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ props.report.type }}</a-descriptions-item>
        <a-descriptions-item label="生成日期">{{ props.report.date }}</a-descriptions-item>
        <a-descriptions-item label="摘要" :span="2">{{ props.report.summary }}</a-descriptions-item>
      </a-descriptions>

      <template v-if="isCompetitorReport">
        <a-row :gutter="[12, 12]" class="mb-4">
          <a-col v-for="card in competitorSummaryCards" :key="card.title" :xs="12" :md="6">
            <a-card size="small" :bordered="false" class="preview-stat-card">
              <a-statistic :title="card.title" :value="card.value" />
              <a-typography-text type="secondary">{{ card.desc }}</a-typography-text>
            </a-card>
          </a-col>
        </a-row>

        <a-card title="一、产品线汇总" :bordered="false" class="mb-4">
          <vxe-table :data="productLineRows" border size="mini" stripe>
            <vxe-column field="line" title="产品线" width="110" />
            <vxe-column field="added" title="新增竞品" width="90" align="right" />
            <vxe-column field="alert" title="触发提醒" width="90" align="right" />
            <vxe-column field="change" title="主要变化" min-width="240" />
            <vxe-column field="action" title="建议动作" min-width="180" />
          </vxe-table>
        </a-card>

        <a-card title="二、价格 / 排名 / 功能变化" :bordered="false" class="mb-4">
          <vxe-table :data="competitorChangeRows" border size="mini" stripe>
            <vxe-column field="type" title="变化类型" width="110" />
            <vxe-column field="product" title="竞品" min-width="180" />
            <vxe-column field="evidence" title="证据" min-width="260" />
            <vxe-column field="impact" title="影响判断" min-width="220" />
          </vxe-table>
        </a-card>

        <a-card title="三、差评主题与品牌影响" :bordered="false" class="mb-4">
          <vxe-table :data="negativeThemeRows" border size="mini" stripe>
            <vxe-column field="theme" title="差评主题" width="120" />
            <vxe-column field="product" title="关联竞品" min-width="180" />
            <vxe-column field="source" title="来源" width="160" />
            <vxe-column field="action" title="沉淀动作" min-width="220" />
          </vxe-table>
        </a-card>

        <a-card title="四、报告产物与生成规则" :bordered="false">
          <vxe-table :data="reportOutputRows" border size="mini" stripe>
            <vxe-column field="name" title="报告名称" width="150" />
            <vxe-column field="content" title="内容要求" min-width="360" />
            <vxe-column field="trigger" title="生成时机" min-width="180" />
            <vxe-column field="type" title="报告类型" width="110" />
          </vxe-table>
        </a-card>
      </template>

      <template v-else>
        <a-card title="月报核心内容" :bordered="false">
          <vxe-table :data="feedbackRows" border size="mini" stripe>
            <vxe-column field="name" title="模块" width="120" />
            <vxe-column field="value" title="内容" min-width="260" />
            <vxe-column field="action" title="处理要求" min-width="240" />
          </vxe-table>
        </a-card>
      </template>
    </template>
    <template #footer>
      <a-button type="primary" @click="closeModal">关闭</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.preview-stat-card {
  border-radius: 8px;
  min-height: 118px;
}
</style>
