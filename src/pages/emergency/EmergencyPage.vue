<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { EmergencyException } from '@/types'
import { emergencyData, emergencyStepLabels } from '@/api/mock'
import EmergencyDetailDrawer from './EmergencyDetailDrawer.vue'
import EmergencyFilter, { type EmergencyFilters } from './EmergencyFilter.vue'
import EmergencyTable from './EmergencyTable.vue'

type StatCard = {
  label: string
  value: number
  accent: string
}

const statusByStep = ['临时方案输出', '根因分析', '整改措施', '验证结果', '关闭归档']
const items = ref<EmergencyException[]>([...emergencyData])
const detailOpen = ref(false)
const createOpen = ref(false)
const currentItem = ref<EmergencyException | null>(null)

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
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesLevel = !filters.value.level || item.level === filters.value.level
    const matchesRegion = !filters.value.region || item.region === filters.value.region
    const matchesStatus = !filters.value.status || item.status === filters.value.status
    const matchesDimension = !filters.value.dimension || item.dimension === filters.value.dimension
    const matchesOverdue =
      !filters.value.overdue ||
      (filters.value.overdue === 'yes' ? item.overdue : !item.overdue)

    return (
      matchesKeyword &&
      matchesLevel &&
      matchesRegion &&
      matchesStatus &&
      matchesDimension &&
      matchesOverdue
    )
  })
})

const urgentItems = computed(() => {
  return filteredItems.value
    .filter((item) => item.level === 'P0' || item.level === 'P1')
    .sort((a, b) => Number(b.overdue) - Number(a.overdue))
})

const observationItems = computed(() => {
  return filteredItems.value.filter((item) => item.level === 'P2' || item.level === 'P3')
})

const stats = computed<StatCard[]>(() => [
  {
    label: 'P0 致命/封店',
    value: items.value.filter((item) => item.level === 'P0').length,
    accent: '#e11d48',
  },
  {
    label: 'P1 高危/下架',
    value: items.value.filter((item) => item.level === 'P1').length,
    accent: '#f97316',
  },
  {
    label: '超时待响应',
    value: items.value.filter((item) => item.overdue && item.status !== '关闭归档').length,
    accent: '#dc2626',
  },
  {
    label: 'P2/P3 观察',
    value: items.value.filter((item) => item.level === 'P2' || item.level === 'P3').length,
    accent: '#2563eb',
  },
])

function levelColor(level: string) {
  if (level === 'P0') {
    return 'red'
  }

  if (level === 'P1') {
    return 'orange'
  }

  return 'blue'
}

function emergencyTitle(item: EmergencyException) {
  if (item.level === 'P0') {
    return `${item.dimension} ${item.issue}`
  }

  return `${item.dimension} ${item.issue}`
}

function emergencyState(item: EmergencyException) {
  if (item.status === '关闭归档' || item.step >= 5) {
    return '已归档'
  }

  if (item.overdue) {
    return '待响应'
  }

  if (item.step >= 4) {
    return '验证中'
  }

  return '处理中'
}

function openDetail(item: EmergencyException) {
  currentItem.value = item
  detailOpen.value = true
}

function saveEmergency(item: EmergencyException) {
  items.value = items.value.map((row) => (row.id === item.id ? item : row))
  message.success('紧急异常已更新')
}

