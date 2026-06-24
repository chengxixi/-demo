<script setup lang="ts">
import { FileText, Download } from 'lucide-vue-next';

const reports = [
  { id: 'RPT-202606', title: '2026年6月反馈分析月报', period: '2026年6月', type: '月度报告', date: '2026-07-01', summary: '本月反馈总量较上月增长12%，退货率上升0.5个百分点，需重点关注CS20A型号开机故障问题。异常处理闭环率达到89%。' },
  { id: 'RPT-202605', title: '2026年5月反馈分析月报', period: '2026年5月', type: '月度报告', date: '2026-06-01', summary: '反馈总量稳定，筋膜枪MG20噪音问题成为TOP3问题，已启动专项处理。竞品Withings Body Scan上市后关注度提升。' },
  { id: 'RPT-Q2', title: '2026年Q2季度质量分析报告', period: '2026年Q2', type: '季度报告', date: '2026-07-10', summary: 'Q2整体退货率3.2%，环比Q1上升0.3%。体脂秤品类为主要退货来源，占比62%。八电极秤玻璃碎裂事件已闭环。' },
];
</script>

<template>
  <div class="p-6 max-w-[1200px] mx-auto">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">报告中心</h2>
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="r in reports"
        :key="r.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
            <FileText :size="20" class="text-brand-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 text-sm">{{ r.title }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-flex px-2 py-0.5 rounded bg-purple-50 text-purple-600 text-xs font-medium">{{ r.type }}</span>
              <span class="text-xs text-gray-400">{{ r.date }}</span>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-500 mb-4 line-clamp-3">{{ r.summary }}</p>
        <div class="flex gap-2">
          <button class="flex-1 flex items-center justify-center gap-1 py-2 text-sm bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100">
            <FileText :size="14" />
            <span>查看详情</span>
          </button>
          <button class="flex-1 flex items-center justify-center gap-1 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
            <Download :size="14" />
            <span>下载报告</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
