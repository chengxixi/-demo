<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { EmergencyException } from '@/types'
import { emergencyStepLabels } from '@/api/mock'

const props = defineProps<{
  open: boolean
  item: EmergencyException | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'save', value: EmergencyException): void
}>()

const form = reactive({
  status: '',
  owner: '',
  team: '',
  action: '',
  tempPlan: '',
  rootCause: '',
  fixPlan: '',
  verifyResult: '',
  step: 1,
})

const stepCurrent = computed(() => Math.max(0, Math.min(form.step - 1, emergencyStepLabels.length - 1)))

const stageRows = computed(() => {
  if (!props.item) {
    return []
  }

  return [
    {
      stage: '临时方案处理',
      owner: form.owner,
      status: form.step >= 1 ? '已输出' : '待输出',
      content: form.tempPlan || '待补充',
    },
    {
      stage: '根因分析',
      owner: form.owner,
      status: form.step >= 2 ? '进行中/已输出' : '待启动',
      content: form.rootCause || '待补充',
    },
    {
      stage: '整改措施',
      owner: form.owner,
      status: form.step >= 3 ? '进行中/已输出' : '待启动',
      content: form.fixPlan || '待补充',
    },
    {
      stage: '验证结果',
      owner: form.owner,
      status: form.step >= 4 ? '验证中/已完成' : '待验证',
      content: form.verifyResult || '待补充',
    },
    {
      stage: '关闭归档',
      owner: form.owner,
      status: form.step >= 5 ? '已归档' : '待关闭',
      content: form.step >= 5 ? '闭环资料已归档' : '待验证通过后归档',
    },
  ]
})

watch(
  () => props.item,
  (item) => {
    form.status = item?.status || ''
    form.owner = item?.owner || ''
    form.team = item?.team || ''
    form.action = item?.action || ''
    form.tempPlan = item?.tempPlan || ''
    form.rootCause = item?.rootCause || ''
    form.fixPlan = item?.fixPlan || ''
    form.verifyResult = item?.verifyResult || ''
    form.step = Math.max(1, item?.step || 1)
  },
  { immediate: true },
)

function closeDrawer() {
  emit('update:open', false)
}

function saveItem() {
  if (!props.item) {
    closeDrawer()
    return
  }

  emit('save', {
    ...props.item,
    status: form.status,
    owner: form.owner,
    team: form.team,
    action: form.action,
    tempPlan: form.tempPlan,
    rootCause: form.rootCause,
    fixPlan: form.fixPlan,
    verifyResult: form.verifyResult,
    step: form.step,
    overdue: form.status === '关闭归档' ? false : props.item.overdue,
  })
  closeDrawer()
}
</script>

<template>
  <a-drawer
    :open="props.open"
    width="820"
    @close="closeDrawer"
  >
    <template #title>
      <a-space direction="vertical" size="small">
        <a-typography-text type="secondary">紧急异常详情</a-typography-text>
        <a-typography-title :level="4" class="m-0">
          {{ props.item?.id || '异常详情' }}
        </a-typography-title>
      </a-space>
    </template>

    <template v-if="props.item">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="异常级别">{{ props.item.level }}</a-descriptions-item>
        <a-descriptions-item label="异常维度">{{ props.item.dimension }}</a-descriptions-item>
        <a-descriptions-item label="地区/站点">{{ props.item.region }} / {{ props.item.site }}</a-descriptions-item>
        <a-descriptions-item label="触发来源">{{ props.item.source }}</a-descriptions-item>
        <a-descriptions-item label="产品/型号">{{ props.item.productLine }} / {{ props.item.internal }}</a-descriptions-item>
        <a-descriptions-item label="临时方案倒计时">{{ props.item.deadline }}</a-descriptions-item>
        <a-descriptions-item label="当前处理人">{{ props.item.owner }}</a-descriptions-item>
        <a-descriptions-item label="协同团队">{{ props.item.team }}</a-descriptions-item>
        <a-descriptions-item label="关联反馈" :span="2">{{ props.item.feedback || '-' }}</a-descriptions-item>
        <a-descriptions-item label="异常问题" :span="2">{{ props.item.issue }}</a-descriptions-item>
        <a-descriptions-item label="影响范围" :span="2">{{ props.item.impactScope }}</a-descriptions-item>
      </a-descriptions>

      <a-steps class="my-5" :current="stepCurrent" size="small">
        <a-step v-for="label in emergencyStepLabels" :key="label" :title="label" />
      </a-steps>

      <vxe-table :data="stageRows" border size="mini" show-overflow class="mb-4">
        <vxe-column field="stage" title="阶段" width="120" />
        <vxe-column field="owner" title="负责人" width="100" />
        <vxe-column field="status" title="状态" width="140" />
        <vxe-column field="content" title="输出内容" />
      </vxe-table>

      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="8">
            <a-form-item label="当前状态">
              <a-select
                v-model:value="form.status"
                :options="['临时方案超时', '临时方案输出', '根因分析', '整改措施', '验证结果', '关闭归档'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="当前步骤">
              <a-input-number v-model:value="form.step" :min="1" :max="5" class="w-full" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="负责人">
              <a-input v-model:value="form.owner" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="协同团队">
              <a-input v-model:value="form.team" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="当前动作">
              <a-textarea v-model:value="form.action" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="临时处置">
              <a-textarea v-model:value="form.tempPlan" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="根因分析">
              <a-textarea v-model:value="form.rootCause" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="整改措施">
              <a-textarea v-model:value="form.fixPlan" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="验证结果">
              <a-textarea v-model:value="form.verifyResult" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </template>

    <template #footer>
      <a-space>
        <a-button @click="closeDrawer">取消</a-button>
        <a-button type="primary" @click="saveItem">保存流程</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
