<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { RequirementPoolItem } from '@/types'

const props = defineProps<{
  item: RequirementPoolItem | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const processSteps = ['候选导入', '信息补齐', '五维评分', 'L级分级', '审批/评审', '下游立项', '复盘回写']
const scoreLabels = ['用户价值', '业务影响', '可行性', '竞争影响', '库存影响']
const scoreKeys = ['userValue', 'businessImpact', 'feasibility', 'competitiveImpact', 'inventoryImpact']
const scoreColors = ['#1f73e8', '#22a06b', '#ffb020', '#8b5cf6', '#06b6d4']

function getStepClass(req: RequirementPoolItem, stepIdx: number): string {
  const stepMap: Record<string, number> = {
    '待补充': 0, '待评分': 1, '评分确认': 2, '待审批': 3, '已入池': 4, '观察池': 2,
  }
  const cur = stepMap[req.status] ?? 0
  if (stepIdx < cur) return 'done'
  if (stepIdx === cur) return 'active'
  return ''
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div v-if="visible && item" class="fixed inset-y-0 right-0 z-50 w-[480px] max-w-[90vw] bg-white shadow-2xl flex flex-col">
    <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
      <button class="flex items-center gap-1.5 text-xs font-extrabold text-gray-600 hover:text-gray-800" @click="handleClose"><ArrowLeft class="w-4 h-4" />返回</button>
      <span class="text-[10px] text-gray-400">需求详情</span>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <!-- Process Steps -->
      <div class="process-bar flex items-center gap-0 mb-5">
        <template v-for="(step, si) in processSteps" :key="step">
          <div class="flex flex-col items-center gap-1">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold"
              :class="getStepClass(item, si) === 'done' ? 'bg-emerald-500 text-white' : getStepClass(item, si) === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'"
            >{{ si + 1 }}</div>
            <span class="text-[9px] font-bold text-gray-400 whitespace-nowrap">{{ step }}</span>
          </div>
          <div v-if="si < processSteps.length - 1" class="flex-1 h-0.5 mx-0.5" :class="getStepClass(item, si) === 'done' ? 'bg-emerald-300' : 'bg-gray-200'"></div>
        </template>
      </div>

      <div class="space-y-4">
        <div>
          <h2 class="text-sm font-extrabold text-gray-900 mb-2">{{ item.title }}</h2>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div><span class="text-gray-400">候选来源：</span><span class="font-bold">{{ item.candidate }}</span></div>
            <div><span class="text-gray-400">需求等级：</span><span class="font-bold">{{ item.level }}</span></div>
            <div><span class="text-gray-400">处理路径：</span><span class="font-bold">{{ item.path }}</span></div>
            <div><span class="text-gray-400">当前状态：</span><span class="font-bold">{{ item.status }}</span></div>
            <div><span class="text-gray-400">责任人：</span><span class="font-bold">{{ item.owner }}</span></div>
            <div><span class="text-gray-400">完成时限：</span><span class="font-bold">{{ item.due }}</span></div>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-3">
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">需求描述</h4>
          <p class="text-xs text-gray-700">{{ item.description }}</p>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">用户痛点</h4>
          <p class="text-xs text-gray-700">{{ item.painPoint }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div><span class="text-[10px] text-gray-400">来源与证据</span><p class="text-xs font-bold mt-0.5">{{ item.source }} / {{ item.evidence }}</p></div>
          <div><span class="text-[10px] text-gray-400">适用产品</span><p class="text-xs font-bold mt-0.5">{{ item.product }}</p></div>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">五维评分</h4>
          <div class="score-bars flex items-end gap-2 h-14">
            <div v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-0.5" :title="`${label}：${(item.scores as any)[scoreKeys[si]]}分`">
              <b class="text-[10px] font-extrabold">{{ (item.scores as any)[scoreKeys[si]] }}</b>
              <i class="w-4 rounded-t" :style="{ height: (item.scores as any)[scoreKeys[si]] * 18 + '%', backgroundColor: scoreColors[si] }"></i>
              <span class="text-[9px] text-gray-400 font-bold">{{ label }}</span>
            </div>
          </div>
          <p class="text-[10px] text-gray-400 mt-2">L级分级说明：{{ item.level === 'L1' ? '紧急修复：安全、合规、批量质量或高退货风险，需要快速审批和资源优先配置。' : item.level === 'L2' ? '体验优化：高频痛点或满意度问题，纳入近期迭代评审。' : item.level === 'L3' ? '功能升级：用户价值和竞争影响明确，进入版本规划和资源评估。' : '换代开发：中长期机会或平台级能力，进入产品规划观察池。' }}</p>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">预期价值</h4>
          <p class="text-xs text-gray-700">{{ item.expectedValue }}</p>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">风险与待确认</h4>
          <p class="text-xs text-gray-700">{{ item.risk }}</p>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">下一步动作</h4>
          <p class="text-xs text-gray-700">{{ item.nextAction }}</p>
        </div>

        <div>
          <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">关联记录</h4>
          <p class="text-xs text-gray-700">{{ item.relatedFeedback || '无' }}</p>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
      <button class="btn-primary text-xs h-8 px-3">进入审批</button>
      <button class="btn-secondary text-xs h-8 px-3">退回补充</button>
      <button class="btn-secondary text-xs h-8 px-3">加入观察池</button>
    </div>
  </div>
</template>

<style scoped>
.process-bar { min-width: 0; }
</style>
