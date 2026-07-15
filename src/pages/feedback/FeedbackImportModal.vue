<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'submit'): void
}>()

function closeModal() {
  emit('update:open', false)
}

function submitImport() {
  emit('submit')
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="批量导入"
    width="680px"
    @cancel="closeModal"
  >
    <a-alert
      class="mb-4"
      type="info"
      show-icon
      message="上传 Excel 表格后批量创建反馈单，需人工确认的记录会进入复核队列。"
    />

    <a-form layout="vertical">
      <a-form-item label="上传Excel表格">
        <a-upload-dragger
          name="file"
          :multiple="false"
          :before-upload="() => false"
          accept=".xlsx,.xls"
        >
          <p class="ant-upload-text">选择或拖拽 .xlsx / .xls 文件</p>
          <p class="ant-upload-hint">系统会读取表格字段，并按模板字段导入。</p>
        </a-upload-dragger>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="submitImport">开始导入</a-button>
      </a-space>
    </template>
  </a-modal>
</template>