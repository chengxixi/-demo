<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { RequirementPoolItem } from '@/types'

type ScoreKey = keyof RequirementPoolItem['scores']

interface TaskItem {
  id: string
  title: string
  owner: string
  dept: string
  status: string
  due: string
}

const props = defineProps<{
  item: RequirementPoolItem
}>()

const emit = defineEmits<{
  (event: 'back'): void
  (event: 'update', item: RequirementPoolItem): void
}>()

const scoreDimensions: Array<{
  key: ScoreKey
  label: string
  weight: number
  standard: string
}> = [
  { key: 'userValue', label: '用户价值', weight: 30, standard: '1分：边缘改善；5分：解决核心痛点或安全隐患。' },
  { key: 'businessImpact', label: '业务影响', weight: 25, standard: '1分：影响较弱；5分：显著降低退货率或提升转化率。' },
  { key: 'feasibility', label: '可行性', weight: 20, standard: '1分：周期大于6个月；5分：可快速落地，周期小于1个月。' },
  { key: 'competitiveImpact', label: '竞争影响', weight: 15, standard: '1分：与竞品无关；5分：补齐关键短板，形成差异化优势。' },
  { key: 'inventoryImpact', label: '库存影响', weight: 10, standard: '1分：造成库存压力；5分：有效消耗库存或无影响。' },
]

const ownerOptions = ['李工', '刘工', '张工', '陈华军', '刘海洲']
const deptOptions = ['产品部', '研发部', '供应链', '品质部']
const taskStatusOptions = ['待处理', '处理中', '已完成']

const editableScores = reactive<Record<ScoreKey, number>>({
  userValue: 0,
  businessImpact: 0,
  feasibility: 0,
  competitiveImpact: 0,
  inventoryImpact: 0,
})

const taskDraft = reactive({
  title: '',
  owner: '李工',
  dept: '产品部',
  due: '',
})

const tasks = shallowRef<TaskItem[]>([])

const weightedTotal = computed(() => {
  const total = scoreDimensions.reduce((sum, dimension) => {
    return sum + editableScores[dimension.key] * (dimension.weight / 100)
  }, 0)
  return Number(total.toFixed(2))
})

const scoreLevel = computed(() => {
  if (props.item.level === 'L1') return 'L1'
  if (weightedTotal.value >= 4.2) return 'L2'
  if (weightedTotal.value >= 3.5) return 'L3'
  if (weightedTotal.value >= 2.8) return 'L4'
  return '不紧急'
})

const scorePath = computed(() => {
  const map: Record<string, string> = {
    L1: '紧急修复',
    L2: '快速优化',
    L3: '功能升级',
    L4: '换代观察',
    不紧急: '观察池',
  }
  return map[scoreLevel.value] ?? props.item.path
})

const allTasksFinished = computed(() => tasks.value.length > 0 && tasks.value.every((task) => task.status === '已完成'))

const closedStatus = computed(() => props.item.status === '已闭环')

const basicInfo = computed(() => [
  { label: '需求编号', value: props.item.id },
  { label: '需求标题', value: props.item.title },
  { label: '候选来源', value: props.item.candidate },
  { label: '来源反馈', value: props.item.relatedFeedback },
  { label: '适用产品', value: props.item.product },
  { label: '负责人', value: props.item.owner },
  { label: '当前等级', value: props.item.level },
  { label: '处理路径', value: props.item.path },
  { label: '当前状态', value: props.item.status },
  { label: '完成时限', value: props.item.due },
])

const processSteps = computed(() => [
  { color: 'blue', text: `${props.item.owner} 接收需求，进入产品需求池。` },
  { color: scoreLevel.value === props.item.level ? 'green' : 'orange', text: `当前建议优先级：${scoreLevel.value}，处理路径：${scorePath.value}。` },
  { color: allTasksFinished.value ? 'green' : 'gray', text: allTasksFinished.value ? '任务已全部完成，可闭环并流入外部需求池。' : '任务拆分处理中。' },
])

watch(
  () => props.item,
  (item) => {
    Object.assign(editableScores, item.scores)
    tasks.value = [
      { id: `${item.id}-T01`, title: '产品方案确认', owner: item.owner, dept: '产品部', status: item.status === '已闭环' ? '已完成' : '处理中', due: item.due },
      { id: `${item.id}-T02`, title: '技术可行性评估', owner: '刘工', dept: '研发部', status: item.status === '已闭环' ? '已完成' : '待处理', due: item.due },
    ]
  },
  { immediate: true },
)

function saveScore() {
  const updated: RequirementPoolItem = {
    ...props.item,
    scores: { ...editableScores },
    level: scoreLevel.value,
    path: scorePath.value,
    status: props.item.status === '已闭环' ? props.item.status : '评分已更新',
    nextAction: `五维总分 ${weightedTotal.value}，建议进入${scoreLevel.value}。`,
  }
  emit('update', updated)
  message.success('评分已重新计算')
}

function addTask() {
  if (!taskDraft.title.trim()) {
    message.warning('请先填写任务名称')
    return
  }
  const nextIndex = tasks.value.length + 1
  tasks.value = [
    ...tasks.value,
    {
      id: `${props.item.id}-T${String(nextIndex).padStart(2, '0')}`,
      title: taskDraft.title.trim(),
      owner: taskDraft.owner,
      dept: taskDraft.dept,
      status: '待处理',
      due: taskDraft.due || props.item.due,
    },
  ]
  taskDraft.title = ''
  taskDraft.due = ''
}

function updateTaskStatus(taskId: string, status: string) {
  tasks.value = tasks.value.map((task) => (task.id === taskId ? { ...task, status } : task))
}

