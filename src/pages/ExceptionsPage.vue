<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, Clock, Search, ChevronRight } from 'lucide-vue-next'
import { useEmergencyStore } from '@/stores'
import { emergencyStepLabels, siteOptions } from '@/api/mock-data'

const store = useEmergencyStore()

const filters = ref({
  level: '',
  region: '',
  site: '',
  productLine: '',
  creator: '',
  dimension: '',
  source: '',
  deadline: '',
  search: '',
})

const regionOptions = ['海外', '国内']
const dimensionOptions = ['平台合规', '客户伤害', '产品质量', '产品体验']
const sourceOptions = ['投诉/舆情', '退货原因', '商品评论', '客服沟通']
const productLineOptions = ['八电极秤', '体脂秤', '筋膜枪', '血压计']

const stats = computed(() => {
  const all = store.exceptions
  return {
    p0: all.filter(e => e.level === 'P0').length,
    p1: all.filter(e => e.level === 'P1').length,
    overdue: all.filter(e => e.overdue).length,
    total: all.length,
  }
})

const filteredExceptions = computed(() => {
  let result = store.exceptions
  const f = filters.value
  if (f.level) result = result.filter(e => e.level === f.level)
  if (f.region) result = result.filter(e => e.region === f.region)
  if (f.site) result = result.filter(e => e.site === f.site)
  if (f.productLine) result = result.filter(e => e.productLine === f.productLine)
  if (f.creator) result = result.filter(e => e.creator.includes(f.creator))
  if (f.dimension) result = result.filter(e => e.dimension === f.dimension)
  if (f.source) result = result.filter(e => e.source === f.source)
  if (f.deadline) result = result.filter(e => e.deadline.includes(f.deadline))
  if (f.search) {
    const q = f.search.toLowerCase()
    result = result.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.issue.toLowerCase().includes(q) ||
      e.internal.toLowerCase().includes(q) ||
      e.owner.toLowerCase().includes(q)
    )
  }
  return result
})

function resetFilters() {
  filters.value = {
    level: '', region: '', site: '', productLine: '',
    creator: '', dimension: '', source: '', deadline: '', search: '',
  }
}

function levelClass(level: string): string {
  if (level === 'P0') return 'level-p0'
  if (level === 'P1') return 'level-p1'
  return 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-black'
}

// Detail expansion
const detailId = ref<string | null>(null)
function toggleDetail(id: string) {
  detailId.value = detailId.value === id ? null : id
}

// Update progress
function updateProgress(id: string) {
  const ex = store.exceptions.find(e => e.id === id)
  if (ex && ex.step < 5) {
    store.updateException(id, { step: ex.step + 1 })
  }
}

