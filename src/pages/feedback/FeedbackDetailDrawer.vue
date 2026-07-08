<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { FeedbackItem } from '@/types'
import { processRouteOptions, processStateOptions } from '@/api/mock'

const props = defineProps<{
  open: boolean
  item: FeedbackItem | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'save', value: FeedbackItem): void
}>()

const form = reactive({
  processRoute: '',
  processState: '',
  handler: '',
  raw: '',
  ai: '',
})

const title = computed(() => props.item?.id || '反馈详情')

watch(
  () => props.item,
  (item) => {
    form.processRoute = item?.processRoute || ''
    form.processState = item?.processState || ''
    form.handler = item?.handler || ''
    form.raw = item?.raw || ''
    form.ai = item?.ai || ''
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
    processRoute: form.processRoute,
    processState: form.processState,
    handler: form.handler,
    raw: form.raw,
    ai: form.ai,
  })
  closeDrawer()
}
</script>

<template>
  <a-drawer
    :open="props.open"
    :title="title"
    width="560"
    @close="closeDrawer"
  >
    <template v-if="props.item">
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="品牌">{{ props.item.brand }}</a-descriptions-item>
        <a-descriptions-item label="型号">{{ props.item.model }}</a-descriptions-item>
        <a-descriptions-item label="异常级别">{{ props.item.exception }}</a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical" class="mt-4">
        <a-form-item label="处理去向">
          <a-select
            v-model:value="form.processRoute"
            :options="processRouteOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="form.processState"
            :options="processStateOptions.map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
        <a-form-item label="处理人">
          <a-input v-model:value="form.handler" />
        </a-form-item>
        <a-form-item label="用户反馈">
          <a-textarea v-model:value="form.raw" :rows="4" />
        </a-form-item>
        <a-form-item label="AI翻译">
          <a-textarea v-model:value="form.ai" :rows="4" />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-space>
        <a-button @click="closeDrawer">取消</a-button>
        <a-button type="primary" @click="saveItem">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
