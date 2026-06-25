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
  <div v-if="visible && groupId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400">合并反馈</span>
          <h3 class="text-base font-extrabold text-gray-900">合并组 {{ groupId }}</h3>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleClose">&times;</button>
      </div>
      <div class="p-5">
        <p class="text-xs text-gray-500">合并反馈功能：将多条同类反馈合并为一个组，便于统一处理。</p>
      </div>
      <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-secondary text-xs" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>
