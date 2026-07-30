<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import type { CandidateLead, RequirementPoolItem } from '@/types'

const props = defineProps<{
  visible: boolean
  source: CandidateLead | null
}>()

const emit = defineEmits<{
  (event: 'confirm', value: RequirementPoolItem): void
  (event: 'close'): void
}>()

const showRiceGuide = shallowRef(false)
const showFiveGuide = shallowRef(false)

const impactOptions = [
  { label: '3 巨大', value: 3 },
  { label: '2 高', value: 2 },
  { label: '1 中', value: 1 },
  { label: '0.5 低', value: 0.5 },
  { label: '0.25 微弱', value: 0.25 },
]

const confidenceOptions = [
  { label: '100% 高', value: 1 },
  { label: '80% 中', value: 0.8 },
  { label: '50% 低', value: 0.5 },
]

const riceStandards = [
  { key: 'R 触及范围', standard: '受影响的用户数量或百分比，使用估算绝对用户数。', source: '后台数据、市场预测。', owner: '产品部 + 运营部' },
  { key: 'I 影响程度', standard: '对单个用户的影响强度系数：3 巨大、2 高、1 中、0.5 低、0.25 微弱。', source: '用户反馈分析、专家评估。', owner: '产品部 + 研发部' },
  { key: 'C 信心指数', standard: '对 R 和 I 评估的信心百分比：100% 高、80% 中、50% 低。', source: '数据质量、假设合理性。', owner: '需求分析团队' },
  { key: 'E 投入成本', standard: '实现所需团队总人天数。', source: '研发、供应链评估。', owner: '研发部牵头' },
]

type FiveScoreField = 'userValue' | 'businessImpact' | 'feasibility' | 'competitiveImpact' | 'inventoryImpact'

const fiveDimensionStandards: Array<{ key: string; weight: string; field: FiveScoreField; brief: string; standard: string; basis: string; owner: string }> = [
  { key: 'A 用户价值', weight: '30%', field: 'userValue', brief: '核心痛点/安全隐患', standard: '1 分：边缘改善；5 分：解决核心痛点或安全隐患。', basis: '用户反馈分析、NPS 驱动因素。', owner: '产品部' },
  { key: 'B 业务影响', weight: '25%', field: 'businessImpact', brief: '退货率/转化率影响', standard: '1 分：影响微弱；5 分：显著降低退货率或提升转化率。', basis: '历史数据回归、运营预估。', owner: '运营部' },
  { key: 'C 可行性', weight: '20%', field: 'feasibility', brief: '落地周期和难度', standard: '1 分：难度大，周期超过 6 个月；5 分：可快速落地，周期小于 1 个月。', basis: '研发、供应链评估。', owner: '研发部、供应链部' },
  { key: 'D 竞争影响', weight: '15%', field: 'competitiveImpact', brief: '补齐短板/差异化', standard: '1 分：与竞品无关或已领先；5 分：补齐关键短板，形成差异化优势。', basis: '竞品分析、市场调研。', owner: '市场部/产品部' },
  { key: 'E 库存影响', weight: '10%', field: 'inventoryImpact', brief: '库存消耗或压力', standard: '1 分：造成重大呆滞压力；5 分：有效消耗库存或无影响。', basis: '供应链库存数据。', owner: '供应链部' },
]

const form = reactive({
  title: '',
  product: '',
  owner: '李工',
  due: '',
  evidence: '',
  description: '',
  reach: 100,
  impact: 1,
  confidence: 0.8,
  effort: 5,
  userValue: 3,
  businessImpact: 3,
  feasibility: 3,
  competitiveImpact: 3,
  inventoryImpact: 3,
})

const riceScore = computed(() => {
  if (!form.effort) return 0
  return Number(((form.reach * form.impact * form.confidence) / form.effort).toFixed(2))
})

const fiveScore = computed(() => {
  const score =
    form.userValue * 0.3 +
    form.businessImpact * 0.25 +
    form.feasibility * 0.2 +
    form.competitiveImpact * 0.15 +
    form.inventoryImpact * 0.1
  return Number(score.toFixed(2))
})

