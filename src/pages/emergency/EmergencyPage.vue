<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { EmergencyException } from '@/types'
import { emergencyData, emergencyStepLabels } from '@/api/mock'
import { currentUser } from '@/stores'
import EmergencyFilter, { type EmergencyFilters } from './EmergencyFilter.vue'
import EmergencyTable from './EmergencyTable.vue'

type StatCard = {
  label: string
  value: number
  accent: string
}

const router = useRouter()
const items = ref<EmergencyException[]>([...emergencyData])
const createOpen = ref(false)

const filters = ref<EmergencyFilters>({
  keyword: '',
  level: '',
  region: '',
  status: '',
  dimension: '',
  overdue: '',
})

const newEmergency = reactive({
  level: 'P0',
  region: '国内',
  site: '京东',
  productLine: '体脂秤',
  internal: '',
  dimension: '客户伤害',
  source: '退货反馈',
  owner: '刘海州',
  team: '售后负责人 + 质量负责人',
  issue: '',
  impactScope: '',
  feedback: '',
  reminderLimit: '2h',
  reminderDeadline: '',
})

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const keyword = filters.value.keyword.trim().toLowerCase()
    const text = [
      item.id,
      item.level,
      item.region,
      item.site,
      item.productLine,
      item.internal,
      item.creator,
      item.owner,
      item.team,
      item.dimension,
      item.source,
      item.status,
      item.issue,
      item.impactScope,
      item.feedback,
    ].filter(Boolean).join(' ').toLowerCase()

    return (
      (!keyword || text.includes(keyword)) &&
      (!filters.value.level || item.level === filters.value.level) &&
      (!filters.value.region || item.region === filters.value.region) &&
      (!filters.value.status || item.status === filters.value.status) &&
      (!filters.value.dimension || item.dimension === filters.value.dimension) &&
      (!filters.value.overdue || (filters.value.overdue === 'yes' ? item.overdue : !item.overdue))
    )
  })
})

const p0Items = computed(() => emergencyItemsByLevel('P0'))
const p1Items = computed(() => emergencyItemsByLevel('P1'))
const observationItems = computed(() => filteredItems.value.filter((item) => item.level === 'P2' || item.level === 'P3'))

const stats = computed<StatCard[]>(() => [
  { label: 'P0 致命/封店', value: items.value.filter((item) => item.level === 'P0').length, accent: '#e11d48' },
  { label: 'P1 高危/下架', value: items.value.filter((item) => item.level === 'P1').length, accent: '#f97316' },
  { label: '超时待响应', value: items.value.filter((item) => item.overdue && item.status !== '关闭归档').length, accent: '#dc2626' },
  { label: 'P2/P3 观察', value: items.value.filter((item) => item.level === 'P2' || item.level === 'P3').length, accent: '#2563eb' },
])

function emergencyItemsByLevel(level: 'P0' | 'P1') {
  return filteredItems.value
    .filter((item) => item.level === level)
    .sort((a, b) => Number(b.overdue && !b.tempPlan) - Number(a.overdue && !a.tempPlan))
}

function levelColor(level: string) {
  if (level === 'P0') return 'red'
  if (level === 'P1') return 'orange'
  return 'blue'
}

function emergencyTitle(item: EmergencyException) {
  return `${item.dimension} ${item.issue}`
}

function emergencyState(item: EmergencyException) {
  if (item.status === '关闭归档' || item.step >= 5) return '已归档'
  if (item.overdue && !item.tempPlan) return '待响应'
  if (item.step >= 4) return '验证中'
  return '处理中'
}

function canDispose(item: EmergencyException) {
  return currentUser.value.name === item.owner
}

function openDetail(item: EmergencyException) {
  router.push(`/emergency/detail/${encodeURIComponent(item.id)}`)
}

function openDispose(item: EmergencyException) {
  if (!canDispose(item)) {
    message.warning(`只有负责人 ${item.owner} 可以处置`)
    return
  }

  router.push(`/emergency/detail/${encodeURIComponent(item.id)}?mode=dispose`)
}

