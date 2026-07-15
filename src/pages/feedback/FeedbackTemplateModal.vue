<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { brandOptions, productTypeOptions, sourceOptions } from '@/api/mock'

interface FeedbackTemplateValues {
  region: string
  source: string
  productType: string
  brand: string
}

interface FeedbackTemplate {
  id: string
  name: string
  enabled: boolean
  isDefault: boolean
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
  source: '商品评论',
  productType: '八电极',
  brand: '云康宝',
}

const templates = ref<FeedbackTemplate[]>([
  {
    id: 'TPL-001',
    name: '八电极海外退货模板',
    enabled: true,
    isDefault: true,
    values: {
      region: '海外',
      source: '退货反馈',
      productType: '八电极',
      brand: '云康宝',
    },
  },
  {
    id: 'TPL-002',
    name: '筋膜枪国内反馈模板',
    enabled: true,
    isDefault: false,
    values: {
      region: '国内',
      source: '客服沟通',
      productType: '筋膜枪',
      brand: 'LOT',
    },
  },
])

const activeId = ref(templates.value[0]?.id || '')
const form = reactive<FeedbackTemplate>({
  id: '',
  name: '',
  enabled: true,
  isDefault: false,
  values: { ...defaultValues },
})

const activeTemplate = computed(() => templates.value.find((item) => item.id === activeId.value) || null)

function loadTemplate(template: FeedbackTemplate | null) {
  if (!template) {
    form.id = ''
    form.name = ''
    form.enabled = true
    form.isDefault = false
    form.values = { ...defaultValues }
    return
  }

  form.id = template.id
  form.name = template.name
  form.enabled = template.enabled
  form.isDefault = template.isDefault
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
      enabled: true,
      isDefault: false,
      values: { ...defaultValues },
    },
  ]
  activeId.value = id
  loadTemplate(activeTemplate.value)
}

function deleteTemplate() {
  if (!activeId.value) return

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
  if (index < 0) return

  templates.value = templates.value.map((item, itemIndex) => {
    if (itemIndex !== index) {
      return {
        ...item,
        isDefault: form.isDefault ? false : item.isDefault,
      }
    }

    return {
      id: form.id,
      name: form.name || '未命名模板',
      enabled: form.enabled,
      isDefault: form.isDefault,
      values: { ...form.values },
    }
  })

  if (!templates.value.some((item) => item.isDefault) && templates.value[0]) {
    templates.value[0].isDefault = true
  }

  if (showMessage) message.success('模板已保存')
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
    width="840px"
    @cancel="closeModal"
    @after-open-change="(visible) => visible && loadTemplate(activeTemplate)"
  >
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="8">
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
                    {{ template.enabled ? '已启用' : '已停用' }}
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

      <a-col :xs="24" :md="16">
        <a-form layout="vertical">
          <a-row :gutter="12">
            <a-col :xs="24" :md="16">
              <a-form-item label="模板名称">
                <a-input v-model:value="form.name" placeholder="请输入模板名称" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="是否启用">
                <a-switch v-model:checked="form.enabled" checked-children="启用" un-checked-children="停用" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="地区">
                <a-select
                  v-model:value="form.values.region"
                  :options="['海外', '国内'].map((item) => ({ label: item, value: item }))"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="来源">
                <a-select
                  v-model:value="form.values.source"
                  :options="sourceOptions.map((item) => ({ label: item, value: item }))"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="设备类型">
                <a-select
                  v-model:value="form.values.productType"
                  :options="productTypeOptions.map((item) => ({ label: item, value: item }))"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="品牌">
                <a-select
                  v-model:value="form.values.brand"
                  :options="brandOptions.map((item) => ({ label: item, value: item }))"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="8">
              <a-form-item label="默认模板">
                <a-checkbox v-model:checked="form.isDefault">设为默认模板</a-checkbox>
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