const decision = computed(() => {
  const highRice = riceScore.value >= 50
  const highFive = fiveScore.value >= 3.5

  if (highRice && highFive) {
    return {
      area: '优先执行区',
      quadrant: 'L3 核心功能升级',
      level: riceScore.value >= 80 && fiveScore.value >= 4.2 ? 'L2' : 'L3',
      path: riceScore.value >= 80 && fiveScore.value >= 4.2 ? '快速优化' : '功能升级',
      status: '待评审',
      nextAction: '进入产品评审，确认排期和资源投入。',
    }
  }

  if (!highRice && highFive) {
    return {
      area: '战略再议区',
      quadrant: 'L4 战略开发',
      level: 'L4',
      path: '换代观察',
      status: '待评审',
      nextAction: '进入产品规划观察池，持续补充市场和用户证据。',
    }
  }

  if (highRice && !highFive) {
    return {
      area: '快速验证区',
      quadrant: 'L2 快速优化',
      level: 'L2',
      path: '快速验证',
      status: '待评审',
      nextAction: '先做小范围验证或 A/B 测试，再决定是否进入迭代。',
    }
  }

  return {
    area: '观察/拒绝区',
    quadrant: '观察/拒绝',
    level: '不紧急',
    path: '暂缓观察',
    status: '不紧急',
    nextAction: '转入需求池末尾，后续有新增证据再重新评分。',
  }
})

const matrixPointStyle = computed(() => ({
  left: riceScore.value >= 50 ? '75%' : '25%',
  top: fiveScore.value >= 3.5 ? '25%' : '75%',
}))

watch(
  () => props.source,
  (source) => {
    form.title = source?.title || ''
    form.product = source?.product || ''
    form.evidence = source?.evidence || ''
    form.description = source?.nextAction || ''
  },
  { immediate: true },
)

function confirmPromote() {
  emit('confirm', {
    id: `REQ-${Date.now()}`,
    candidate: props.source?.id || '',
    title: form.title,
    source: props.source?.category || '人工创建',
    evidence: form.evidence,
    product: form.product,
    scores: {
      userValue: form.userValue,
      businessImpact: form.businessImpact,
      feasibility: form.feasibility,
      competitiveImpact: form.competitiveImpact,
      inventoryImpact: form.inventoryImpact,
    },
    level: decision.value.level,
    path: decision.value.path,
    status: decision.value.status,
    owner: form.owner,
    due: form.due,
    description: form.description,
    painPoint: form.evidence || '待补充',
    expectedValue: `RICE ${riceScore.value}，五维总分 ${fiveScore.value}，判定为${decision.value.area}`,
    risk: '待产品评审确认资源、成本和风险。',
    nextAction: decision.value.nextAction,
    relatedFeedback: props.source?.sourceFeedback || '',
  })
}
</script>

