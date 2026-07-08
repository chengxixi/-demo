<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

interface FeedbackTemplateValues {
  region: string
  dataSource: string
  deviceType: string
  brand: string
  internal: string
  model: string
  orderNo: string
  returned: string
  expressNo: string
  feedbackDate: string
  raw: string
  ai: string
  image: string
  video: string
  solution: string
  level1: string
  level2: string
  level3: string
  exception: string
  createMode: string
  processRoute: string
  processState: string
  feedbackUser: string
  note: string
}

interface FeedbackTemplate {
  id: string
  name: string
  isDefault: boolean
  enabled: boolean
  values: FeedbackTemplateValues
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const defaultValues: FeedbackTemplateValues = {
  region: '海外',
  dataSource: '海外电商-退货反馈',
  deviceType: '八电极',
  brand: '云康宝',
  internal: 'YL-CS20A-8',
  model: 'CS20A',
  orderNo: 'B0CS20AUS1',
  returned: '无需',
  expressNo: '',
  feedbackDate: '2026-06-18',
  raw: '用户反馈体脂秤无法开机，疑似电池或主板异常。',
  ai: 'The customer reports that the body fat scale cannot power on, possibly due to a battery or mainboard issue.',
  image: '',
  video: '',
  solution: '待产品经理确认处理方案。',
  level1: '产品质量',
  level2: '硬件损坏/无法使用',
  level3: '无法开机/上电',
  exception: 'P2',
  createMode: '人工录入',
  processRoute: '待处理',
  processState: '待处理',
  feedbackUser: '张伟',
  note: '',
}

const templates = ref<FeedbackTemplate[]>([
  {
    id: 'TPL-001',
    name: '八电极海外退货模板',
    isDefault: true,
    enabled: true,
    values: { ...defaultValues },
  },
  {
    id: 'TPL-002',
    name: '筋膜枪国内反馈模板',
    isDefault: false,
    enabled: true,
    values: {
      ...defaultValues,
      region: '国内',
      dataSource: '客服沟通',
      deviceType: '筋膜枪',
      brand: 'LF',
      internal: 'LF-MG20-CN',
      model: 'MG20',
      orderNo: '',
      raw: '用户反馈筋膜枪高档位噪音偏大。',
      ai: '筋膜枪高档位噪音明显，建议检查电机与结构件。',
      solution: '待筋膜枪产品经理确认处理方案。',
      level1: '产品体验',
      level2: '功能效果',
      level3: '噪音偏大',
      exception: 'P3',
      feedbackUser: '王雪',
    },
  },
])

const activeId = ref(templates.value[0]?.id || '')
const form = reactive<FeedbackTemplate>({
  id: '',
  name: '',
  isDefault: false,
  enabled: true,
  values: { ...defaultValues },
})

const activeTemplate = computed(() => {
  return templates.value.find((item) => item.id === activeId.value) || null
})

const dataSourceOptions = ['海外电商-退货反馈', '海外电商-商品评论', '国内电商-退货反馈', '国内电商-商品评论', '站内信', '客服沟通', 'APP反馈']
const returnOptions = ['退货', '换货', '退货+换货', '无需']
const processRouteOptions = ['待处理', '已转工单', '已转需求', '已转异常', '已转Q&A', '已直接回复关闭']
const processStateOptions = ['待人工复核', '待处理', '已处理']

function loadTemplate(template: FeedbackTemplate | null) {
  if (!template) {
    form.id = ''
    form.name = ''
    form.isDefault = false
    form.enabled = true
    form.values = { ...defaultValues }
    return
  }

  form.id = template.id
  form.name = template.name
  form.isDefault = template.isDefault
  form.enabled = template.enabled
  form.values = { ...template.values }
}

function closeModal() {
  emit('update:open', false)
}

function selectTemplate(id: string) {
  saveCurrent(false)
  activeId.value = id
  loadTemplate(activeTemplate.value)
}

function addTemplate() {
  saveCurrent(false)
  const id = `TPL-${String(templates.value.length + 1).padStart(3, '0')}`
  templates.value = [
    ...templates.value,
    {
      id,
      name: `我的模板${templates.value.length + 1}`,
      isDefault: false,
      enabled: true,
      values: { ...defaultValues },
    },
  ]
  activeId.value = id
  loadTemplate(activeTemplate.value)
}

function deleteTemplate() {
  if (!activeId.value) {
    return
  }

  const deleted = activeTemplate.value
  templates.value = templates.value.filter((item) => item.id !== activeId.value)

  if (deleted?.isDefault && templates.value[0]) {
    templates.value[0].isDefault = true
  }

  activeId.value = templates.value[0]?.id || ''
  loadTemplate(activeTemplate.value)
  message.success('模板已删除')
}

function saveCurrent(showMessage = true) {
  const index = templates.value.findIndex((item) => item.id === form.id)

  if (index < 0) {
    return
  }

  const next = templates.value.map((item, itemIndex) => {
    if (itemIndex !== index) {
      return {
        ...item,
        isDefault: form.isDefault ? false : item.isDefault,
      }
    }

    return {
      id: form.id,
      name: form.name || '未命名模板',
      enabled: true,
      isDefault: form.isDefault,
      values: { ...form.values },
    }
  })

  if (!next.some((item) => item.isDefault) && next[0]) {
    next[0].isDefault = true
  }

  templates.value = next

  if (showMessage) {
    message.success('模板已保存')
  }
}

function saveAndClose() {
  saveCurrent()
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="我的模板设置"
    width="1040px"
    @cancel="closeModal"
    @after-open-change="(visible) => visible && loadTemplate(activeTemplate)"
  >
    <a-alert
      class="mb-4"
      type="info"
      show-icon
      message="创建多个个人录入模板，并选择一个默认模板用于新增反馈。"
    />

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="7">
        <a-button type="primary" block class="mb-3" @click="addTemplate">新增模板</a-button>
        <a-space direction="vertical" class="w-full">
          <a-card
            v-for="template in templates"
            :key="template.id"
            size="small"
            :class="{ 'template-card-active': template.id === activeId }"
            @click="selectTemplate(template.id)"
          >
            <a-row justify="space-between" align="middle">
              <a-col>
                <a-typography-text strong>{{ template.name }}</a-typography-text>
                <div>
                  <a-typography-text type="secondary">
                    {{ template.isDefault ? '默认启用' : template.enabled ? '可用模板' : '已停用' }}
                  </a-typography-text>
                </div>
              </a-col>
              <a-col>
                <a-tag v-if="template.isDefault" color="blue">默认</a-tag>
                <a-tag v-else>选择</a-tag>
              </a-col>
            </a-row>
          </a-card>
        </a-space>
      </a-col>

      <a-col :xs="24" :md="17">
        <a-form layout="vertical">
          <a-row :gutter="12">
            <a-col :xs="24" :md="16">
              <a-form-item label="模板名称">
                <a-input v-model:value="form.name" placeholder="请输入模板名称" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="默认启用">
                <a-checkbox v-model:checked="form.isDefault">设为默认启用模板</a-checkbox>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="地区">
                <a-select v-model:value="form.values.region" :options="['海外', '国内'].map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="数据来源">
                <a-select v-model:value="form.values.dataSource" :options="dataSourceOptions.map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="设备类型">
                <a-input v-model:value="form.values.deviceType" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="品牌">
                <a-input v-model:value="form.values.brand" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="内部型号/料号">
                <a-input v-model:value="form.values.internal" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="销售型号">
                <a-input v-model:value="form.values.model" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="订单号">
                <a-input v-model:value="form.values.orderNo" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="是否退换货">
                <a-select v-model:value="form.values.returned" :options="returnOptions.map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="快递单号（退换货）">
                <a-input v-model:value="form.values.expressNo" placeholder="退换货时填写" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="问题反馈时间">
                <a-input v-model:value="form.values.feedbackDate" type="date" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="异常级别">
                <a-select v-model:value="form.values.exception" :options="['否', '待确认', 'P0', 'P1', 'P2', 'P3'].map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="创建方式">
                <a-select v-model:value="form.values.createMode" :options="['人工录入', 'AI自动创建'].map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="处理去向">
                <a-select v-model:value="form.values.processRoute" :options="processRouteOptions.map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="状态">
                <a-select v-model:value="form.values.processState" :options="processStateOptions.map((item) => ({ label: item, value: item }))" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="反馈人">
                <a-input v-model:value="form.values.feedbackUser" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="一级职能划分">
                <a-input v-model:value="form.values.level1" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="二级问题场景分类">
                <a-input v-model:value="form.values.level2" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="三级具体问题">
                <a-input v-model:value="form.values.level3" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="图片补充">
                <a-input v-model:value="form.values.image" placeholder="图片链接或附件说明" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="视频补充">
                <a-input v-model:value="form.values.video" placeholder="视频链接或附件说明" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="用户反馈（客户对话/退货反馈）">
                <a-textarea v-model:value="form.values.raw" :rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="用户评价翻译（AI自动翻译）">
                <a-textarea v-model:value="form.values.ai" :rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="问题回答/处理方案">
                <a-textarea v-model:value="form.values.solution" :rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="备注">
                <a-textarea v-model:value="form.values.note" :rows="2" placeholder="可保存固定话术、默认标签、备注字段" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
    </a-row>

    <template #footer>
      <a-space>
        <a-button danger @click="deleteTemplate">删除当前模板</a-button>
        <a-button type="primary" @click="saveAndClose">保存模板</a-button>
        <a-button @click="closeModal">关闭</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style scoped>
.template-card-active {
  border-color: #1677ff;
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
}
</style>
