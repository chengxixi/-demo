<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FeedbackItem } from '@/types'
import { exceptionLevels } from '@/api/mock'

const props = defineProps<{
  open: boolean
  item: FeedbackItem | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'save', value: FeedbackItem): void
}>()

const form = reactive({
  level1: '',
  level2: '',
  level3: '',
  exception: '',
  ai: '',
})

watch(
  () => props.item,
  (item) => {
    form.level1 = item?.level1 || ''
    form.level2 = item?.level2 || ''
    form.level3 = item?.level3 || ''
    form.exception = item?.exception || ''
    form.ai = item?.ai || ''
  },
  { immediate: true },
)

function closeModal() {
  emit('update:open', false)
}

function submitReview() {
  if (!props.item) {
    closeModal()
    return
  }

  emit('save', {
    ...props.item,
    level1: form.level1,
    level2: form.level2,
    level3: form.level3,
    exception: form.exception,
    ai: form.ai,
    processState: '已处理',
  })
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="人工复核"
    width="680px"
    @cancel="closeModal"
  >
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="8">
          <a-form-item label="一级分类">
            <a-input v-model:value="form.level1" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="二级问题">
            <a-input v-model:value="form.level2" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="三级问题">
            <a-input v-model:value="form.level3" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="异常级别">
            <a-select
              v-model:value="form.exception"
              :options="exceptionLevels.map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="AI翻译/复核内容">
            <a-textarea v-model:value="form.ai" :rows="4" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="submitReview">提交复核</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