// Toast
const toast = ref<string | null>(null)
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="mb-5">
      <h2 class="text-2xl font-extrabold text-gray-900">紧急异常处理</h2>
      <p class="text-sm text-gray-500 mt-1">引用外贸电商异常级别判定标准，支持P0-P3响应时效、升级路径和归档。</p>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #ef4444;">
        <div class="flex items-center gap-2 mb-1">
          <span class="level-p0">P0</span>
          <span class="text-xs font-bold text-gray-500">异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.p0 }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #f97316;">
        <div class="flex items-center gap-2 mb-1">
          <span class="level-p1">P1</span>
          <span class="text-xs font-bold text-gray-500">异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.p1 }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #ef4444;">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangle class="w-4 h-4 text-red-500" />
          <span class="text-xs font-bold text-gray-500">超时</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.overdue }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #2563eb;">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangle class="w-4 h-4 text-blue-500" />
          <span class="text-xs font-bold text-gray-500">总异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.total }}</strong>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="bg-white border border-gray-200 rounded-lg mb-5 px-4 py-3">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <select v-model="filters.level" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">级别</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select v-model="filters.region" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">区域</option>
          <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filters.site" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">站点</option>
          <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
          <option value="Amazon">Amazon</option>
          <option value="京东">京东</option>
        </select>
        <select v-model="filters.productLine" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">产品线</option>
          <option v-for="p in productLineOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <input
          v-model="filters.creator"
          type="text"
          placeholder="创建人"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />
        <select v-model="filters.dimension" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">维度</option>
          <option v-for="d in dimensionOptions" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="filters.source" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">来源</option>
          <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <input
          v-model="filters.deadline"
          type="text"
          placeholder="截止时间"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />
        <div class="relative lg:col-span-2">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="filters.search"
            type="search"
            placeholder="搜索异常ID、问题、内部型号、负责人..."
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <button class="btn-secondary text-xs" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <!-- Card List -->
    <div class="space-y-4">
      <div
        v-for="ex in filteredExceptions"
        :key="ex.id"
        class="bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
        :class="ex.overdue ? 'border-l-4 border-l-red-500 bg-red-50/30' : 'border-gray-200'"
      >
        <!-- Card Top -->
        <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <span :class="levelClass(ex.level)">{{ ex.level }}</span>
          <span class="text-sm font-extrabold text-gray-900">{{ ex.id }}</span>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
            :class="ex.overdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
          >{{ ex.status }}</span>
          <span
            v-if="ex.overdue"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white"
          >
            <Clock class="w-3 h-3" />
            超时
          </span>
          <span class="ml-auto text-xs font-bold text-gray-500">
            <Clock class="w-3 h-3 inline mr-1" />
            {{ ex.deadline }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4">
          <!-- Title -->
          <h3 class="text-base font-extrabold text-gray-900 mb-3">{{ ex.issue }}</h3>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 mb-4">
            <div class="text-xs">
              <span class="text-gray-400 font-bold">区域</span>
              <p class="font-bold text-gray-700">{{ ex.region }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">站点</span>
              <p class="font-bold text-gray-700">{{ ex.site }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">产品线</span>
              <p class="font-bold text-gray-700">{{ ex.productLine }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">内部型号</span>
              <p class="font-bold text-gray-700">{{ ex.internal }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">创建人</span>
              <p class="font-bold text-gray-700">{{ ex.creator }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">维度</span>
              <p class="font-bold text-gray-700">{{ ex.dimension }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">来源</span>
              <p class="font-bold text-gray-700">{{ ex.source }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">负责人</span>
              <p class="font-bold text-gray-700">{{ ex.owner }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">团队</span>
              <p class="font-bold text-gray-700">{{ ex.team }}</p>
            </div>
          </div>

          <!-- Impact & Action -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 rounded-md px-3 py-2">
              <span class="text-xs font-bold text-gray-400">影响范围</span>
              <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.impactScope }}</p>
            </div>
            <div class="bg-gray-50 rounded-md px-3 py-2">
              <span class="text-xs font-bold text-gray-400">处理动作</span>
              <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.action }}</p>
            </div>
          </div>

          <!-- Associated Feedback -->
          <div class="mb-4 text-xs">
            <span class="font-bold text-gray-400">关联反馈: </span>
            <span class="font-bold text-blue-600">{{ ex.feedback }}</span>
          </div>

          <!-- 5-Step Process Indicator -->
          <div class="mb-4">
            <div class="flex items-center gap-1 mb-2">
              <div
                v-for="(label, idx) in emergencyStepLabels"
                :key="idx"
                class="flex-1"
              >
                <div
                  class="h-1.5 rounded-full transition-colors"
                  :class="idx < ex.step ? 'bg-green-500' : 'bg-gray-200'"
                ></div>
                <span
                  class="block text-[10px] font-bold mt-1 text-center"
                  :class="idx < ex.step ? 'text-green-600' : 'text-gray-400'"
                >{{ label }}</span>
              </div>
            </div>
          </div>

          <!-- Plan Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.tempPlan ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">临时方案</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.tempPlan || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.rootCause && ex.rootCause !== '待根因分析' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">根因分析</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.rootCause || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.fixPlan && ex.fixPlan !== '待整改措施' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">整改措施</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.fixPlan || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.verifyResult && ex.verifyResult !== '待验证' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">验证结果</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.verifyResult || '待验证' }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 border-t border-gray-100 pt-3">
            <button class="btn-secondary text-xs" @click="toggleDetail(ex.id)">
              查看详情
              <ChevronRight class="w-3.5 h-3.5 ml-1" />
            </button>
            <button class="btn-primary text-xs" @click="updateProgress(ex.id); showToast(`${ex.id} 进度已更新`)">
              更新进度
            </button>
          </div>

          <!-- Expanded Detail -->
          <div v-if="detailId === ex.id" class="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-extrabold text-gray-900 mb-3">处理详情</h4>
            <div class="space-y-2 text-xs">
              <p><span class="font-bold text-gray-400">反馈原文：</span>{{ ex.feedback }}</p>
              <p><span class="font-bold text-gray-400">影响范围：</span>{{ ex.impactScope }}</p>
              <p><span class="font-bold text-gray-400">处理动作：</span>{{ ex.action }}</p>
              <p><span class="font-bold text-gray-400">当前步骤：</span>第 {{ ex.step }} 步 / 共 5 步（{{ emergencyStepLabels[Math.max(0, Math.min(ex.step - 1, 4))] }}）</p>
              <p><span class="font-bold text-gray-400">创建时间：</span>{{ ex.deadline }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredExceptions.length === 0" class="bg-white border border-gray-200 rounded-lg py-16 text-center">
        <AlertTriangle class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-sm font-bold text-gray-400">未找到匹配的异常记录</p>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-green-600">
      {{ toast }}
    </div>
  </div>
</template>
