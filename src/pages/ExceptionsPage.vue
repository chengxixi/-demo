<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import { emergencyData } from '@/api/mock-data';
import type { EmergencyException } from '@/types';

const searchQuery = ref('');
const levelFilter = ref('全部');
const statusFilter = ref('全部');
const expandedRows = ref<Set<string>>(new Set());

const levelOptions = ['全部', 'P1', 'P2', 'P3'];
const statusOptions = ['全部', '处理中', '临时方案超时', '已闭环'];

const filteredData = computed(() => {
  let items = emergencyData;
  if (levelFilter.value !== '全部') items = items.filter((i) => i.level === levelFilter.value);
  if (statusFilter.value !== '全部') items = items.filter((i) => i.status.includes(statusFilter.value));
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter((i) => i.id.toLowerCase().includes(q) || i.issue.toLowerCase().includes(q));
  }
  return items;
});

function levelClass(level: string) {
  if (level === 'P1') return 'bg-red-100 text-red-700 font-bold';
  if (level === 'P2') return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
}

function toggle(id: string) {
  const s = new Set(expandedRows.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  expandedRows.value = s;
}

const stepLabels = ['发现异常', '临时方案', '根因分析', '整改措施', '验证结果'];

function stepContent(item: EmergencyException, idx: number): string {
  const fields = [item.issue, item.tempPlan, item.rootCause, item.fixPlan, item.verifyResult];
  return fields[idx] || '';
}

function isPending(val: string) {
  return val.startsWith('待');
}
</script>

<template>
  <div class="p-6 max-w-[1500px] mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-800">异常处理</h2>
        <span class="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">{{ emergencyData.length }}条</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input v-model="searchQuery" placeholder="搜索异常..." class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-brand-400" />
        </div>
        <select v-model="levelFilter" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
          <option v-for="o in levelOptions" :key="o" :value="o">{{ o === '全部' ? '全部级别' : o }}</option>
        </select>
        <select v-model="statusFilter" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
          <option v-for="o in statusOptions" :key="o" :value="o">{{ o === '全部' ? '全部状态' : o }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs">
              <th class="text-left px-3 py-2.5 font-medium w-8"></th>
              <th class="text-left px-3 py-2.5 font-medium">异常编号</th>
              <th class="text-left px-3 py-2.5 font-medium">级别</th>
              <th class="text-left px-3 py-2.5 font-medium">区域</th>
              <th class="text-left px-3 py-2.5 font-medium">站点</th>
              <th class="text-left px-3 py-2.5 font-medium">产品线</th>
              <th class="text-left px-3 py-2.5 font-medium">内部型号</th>
              <th class="text-left px-3 py-2.5 font-medium">维度</th>
              <th class="text-left px-3 py-2.5 font-medium">来源</th>
              <th class="text-left px-3 py-2.5 font-medium">截止时间</th>
              <th class="text-left px-3 py-2.5 font-medium">负责人</th>
              <th class="text-left px-3 py-2.5 font-medium">状态</th>
              <th class="text-left px-3 py-2.5 font-medium">步骤</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in filteredData" :key="item.id">
              <tr
                :class="['border-t border-gray-50 hover:bg-gray-50/50 cursor-pointer', item.overdue ? 'bg-red-50/30' : '']"
                @click="toggle(item.id)"
              >
                <td class="px-3 py-3">
                  <component :is="expandedRows.has(item.id) ? ChevronDown : ChevronRight" :size="14" class="text-gray-400" />
                </td>
                <td class="px-3 py-3 font-mono text-xs" :class="item.overdue ? 'text-red-600' : 'text-brand-600'">{{ item.id }}</td>
                <td class="px-3 py-3"><span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', levelClass(item.level)]">{{ item.level }}</span></td>
                <td class="px-3 py-3">{{ item.region }}</td>
                <td class="px-3 py-3 text-gray-600">{{ item.site }}</td>
                <td class="px-3 py-3">{{ item.productLine }}</td>
                <td class="px-3 py-3 text-gray-600 font-mono text-xs">{{ item.internal }}</td>
                <td class="px-3 py-3">{{ item.dimension }}</td>
                <td class="px-3 py-3 text-gray-600">{{ item.source }}</td>
                <td class="px-3 py-3" :class="item.overdue ? 'text-red-600 font-bold' : 'text-orange-500'">{{ item.deadline }}</td>
                <td class="px-3 py-3 font-medium">{{ item.owner }}</td>
                <td class="px-3 py-3" :class="item.overdue ? 'text-red-600' : 'text-orange-500'">{{ item.status }}</td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-1">
                    <div v-for="s in 5" :key="s" :class="['w-2 h-2 rounded-full', s <= item.step + 1 ? 'bg-brand-500' : 'bg-gray-200']" />
                  </div>
                </td>
              </tr>
              <tr v-if="expandedRows.has(item.id)">
                <td colspan="13" class="px-4 py-4 bg-gray-50/50">
                  <div class="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div><span class="text-gray-400 text-xs">创建人</span><p class="text-gray-700 mt-0.5">{{ item.creator }}</p></div>
                    <div><span class="text-gray-400 text-xs">团队</span><p class="text-gray-700 mt-0.5">{{ item.team }}</p></div>
                    <div><span class="text-gray-400 text-xs">提醒截止</span><p class="text-gray-700 mt-0.5">{{ item.reminderDeadline }}</p></div>
                    <div><span class="text-gray-400 text-xs">措施</span><p class="text-gray-700 mt-0.5">{{ item.action }}</p></div>
                    <div><span class="text-gray-400 text-xs">关联反馈</span><p class="text-gray-700 mt-0.5">{{ item.feedback }}</p></div>
                    <div><span class="text-gray-400 text-xs">影响范围</span><p class="text-gray-700 mt-0.5">{{ item.impactScope }}</p></div>
                  </div>
                  <div class="flex items-center gap-2 mb-3">
                    <div v-for="(label, i) in stepLabels" :key="i" class="flex items-center gap-2">
                      <div :class="['flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold', i <= item.step ? (i === 0 && item.overdue ? 'bg-red-600 text-white' : 'bg-brand-600 text-white') : 'bg-gray-100 text-gray-400']">
                        <CheckCircle2 v-if="i <= item.step && !isPending(stepContent(item, i))" :size="14" />
                        <AlertTriangle v-else-if="i <= item.step" :size="14" />
                        <span v-else>{{ i + 1 }}</span>
                      </div>
                      <span :class="['text-xs', i <= item.step ? 'text-gray-700 font-medium' : 'text-gray-400']">{{ label }}</span>
                      <div v-if="i < 4" :class="['w-8 h-px', i <= item.step ? 'bg-brand-300' : 'bg-gray-200']" />
                    </div>
                  </div>
                  <div class="grid grid-cols-5 gap-2 text-xs">
                    <div v-for="(label, i) in stepLabels" :key="i" class="p-2 bg-white rounded-lg border border-gray-100">
                      <div class="text-gray-400 mb-1">{{ label }}</div>
                      <div :class="isPending(stepContent(item, i)) ? 'text-orange-500' : 'text-gray-700'">
                        {{ stepContent(item, i) || '—' }}
                      </div>
                    </div>
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