function resetFilters() {
  filters.value = {
    keyword: '',
    level: '',
    region: '',
    status: '',
    dimension: '',
    overdue: '',
  }
}

function createEmergency() {
  const dateKey = new Date().toISOString().slice(0, 10).split('-').join('')
  const id = `${newEmergency.level}-${dateKey}-${String(items.value.length + 1).padStart(3, '0')}`

  items.value = [
    {
      id,
      level: newEmergency.level,
      region: newEmergency.region,
      site: newEmergency.site,
      productLine: newEmergency.productLine,
      internal: newEmergency.internal || '待补充',
      creator: currentUser.value.name || '当前用户',
      dimension: newEmergency.dimension,
      source: newEmergency.source,
      deadline: '剩余 2h',
      reminderLimit: newEmergency.reminderLimit,
      reminderDeadline: newEmergency.reminderDeadline || '待确认',
      overdue: false,
      owner: newEmergency.owner,
      team: newEmergency.team,
      status: '待临时方案',
      issue: newEmergency.issue || '待补充异常问题',
      impactScope: newEmergency.impactScope || '待补充影响范围',
      action: '待补充处置方案',
      feedback: newEmergency.feedback || newEmergency.source,
      tempPlan: '',
      rootCause: '待根因分析',
      fixPlan: '待整改措施',
      verifyResult: '待验证',
      step: 0,
    },
    ...items.value,
  ]
  createOpen.value = false
  message.success('紧急异常已新增')
}
</script>

