<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import type { CandidateLead, RequirementPoolItem } from '@/types'

const props = defineProps<{
  visible: boolean
  source: CandidateLead | null
}>()

const emit = defineEmits<{
  confirm: [newReq: RequirementPoolItem]
  close: []
}>()

const scoreLabels = ['用户价值', '业务影响', '可行性', '竞争影响', '库存影响']
const scoreKeys = ['userValue', 'businessImpact', 'feasibility', 'competitiveImpact', 'inventoryImpact']

const promoteForm = ref({
  reqId: '',
  title: '',
  source: '',
  product: '',
  level: 'L2',
  path: '体验优化',
  status: '评分确认',
  owner: '产品经理',
  due: '',
  scores: { userValue: 3, businessImpact: 3, feasibility: 3, competitiveImpact: 3, inventoryImpact: 3 },
  evidence: '',
  description: '',
  painPoint: '',
  expectedValue: '',
  risk: '',
  nextAction: '',
  relatedFeedback: '',
})

// Initialize form when source changes
function initForm() {
  const c = props.source
  if (!c) return
  promoteForm.value = {
    reqId: `REQ-${c.id.replace('REQ-CAND-', '')}`,
    title: c.title,
    source: c.category,
    product: c.product,
    level: 'L2',
    path: '体验优化',
    status: '评分确认',
    owner: '产品经理',
    due: '',
    scores: { userValue: 3, businessImpact: 3, feasibility: 3, competitiveImpact: 3, inventoryImpact: 3 },
    evidence: c.evidence,
    description: '',
    painPoint: '',
    expectedValue: '',
    risk: '',
    nextAction: c.nextAction,
    relatedFeedback: c.sourceFeedback,
  }
}

// Watch for visible becoming true to init form
import { watch } from 'vue'
watch(() => props.visible, (val) => { if (val) initForm() })

function handleConfirmPromote() {
  const f = promoteForm.value
  const newReq: RequirementPoolItem = {
    id: f.reqId,
    candidate: props.source?.id || '',
    title: f.title,
    source: f.source,
    evidence: f.evidence,
    product: f.product,
    scores: { ...f.scores },
    level: f.level,
    path: f.path,
    status: f.status,
    owner: f.owner,
    due: f.due || '待定',
    description: f.description,
    painPoint: f.painPoint,
    expectedValue: f.expectedValue,
    risk: f.risk,
    nextAction: f.nextAction,
    relatedFeedback: f.relatedFeedback,
  }
  emit('confirm', newReq)
}

function handleClose() {
  emit('close')
}

function handleScoreChange(si: number, value: number) {
  (promoteForm.value.scores as any)[scoreKeys[si]] = value
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-6">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400">候选线索转产品需求</span>
          <h3 class="text-base font-extrabold text-gray-900">转产品需求</h3>
          <p class="text-[11px] text-gray-400">{{ source?.id }} / {{ source?.title }}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleClose"><X class="w-5 h-5" /></button>
      </div>
      <div class="p-5 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 gap-3 mb-4">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求ID</span><input v-model="promoteForm.reqId" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">当前状态</span>
            <select v-model="promoteForm.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option>评分确认</option><option>待审批</option><option>已入池</option><option>观察池</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 col-span-2"><span class="text-[11px] font-bold text-gray-600">需求标题</span><input v-model="promoteForm.title" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">来源/证据类型</span><input v-model="promoteForm.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">适用产品</span><input v-model="promoteForm.product" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求等级</span>
            <select v-model="promoteForm.level" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option>L1 紧急修复</option><option>L2 体验优化</option><option>L3 功能升级</option><option>L4 换代开发</option>
            </select>
          </label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">处理路径</span>
            <select v-model="promoteForm.path" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
              <option>紧急修复</option><option>体验优化</option><option>功能升级</option><option>换代开发观察</option>
            </select>
          </label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">责任人</span><input v-model="promoteForm.owner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">完成时限</span><input type="date" v-model="promoteForm.due" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>

        <!-- Five-dimension Scoring -->
        <fieldset class="border border-gray-200 rounded-lg p-3 mb-4">
          <legend class="text-[11px] font-extrabold text-gray-600 px-1">五维评分</legend>
          <div class="grid grid-cols-5 gap-3">
            <label v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-1">
              <span class="text-[10px] font-bold text-gray-500">{{ label }}</span>
              <select
                class="h-8 w-full text-xs border border-gray-300 rounded-md px-2 font-bold text-center"
                :value="(promoteForm.scores as any)[scoreKeys[si]]"
                @change="(e: Event) => { const t = e.target as HTMLSelectElement; handleScoreChange(si, Number(t.value)) }"
              >
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div class="space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">证据摘要</span><textarea v-model="promoteForm.evidence" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求描述</span><textarea v-model="promoteForm.description" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户痛点</span><textarea v-model="promoteForm.painPoint" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">预期价值</span><textarea v-model="promoteForm.expectedValue" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">风险与待确认</span><textarea v-model="promoteForm.risk" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">下一步动作</span><textarea v-model="promoteForm.nextAction" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-primary text-xs h-8 px-4" @click="handleConfirmPromote">确认转入产品需求池</button>
        <button class="btn-secondary text-xs h-8 px-4" @click="handleClose">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
