<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { Competitor, CompetitorFieldDef } from '@/types'
import { competitorParamFieldsMap, competitorProductTypeOptions } from '@/api/mock'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'add', value: Competitor): void
}>()

const form = reactive({
  line: '八电极秤',
  name: '',
  channelType: '海外',
  asin: '',
  price: '',
  channels: '',
  tags: ['品牌竞品'] as string[],
  fieldPlan: '完整信息登记',
  remark: '',
  values: {} as Record<string, string>,
})

const fields = computed(() => competitorParamFieldsMap[form.line] || competitorParamFieldsMap['体脂秤'])

const visibleFields = computed(() => {
  if (form.fieldPlan === '快速登记（仅必填）') {
    return fields.value.filter((field) => field.required)
  }

  if (form.fieldPlan === '基础信息+销售') {
    return fields.value.filter((field) => ['基础信息', '销售信息'].includes(field.category))
  }

  return fields.value
})

const groupedFields = computed(() => {
  return visibleFields.value.reduce<Record<string, CompetitorFieldDef[]>>((groups, field) => {
    groups[field.category] ||= []
    groups[field.category].push(field)
    return groups
  }, {})
})

const productTypeOptions = computed(() => competitorProductTypeOptions[form.line] || [])

const fieldPlanOptions = ['完整信息登记', '快速登记（仅必填）', '基础信息+销售']

const tagOptions = ['品牌竞品', 'ODM竞品']

watch(
  () => form.line,
  () => {
    form.values['产品类型'] = productTypeOptions.value[0] || form.line
  },
  { immediate: true },
)

function closeModal() {
  emit('update:open', false)
}

function fieldValue(name: string, fallback = '') {
  return form.values[name] || fallback
}

function submitForm() {
  if (form.channelType === '海外' && !form.asin.trim()) {
    message.error('海外竞品渠道必须填写 ASIN')
    return
  }

  const missingRequired = fields.value
    .filter((field) => field.required && !fieldValue(field.name).trim())
    .map((field) => field.name)

  if (missingRequired.length) {
    form.fieldPlan = '完整信息登记'
    message.error(`请补充必填字段：${missingRequired.join('、')}`)
    return
  }

  const productName = form.name || fieldValue('产品名称', '未命名竞品')
  const salesChannels = form.channels || fieldValue('销售平台', '-')
  const price = form.price || fieldValue('到手价', '-')
  const sellingPoints = fieldValue('核心卖点', '待补充')
    .split(/[、,/]/)
    .map((item) => item.trim())
    .filter(Boolean)

  const specs = Object.fromEntries(
    fields.value
      .filter((field) => !['基础信息', '销售信息'].includes(field.category))
      .map((field) => [field.name, fieldValue(field.name, '-')]),
  )

  emit('add', {
    id: `custom-${Date.now()}`,
    category: form.line,
    type: fieldValue('竞品类型', '直接竞争产品'),
    brand: fieldValue('品牌', '未命名品牌'),
    name: productName,
    model: fieldValue('产品型号', '-'),
    productType: fieldValue('产品类型', form.line),
    position: fieldValue('产品定位', '待评估'),
    launch: fieldValue('上市时间', '-'),
    platform: salesChannels,
    region: fieldValue('销售区域', '-'),
    officialPrice: fieldValue('官方售价', fieldValue('官方价格', '-')),
    dealPrice: price,
    rating: '-',
    reviews: '-',
    sellingPoints: sellingPoints.length ? sellingPoints : ['待补充'],
    specs,
    pain: form.remark || fieldValue('主要痛点', '待补充'),
    channelType: form.channelType,
    asin: form.asin || fieldValue('竞品链接', '-'),
    price,
    params: form.remark,
    channels: salesChannels,
    tags: form.tags.length ? [...form.tags] : ['品牌竞品'],
    monitorStatus: fieldValue('信息状态', '正常监控'),
    archived: false,
    registerFields: {
      ...form.values,
      产品线: form.line,
      渠道类型: form.channelType,
      ASIN: form.asin,
      字段处理方案: form.fieldPlan,
      备注: form.remark,
    },
  })
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="增加竞品"
    width="1080px"
    @cancel="closeModal"
  >
    <a-alert
      class="mb-4"
      type="info"
      show-icon
      message="按竞品信息登记表填写，海外渠道必须补充 ASIN。"
    />

    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :xs="24" :md="8">
          <a-form-item label="竞品名称">
            <a-input v-model:value="form.name" placeholder="例如 Withings Body Scan" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="渠道类型">
            <a-select
              v-model:value="form.channelType"
              :options="['海外', '国内'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="ASIN">
            <a-input
              v-model:value="form.asin"
              :placeholder="form.channelType === '海外' ? '海外渠道必填 ASIN' : '国内渠道可不填写'"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="产品线">
            <a-select
              v-model:value="form.line"
              :options="Object.keys(competitorParamFieldsMap).map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="价格">
            <a-input v-model:value="form.price" placeholder="$39.99 / ¥399" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="8">
          <a-form-item label="渠道">
            <a-input v-model:value="form.channels" placeholder="Amazon / 天猫 / 京东 / 抖音" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="竞品标签">
            <a-checkbox-group
              v-model:value="form.tags"
              :options="tagOptions"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="字段处理方案">
            <a-select
              v-model:value="form.fieldPlan"
              :options="fieldPlanOptions.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-collapse :default-active-key="Object.keys(groupedFields)">
        <a-collapse-panel
          v-for="(sectionFields, section) in groupedFields"
          :key="section"
          :header="section"
        >
          <a-row :gutter="12">
            <a-col
              v-for="field in sectionFields"
              :key="`${section}-${field.name}`"
              :xs="24"
              :md="8"
            >
              <a-form-item :label="`${field.required ? '* ' : ''}${field.name}`">
                <a-select
                  v-if="field.type === 'select'"
                  v-model:value="form.values[field.name]"
                  :options="(field.options || []).map((item) => ({ label: item, value: item }))"
                  :placeholder="field.placeholder || field.name"
                />
                <a-select
                  v-else-if="field.type === 'lineSelect'"
                  v-model:value="form.values[field.name]"
                  :options="productTypeOptions.map((item) => ({ label: item, value: item }))"
                  :placeholder="field.name"
                />
                <a-input-number
                  v-else-if="field.type === 'number'"
                  v-model:value="form.values[field.name]"
                  class="w-full"
                  :placeholder="field.placeholder"
                />
                <a-input
                  v-else
                  v-model:value="form.values[field.name]"
                  :placeholder="field.placeholder || field.name"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>

      <a-form-item class="mt-4" label="备注">
        <a-textarea
          v-model:value="form.remark"
          :rows="4"
          placeholder="补充核心卖点、功能差异、价格策略等备注信息"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="submitForm">保存竞品</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
