<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import type { CandidateLead } from '@/types'

const props = defineProps<{
  candidates: CandidateLead[]
}>()

const emit = defineEmits<{
  (event: 'openPromote', candidate: CandidateLead): void
  (event: 'convertToWorkOrder', candidate: CandidateLead): void
  (event: 'updateCandidate', candidate: CandidateLead): void
}>()

const showEvidenceModal = shallowRef(false)
const showDetailModal = shallowRef(false)
const currentCandidate = shallowRef<CandidateLead | null>(null)
const mergeActive = shallowRef(false)
const selectedMergeIds = shallowRef<string[]>([])
const convertedIds = shallowRef<Set<string>>(new Set())

const evidenceForm = reactive({
  text: '',
  files: [] as UploadProps['fileList'],
})

const candidateFilters = reactive({
  id: '',
  source: '',
  productLine: undefined as string | undefined,
  status: undefined as string | undefined,
  assignee: undefined as string | undefined,
})

const candidateAssigneeMap: Record<string, string> = {
  'REQ-CAND-001': '李工',
  'REQ-CAND-002': '王工',
  'REQ-CAND-003': '孙工',
}

const productLineOptions = computed(() => {
  return Array.from(new Set(props.candidates.map(productLineOf).filter(Boolean))).map((value) => ({ label: value, value }))
})

const statusOptions = computed(() => {
  return Array.from(new Set(props.candidates.map((item) => item.status))).map((value) => ({ label: value, value }))
})

const assigneeOptions = computed(() => {
  return Array.from(new Set(props.candidates.map(candidateAssignee).filter(Boolean))).map((value) => ({ label: value, value }))
})

const filteredCandidates = computed(() => {
  return props.candidates.filter((item) => {
    const idMatched = !candidateFilters.id || item.id.includes(candidateFilters.id.trim())
    const sourceMatched = !candidateFilters.source || item.sourceFeedback.includes(candidateFilters.source.trim())
    const productLineMatched = !candidateFilters.productLine || productLineOf(item) === candidateFilters.productLine
    const statusMatched = !candidateFilters.status || item.status === candidateFilters.status
    const assigneeMatched = !candidateFilters.assignee || candidateAssignee(item) === candidateFilters.assignee

    return idMatched && sourceMatched && productLineMatched && statusMatched && assigneeMatched
  })
})

const displayCandidates = computed(() => {
  return [...filteredCandidates.value].sort((a, b) => {
    const aDone = isDoneCandidate(a) ? 1 : 0
    const bDone = isDoneCandidate(b) ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return a.id.localeCompare(b.id)
  })
})

const statusRows = computed(() => {
  const groups = ['待补充', '待评分', '已转需求', '已合并']

  return groups.map((status) => ({
    status,
    count: props.candidates.filter((item) => item.status === status).length,
  }))
})

function productLineOf(candidate: CandidateLead) {
  return candidate.product.split(/\s+/)[0] || ''
}

function candidateAssignee(candidate: CandidateLead) {
  return candidateAssigneeMap[candidate.id] || ''
}

function isConverted(candidate: CandidateLead) {
  return convertedIds.value.has(candidate.id) || candidate.status === '已转需求'
}

function isDoneCandidate(candidate: CandidateLead) {
  return isConverted(candidate) || candidate.status === '已合并'
}

function candidateRowClassName({ row }: { row: CandidateLead }) {
  return isDoneCandidate(row) ? 'candidate-row-done' : ''
}

function openDetail(candidate: CandidateLead) {
  currentCandidate.value = candidate
  showDetailModal.value = true
}

function startMerge() {
  mergeActive.value = true
  selectedMergeIds.value = []
}

function cancelMerge() {
  mergeActive.value = false
  selectedMergeIds.value = []
}

function toggleMergeTarget(candidate: CandidateLead) {
  if (!mergeActive.value || candidate.status === '已合并') return

  selectedMergeIds.value = selectedMergeIds.value.includes(candidate.id)
    ? selectedMergeIds.value.filter((id) => id !== candidate.id)
    : [...selectedMergeIds.value, candidate.id]
}

