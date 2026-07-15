<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { emergencyData, emergencyStepLabels } from '@/api/mock'
import { currentUser } from '@/stores'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ''))
const sourceItem = computed(() => emergencyData.find((item) => item.id === id.value) || null)
const disposeMode = computed(() => route.query.mode === 'dispose')
const canDispose = computed(() => sourceItem.value?.owner === currentUser.value.name)

const form = reactive({
  issue: '',
  impactScope: '',
  tempPlan: '',
  rootCause: '',
  fixPlan: '',
  verifyResult: '',
  status: '',
  step: 0,
})

const stepCurrent = computed(() => Math.max(0, Math.min(form.step - 1, emergencyStepLabels.length - 1)))
const reminderOverdue = computed(() => Boolean(sourceItem.value?.overdue && !form.tempPlan))

const detailCards = computed(() => {
  if (!sourceItem.value) return []

  return [
    { label: '当前处理人', value: sourceItem.value.owner },
    { label: '协同团队', value: sourceItem.value.team },
    { label: '临时方案倒计时', value: sourceItem.value.deadline, danger: reminderOverdue.value },
    { label: '当前状态', value: form.status },
    { label: '关联反馈', value: sourceItem.value.feedback || '-' },
    { label: '触发来源', value: sourceItem.value.source || '-' },
    { label: '创建人', value: sourceItem.value.creator || '-' },
    { label: '站点', value: sourceItem.value.site || '-' },
    { label: '产品线', value: sourceItem.value.productLine || '-' },
    { label: '内部型号', value: sourceItem.value.internal || '-' },
  ]
})

const stageRows = computed(() => {
  if (!sourceItem.value) return []

  return [
    {
      stage: '临时方案处理',
      owner: sourceItem.value.owner,
      status: form.tempPlan ? '已输出' : '待输出',
      content: form.tempPlan || '待补充',
    },
    {
      stage: '根因分析',
      owner: sourceItem.value.owner,
      status: form.rootCause && form.rootCause !== '待根因分析' ? '已输出' : '待启动',
      content: form.rootCause || '待补充',
    },
    {
      stage: '整改措施',
      owner: sourceItem.value.owner,
      status: form.fixPlan && form.fixPlan !== '待整改措施' ? '已输出' : '待启动',
      content: form.fixPlan || '待补充',
    },
    {
      stage: '验证结果',
      owner: sourceItem.value.owner,
      status: form.verifyResult && form.verifyResult !== '待验证' ? '已完成' : '待验证',
      content: form.verifyResult || '待补充',
    },
    {
      stage: '关闭归档',
      owner: sourceItem.value.owner,
      status: form.step >= 5 ? '已归档' : '待关闭',
      content: form.step >= 5 ? '闭环资料已归档' : '待验证通过后归档',
    },
  ]
})

watch(
  sourceItem,
  (item) => {
    form.issue = item?.issue || ''
    form.impactScope = item?.impactScope || ''
    form.tempPlan = item?.tempPlan || ''
    form.rootCause = item?.rootCause || ''
    form.fixPlan = item?.fixPlan || ''
    form.verifyResult = item?.verifyResult || ''
    form.status = item?.status || ''
    form.step = item?.step || 0
  },
  { immediate: true },
)

function backToList() {
  router.push('/emergency')
}

function inferStep() {
  if (form.status === '关闭归档') return 5
  if (form.verifyResult && form.verifyResult !== '待验证') return 4
  if (form.fixPlan && form.fixPlan !== '待整改措施') return 3
  if (form.rootCause && form.rootCause !== '待根因分析') return 2
  if (form.tempPlan) return 1
  return form.step
}

function saveProcess() {
  if (!sourceItem.value) return
  if (!canDispose.value) {
    message.warning(`只有负责人 ${sourceItem.value.owner} 可以保存处置`)
    return
  }

  form.step = inferStep()
  form.status = form.tempPlan ? '临时方案输出' : form.status
  message.success('处置流程已保存')
}

function closeArchive() {
  if (!sourceItem.value) return
  if (!canDispose.value) {
    message.warning(`只有负责人 ${sourceItem.value.owner} 可以关闭归档`)
    return
  }

  form.step = 5
  form.status = '关闭归档'
  form.verifyResult ||= '验证完成'
  message.success('异常已关闭归档')
}
</script>

