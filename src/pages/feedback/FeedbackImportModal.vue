<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'submit', value: { mode: string; dedupe: string; note: string }): void
}>()

const form = reactive({
  mode: '按模板字段导入',
  dedupe: '按内容+型号',
  note: '',
})

function closeModal() {
  emit('update:open', false)
}

function submitImport() {
  emit('submit', { ...form })
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
          <p class="ant-upload-hint">系统会读取表格字段，并按导入模式做字段匹配。</p>
        </a-upload-dragger>
      </a-form-item>
      <a-row :gutter="12">
        <a-col :xs="24" :md="12">
          <a-form-item label="导入模式">
            <a-select
              v-model:value="form.mode"
              :options="['按模板字段导入', '自动匹配表头'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="去重方式">
            <a-select
              v-model:value="form.dedupe"
              :options="['按内容+型号', '按反馈ID'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="说明">
        <a-textarea
          v-model:value="form.note"
          :rows="4"
          placeholder="可补充本次导入的数据来源、负责人或特殊字段说明。"
        />
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
