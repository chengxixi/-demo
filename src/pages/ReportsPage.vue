<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Download, X, RefreshCw, Lock, ExternalLink } from 'lucide-vue-next'

const activeTab = ref<'feedback' | 'competitor'>('feedback')
const showPreview = ref(false)
const previewType = ref<'feedback' | 'competitor'>('feedback')

const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

const feedbackHistory = [
  { title: '用户反馈月报', period: '2026-06', owner: '产品经理', status: '刷新中', type: '月报' },
  { title: '用户反馈月报', period: '2026-05', owner: '产品经理', status: '已冻结', type: '月报' },
  { title: '用户反馈月报', period: '2026-04', owner: '产品经理', status: '已归档', type: '月报' },
]

const competitorHistory = [
  { title: '竞品分析月报', period: '2026-06', owner: '产品经理', status: '刷新中', type: '月报' },
  { title: '竞品分析月报', period: '2026-05', owner: '产品经理', status: '已冻结', type: '月报' },
  { title: '竞品分析月报', period: '2026-04', owner: '产品经理', status: '已归档', type: '月报' },
]

function statusClass(status: string) {
  if (status === '刷新中') return 'bg-blue-100 text-blue-700'
  if (status === '已冻结') return 'bg-gray-100 text-gray-600'
  return 'bg-green-100 text-green-700'
}

function statusIcon(status: string) {
  if (status === '刷新中') return RefreshCw
  if (status === '已冻结') return Lock
  return FileText
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">报告中心</h2>
      <p class="text-xs text-gray-400 mt-0.5">系统每月初自动创建两类月报，每日刷新，月末冻结；默认展示用户反馈月报。</p>
    </div>

    <!-- Tabs -->
    <div class="px-6 pt-4 flex items-center gap-0 border-b border-gray-200 flex-shrink-0">
      <button
        class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors -mb-px"
        :class="activeTab === 'feedback' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'feedback'"
      >用户反馈月报</button>
      <button
        class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors -mb-px"
        :class="activeTab === 'competitor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'competitor'"
      >竞品分析月报</button>
    </div>

    <!-- ==================== Tab 1: 用户反馈月报 ==================== -->
    <div v-if="activeTab === 'feedback'" class="flex-1 overflow-auto p-6 space-y-4">
      <!-- Panel Card -->
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <FileText class="w-5 h-5 text-blue-500" />
              <h3 class="text-base font-extrabold text-gray-900">用户反馈月报</h3>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed mt-1">汇总反馈量、反馈率、差评率、问题分类、处理去向、退换货与重点案例。</p>
            <div class="flex items-center gap-3 mt-3 text-[11px]">
              <span class="text-gray-400 font-bold">2026-06</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 font-bold">每日 02:00 刷新</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 font-bold">月末冻结</span>
            </div>
          </div>
          <button class="btn-primary text-xs h-8 px-4 flex items-center gap-1" @click="previewType = 'feedback'; showPreview = true">
            <ExternalLink class="w-3.5 h-3.5" /> 查看当前月报
          </button>
        </div>
      </div>

      <!-- Auto Generate Rule -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 class="text-xs font-extrabold text-blue-700 mb-1">自动生成规则</h4>
        <p class="text-[11px] text-gray-600 leading-relaxed">系统每月 1 日自动创建当月报告；每日上午刷新数据；月末 24:00 冻结归档。无需手动创建、自动刷新、冻结后只读。</p>
      </div>

      <!-- History List -->
      <div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">历史报告</h3>
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">报告名称</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">类型</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">周期</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">负责人</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">状态</th>
                <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in feedbackHistory" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2.5 font-extrabold text-gray-900">{{ r.title }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.type }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.period }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.owner }}</td>
                <td class="px-3 py-2.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="statusClass(r.status)">
                    <component :is="statusIcon(r.status)" class="w-3 h-3 inline mr-0.5" />{{ r.status }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <button class="btn-secondary text-[11px] h-6 px-3" @click="previewType = 'feedback'; showPreview = true">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== Tab 2: 竞品分析月报 ==================== -->
    <div v-if="activeTab === 'competitor'" class="flex-1 overflow-auto p-6 space-y-4">
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <FileText class="w-5 h-5 text-purple-500" />
              <h3 class="text-base font-extrabold text-gray-900">竞品分析月报</h3>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed mt-1">按产品线生成完整竞品分析报告，品牌竞品/ODM竞品各输出一份，涵盖市场动态、拆机分析和品牌影响评估。</p>
            <div class="flex items-center gap-3 mt-3 text-[11px]">
              <span class="text-gray-400 font-bold">2026-06</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 font-bold">八电极秤 / 体脂秤 / 筋膜枪</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 font-bold">品牌竞品 + ODM竞品</span>
            </div>
          </div>
          <button class="btn-primary text-xs h-8 px-4 flex items-center gap-1" @click="previewType = 'competitor'; showPreview = true">
            <ExternalLink class="w-3.5 h-3.5" /> 查看当前月报
          </button>
        </div>
      </div>

      <div class="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <h4 class="text-xs font-extrabold text-purple-700 mb-1">生成规则</h4>
        <p class="text-[11px] text-gray-600 leading-relaxed">按产品线生成完整报告，品牌竞品/ODM竞品各输出一份。包含重点结论、竞品动态、用户反馈分析、拆机分析和品牌影响评估。</p>
      </div>

      <div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">历史报告</h3>
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">报告名称</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">类型</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">周期</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">负责人</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">状态</th>
                <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in competitorHistory" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-3 py-2.5 font-extrabold text-gray-900">{{ r.title }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.type }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.period }}</td>
                <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.owner }}</td>
                <td class="px-3 py-2.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="statusClass(r.status)">
                    <component :is="statusIcon(r.status)" class="w-3 h-3 inline mr-0.5" />{{ r.status }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <button class="btn-secondary text-[11px] h-6 px-3" @click="previewType = 'competitor'; showPreview = true">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== Preview Modal ==================== -->
    <div v-if="showPreview" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-6">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">{{ previewType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }}</span>
            <h3 class="text-base font-extrabold text-gray-900">{{ previewType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }} · 2026-06</h3>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-primary text-xs h-7 px-3 flex items-center gap-1" @click="showToast('下载中...', 'success')">
              <Download class="w-3 h-3" /> 下载月报 (.docx)
            </button>
            <button class="text-gray-400 hover:text-gray-600" @click="showPreview = false"><X class="w-5 h-5" /></button>
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
              <strong class="block mt-0.5 text-sm">{{ previewType === 'feedback' ? '用户反馈月报' : '竞品分析月报' }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">状态</span>
              <strong class="block mt-0.5 text-sm text-blue-600">每日刷新，月末冻结</strong>
            </div>
          </div>

          <!-- Content Sections (simplified) -->
          <div class="space-y-4">
            <template v-if="previewType === 'feedback'">
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
          <button class="btn-secondary text-xs h-8 px-4" @click="showPreview = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">{{ toast.msg }}</div>
  </div>
</template>
