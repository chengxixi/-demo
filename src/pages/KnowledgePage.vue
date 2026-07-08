<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import { knowledgeData } from '@/api/mock'

const keyword = ref('')
const category = ref('')
const editorOpen = shallowRef(false)

const draft = reactive({
  question: '',
  answer: '',
  category: '标准回复',
  tags: '',
  sourceType: '手工新建',
  sourceId: '',
  status: '待审核',
})

const sourceActions = [
  { type: '反馈单', label: '从反馈转入', example: 'FB-20260618-0012' },
  { type: '紧急异常', label: '从异常转入', example: 'P0-20260611-007' },
  { type: '工单', label: '从工单转入', example: 'WO-20260618-003' },
]

const categories = computed(() => {
  return [...new Set(knowledgeData.map((item) => item.category))]
})

const filteredItems = computed(() => {
  return knowledgeData.filter((item) => {
    const text = `${item.question} ${item.answer} ${item.tags.join(' ')}`.toLowerCase()
    const matchesKeyword = !keyword.value || text.includes(keyword.value.toLowerCase())
    const matchesCategory = !category.value || item.category === category.value

    return matchesKeyword && matchesCategory
  })
})

function openEditorFrom(sourceType = '手工新建', sourceId = '') {
  draft.sourceType = sourceType
  draft.sourceId = sourceId
  draft.status = '待审核'
  editorOpen.value = true
}

function saveKnowledge() {
  message.success('知识条目已保存，可进入审核发布')
  editorOpen.value = false
}

function publishKnowledge() {
  message.success('已提交审核，通过后发布到 Q&A/案例库')
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row :gutter="[12, 12]" justify="space-between" align="middle">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">Q&A/案例库</a-typography-title>
          <a-typography-text type="secondary">
            统一沉淀标准回复、异常案例、使用指引和培训材料，支持来源追溯、版本及审核发布。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-button type="primary" @click="openEditorFrom()">新建知识条目</a-button>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col v-for="item in sourceActions" :key="item.type" :xs="24" :md="8">
        <a-card size="small" :title="item.label">
          <a-typography-text type="secondary">保留来源编号、处理结论和版本记录。</a-typography-text>
          <template #actions>
            <a-button type="link" @click="openEditorFrom(item.type, item.example)">转入</a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col :xs="24" :md="12">
        <a-input-search v-model:value="keyword" placeholder="搜索问题、答案或标签" allow-clear />
      </a-col>
      <a-col :xs="24" :md="6">
        <a-select
          v-model:value="category"
          class="w-full"
          allow-clear
          placeholder="类型"
          :options="categories.map((item) => ({ label: item, value: item }))"
        />
      </a-col>
    </a-row>

    <vxe-table :data="filteredItems" border stripe height="520" :export-config="{}">
      <vxe-column field="id" title="编号" width="150" />
      <vxe-column field="question" title="标题" min-width="220" />
      <vxe-column field="category" title="类型" width="120" />
      <vxe-column field="answer" title="内容" min-width="280" />
      <vxe-column field="date" title="更新时间" width="120" />
      <vxe-column title="标签" min-width="180">
        <template #default="{ row }">
          <a-space wrap>
            <a-tag v-for="tag in row.tags" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
      </vxe-column>
      <vxe-column title="状态" width="110">
        <template #default>
          <a-tag color="orange">待审核</a-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="160" fixed="right">
        <template #default="{ row }">
          <a-space>
            <a-button size="small" @click="openEditorFrom('手工新建', row.id)">编辑</a-button>
            <a-button size="small" type="primary" @click="publishKnowledge">发布</a-button>
          </a-space>
        </template>
      </vxe-column>
    </vxe-table>

    <a-modal v-model:open="editorOpen" title="新建知识条目" width="760px" @ok="saveKnowledge">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select
                v-model:value="draft.category"
                :options="['标准回复', '异常案例', '使用指引', '培训材料'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="来源类型">
              <a-select
                v-model:value="draft.sourceType"
                :options="['手工新建', '反馈单', '紧急异常', '工单'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24"><a-form-item label="标题"><a-input v-model:value="draft.question" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="来源编号"><a-input v-model:value="draft.sourceId" placeholder="反馈、异常或工单编号" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="审核状态"><a-select v-model:value="draft.status" :options="['待审核', '已发布', '需修订'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="知识内容"><a-textarea v-model:value="draft.answer" :rows="4" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="标签"><a-input v-model:value="draft.tags" placeholder="多个标签用逗号分隔" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>
  </section>
</template>
