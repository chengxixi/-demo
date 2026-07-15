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
const mergeSource = shallowRef<CandidateLead | null>(null)
const selectedMergeIds = shallowRef<string[]>([])
const convertedIds = shallowRef<Set<string>>(new Set())

const evidenceForm = reactive({
  text: '',
  files: [] as UploadProps['fileList'],
})

const displayCandidates = computed(() => {
  return [...props.candidates].sort((a, b) => {
    const aDone = isDoneCandidate(a) ? 1 : 0
    const bDone = isDoneCandidate(b) ? 1 : 0
    if (aDone !== bDone) return aDone - bDone
    return a.id.localeCompare(b.id)
  })
})

const statusRows = computed(() => {
  const groups = ['待补充', '待评分', '已转需求']

  return groups.map((status) => ({
    status,
    count: props.candidates.filter((item) => item.status === status).length,
  }))
})

const mergeActive = computed(() => Boolean(mergeSource.value))

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

function startMerge(candidate: CandidateLead) {
  mergeSource.value = candidate
  selectedMergeIds.value = []
}

function cancelMerge() {
  mergeSource.value = null
  selectedMergeIds.value = []
}

function toggleMergeTarget(candidate: CandidateLead) {
  if (!mergeSource.value || candidate.id === mergeSource.value.id || candidate.status === '已合并') return

  selectedMergeIds.value = selectedMergeIds.value.includes(candidate.id)
    ? selectedMergeIds.value.filter((id) => id !== candidate.id)
    : [...selectedMergeIds.value, candidate.id]
}

function confirmMergeCandidate() {
  if (!mergeSource.value || selectedMergeIds.value.length === 0) {
    message.info('请选择需要合并的线索')
    return
  }

  const mergedItems = props.candidates.filter((item) => selectedMergeIds.value.includes(item.id))
  const mergedEvidence = mergedItems.map((item) => `${item.id}: ${item.evidence}`).join('\n')
  emit('updateCandidate', {
    ...mergeSource.value,
    evidence: [mergeSource.value.evidence, mergedEvidence].filter(Boolean).join('\n'),
    nextAction: '已合并线索，进入证据评分',
    status: mergeSource.value.status === '已转需求' ? '已转需求' : '待评分',
  })

  mergedItems.forEach((item) => {
    emit('updateCandidate', {
      ...item,
      status: '已合并',
      nextAction: `已合并至 ${mergeSource.value?.id}`,
    })
  })

  cancelMerge()
  message.success('线索已合并')
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
          <a-tag v-if="mergeSource" color="blue">主线索：{{ mergeSource.id }}</a-tag>
        </a-space>
      </a-col>
      <a-col v-if="mergeSource">
        <a-space>
          <a-button @click="cancelMerge">取消合并</a-button>
          <a-button type="primary" :disabled="selectedMergeIds.length === 0" @click="confirmMergeCandidate">
            合并选中线索
          </a-button>
        </a-space>
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
          <a-radio
            :checked="selectedMergeIds.includes(row.id)"
            :disabled="row.id === mergeSource?.id || row.status === '已合并'"
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
      <vxe-column field="product" title="适用产品" min-width="160" />
      <vxe-column field="status" title="状态" width="110">
        <template #default="{ row }">
          <a-tag :color="row.status === '待评分' ? 'blue' : row.status === '已转需求' ? 'green' : row.status === '已合并' ? 'default' : 'orange'">
            {{ row.status }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="nextAction" title="下一步动作" min-width="260" />
      <vxe-column title="操作" width="330" fixed="right" align="center">
        <template #default="{ row }">
          <a-space size="small" wrap>
            <a-button size="small" @click="startMerge(row)">合并</a-button>
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

:deep(.candidate-row-done) {
  color: #8c8c8c;
  background: #f5f5f5;
}

:deep(.candidate-row-done td) {
  background: #f5f5f5 !important;
}
</style>