function advanceStep(item: EmergencyException) {
  const nextStep = Math.min(item.step + 1, emergencyStepLabels.length)
  const nextStatus = statusByStep[nextStep - 1] || item.status

  items.value = items.value.map((row) => {
    if (row.id !== item.id) {
      return row
    }

    return {
      ...row,
      step: nextStep,
      status: nextStatus,
      overdue: nextStatus === '关闭归档' ? false : row.overdue,
    }
  })
  message.success(`${item.id} 已推进到 ${nextStatus}`)
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
      creator: '当前用户',
      dimension: newEmergency.dimension,
      source: newEmergency.source,
      deadline: '剩余 2h',
      reminderLimit: newEmergency.reminderLimit,
      reminderDeadline: newEmergency.reminderDeadline || '待确认',
      overdue: false,
      owner: newEmergency.owner,
      team: newEmergency.team,
      status: '临时方案输出',
      issue: newEmergency.issue || '待补充异常问题',
      impactScope: newEmergency.impactScope || '待补充影响范围',
      action: '待补充处置方案',
      feedback: newEmergency.feedback || newEmergency.source,
      tempPlan: '',
      rootCause: '待根因分析',
      fixPlan: '待整改措施',
      verifyResult: '待验证',
      step: 1,
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
      <a-col :xs="24" :xl="15">
        <a-card class="emergency-hero" :bordered="false">
          <a-row :gutter="[16, 16]" align="middle" justify="space-between">
            <a-col :xs="24" :lg="15">
              <a-space direction="vertical" size="small">
                <a-typography-text class="hero-eyebrow">紧急异常处理</a-typography-text>
                <a-typography-title :level="2" class="hero-title">
                  P0/P1 紧急事项闭环看板
                </a-typography-title>
                <a-typography-paragraph class="hero-copy">
                  仅展示 P0/P1 紧急异常，按临时方案处理、根因分析、整改措施、验证结果、关闭归档推进；P2/P3 仅纳入统计观察。
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

      <a-col :xs="24" :xl="9">
        <a-card class="flow-panel" :bordered="false">
          <a-typography-title :level="5">异常处理流程</a-typography-title>
          <a-steps direction="vertical" size="small" :current="1">
            <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
          </a-steps>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]" class="mt-4">
      <a-col v-for="stat in stats" :key="stat.label" :xs="12" :lg="6">
        <a-card class="stat-card" :bordered="false" :style="{ '--accent': stat.accent }">
          <a-statistic :title="stat.label" :value="stat.value" />
        </a-card>
      </a-col>
    </a-row>

    <a-card class="filter-card mt-4" :bordered="false">
      <EmergencyFilter v-model:filters="filters" />
    </a-card>

    <a-row :gutter="[16, 16]" class="mt-4">
      <a-col v-for="item in urgentItems" :key="item.id" :xs="24" :xl="12">
        <a-card
          class="urgent-card"
          :class="{ overdue: item.overdue }"
          :bordered="false"
        >
          <template #title>
            <a-space wrap>
              <a-tag :color="levelColor(item.level)">{{ item.level }}</a-tag>
              <a-typography-text strong>{{ item.id }}</a-typography-text>
              <a-tag :color="item.overdue ? 'red' : 'green'">{{ item.deadline }}</a-tag>
              <a-tag>{{ emergencyState(item) }}</a-tag>
            </a-space>
          </template>
          <template #extra>
            <a-space>
              <a-button size="small" @click="openDetail(item)">详情</a-button>
              <a-button size="small" type="primary" @click="advanceStep(item)">处置</a-button>
            </a-space>
          </template>

          <a-space direction="vertical" size="middle" class="w-full">
            <a-space direction="vertical" size="small" class="w-full">
              <a-typography-title :level="4" class="card-title">
                {{ emergencyTitle(item) }}
              </a-typography-title>
              <a-typography-paragraph class="card-desc">
                {{ item.action }}
              </a-typography-paragraph>
            </a-space>

            <a-descriptions size="small" :column="2" class="card-meta">
              <a-descriptions-item label="触发来源">{{ item.feedback }}</a-descriptions-item>
              <a-descriptions-item label="负责人">{{ item.owner }}</a-descriptions-item>
              <a-descriptions-item label="地区/站点">{{ item.region }} / {{ item.site }}</a-descriptions-item>
              <a-descriptions-item label="产品/型号">{{ item.productLine }} / {{ item.internal }}</a-descriptions-item>
              <a-descriptions-item label="影响范围" :span="2">{{ item.impactScope }}</a-descriptions-item>
              <a-descriptions-item label="协同团队" :span="2">{{ item.team }}</a-descriptions-item>
            </a-descriptions>

            <a-steps class="card-steps" size="small" :current="Math.max(0, item.step - 1)">
              <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
            </a-steps>

            <a-alert
              :type="item.overdue ? 'error' : 'warning'"
              show-icon
              :message="`临时处置：${item.tempPlan || '待输出临时方案，超时后系统标红并置顶。'}`"
            />
          </a-space>
        </a-card>
      </a-col>

      <a-col v-if="urgentItems.length === 0" :span="24">
        <a-empty description="暂无匹配的 P0/P1 紧急异常" />
      </a-col>
    </a-row>

    <a-collapse class="mt-4" ghost>
      <a-collapse-panel key="observe" header="P2/P3 统计观察">
        <EmergencyTable
          :items="observationItems"
          @open-detail="openDetail"
          @advance-step="advanceStep"
        />
      </a-collapse-panel>
    </a-collapse>

    <EmergencyDetailDrawer
      v-model:open="detailOpen"
      :item="currentItem"
      @save="saveEmergency"
    />

    <a-modal
      v-model:open="createOpen"
      title="新建紧急异常"
      width="860px"
      @ok="createEmergency"
    >
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="6">
            <a-form-item label="P级">
              <a-select
                v-model:value="newEmergency.level"
                :options="['P0', 'P1'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="地区">
              <a-select
                v-model:value="newEmergency.region"
                :options="['国内', '海外'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="异常维度">
              <a-select
                v-model:value="newEmergency.dimension"
                :options="['客户伤害', '平台合规'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="来源">
              <a-select
                v-model:value="newEmergency.source"
                :options="['退货反馈', '投诉/舆情', '客服沟通', 'APP反馈'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="站点">
              <a-input v-model:value="newEmergency.site" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="产品线">
              <a-input v-model:value="newEmergency.productLine" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="内部型号">
              <a-input v-model:value="newEmergency.internal" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="负责人">
              <a-input v-model:value="newEmergency.owner" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="协同团队">
              <a-input v-model:value="newEmergency.team" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="提醒时限">
              <a-input v-model:value="newEmergency.reminderLimit" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="提醒截止">
              <a-input v-model:value="newEmergency.reminderDeadline" placeholder="YYYY-MM-DD HH:mm" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="异常问题">
              <a-textarea v-model:value="newEmergency.issue" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="影响范围">
              <a-textarea v-model:value="newEmergency.impactScope" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="关联反馈">
              <a-input v-model:value="newEmergency.feedback" placeholder="反馈编号、工单编号或合并组" />
            </a-form-item>
          </a-col>
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
.flow-panel,
.filter-card,
.stat-card,
.urgent-card {
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
}

.emergency-hero {
  min-height: 222px;
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

.flow-panel {
  min-height: 222px;
}

.stat-card {
  border-left: 4px solid var(--accent);
}

.urgent-card {
  border-top: 3px solid #f97316;
}

.urgent-card.overdue {
  border-top-color: #e11d48;
  background: linear-gradient(180deg, #fff7f7 0%, #ffffff 42%);
}

.card-title {
  margin: 0 !important;
}

.card-desc {
  margin: 0 !important;
  color: #475569;
}

.card-meta :deep(.ant-descriptions-item-label) {
  color: #64748b;
}

.card-steps {
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
}
</style>