function confirmMergeCandidate() {
  if (selectedMergeIds.value.length < 2) {
    message.info('请选择至少 2 条需要合并的线索')
    return
  }

  const selectedItems = displayCandidates.value.filter((item) => selectedMergeIds.value.includes(item.id))
  const [mainCandidate, ...mergedItems] = selectedItems
  const mergedEvidence = mergedItems.map((item) => `${item.id}: ${item.evidence}`).join('\n')
  emit('updateCandidate', {
    ...mainCandidate,
    evidence: [mainCandidate.evidence, mergedEvidence].filter(Boolean).join('\n'),
    nextAction: '已合并线索，进入证据评分',
    status: mainCandidate.status === '已转需求' ? '已转需求' : '待评分',
  })

  mergedItems.forEach((item) => {
    emit('updateCandidate', {
      ...item,
      status: '已合并',
      nextAction: `已合并至 ${mainCandidate.id}`,
    })
  })

  cancelMerge()
  message.success(`已合并 ${selectedItems.length} 条线索`)
}

function openSupplementEvidence(candidate: CandidateLead) {
  currentCandidate.value = candidate
  evidenceForm.text = ''
  evidenceForm.files = []
  showEvidenceModal.value = true
}

function confirmSupplementEvidence() {
  if (!currentCandidate.value) return

  const fileNames = (evidenceForm.files || []).map((file) => file.name).filter(Boolean)
  const additions = [evidenceForm.text, fileNames.length ? `附件：${fileNames.join('、')}` : ''].filter(Boolean)
  emit('updateCandidate', {
    ...currentCandidate.value,
    evidence: [currentCandidate.value.evidence, ...additions].filter(Boolean).join('\n'),
    status: currentCandidate.value.status === '已转需求' ? '已转需求' : '待评分',
    nextAction: '证据已补充，待五维评分',
  })

  showEvidenceModal.value = false
  message.success('证据已补充')
}

function beforeUpload() {
  return false
}

function promoteCandidate(candidate: CandidateLead) {
  convertedIds.value = new Set([...convertedIds.value, candidate.id])
  emit('updateCandidate', {
    ...candidate,
    status: '已转需求',
    nextAction: '已进入产品需求池，仍可继续合并证据',
  })
  emit('openPromote', candidate)
}
</script>

