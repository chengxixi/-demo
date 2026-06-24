<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ChevronDown, ChevronRight, Clock, CheckCircle2 } from 'lucide-vue-next';
import { workOrderData } from '@/api/mock-data';

const searchQuery = ref('');
const statusFilter = ref('全部');
const expandedRows = ref<Set<string>>(new Set());

const statusOptions = ['全部', '处理中', '待处理', '已完成'];

const filteredData = computed(() => {
  let items = workOrderData;
  if (statusFilter.value !== '全部') items = items.filter((i) => i.status === statusFilter.value);
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter((i) => i.id.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
  }
  return items;
});

function statusClass(status: string) {
  if (status === '处理中') return 'bg-blue-50 text-blue-600';
  if (status === '待处理') return 'bg-yellow-50 text-yellow-600';
  return 'bg-green-50 text-green-600';
}

function slaClass(sla: string) {
  if (sla === '已完成') return 'text-green-500';
  const h = parseInt(sla);
  return h < 5 ? 'text-red-500 font-bold' : 'text-orange-500';
}

function toggle(id: string) {
  const s = new Set(expandedRows.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  expandedRows.value = s;
}
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-800">工单池</h2>
        <span class="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">{{ workOrderData.length }}条</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input v-model="searchQuery" placeholder="搜索工单..." class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-brand-400" />
        </div>
        <select v-model="statusFilter" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <button class="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">新建工单</button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs">
              <th class="text-left px-4 py-2.5 font-medium w-8"></th>
              <th class="text-left px-4 py-2.5 font-medium">工单编号</th>
              <th class="text-left px-4 py-2.5 font-medium">摘要</th>
              <th class="text-left px-4 py-2.5 font-medium">状态</th>
              <th class="text-left px-4 py-2.5 font-medium">负责人</th>
              <th class="text-left px-4 py-2.5 font-medium">部门</th>
              <th class="text-left px-4 py-2.5 font-medium">SLA</th>
              <th class="text-left px-4 py-2.5 font-medium">转异常</th>
              <th class="text-left px-4 py-2.5 font-medium">转需求</th>
              <th class="text-left px-4 py-2.5 font-medium">步骤</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in filteredData" :key="item.id">
              <tr class="border-t border-gray-50 hover:bg-gray-50/50 cursor-pointer" @click="toggle(item.id)">
                <td class="px-4 py-3">
                  <component :is="expandedRows.has(item.id) ? ChevronDown : ChevronRight" :size="14" class="text-gray-400" />
                </td>
                <td class="px-4 py-3 font-mono text-xs text-brand-600">{{ item.id }}</td>
                <td class="px-4 py-3 font-medium text-gray-800 max-w-[240px] truncate">{{ item.summary }}</td>
                <td class="px-4 py-3"><span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', statusClass(item.status)]">{{ item.status }}</span></td>
                <td class="px-4 py-3">{{ item.owner }}</td>
                <td class="px-4 py-3 text-gray-500">{{ item.dept }}</td>
                <td class="px-4 py-3" :class="slaClass(item.sla)">{{ item.sla }}</td>
                <td class="px-4 py-3">{{ item.exception }}</td>
                <td class="px-4 py-3">{{ item.requirement }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <div v-for="s in 5" :key="s" :class="['w-2 h-2 rounded-full', s <= item.step ? 'bg-brand-500' : 'bg-gray-200']" />
                  </div>
                </td>
              </tr>
              <tr v-if="expandedRows.has(item.id)">
                <td colspan="10" class="px-4 py-4 bg-gray-50/50">
                  <div class="flex items-center gap-2 mb-3">
                    <div v-for="(label, i) in ['接收', '分析', '处理', '闭环', '完成']" :key="i" class="flex items-center gap-2">
                      <div :class="['flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold', i < item.step ? 'bg-brand-600 text-white' : i === item.step ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-300' : 'bg-gray-100 text-gray-400']">
                        <CheckCircle2 v-if="i < item.step" :size="14" />
                        <Clock v-else-if="i === item.step" :size="14" />
                        <span v-else>{{ i + 1 }}</span>
                      </div>
                      <span :class="['text-xs', i < item.step ? 'text-brand-600 font-medium' : 'text-gray-400']">{{ label }}</span>
                      <div v-if="i < 4" :class="['w-8 h-px', i < item.step ? 'bg-brand-300' : 'bg-gray-200']" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div><span class="text-gray-400 text-xs">处理结果</span><p class="text-gray-700 mt-0.5">{{ item.result || '—' }}</p></div>
                    <div><span class="text-gray-400 text-xs">关闭原因</span><p class="text-gray-700 mt-0.5">{{ item.closeReason }}</p></div>
                    <div><span class="text-gray-400 text-xs">关联反馈</span><p class="text-gray-700 mt-0.5">{{ item.relatedFeedback }}</p></div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
