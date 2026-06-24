<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { TrendingUp, TrendingDown, CircleHelp, Search, Filter, RefreshCw } from 'lucide-vue-next';
import { fetchMetricCards, fetchModelRank } from '@/api';
import type { MetricCardData, ModelRankItem, CompareMode } from '@/types';

const metricCards = ref<MetricCardData[]>([]);
const modelRank = ref<ModelRankItem[]>([]);
const compareMode = ref<CompareMode>('mom');
const modelSearch = ref('');

onMounted(async () => {
  metricCards.value = await fetchMetricCards(compareMode.value);
  modelRank.value = await fetchModelRank();
});

const filteredRank = computed(() => {
  if (!modelSearch.value) return modelRank.value;
  const q = modelSearch.value.toLowerCase();
  return modelRank.value.filter(
    (m) =>
      m.model.toLowerCase().includes(q) ||
      m.internal.toLowerCase().includes(q) ||
      m.material.toLowerCase().includes(q),
  );
});

function toggleMode(mode: CompareMode) {
  compareMode.value = mode;
  fetchMetricCards(mode).then((data) => (metricCards.value = data));
}
</script>

<template>
  <div class="p-6 max-w-[1440px] mx-auto">
    <!-- 筛选栏 -->
    <div class="flex items-center gap-2 mb-4 text-sm">
      <span class="text-gray-500">时间周期</span>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
        <option>近30天</option>
        <option>近7天</option>
        <option>近90天</option>
      </select>
      <span class="text-gray-500 ml-4">站点</span>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
        <option>Amazon.com (US)</option>
        <option>全部站点</option>
        <option>天猫</option>
        <option>京东</option>
      </select>
      <span class="text-gray-500 ml-4">品牌</span>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
        <option>全部品牌</option>
        <option>云康宝</option>
      </select>
      <span class="text-gray-500 ml-4">产品类型</span>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
        <option>体脂秤</option>
        <option>全部产品类型</option>
        <option>人体秤</option>
        <option>八电极秤</option>
        <option>筋膜枪</option>
      </select>
    </div>

    <!-- 同比/环比切换 -->
    <div class="flex items-center gap-2 mb-5">
      <button
        @click="toggleMode('mom')"
        :class="[
          'px-3 py-1 text-xs rounded-md border transition-colors',
          compareMode === 'mom' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
        ]"
      >
        环比
      </button>
      <button
        @click="toggleMode('yoy')"
        :class="[
          'px-3 py-1 text-xs rounded-md border transition-colors',
          compareMode === 'yoy' ? 'bg-brand-50 border-brand-300 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50',
        ]"
      >
        同比
      </button>
    </div>

    <!-- 指标卡片 -->
    <div class="grid grid-cols-6 gap-4 mb-6">
      <div
        v-for="card in metricCards"
        :key="card.key"
        class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-400">{{ card.label }}</span>
          <div class="relative group">
            <CircleHelp :size="14" class="text-gray-300 cursor-help" />
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 w-48 text-center">
              {{ card.formula }}
            </div>
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-800">{{ card.value }}</div>
        <div class="flex items-center gap-1 mt-1">
          <TrendingUp v-if="card.trend === 'up'" :size="14" class="text-red-500" />
          <TrendingDown v-else :size="14" class="text-green-500" />
          <span :class="card.trend === 'up' ? 'text-red-500' : 'text-green-500'" class="text-xs font-medium">
            {{ card.change }}
          </span>
          <span class="text-xs text-gray-400">{{ compareMode === 'mom' ? '环比' : '同比' }}</span>
        </div>
      </div>
    </div>

    <!-- 型号排名表 -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between p-4 border-b border-gray-50">
        <h2 class="text-sm font-semibold text-gray-700">型号排名</h2>
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              v-model="modelSearch"
              placeholder="搜索型号/料号"
              class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-brand-400"
            />
          </div>
          <button class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <Filter :size="16" />
          </button>
          <button class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <RefreshCw :size="16" />
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs">
              <th class="text-left px-4 py-3 font-medium">销售型号</th>
              <th class="text-left px-4 py-3 font-medium">内部型号</th>
              <th class="text-left px-4 py-3 font-medium">料号</th>
              <th class="text-right px-4 py-3 font-medium">退货率</th>
              <th class="text-right px-4 py-3 font-medium">反馈率</th>
              <th class="text-right px-4 py-3 font-medium">闭环率</th>
              <th class="text-right px-4 py-3 font-medium">响应达成率</th>
              <th class="text-right px-4 py-3 font-medium">异常占比</th>
              <th class="text-right px-4 py-3 font-medium">差评率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRank.length === 0">
              <td colspan="9" class="text-center py-16 text-gray-400">暂无匹配数据</td>
            </tr>
            <tr
              v-for="item in filteredRank"
              :key="item.model"
              class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-4 py-3 font-medium text-gray-800">{{ item.model }}</td>
              <td class="px-4 py-3 text-gray-500">
                {{ item.internal }}
                <div class="text-xs text-gray-300">{{ item.material }}</div>
              </td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ item.material }}</td>
              <td class="px-4 py-3 text-right font-medium" :class="Number(item.returnRate.replace('%','')) > 4 ? 'text-red-500' : 'text-gray-700'">{{ item.returnRate }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ item.feedbackRate }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ item.closeRate }}</td>
              <td class="px-4 py-3 text-right text-gray-700">{{ item.responseRate }}</td>
              <td class="px-4 py-3 text-right font-medium" :class="Number(item.exceptionRate.replace('%','')) > 5 ? 'text-red-500' : 'text-gray-700'">{{ item.exceptionRate }}</td>
              <td class="px-4 py-3 text-right font-medium" :class="Number(item.negativeRate.replace('%','')) > 15 ? 'text-red-500' : 'text-gray-700'">{{ item.negativeRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
