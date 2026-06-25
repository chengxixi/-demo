<script setup lang="ts">
import { Download, X } from 'lucide-vue-next'

defineProps<{
  visible: boolean
  reportType: 'feedback' | 'competitor'
}>()

const emit = defineEmits<{
  close: []
  download: []
}>()

function handleClose() {
  emit('close')
}

function handleDownload() {
  emit('download')
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-6">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400">{{ reportType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }}</span>
          <h3 class="text-base font-extrabold text-gray-900">{{ reportType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }} · 2026-06</h3>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-primary text-xs h-7 px-3 flex items-center gap-1" @click="handleDownload()">
            <Download class="w-3 h-3" /> 下载月报 (.docx)
          </button>
          <button class="text-gray-400 hover:text-gray-600" @click="handleClose()"><X class="w-5 h-5" /></button>
        </div>
      </div>

      <div class="p-5 max-h-[70vh] overflow-y-auto">
        <!-- Info -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">报告周期</span>
            <strong class="block mt-0.5 text-sm">2026-06</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">报告类型</span>
            <strong class="block mt-0.5 text-sm">{{ reportType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">状态</span>
            <strong class="block mt-0.5 text-sm text-blue-600">每日刷新，月末冻结</strong>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="space-y-4">
          <template v-if="reportType === 'feedback'">
            <section>
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">一、本月重点结论</h4>
              <div class="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 leading-relaxed font-bold">
                2026年6月用户反馈总量较上月下降 8.7%，退货率由 4.72% 降至 4.38%。测脂不准和无法开机仍为TOP问题，筋膜枪噪音类反馈上升 15%。已转需求 4 条，转异常 2 条。
              </div>
            </section>
            <section>
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">二、关键指标趋势</h4>
              <div class="grid grid-cols-3 gap-3">
                <div class="border border-gray-200 rounded-lg p-3 text-center" v-for="m in [{label:'总反馈量',v:'3,637',trend:'-8.7%'},{label:'退货率',v:'4.38%',trend:'-0.34pp'},{label:'闭环率',v:'87.45%',trend:'+3.21pp'}]" :key="m.label">
                  <div class="text-lg font-extrabold text-gray-900">{{ m.v }}</div>
                  <div class="text-[10px] text-gray-500">{{ m.label }}</div>
                  <div class="text-[10px] font-extrabold mt-0.5" :class="m.trend.startsWith('-') ? 'text-green-600' : 'text-red-500'">{{ m.trend }}</div>
                </div>
              </div>
            </section>
            <section>
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">三、问题分类与处理去向</h4>
              <p class="text-xs text-gray-600 leading-relaxed">产品质量类占比 36%（+4pp），产品体验类 28%（-3pp），物流运营类 14%。处理去向：已直接回复关闭 45%、已转工单 28%、已转需求 6%、已转异常 3%。</p>
            </section>
          </template>
          <template v-else>
            <section>
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">一、本月重点结论</h4>
              <div class="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 leading-relaxed font-bold">
                <p class="mb-2"><strong>1. 本月市场动态：</strong>新增竞品 12 款，触发提醒 6 次（L4级1次、L3级2次）。Withings 新增心率/血管年龄卖点值得重点关注。</p>
                <p class="mb-2"><strong>2. 核心发现：</strong>RENPHO 降价 18% 冲击中低端市场；华为八电极秤大促冲量，排名从#3升至#1。</p>
                <p><strong>3. 需决策事项：</strong>是否跟进心率功能升级？是否调整中低端产品定价策略？</p>
              </div>
            </section>
            <section>
              <h4 class="text-sm font-extrabold text-gray-900 mb-2">二、本月竞品动态</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-[11px] border border-gray-200 rounded-lg">
                  <thead>
                    <tr class="bg-gray-50"><th class="text-left px-2 py-1.5 font-extrabold">品牌</th><th class="text-left px-2 py-1.5 font-extrabold">型号</th><th class="text-left px-2 py-1.5 font-extrabold">变化</th><th class="text-left px-2 py-1.5 font-extrabold">影响</th></tr>
                  </thead>
                  <tbody>
                    <tr class="border-t border-gray-100"><td class="px-2 py-1.5 font-bold">Withings</td><td class="px-2 py-1.5">Body Scan</td><td class="px-2 py-1.5">新增血管年龄功能</td><td class="px-2 py-1.5 text-red-600 font-bold">高</td></tr>
                    <tr class="border-t border-gray-100"><td class="px-2 py-1.5 font-bold">RENPHO</td><td class="px-2 py-1.5">Elis 1</td><td class="px-2 py-1.5">降价 18% → $32.99</td><td class="px-2 py-1.5 text-orange-600 font-bold">中</td></tr>
                    <tr class="border-t border-gray-100"><td class="px-2 py-1.5 font-bold">华为</td><td class="px-2 py-1.5">体脂秤3 Pro</td><td class="px-2 py-1.5">大促排名 #3→#1</td><td class="px-2 py-1.5 text-orange-600 font-bold">中</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </template>
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-secondary text-xs h-8 px-4" @click="handleClose()">关闭</button>
      </div>
    </div>
  </div>
</template>