function closeRequirement() {
  if (!allTasksFinished.value) {
    message.warning('所有任务完成后才能闭环')
    return
  }
  emit('update', {
    ...props.item,
    status: '已闭环',
    nextAction: '已完成闭环，流入外部需求池。',
  })
  message.success('需求已闭环并流入外部需求池')
}
</script>

<template>
  <section class="requirement-detail-page space-y-4">
    <a-row justify="space-between" align="middle" :gutter="[12, 12]">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-button @click="emit('back')">返回需求池</a-button>
          <a-typography-title :level="4" class="m-0">{{ props.item.title }}</a-typography-title>
          <a-space wrap>
            <a-tag color="blue">{{ props.item.id }}</a-tag>
            <a-tag :color="scoreLevel === 'L1' ? 'red' : scoreLevel === 'L2' ? 'orange' : scoreLevel === 'L3' ? 'blue' : 'default'">
              {{ scoreLevel }}
            </a-tag>
            <a-tag>{{ scorePath }}</a-tag>
            <a-tag v-if="closedStatus" color="green">已闭环</a-tag>
          </a-space>
        </a-space>
      </a-col>
      <a-col>
        <a-statistic title="五维总分" :value="weightedTotal" :precision="2" />
      </a-col>
    </a-row>

    <a-card title="基本信息" size="small">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item v-for="info in basicInfo" :key="info.label" :label="info.label">
          {{ info.value || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="证据" :span="2">{{ props.item.evidence || '-' }}</a-descriptions-item>
        <a-descriptions-item label="需求描述" :span="2">{{ props.item.description || '-' }}</a-descriptions-item>
        <a-descriptions-item label="用户痛点" :span="2">{{ props.item.painPoint || '-' }}</a-descriptions-item>
        <a-descriptions-item label="预期价值" :span="2">{{ props.item.expectedValue || '-' }}</a-descriptions-item>
        <a-descriptions-item label="风险" :span="2">{{ props.item.risk || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="评分与优先级" size="small">
      <a-row :gutter="[12, 12]">
        <a-col v-for="dimension in scoreDimensions" :key="dimension.key" :xs="24" :md="8" :xl="4">
          <label class="score-field">
            <span>{{ dimension.label }} · {{ dimension.weight }}%</span>
            <a-input-number v-model:value="editableScores[dimension.key]" :min="1" :max="5" :step="0.5" class="w-full" />
            <a-typography-text type="secondary">{{ dimension.standard }}</a-typography-text>
          </label>
        </a-col>
        <a-col :xs="24" :xl="4">
          <div class="score-result">
            <a-statistic title="重算总分" :value="weightedTotal" :precision="2" />
            <a-space class="mt-2">
              <a-tag color="blue">{{ scoreLevel }}</a-tag>
              <a-tag>{{ scorePath }}</a-tag>
            </a-space>
          </div>
        </a-col>
      </a-row>
      <a-button type="primary" class="mt-3" @click="saveScore">重新生成总分和优先级</a-button>
    </a-card>

    <a-card title="任务拆分" size="small">
      <a-alert
        class="mb-3"
        type="info"
        show-icon
        message="产品经理可将需求拆成多个任务，分别流转给不同责任人。所有任务完成后，需求才能闭环并流入外部需求池。"
      />
      <a-row :gutter="[12, 12]" class="mb-3">
        <a-col :xs="24" :md="8">
          <a-input v-model:value="taskDraft.title" placeholder="任务名称" />
        </a-col>
        <a-col :xs="12" :md="4">
          <a-select v-model:value="taskDraft.owner" class="w-full" :options="ownerOptions.map((value) => ({ label: value, value }))" />
        </a-col>
        <a-col :xs="12" :md="4">
          <a-select v-model:value="taskDraft.dept" class="w-full" :options="deptOptions.map((value) => ({ label: value, value }))" />
        </a-col>
        <a-col :xs="12" :md="4">
          <a-input v-model:value="taskDraft.due" placeholder="完成时间" />
        </a-col>
        <a-col :xs="12" :md="4">
          <a-button block @click="addTask">添加任务</a-button>
        </a-col>
      </a-row>

      <a-table :data-source="tasks" :pagination="false" row-key="id" size="small">
        <a-table-column title="任务编号" data-index="id" width="170" />
        <a-table-column title="任务名称" data-index="title" />
        <a-table-column title="责任人" data-index="owner" width="100" />
        <a-table-column title="部门" data-index="dept" width="110" />
        <a-table-column title="完成时间" data-index="due" width="130" />
        <a-table-column title="状态" width="140">
          <template #default="{ record }">
            <a-select
              :value="record.status"
              class="w-full"
              :options="taskStatusOptions.map((value) => ({ label: value, value }))"
              @change="(value) => updateTaskStatus(record.id, value as string)"
            />
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-card title="处理记录" size="small">
      <a-timeline>
        <a-timeline-item v-for="step in processSteps" :key="step.text" :color="step.color">
          {{ step.text }}
        </a-timeline-item>
      </a-timeline>
    </a-card>

    <div class="detail-actions">
      <a-button @click="emit('back')">返回</a-button>
      <a-button type="primary" :disabled="!allTasksFinished || closedStatus" @click="closeRequirement">
        完成闭环并流入外部需求池
      </a-button>
    </div>
  </section>
</template>

<style scoped>
.requirement-detail-page {
  padding-bottom: 32px;
}

.score-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 154px;
}

.score-result {
  height: 154px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.detail-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0;
  background: #f5f7fb;
}
</style>