<template>
  <section class="emergency-detail-page">
    <a-empty v-if="!sourceItem" description="未找到该异常记录">
      <a-button type="primary" @click="backToList">返回列表</a-button>
    </a-empty>

    <template v-else>
      <div class="detail-head">
        <div>
          <a-typography-text type="secondary">紧急异常详情</a-typography-text>
          <a-typography-title :level="3" class="m-0">{{ sourceItem.id }}</a-typography-title>
          <a-space wrap>
            <a-tag :color="sourceItem.level === 'P0' ? 'red' : 'orange'">{{ sourceItem.level }}</a-tag>
            <a-typography-text type="secondary">{{ sourceItem.region }} / {{ sourceItem.site }}</a-typography-text>
            <a-typography-text type="secondary">{{ sourceItem.dimension }}</a-typography-text>
            <a-typography-text type="secondary">负责人：{{ sourceItem.owner }}</a-typography-text>
          </a-space>
        </div>
        <a-space>
          <a-tag v-if="disposeMode" color="blue">处置模式</a-tag>
          <a-tag v-if="!canDispose" color="orange">当前用户仅查看</a-tag>
          <a-button @click="backToList">返回列表</a-button>
        </a-space>
      </div>

      <a-alert
        v-if="!canDispose"
        class="mb-4"
        type="warning"
        show-icon
        :message="`只有负责人 ${sourceItem.owner} 可以处置，当前页面仅支持查看。`"
      />

      <a-card :bordered="false" class="detail-card mb-4">
        <a-steps :current="stepCurrent" size="small">
          <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
        </a-steps>
      </a-card>

      <div class="reminder-card mb-4" :class="{ overdue: reminderOverdue }">
        <div>
          <a-typography-text strong>临时方案提醒</a-typography-text>
          <p>
            P0/P1 异常需要先输出临时方案，再继续根因、整改和验证闭环。超过时限后会标记为超时待响应。
          </p>
        </div>
        <a-tag :color="reminderOverdue ? 'red' : 'green'">{{ sourceItem.deadline }}</a-tag>
      </div>

      <div class="detail-grid mb-4">
        <article v-for="card in detailCards" :key="card.label" class="detail-grid-item" :class="{ danger: card.danger }">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>

      <a-card :bordered="false" class="detail-card mb-4" title="处置进展">
        <vxe-table :data="stageRows" border size="mini" show-overflow>
          <vxe-column field="stage" title="阶段" width="130" />
          <vxe-column field="owner" title="负责人" width="110" />
          <vxe-column field="status" title="状态" width="120" />
          <vxe-column field="content" title="输出内容" />
        </vxe-table>
      </a-card>

      <a-card :bordered="false" class="detail-card" title="详情与处置">
        <a-form layout="vertical">
          <a-row :gutter="12">
            <a-col :xs="24" :md="12">
              <a-form-item label="异常问题">
                <a-textarea v-model:value="form.issue" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="影响范围">
                <a-textarea v-model:value="form.impactScope" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="临时处置">
                <a-textarea v-model:value="form.tempPlan" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="根因分析">
                <a-textarea v-model:value="form.rootCause" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="整改措施">
                <a-textarea v-model:value="form.fixPlan" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="验证结果">
                <a-textarea v-model:value="form.verifyResult" :rows="3" :disabled="!canDispose" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <div class="detail-actions">
          <a-space>
            <a-button @click="backToList">返回</a-button>
            <a-button type="primary" :disabled="!canDispose" @click="saveProcess">保存流程</a-button>
            <a-button danger :disabled="!canDispose" @click="closeArchive">关闭归档</a-button>
          </a-space>
        </div>
      </a-card>
    </template>
  </section>
</template>

<style scoped>
.emergency-detail-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fb;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
}

.detail-card {
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
}

.reminder-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #d9f7be;
  border-radius: 8px;
  background: #f6ffed;
}

.reminder-card.overdue {
  border-color: #ffccc7;
  background: #fff1f0;
}

.reminder-card p {
  margin: 4px 0 0;
  color: #667085;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 78px;
  padding: 14px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  background: #fff;
}

.detail-grid-item span {
  color: #8c8c8c;
}

.detail-grid-item strong {
  color: #1f2937;
  line-height: 1.45;
}

.detail-grid-item.danger strong {
  color: #cf1322;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

@media (max-width: 900px) {
  .detail-head,
  .reminder-card {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>