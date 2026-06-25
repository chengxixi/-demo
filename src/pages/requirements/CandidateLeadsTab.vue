<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import type { CandidateLead } from '@/types'

const props = defineProps<{
  candidates: CandidateLead[]
}>()

const emit = defineEmits<{
  openPromote: [candidate: CandidateLead]
  convertToWorkOrder: [candidate: CandidateLead]
  createCandidate: [candidate: CandidateLead]
}>()

// ==================== New Candidate Modal ====================
const showNewCandidateModal = ref(false)
const newCandidate = ref({
  id: '',
  sourceFeedback: '',
  category: '',
  title: '',
  evidence: '',
  product: '',
  status: '待补充',
  nextAction: '',
})

function handleOpenNewCandidate() {
  const n = props.candidates.length + 1
  newCandidate.value = {
    id: `REQ-CAND-${String(n).padStart(3, '0')}`,
    sourceFeedback: '',
    category: '',
    title: '',
    evidence: '',
    product: '',
    status: '待补充',
    nextAction: '',
  }
  showNewCandidateModal.value = true
}

function handleCreateCandidate() {
  emit('createCandidate', { ...newCandidate.value })
  showNewCandidateModal.value = false
}

function handleOpenPromote(c: CandidateLead) {
  emit('openPromote', c)
}

function handleConvertToWorkOrder(c: CandidateLead) {
  emit('convertToWorkOrder', c)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <span class="text-sm font-extrabold text-gray-800">候选需求线索（反馈承接区）</span>
      </div>
      <button class="btn-primary text-xs h-8 px-3 flex items-center gap-1" @click="handleOpenNewCandidate"><Plus class="w-3.5 h-3.5" />新增线索</button>
    </div>

    <div class="overflow-x-auto">
      <table class="data-table w-full text-xs border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">线索ID</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">来源反馈</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">分类</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">线索标题</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">证据摘要</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">适用产品</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">状态</th>
            <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">下一步动作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in candidates" :key="c.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-3 py-2.5"><button class="link-button text-xs font-extrabold text-blue-600 hover:underline">{{ c.id }}</button></td>
            <td class="px-3 py-2.5 text-xs">{{ c.sourceFeedback }}</td>
            <td class="px-3 py-2.5 text-xs">{{ c.category }}</td>
            <td class="px-3 py-2.5 text-xs font-extrabold max-w-[260px] truncate">{{ c.title }}</td>
            <td class="px-3 py-2.5"><em class="text-xs text-gray-500">{{ c.evidence }}</em></td>
            <td class="px-3 py-2.5 text-xs">{{ c.product }}</td>
            <td class="px-3 py-2.5"><span class="status-tag text-[10px] px-2 py-0.5 rounded font-extrabold" :class="c.status === '待评分' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">{{ c.status }}</span></td>
            <td class="px-3 py-2.5">
              <div class="flex items-center gap-1 flex-wrap">
                <button class="mini-action text-[10px] px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold">合并</button>
                <button class="mini-action text-[10px] px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold">补证据</button>
                <button class="mini-action primary text-[10px] px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 font-bold" @click="handleOpenPromote(c)">转产品需求</button>
                <button class="mini-action warning text-[10px] px-2 py-0.5 rounded border border-orange-400 text-orange-600 hover:bg-orange-50 font-bold" @click="handleConvertToWorkOrder(c)">转为工单</button>
              </div>
            </td>
          </tr>
          <tr v-if="candidates.length === 0">
            <td colspan="8" class="text-center py-10 text-gray-400 text-sm font-bold">暂无候选线索</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ==================== New Candidate Modal ==================== -->
    <div v-if="showNewCandidateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <h3 class="text-base font-extrabold text-gray-900">新增候选线索</h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showNewCandidateModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">线索ID</span><input v-model="newCandidate.id" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">来源反馈</span><input v-model="newCandidate.sourceFeedback" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">分类</span><input v-model="newCandidate.category" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">线索标题</span><input v-model="newCandidate.title" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">证据摘要</span><textarea v-model="newCandidate.evidence" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">适用产品</span><input v-model="newCandidate.product" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">状态</span>
            <select v-model="newCandidate.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>待补充</option><option>待评分</option></select>
          </label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">下一步动作</span><input v-model="newCandidate.nextAction" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-primary text-xs h-8 px-4" @click="handleCreateCandidate">创建线索</button>
          <button class="btn-secondary text-xs h-8 px-4" @click="showNewCandidateModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table { background: white; border-radius: 8px; overflow: hidden; }
.data-table th { background: #f8f9fa; }
.link-button { background: none; border: none; cursor: pointer; padding: 0; font: inherit; }
.link-button:hover { text-decoration: underline; }
.mini-action { white-space: nowrap; cursor: pointer; transition: all 0.15s; }
.mini-action.primary:hover { background: #1d4ed8 !important; }
.mini-action.warning:hover { background: #fff7ed !important; }
.status-tag { white-space: nowrap; }
</style>
