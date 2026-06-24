<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Filter, Plus, ChevronDown, X } from 'lucide-vue-next';
import { feedbackData } from '@/api/mock-data';
import type { FeedbackItem } from '@/types';

const tabs = [
  { key: 'all', label: '全部', count: 7 },
  { key: 'pending', label: '待处理', count: 5 },
  { key: 'review', label: '待人工复核', count: 1 },
  { key: 'done', label: '已处理', count: 1 },
];

const activeTab = ref('all');
const searchQuery = ref('');
const selectedItem = ref<FeedbackItem | null>(null);
const expandedGroups = ref<Set<string>>(new Set());

const filteredList = computed(() => {
  let items = feedbackData;
  if (activeTab.value === 'pending') items = feedbackData.filter((i) => i.processState === '待处理');
  if (activeTab.value === 'review') items = feedbackData.filter((i) => i.createMode === '人工录入');
  if (activeTab.value === 'done') items = feedbackData.filter((i) => i.processState === '已关闭' || i.processState === '已转需求' || i.processState === '异常处理中');
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter((i) => i.id.toLowerCase().includes(q) || i.raw.toLowerCase().includes(q) || i.model.toLowerCase().includes(q));
  }
  return items;
});

const grouped = computed(() => {
  const map = new Map<string, FeedbackItem[]>();
  for (const item of filteredList.value) {
    const key = item.mergeGroup;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
});

function toggleGroup(key: string) {
  const s = new Set(expandedGroups.value);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  expandedGroups.value = s;
}

function createModeClass(mode: string) {
  return mode === 'AI自动创建' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500';
}

function levelClass(level: string) {
  if (level === 'P1') return 'bg-red-50 text-red-600';
  if (level === 'P2') return 'bg-orange-50 text-orange-600';
  return 'bg-yellow-50 text-yellow-600';
}

function sentimentColor(s: string) {
  return s === '负向' ? 'text-red-500' : 'text-green-500';
}

const columns = ['编号', '来源', '创建方式', '品牌', '站点', '产品类型', '型号', '情感', '退货', '异常', '处理状态', '反馈人', '处理人', '日期'];
</script>

<template>
  <div class="p-6 max-w-[1600px] mx-auto">
    <!-- 筛选区 -->
    <div class="flex items-center gap-2 mb-4 text-sm flex-wrap">
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>近30天</option><option>近7天</option><option>近90天</option></select>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>Amazon.com (US)</option><option>全部站点</option><option>天猫</option><option>京东</option><option>抖音</option></select>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>全部品牌</option><option>云康宝</option><option>AF</option><option>GE</option></select>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>全部产品类型</option><option>体脂秤</option><option>人体秤</option><option>八电极秤</option><option>筋膜枪</option></select>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>全部型号</option><option>CS20A</option><option>CS30B</option><option>BF511</option><option>MG20</option></select>
      <select class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option>全部来源</option><option>商品评论</option><option>退货原因</option><option>站内信</option><option>APP反馈</option><option>社媒</option></select>
    </div>

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-2 text-sm rounded-lg transition-colors',
            activeTab === tab.key ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-500 hover:bg-gray-50',
          ]"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            v-model="searchQuery"
            placeholder="搜索反馈..."
            class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:border-brand-400"
          />
        </div>
        <button class="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter :size="14" />
          <span>筛选</span>
        </button>
        <button class="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          <Plus :size="14" />
          <span>新增反馈</span>
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs">
              <th class="text-left px-3 py-2.5 font-medium w-8"></th>
              <th v-for="col in columns" :key="col" class="text-left px-3 py-2.5 font-medium whitespace-nowrap">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="[key, items] in grouped" :key="key">
              <!-- 合并父行 -->
              <tr class="border-t border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50" @click="toggleGroup(key)">
                <td class="px-3 py-3">
                  <ChevronDown :size="14" :class="['transition-transform text-gray-400', expandedGroups.has(key) ? '' : '-rotate-90']" />
                </td>
                <td class="px-3 py-3 font-medium text-brand-600" :colspan="columns.length">
                  <span class="inline-flex items-center gap-2">
                    {{ key }}
                    <span class="text-xs text-gray-400">（{{ items.length }}条合并）</span>
                  </span>
                </td>
              </tr>
              <!-- 子项 -->
              <template v-if="expandedGroups.has(key)">
                <tr v-for="item in items" :key="item.id" class="border-t border-gray-50 hover:bg-brand-50/30 transition-colors cursor-pointer" @click="selectedItem = item">
                  <td class="px-3 py-2.5"></td>
                  <td class="px-3 py-2.5 font-mono text-xs text-gray-600">{{ item.id }}</td>
                  <td class="px-3 py-2.5 text-gray-600">{{ item.source }}</td>
                  <td class="px-3 py-2.5"><span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', createModeClass(item.createMode)]">{{ item.createMode }}</span></td>
                  <td class="px-3 py-2.5">{{ item.brand }}</td>
                  <td class="px-3 py-2.5 text-gray-600">{{ item.site }}</td>
                  <td class="px-3 py-2.5">{{ item.productType }}</td>
                  <td class="px-3 py-2.5 font-medium">{{ item.model }}</td>
                  <td class="px-3 py-2.5" :class="sentimentColor(item.sentiment)">{{ item.sentiment }}</td>
                  <td class="px-3 py-2.5" :class="item.returned === '退货' ? 'text-red-500' : 'text-gray-400'">{{ item.returned }}</td>
                  <td class="px-3 py-2.5"><span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', levelClass(item.exception)]">{{ item.exception }}</span></td>
                  <td class="px-3 py-2.5" :class="item.processState.includes('处理中') ? 'text-orange-500' : item.processState.includes('已') ? 'text-green-500' : 'text-gray-400'">{{ item.processState }}</td>
                  <td class="px-3 py-2.5 text-gray-600">{{ item.feedbackUser }}</td>
                  <td class="px-3 py-2.5 text-gray-600">{{ item.handler }}</td>
                  <td class="px-3 py-2.5 text-gray-400 text-xs">{{ item.date }}</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="selectedItem" class="fixed inset-0 z-50 flex justify-end" @click.self="selectedItem = null">
      <div class="bg-white w-[560px] h-full shadow-xl border-l border-gray-200 overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-100 z-10 flex items-center justify-between p-4">
          <h3 class="font-semibold text-gray-800">反馈详情 - {{ selectedItem.id }}</h3>
          <button @click="selectedItem = null" class="p-1.5 hover:bg-gray-100 rounded-lg"><X :size="18" class="text-gray-400" /></button>
        </div>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-gray-400 text-xs">数据来源</span><p class="text-gray-700 mt-0.5">{{ selectedItem.source }}</p></div>
            <div><span class="text-gray-400 text-xs">创建方式</span><p class="text-gray-700 mt-0.5">{{ selectedItem.createMode }}</p></div>
            <div><span class="text-gray-400 text-xs">品牌</span><p class="text-gray-700 mt-0.5">{{ selectedItem.brand }}</p></div>
            <div><span class="text-gray-400 text-xs">站点</span><p class="text-gray-700 mt-0.5">{{ selectedItem.site }}</p></div>
            <div><span class="text-gray-400 text-xs">产品类型</span><p class="text-gray-700 mt-0.5">{{ selectedItem.productType }}</p></div>
            <div><span class="text-gray-400 text-xs">销售型号</span><p class="text-gray-700 mt-0.5 font-medium">{{ selectedItem.model }}</p></div>
            <div><span class="text-gray-400 text-xs">内部型号</span><p class="text-gray-700 mt-0.5">{{ selectedItem.internal }}</p></div>
            <div><span class="text-gray-400 text-xs">ASIN</span><p class="text-gray-700 mt-0.5 font-mono text-xs">{{ selectedItem.asin }}</p></div>
            <div><span class="text-gray-400 text-xs">分类</span><p class="text-gray-700 mt-0.5">{{ selectedItem.level1 }} › {{ selectedItem.level2 }} › {{ selectedItem.level3 }}</p></div>
            <div><span class="text-gray-400 text-xs">情感</span><p class="mt-0.5" :class="sentimentColor(selectedItem.sentiment)">{{ selectedItem.sentiment }}</p></div>
            <div><span class="text-gray-400 text-xs">退货</span><p class="text-gray-700 mt-0.5">{{ selectedItem.returned }}</p></div>
            <div><span class="text-gray-400 text-xs">异常级别</span><p class="text-gray-700 mt-0.5">{{ selectedItem.exception }}</p></div>
          </div>
          <div class="border-t border-gray-100 pt-3">
            <span class="text-gray-400 text-xs">用户原始反馈</span>
            <p class="text-gray-700 text-sm mt-1 p-3 bg-gray-50 rounded-lg">{{ selectedItem.raw }}</p>
          </div>
          <div>
            <span class="text-gray-400 text-xs">AI 分析</span>
            <p class="text-gray-700 text-sm mt-1 p-3 bg-brand-50 rounded-lg">{{ selectedItem.ai }}</p>
          </div>
          <div class="border-t border-gray-100 pt-3 flex gap-2">
            <button class="flex-1 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">转工单</button>
            <button class="flex-1 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">转异常</button>
            <button class="flex-1 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">转需求</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