<template>
  <section class="emergency-page">
    <a-row :gutter="[16, 16]" align="stretch">
      <a-col :span="24">
        <a-card class="emergency-hero" :bordered="false">
          <a-row :gutter="[16, 16]" align="middle" justify="space-between">
            <a-col :xs="24" :lg="15">
              <a-space direction="vertical" size="small">
                <a-typography-text class="hero-eyebrow">紧急异常处理</a-typography-text>
                <a-typography-title :level="2" class="hero-title">P0/P1 紧急事项闭环看板</a-typography-title>
                <a-typography-paragraph class="hero-copy">
                  P0/P1 紧急异常事项跟踪与闭环处理，P2/P3 仅纳入统计观察。
                </a-typography-paragraph>
              </a-space>
            </a-col>
            <a-col :xs="24" :lg="9">
              <a-space wrap class="hero-actions">
                <a-button @click="filters.overdue = 'yes'">查看超时</a-button>
                <a-button @click="resetFilters">重置筛选</a-button>
                <a-button type="primary" @click="createOpen = true">新建异常</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="filter-card mt-4" :bordered="false">
      <EmergencyFilter v-model:filters="filters" />
    </a-card>

    <a-row :gutter="[12, 12]" class="mt-4">
      <a-col v-for="stat in stats" :key="stat.label" :xs="12" :lg="6">
        <a-card class="stat-card" :bordered="false" :style="{ '--accent': stat.accent }">
          <a-statistic :title="stat.label" :value="stat.value" />
        </a-card>
      </a-col>
    </a-row>

    <section class="level-section p0-section">
      <div class="level-head">
        <div>
          <h3>P0 紧急异常</h3>
          <p>客户伤害、法规/安全或重大封店风险，优先响应。</p>
        </div>
        <a-tag color="red">{{ p0Items.length }} 个</a-tag>
      </div>
      <a-space v-if="p0Items.length" direction="vertical" size="middle" class="w-full">
        <a-card v-for="item in p0Items" :key="item.id" class="emergency-card p0" :bordered="false">
          <div class="emergency-card-main">
            <div class="emergency-card-content">
              <a-space wrap class="emergency-tags">
                <a-tag :color="levelColor(item.level)">{{ item.level }}</a-tag>
                <a-typography-text code strong>{{ item.id }}</a-typography-text>
                <a-tag :color="item.overdue && !item.tempPlan ? 'red' : 'green'">{{ item.deadline }}</a-tag>
                <a-tag>{{ emergencyState(item) }}</a-tag>
              </a-space>
              <a-typography-title :level="4" class="card-title">{{ emergencyTitle(item) }}</a-typography-title>
              <a-typography-paragraph class="card-desc">{{ item.action }}</a-typography-paragraph>
              <div class="emergency-meta">
                <span>触发来源：{{ item.feedback }}</span>
                <span>负责人：{{ item.owner }}</span>
                <span>创建人：{{ item.creator || '待补充' }}</span>
                <span>地区/站点：{{ item.region }} / {{ item.site }}</span>
                <span>产品线/型号：{{ item.productLine }} / {{ item.internal }}</span>
                <span>影响范围：{{ item.impactScope }}</span>
                <span>响应时限：{{ item.reminderDeadline || item.deadline }}</span>
              </div>
              <div class="emergency-plan"><b>临时处置：</b>{{ item.tempPlan || '待输出临时方案，超时后系统标红并置顶。' }}</div>
              <a-steps class="card-steps" size="small" :current="Math.max(0, item.step - 1)">
                <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
              </a-steps>
            </div>
            <a-space direction="vertical" size="small" class="card-actions">
              <a-button @click="openDetail(item)">查看详情</a-button>
              <a-tooltip v-if="!canDispose(item)" :title="`只有负责人 ${item.owner} 可以处置`">
                <a-button type="primary" disabled>添加处置</a-button>
              </a-tooltip>
              <a-button v-else type="primary" @click="openDispose(item)">添加处置</a-button>
            </a-space>
          </div>
        </a-card>
      </a-space>
      <a-empty v-else description="暂无 P0 紧急异常" />
    </section>

    <section class="level-section p1-section">
      <div class="level-head">
        <div>
          <h3>P1 高危异常</h3>
          <p>平台合规、批量投诉或高风险问题，独立跟踪。</p>
        </div>
        <a-tag color="orange">{{ p1Items.length }} 个</a-tag>
      </div>
      <a-space v-if="p1Items.length" direction="vertical" size="middle" class="w-full">
        <a-card v-for="item in p1Items" :key="item.id" class="emergency-card p1" :bordered="false">
          <div class="emergency-card-main">
            <div class="emergency-card-content">
              <a-space wrap class="emergency-tags">
                <a-tag :color="levelColor(item.level)">{{ item.level }}</a-tag>
                <a-typography-text code strong>{{ item.id }}</a-typography-text>
                <a-tag :color="item.overdue && !item.tempPlan ? 'red' : 'green'">{{ item.deadline }}</a-tag>
                <a-tag>{{ emergencyState(item) }}</a-tag>
              </a-space>
              <a-typography-title :level="4" class="card-title">{{ emergencyTitle(item) }}</a-typography-title>
              <a-typography-paragraph class="card-desc">{{ item.action }}</a-typography-paragraph>
              <div class="emergency-meta">
                <span>触发来源：{{ item.feedback }}</span>
                <span>负责人：{{ item.owner }}</span>
                <span>创建人：{{ item.creator || '待补充' }}</span>
                <span>地区/站点：{{ item.region }} / {{ item.site }}</span>
                <span>产品线/型号：{{ item.productLine }} / {{ item.internal }}</span>
                <span>影响范围：{{ item.impactScope }}</span>
                <span>响应时限：{{ item.reminderDeadline || item.deadline }}</span>
              </div>
              <div class="emergency-plan"><b>临时处置：</b>{{ item.tempPlan || '待输出临时方案，超时后系统标红并置顶。' }}</div>
              <a-steps class="card-steps" size="small" :current="Math.max(0, item.step - 1)">
                <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
              </a-steps>
            </div>
            <a-space direction="vertical" size="small" class="card-actions">
              <a-button @click="openDetail(item)">查看详情</a-button>
              <a-tooltip v-if="!canDispose(item)" :title="`只有负责人 ${item.owner} 可以处置`">
                <a-button type="primary" disabled>添加处置</a-button>
              </a-tooltip>
              <a-button v-else type="primary" @click="openDispose(item)">添加处置</a-button>
            </a-space>
          </div>
        </a-card>
      </a-space>
      <a-empty v-else description="暂无 P1 高危异常" />
    </section>

    <a-collapse class="mt-4" ghost>
      <a-collapse-panel key="observe" header="P2/P3 统计观察">
        <EmergencyTable :items="observationItems" @open-detail="openDetail" />
      </a-collapse-panel>
    </a-collapse>

    <a-modal v-model:open="createOpen" title="新建紧急异常" width="860px" @ok="createEmergency">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="6"><a-form-item label="P级"><a-select v-model:value="newEmergency.level" :options="['P0', 'P1'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="地区"><a-select v-model:value="newEmergency.region" :options="['国内', '海外'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="异常维度"><a-select v-model:value="newEmergency.dimension" :options="['客户伤害', '平台合规'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="来源"><a-select v-model:value="newEmergency.source" :options="['退货反馈', '投诉/舆情', '客服沟通', 'APP反馈'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="站点"><a-input v-model:value="newEmergency.site" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="产品线"><a-input v-model:value="newEmergency.productLine" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="内部型号"><a-input v-model:value="newEmergency.internal" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="负责人"><a-input v-model:value="newEmergency.owner" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="协同团队"><a-input v-model:value="newEmergency.team" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="提醒时限"><a-input v-model:value="newEmergency.reminderLimit" /></a-form-item></a-col>
          <a-col :span="6"><a-form-item label="提醒截止"><a-input v-model:value="newEmergency.reminderDeadline" placeholder="YYYY-MM-DD HH:mm" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="异常问题"><a-textarea v-model:value="newEmergency.issue" :rows="3" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="影响范围"><a-textarea v-model:value="newEmergency.impactScope" :rows="3" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="关联反馈"><a-input v-model:value="newEmergency.feedback" placeholder="反馈编号、工单编号或合并组" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>
  </section>
</template>

<style scoped>
.emergency-page {
  padding: 16px;
  background: #f5f7fb;
}

.emergency-hero,
.filter-card,
.stat-card,
.level-section,
.emergency-card {
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
}

.emergency-hero {
  min-height: 190px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 96%), rgb(255 247 237 / 92%)),
    radial-gradient(circle at 88% 20%, rgb(248 113 113 / 22%), transparent 30%);
}