<template>
  <div class="space-y-4">
    <a-row :gutter="[12, 12]">
      <a-col v-for="row in statusRows" :key="row.status" :xs="24" :md="8">
        <a-card size="small"><a-statistic :title="row.status" :value="row.count" /></a-card>
      </a-col>
    </a-row>

    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space size="middle">
          <a-typography-title :level="5" class="m-0">候选需求线索</a-typography-title>
          <a-tag v-if="mergeActive" color="blue">已选择 {{ selectedMergeIds.length }} 条</a-tag>
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button v-if="mergeActive" @click="cancelMerge">取消合并</a-button>
          <a-button v-if="mergeActive" type="primary" :disabled="selectedMergeIds.length < 2" @click="confirmMergeCandidate">
            合并选中线索
          </a-button>
          <a-button v-else type="primary" :disabled="displayCandidates.length < 2" @click="startMerge">
            合并
          </a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]" class="candidate-filter-row">
      <a-col :xs="24" :md="8" :xl="5">
        <label class="candidate-filter-field">
          <span>线索ID</span>
          <a-input v-model:value="candidateFilters.id" allow-clear placeholder="线索ID" />
        </label>
      </a-col>
      <a-col :xs="24" :md="8" :xl="5">
        <label class="candidate-filter-field">
          <span>来源</span>
          <a-input v-model:value="candidateFilters.source" allow-clear placeholder="来源反馈" />
        </label>
      </a-col>
      <a-col :xs="24" :md="8" :xl="4">
        <label class="candidate-filter-field">
          <span>产品线</span>
          <a-select v-model:value="candidateFilters.productLine" allow-clear placeholder="产品线" :options="productLineOptions" />
        </label>
      </a-col>
      <a-col :xs="24" :md="8" :xl="4">
        <label class="candidate-filter-field">
          <span>状态</span>
          <a-select v-model:value="candidateFilters.status" allow-clear placeholder="状态" :options="statusOptions" />
        </label>
      </a-col>
      <a-col :xs="24" :md="8" :xl="4">
        <label class="candidate-filter-field">
          <span>当前处理人</span>
          <a-select v-model:value="candidateFilters.assignee" allow-clear placeholder="当前处理人" :options="assigneeOptions" />
        </label>
      </a-col>
    </a-row>

    <vxe-table
      :data="displayCandidates"
      border
      stripe
      show-overflow
      height="520"
      :row-class-name="candidateRowClassName"
      :export-config="{}"
    >
      <vxe-column v-if="mergeActive" title="" width="54" align="center">
        <template #default="{ row }">
          <a-checkbox
            :checked="selectedMergeIds.includes(row.id)"
            :disabled="row.status === '已合并'"
            @click.stop="toggleMergeTarget(row)"
          />
        </template>
      </vxe-column>
      <vxe-column field="id" title="线索ID" width="150">
        <template #default="{ row }">
          <a-button type="link" class="id-link" @click="openDetail(row)">{{ row.id }}</a-button>
        </template>
      </vxe-column>
      <vxe-column field="sourceFeedback" title="来源反馈" min-width="210" />
      <vxe-column field="category" title="分类" min-width="170" />
      <vxe-column field="title" title="线索标题" min-width="240" />
      <vxe-column field="evidence" title="证据摘要" min-width="300" />
      <vxe-column field="status" title="状态" width="110">
        <template #default="{ row }">
          <a-tag :color="row.status === '待评分' ? 'blue' : row.status === '已转需求' ? 'green' : row.status === '已合并' ? 'default' : 'orange'">
            {{ row.status }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <a-space size="small" wrap>
            <a-button size="small" @click="openSupplementEvidence(row)">补证据</a-button>
            <a-button size="small" type="primary" :disabled="isConverted(row)" @click="promoteCandidate(row)">
              {{ isConverted(row) ? '已转需求' : '转产品需求' }}
            </a-button>
            <a-button size="small" @click="emit('convertToWorkOrder', row)">转为工单</a-button>
          </a-space>
        </template>
      </vxe-column>
    </vxe-table>

    <a-modal v-model:open="showDetailModal" title="线索详情" width="760px" :footer="null">
      <a-descriptions v-if="currentCandidate" bordered :column="2" size="small">
        <a-descriptions-item label="线索ID">{{ currentCandidate.id }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ currentCandidate.status }}</a-descriptions-item>
        <a-descriptions-item label="来源反馈">{{ currentCandidate.sourceFeedback }}</a-descriptions-item>
        <a-descriptions-item label="分类">{{ currentCandidate.category }}</a-descriptions-item>
        <a-descriptions-item label="线索标题" :span="2">{{ currentCandidate.title }}</a-descriptions-item>
        <a-descriptions-item label="适用产品" :span="2">{{ currentCandidate.product }}</a-descriptions-item>
        <a-descriptions-item label="下一步动作" :span="2">{{ currentCandidate.nextAction }}</a-descriptions-item>
        <a-descriptions-item label="证据说明" :span="2">
          <a-typography-paragraph class="m-0 evidence-text">{{ currentCandidate.evidence }}</a-typography-paragraph>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:open="showEvidenceModal" title="补充证据" width="720px" @ok="confirmSupplementEvidence">
      <a-form layout="vertical">
        <a-form-item label="线索">
          <a-input :value="currentCandidate ? `${currentCandidate.id} ${currentCandidate.title}` : ''" disabled />
        </a-form-item>
        <a-form-item label="证据说明">
          <a-textarea v-model:value="evidenceForm.text" :rows="4" placeholder="输入补充证据、用户样本、退货率、差评截图说明等" />
        </a-form-item>
        <a-form-item label="上传文件">
          <a-upload-dragger v-model:file-list="evidenceForm.files" multiple :before-upload="beforeUpload">
            <p class="ant-upload-text">点击或拖拽上传证据文件</p>
            <p class="ant-upload-hint">支持截图、视频、表格、客服记录等材料</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.id-link {
  height: auto;
  padding: 0;
}

.evidence-text {
  white-space: pre-wrap;
}

.candidate-filter-row {
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.candidate-filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: #344054;
}

:deep(.candidate-filter-field .ant-select) {
  width: 100%;
}

:deep(.candidate-row-done) {
  color: #8c8c8c;
  background: #f5f5f5;
}

:deep(.candidate-row-done td) {
  background: #f5f5f5 !important;
}
</style>
