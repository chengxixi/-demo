<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { competitorData } from '@/api/mock-data'

const paramRows = [
  { label: '产品线', values: ['八电极秤', '体脂秤', '八电极秤'] },
  { label: '价格', values: ['$349.95', '$39.99', '¥399'] },
  { label: '销售渠道', values: ['Amazon / 独立站', 'Amazon / Walmart', '天猫 / 京东 / 抖音'] },
  { label: '核心卖点', values: ['高端健康管理', '低价高评价', '华为生态'] },
]

// Add Competitor Modal
const showAddModal = ref(false)
const newCompetitor = ref({
  name: '',
  channelType: '海外',
  asin: '',
  line: '八电极秤',
  price: '',
  channels: '',
  params: '',
  tags: ['品牌竞品'] as string[],
})

const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

function openAddModal() {
  showAddModal.value = true
  newCompetitor.value = {
    name: '',
    channelType: '海外',
    asin: '',
    line: '八电极秤',
    price: '',
    channels: '',
    params: '',
    tags: ['品牌竞品'],
  }
}

function closeAddModal() {
  showAddModal.value = false
}

function saveCompetitor() {
  if (!newCompetitor.value.name.trim()) {
    showToast('请填写竞品名称', 'warning')
    return
  }
  showToast(`竞品「${newCompetitor.value.name}」已保存`)
  closeAddModal()
}

function toggleTag(tag: string) {
  const idx = newCompetitor.value.tags.indexOf(tag)
  if (idx >= 0) newCompetitor.value.tags.splice(idx, 1)
  else newCompetitor.value.tags.push(tag)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">竞品分析/差评聚类</h2>
        <p class="text-xs text-gray-400 mt-0.5">整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。</p>
      </div>
      <button class="btn-primary flex items-center gap-1" @click="openAddModal">
        <Plus class="w-4 h-4" /> 新增竞品
      </button>
    </div>
    <div class="flex-1 overflow-auto p-6">
      <!-- Competitor Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          v-for="comp in competitorData"
          :key="comp.name"
          class="bg-white border border-gray-200 rounded-lg p-5 min-h-[220px] flex flex-col gap-2.5"
        >
          <span class="inline-flex self-start px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold">
            {{ comp.line }}
          </span>
          <h3 class="text-base font-extrabold text-gray-900 leading-tight">{{ comp.name }}</h3>
          <p class="text-xs text-gray-500">ASIN: {{ comp.asin }}</p>
          <strong class="text-lg font-extrabold text-gray-900">{{ comp.price }}</strong>
          <span class="text-xs text-gray-600 font-bold">{{ comp.channels }}</span>
          <div class="flex flex-wrap gap-2 mt-auto">
            <span
              v-for="(p, i) in comp.params.split(' / ')"
              :key="i"
              class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold"
            >{{ p }}</span>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">对比参数</h3>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">参数项</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">Withings</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">RENPHO</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">华为</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paramRows" :key="row.label" class="border-b border-gray-100">
              <td class="px-3 py-2 font-extrabold text-gray-700">{{ row.label }}</td>
              <td v-for="(val, i) in row.values" :key="i" class="px-3 py-2 font-bold text-gray-600">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== Add Competitor Modal ==================== -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">竞品信息</span>
            <h3 class="text-base font-extrabold text-gray-900">增加竞品</h3>
            <p class="text-[11px] text-gray-400">按竞品信息登记表填写，海外渠道必须补充 ASIN。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeAddModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">竞品名称</span>
              <input v-model="newCompetitor.name" placeholder="例如 Withings Body Scan" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">渠道类型</span>
              <select v-model="newCompetitor.channelType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>海外</option>
                <option>国内</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">ASIN</span>
              <input v-model="newCompetitor.asin" :placeholder="newCompetitor.channelType === '海外' ? '海外渠道必填 ASIN' : '国内渠道可不填写'" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">产品线</span>
              <select v-model="newCompetitor.line" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>八电极秤</option>
                <option>体脂秤</option>
                <option>筋膜枪</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">价格</span>
              <input v-model="newCompetitor.price" placeholder="$39.99 / ¥399" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1 col-span-2 md:col-span-1">
              <span class="text-[11px] font-bold text-gray-600">渠道</span>
              <input v-model="newCompetitor.channels" placeholder="Amazon / 天猫 / 京东 / 抖音" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
          </div>

          <!-- Tags -->
          <div class="mt-3">
            <span class="block text-[11px] font-bold text-gray-600 mb-1">竞品标签</span>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <input type="checkbox" :checked="newCompetitor.tags.includes('品牌竞品')" @change="toggleTag('品牌竞品')" /> 品牌竞品
              </label>
              <label class="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <input type="checkbox" :checked="newCompetitor.tags.includes('ODM竞品')" @change="toggleTag('ODM竞品')" /> ODM竞品
              </label>
            </div>
          </div>

          <!-- Detailed param fields -->
          <div class="mt-4 border-t border-gray-100 pt-4">
            <h4 class="text-sm font-extrabold text-gray-900 mb-3">{{ newCompetitor.line }}竞品信息登记表字段</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">竞品类型 <span class="text-gray-400">/ 必填</span></span>
                <select class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                  <option>直接竞争产品</option>
                  <option>间接竞争产品</option>
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">品牌 <span class="text-gray-400">/ 必填</span></span>
                <input placeholder="Withings" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">产品名称 <span class="text-gray-400">/ 必填</span></span>
                <input placeholder="Body Comp" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">产品型号 <span class="text-gray-400">/ 必填</span></span>
                <input placeholder="WBS08" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">产品定位 <span class="text-gray-400">/ 必填</span></span>
                <select class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                  <option>入门级</option>
                  <option>大众级</option>
                  <option>中端</option>
                  <option>高端</option>
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">上市时间 <span class="text-gray-400">/ 选填</span></span>
                <input placeholder="YYYY-MM 或 2023年10月" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">销售平台 <span class="text-gray-400">/ 必填</span></span>
                <input placeholder="Amazon / 天猫 / 京东" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">销售区域 <span class="text-gray-400">/ 必填</span></span>
                <input placeholder="中国 / 美国 / 加拿大 / 欧洲" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">竞品链接 <span class="text-gray-400">/ 必填</span></span>
                <input type="url" placeholder="商品链接或官网链接" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">到手价 <span class="text-gray-400">/ 必填</span></span>
                <input type="number" placeholder="349.95" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">币种 <span class="text-gray-400">/ 必填</span></span>
                <select class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                  <option>USD</option>
                  <option>CNY</option>
                  <option>EUR</option>
                  <option>JPY</option>
                  <option>GBP</option>
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-bold text-gray-600">信息采集日期 <span class="text-gray-400">/ 必填</span></span>
                <input type="date" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
              </label>
            </div>
          </div>

          <!-- Notes -->
          <label class="flex flex-col gap-1 mt-4">
            <span class="text-[11px] font-bold text-gray-600">备注</span>
            <textarea v-model="newCompetitor.params" rows="3" placeholder="补充核心卖点、功能差异、价格策略等备注信息" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
          </label>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeAddModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="saveCompetitor">保存竞品</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">
      {{ toast.msg }}
    </div>
  </div>
</template>