<template>
  <a-modal
    :open="props.visible"
    title="转入产品需求池"
    width="1080px"
    class="requirement-promote-modal"
    @cancel="emit('close')"
  >
    <a-form layout="vertical">
      <a-card size="small" class="decision-summary-card">
        <a-row :gutter="16" align="middle">
          <a-col :span="8">
            <a-statistic title="系统判定等级" :value="decision.level" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="落入象限" :value="decision.quadrant" />
          </a-col>
          <a-col :span="8">
            <a-space direction="vertical" size="small">
              <a-tag color="blue">RICE {{ riceScore }}</a-tag>
              <a-tag color="green">五维 {{ fiveScore }}</a-tag>
              <a-typography-text type="secondary">{{ decision.nextAction }}</a-typography-text>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="需求标题">
            <a-input v-model:value="form.title" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="适用产品">
            <a-input v-model:value="form.product" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="负责人">
            <a-input v-model:value="form.owner" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="完成时限">
            <a-date-picker v-model:value="form.due" value-format="YYYY-MM-DD" class="w-full" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="处理路径">
            <a-input :value="decision.path" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="证据摘要">
            <a-textarea v-model:value="form.evidence" :rows="2" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-card size="small" class="score-card">
        <template #title>
          <a-space>
            <span>RICE 模型量化评分</span>
            <a-button class="info-button" size="small" shape="circle" @click="showRiceGuide = true">!</a-button>
          </a-space>
        </template>
        <a-row :gutter="12">
          <a-col :span="6">
            <a-form-item label="R 触及范围">
              <a-input-number v-model:value="form.reach" :min="0" class="w-full" addon-after="用户/样本" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="I 影响程度">
              <a-select v-model:value="form.impact" :options="impactOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="C 信心指数">
              <a-select v-model:value="form.confidence" :options="confidenceOptions" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="E 投入成本">
              <a-input-number v-model:value="form.effort" :min="0.5" :step="0.5" class="w-full" addon-after="人天" />
            </a-form-item>
          </a-col>
        </a-row>
        <div class="score-formula">RICE = (R × I × C) / E = {{ riceScore }}</div>
      </a-card>

      <a-card size="small" class="score-card">
        <template #title>
          <a-space>
            <span>五维业务评分</span>
            <a-button class="info-button" size="small" shape="circle" @click="showFiveGuide = true">!</a-button>
          </a-space>
        </template>
        <div class="five-score-grid">
          <div v-for="item in fiveDimensionStandards" :key="item.field" class="five-score-item">
            <div class="five-score-title">
              <strong>{{ item.key }}</strong>
              <a-tag color="blue">{{ item.weight }}</a-tag>
            </div>
            <a-input-number v-model:value="form[item.field]" :min="1" :max="5" :step="0.5" class="w-full" />
            <a-typography-text type="secondary">{{ item.brief }}</a-typography-text>
          </div>
        </div>
        <div class="score-formula">五维总分 = A×30% + B×25% + C×20% + D×15% + E×10% = {{ fiveScore }}</div>
      </a-card>

      <a-card size="small" class="score-card matrix-card">
        <template #title>
          <a-space>
            <span>需求综合决策矩阵</span>
            <a-tooltip title="横轴为执行优先级，纵轴为战略健康度；系统会把当前需求落到对应象限。">
              <a-button class="info-button" size="small" shape="circle">!</a-button>
            </a-tooltip>
          </a-space>
        </template>
        <div class="matrix-wrap">
          <div class="matrix-axis-y matrix-axis-y-top">高战略健康度</div>
          <div class="matrix-axis-y matrix-axis-y-bottom">低战略健康度</div>
          <div class="matrix-axis-x matrix-axis-x-left">低执行优先级</div>
          <div class="matrix-axis-x matrix-axis-x-right">高执行优先级</div>
          <div class="matrix-grid">
            <div class="matrix-cell matrix-cell-l4">L4 战略开发</div>
            <div class="matrix-cell matrix-cell-l3">L3 核心功能升级</div>
            <div class="matrix-cell matrix-cell-watch">观察/拒绝</div>
            <div class="matrix-cell matrix-cell-l2">L2 快速优化</div>
            <div class="matrix-point" :style="matrixPointStyle">
              <span>{{ decision.level }}</span>
            </div>
          </div>
        </div>
      </a-card>

      <a-form-item label="需求描述">
        <a-textarea v-model:value="form.description" :rows="3" />
      </a-form-item>
    </a-form>

    <a-modal v-model:open="showRiceGuide" title="RICE 评分标准" width="860px" :footer="null">
      <a-table :data-source="riceStandards" :pagination="false" size="small" row-key="key">
        <a-table-column title="维度" data-index="key" width="140" />
        <a-table-column title="定义与评分标准" data-index="standard" />
        <a-table-column title="数据来源" data-index="source" width="200" />
        <a-table-column title="责任岗位" data-index="owner" width="160" />
      </a-table>
    </a-modal>

    <a-modal v-model:open="showFiveGuide" title="五维评分标准与依据" width="920px" :footer="null">
      <a-table :data-source="fiveDimensionStandards" :pagination="false" size="small" row-key="field">
        <a-table-column title="评分维度" data-index="key" width="130" />
        <a-table-column title="权重" data-index="weight" width="80" />
        <a-table-column title="评分标准" data-index="standard" />
        <a-table-column title="评分依据" data-index="basis" width="190" />
        <a-table-column title="责任岗位" data-index="owner" width="140" />
      </a-table>
    </a-modal>

    <template #footer>
      <a-space>
        <a-button @click="emit('close')">取消</a-button>
        <a-button type="primary" @click="confirmPromote">确认转入</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style scoped>
.decision-summary-card,
.score-card {
  margin-bottom: 12px;
}

.score-formula {
  padding: 8px 12px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.info-button {
  color: #1677ff;
  border-color: #91caff;
  font-weight: 700;
}

.five-score-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.five-score-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.five-score-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.matrix-wrap {
  position: relative;
  width: 620px;
  max-width: 100%;
  margin: 4px auto 28px;
  padding: 22px 28px 26px 54px;
}

.matrix-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, 118px);
  overflow: hidden;
  border: 2px solid #c7d2fe;
  background: #f8fafc;
}

.matrix-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border: 1px solid #dbe3ff;
  font-weight: 600;
  text-align: center;
}

.matrix-cell-l4,
.matrix-cell-l3 {
  background: #eef2ff;
}

.matrix-cell-watch,
.matrix-cell-l2 {
  background: #fbfdff;
}

.matrix-point {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #fff;
  background: #1677ff;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(22, 119, 255, 0.28);
  font-weight: 700;
}

.matrix-axis-y {
  position: absolute;
  left: 0;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: #334155;
  font-weight: 600;
}

.matrix-axis-y-top {
  top: 40px;
}

.matrix-axis-y-bottom {
  bottom: 54px;
}

.matrix-axis-x {
  position: absolute;
  bottom: 0;
  color: #334155;
  font-weight: 600;
}

.matrix-axis-x-left {
  left: 124px;
}

.matrix-axis-x-right {
  right: 74px;
}

.w-full {
  width: 100%;
}
</style>