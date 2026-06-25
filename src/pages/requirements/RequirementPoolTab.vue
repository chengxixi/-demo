<script setup lang="ts">
import type { RequirementPoolItem } from '@/types'

const props = defineProps<{
  pool: RequirementPoolItem[]
  levelFilter: string
  levelCounts: { L1: number; L2: number; L3: number; L4: number }
}>()

const emit = defineEmits<{
  'update:level-filter': [value: string]
  openDetail: [item: RequirementPoolItem]
}>()

const levelInfo: Record<string, { title: string; desc: string; pill: string }> = {
  L1: { title: 'L1 紧急修复', desc: '安全/合规/高退货风险，先处置再复盘', pill: 'p1' },
  L2: { title: 'L2 体验优化', desc: '高频体验问题，进入近期迭代评审', pill: 'p2' },
  L3: { title: 'L3 功能升级', desc: '竞品或用户价值明确，进入版本规划', pill: 'p3' },
  L4: { title: 'L4 换代开发', desc: '中长期机会，进入产品规划观察', pill: 'info' },
}
const scoreLabels = ['用户价值', '业务影响', '可行性', '竞争影响', '库存影响']
const scoreKeys = ['userValue', 'businessImpact', 'feasibility', 'competitiveImpact', 'inventoryImpact']
const scoreColors = ['#1f73e8', '#22a06b', '#ffb020', '#8b5cf6', '#06b6d4']

function handleFilterClick(lvl: string) {
  emit('update:level-filter', props.levelFilter === lvl ? '' : lvl)
}

function handleOpenDetail(r: RequirementPoolItem) {
  emit('openDetail', r)
}
</script>

<template>
  <div>
    <!-- L1-L4 Filter Cards -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <button
        v-for="lvl in ['L1', 'L2', 'L3', 'L4']"
        :key="lvl"
        class="text-left p-3 rounded-lg border transition-all hover:shadow-md"
        :class="levelFilter === lvl ? 'border-blue-400 bg-blue-50 shadow' : 'border-gray-200 bg-white'"
        @click="handleFilterClick(lvl)"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="pill text-[10px] px-2 py-0.5 rounded font-extrabold" :class="lvl === 'L1' ? 'bg-red-100 text-red-700' : lvl === 'L2' ? 'bg-orange-100 text-orange-700' : lvl === 'L3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'">{{ lvl }}</span>
          <strong class="text-xs text-gray-800">{{ levelInfo[lvl].title }}</strong>
        </div>
        <em class="text-[10px] text-gray-500 block">{{ levelInfo[lvl].desc }}</em>
        <b class="text-lg font-extrabold text-gray-800 mt-1">{{ (levelCounts as any)[lvl] }}</b>
      </button>
    </div>

    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-extrabold text-gray-800">产品需求池（MVP试运行）</span>
      <button class="text-xs text-blue-600 font-extrabold hover:underline">导出评分表</button>
    </div>

    <div class="overflow-x-auto">
      <table class="data-table w-full text-xs border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">需求ID</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">候选来源</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">需求标题</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">来源/证据</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">适用产品</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">五维评分</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">等级</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">处理路径</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">状态</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">责任人</th>
            <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">完成时限</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in pool" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" @click="handleOpenDetail(r)">
            <td class="px-2.5 py-2.5"><button class="link-button text-xs font-extrabold text-blue-600 hover:underline">{{ r.id }}</button></td>
            <td class="px-2.5 py-2.5 text-xs">{{ r.candidate }}</td>
            <td class="px-2.5 py-2.5 text-xs font-extrabold max-w-[240px] truncate">{{ r.title }}</td>
            <td class="px-2.5 py-2.5">
              <strong class="text-xs block">{{ r.source }}</strong>
              <em class="text-[10px] text-gray-500">{{ r.evidence }}</em>
            </td>
            <td class="px-2.5 py-2.5 text-xs">{{ r.product }}</td>
            <td class="px-2.5 py-2.5">
              <div class="score-bars flex items-end gap-1 h-9">
                <div v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-0.5" :title="`${label}：${(r.scores as any)[scoreKeys[si]]}分`">
                  <b class="text-[9px] font-extrabold">{{ (r.scores as any)[scoreKeys[si]] }}</b>
                  <i class="w-3 rounded-t" :style="{ height: (r.scores as any)[scoreKeys[si]] * 18 + '%', backgroundColor: scoreColors[si] }"></i>
                </div>
              </div>
            </td>
            <td class="px-2.5 py-2.5">
              <span class="pill text-[10px] px-2 py-0.5 rounded font-extrabold"
                :class="r.level === 'L1' ? 'bg-red-100 text-red-700' : r.level === 'L2' ? 'bg-orange-100 text-orange-700' : r.level === 'L3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
              >{{ r.level }}</span>
            </td>
            <td class="px-2.5 py-2.5 text-xs">{{ r.path }}</td>
            <td class="px-2.5 py-2.5"><span class="status-tag text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-100 text-blue-700">{{ r.status }}</span></td>
            <td class="px-2.5 py-2.5 text-xs">{{ r.owner }}</td>
            <td class="px-2.5 py-2.5 text-xs">{{ r.due }}</td>
          </tr>
          <tr v-if="pool.length === 0">
            <td colspan="11" class="text-center py-10 text-gray-400 text-sm font-bold">暂无匹配的需求</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.data-table { background: white; border-radius: 8px; overflow: hidden; }
.data-table th { background: #f8f9fa; }
.link-button { background: none; border: none; cursor: pointer; padding: 0; font: inherit; }
.link-button:hover { text-decoration: underline; }
.status-tag { white-space: nowrap; }
</style>