.hero-eyebrow {
  color: #b42318;
  font-weight: 700;
}

.hero-title {
  margin: 0 !important;
  color: #111827 !important;
}

.hero-copy {
  max-width: 720px;
  margin: 0 !important;
  color: #526070;
}

.hero-actions {
  justify-content: flex-end;
  width: 100%;
}

.stat-card {
  border-left: 4px solid var(--accent);
}

.level-section {
  margin-top: 16px;
  padding: 18px;
  background: #fff;
}

.level-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.level-head h3 {
  margin: 0;
  font-size: 18px;
}

.level-head p {
  margin: 4px 0 0;
  color: #64748b;
}

.emergency-card.p0 {
  border-left: 5px solid #e11d48;
}

.emergency-card.p1 {
  border-left: 5px solid #f97316;
}

.emergency-card-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 18px;
}

.emergency-card-content {
  min-width: 0;
}

.emergency-tags {
  margin-bottom: 10px;
}

.card-title {
  margin: 0 0 6px !important;
}

.card-desc {
  margin: 0 0 10px !important;
  color: #475569;
}

.emergency-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  color: #475569;
  font-size: 13px;
}

.emergency-plan {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: #344054;
}

.emergency-plan b {
  color: #f59e0b;
}

.card-actions :deep(.ant-btn) {
  width: 100px;
}

.card-steps {
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

@media (max-width: 768px) {
  .hero-actions {
    justify-content: flex-start;
  }

  .emergency-page {
    padding: 12px;
  }

  .emergency-card-main,
  .emergency-meta {
    grid-template-columns: 1fr;
  }
}
</style>