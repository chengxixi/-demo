<script setup lang="ts">
defineProps<{
  groupId: string | null
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <a-modal
    :open="visible && Boolean(groupId)"
    title="合并反馈"
    :footer="null"
    @cancel="handleClose"
  >
    <a-space direction="vertical" size="middle" class="w-full">
      <a-typography-title :level="5" class="m-0">合并组 {{ groupId }}</a-typography-title>
      <a-typography-paragraph>
        将多条同类反馈合并为一个处理组，便于统一复核、转工单、转需求或沉淀 Q&A。
      </a-typography-paragraph>
      <a-button type="primary" @click="handleClose">关闭</a-button>
    </a-space>
  </a-modal>
</template>
