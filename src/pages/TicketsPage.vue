<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, X } from 'lucide-vue-next'
import { workOrderData, workOrderSteps } from '@/api/mock-data'
import type { WorkOrder } from '@/types'

const orders = ref<WorkOrder[]>([...workOrderData])
const detailOrder = ref<WorkOrder | null>(null)
const filterProductLine = ref('')
const filterStatus = ref('')
const filterOwner = ref('')

// Stats
const stats = computed(() => ({
  total: orders.value.length,
  processing: orders.value.filter(o => o.status === '处理中').length,
  closed: orders.value.filter(o => o.status === '已闭环').length,
  toRequirement: orders.value.filter(o => o.requirement === '是' || o.requirement === '预留').length,
}))

// Filtered
const filteredOrders = computed(() => {
  let result = orders.value
  if (filterProductLine.value) result = result.filter(o => o.productLine === filterProductLine.value)
  if (filterStatus.value) result = result.filter(o => o.status === filterStatus.value)
  if (filterOwner.value) result = result.filter(o => o.owner === filterOwner.value)
  return result
})

const productLineOptions = computed(() => [...new Set(orders.value.map(o => o.productLine))])
const statusOptions = computed(() => [...new Set(orders.value.map(o => o.status))])
const ownerOptions = computed(() => [...new Set(orders.value.map(o => o.owner))])

function getStatusClass(status: string) {
  if (status === '处理中') return 'status-processing'
  if (status === '待确认') return 'status-pending'
  if (status === '已闭环') return 'status-done'
  return ''
}

function getProductLineClass(line: string) {
  if (line.includes('八电极')) return 'bg-blue-50 text-blue-700'
  if (line.includes('筋膜枪')) return 'bg-purple-50 text-purple-700'
  if (line.includes('体脂秤')) return 'bg-green-50 text-green-700'
  return 'bg-gray-50 text-gray-700'
}

function getRoute(order: WorkOrder): string {
  if (order.status === '已闭环' && order.closeReason !== '-') return '直接关闭'
  if (order.exception === '是') return '已转异常'
  if (order.requirement === '是' || order.requirement === '预留') return '已转需求'
  if (order.qa === '是') return '已转Q&A'
  return '继续处理'
}

function openDetail(order: WorkOrder) {
  detailOrder.value = { ...order }
}

function closeDetail() {
  detailOrder.value = null
  showCloseModal.value = false
  closeNote.value = ''
}

// Route actions
const showCloseModal = ref(false)
const closeNote = ref('')

function doRoute(route: string) {
  if (!detailOrder.value) return
  if (route === 'close') {
    showCloseModal.value = true
    return
  }
  const idx = orders.value.findIndex(o => o.id === detailOrder.value!.id)
  if (idx < 0) return
  if (route === 'exception') orders.value[idx].exception = '是'
  else if (route === 'qa') orders.value[idx].qa = '是'
  else if (route === 'requirement') orders.value[idx].requirement = '是'
  detailOrder.value = { ...orders.value[idx] }
}

function confirmClose() {
  if (!detailOrder.value || !closeNote.value.trim()) return
  const idx = orders.value.findIndex(o => o.id === detailOrder.value!.id)
  if (idx < 0) return
  orders.value[idx].status = '已闭环'
  orders.value[idx].step = 5
  orders.value[idx].closeReason = closeNote.value.trim()
  orders.value[idx].closeNote = closeNote.value.trim()
  detailOrder.value = { ...orders.value[idx] }
  showCloseModal.value = false
  closeNote.value = ''
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">工单池</h2>
      <p class="text-xs text-gray-400 mt-0.5">从反馈清单生成的处理协同事项，按SLA进行分派、跟进和闭环。</p>
    </div>

    <!-- ============ List View ============ -->
    <template v-if="!detailOrder">
      <!-- Stats -->
      <div class="px-6 pt-4 grid grid-cols-4 gap-3 flex-shrink-0">
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-gray-900">{{ stats.total }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">工单总数</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-blue-600">{{ stats.processing }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">处理中</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-green-600">{{ stats.closed }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">已闭环</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-orange-600">{{ stats.toRequirement }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">已转需求</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <select v-model="filterProductLine" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
          <option value="">全部产品线</option>
          <option v-for="pl in productLineOptions" :key="pl" :value="pl">{{ pl }}</option>
        </select>
        <select v-model="filterStatus" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
          <option value="">全部状态</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterOwner" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
          <option value="">全部处理人</option>
          <option v-for="o in ownerOptions" :key="o" :value="o">{{ o }}</option>
        </select>
        <span class="text-[11px] text-gray-400 ml-auto">{{ filteredOrders.length }} 条工单</span>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto px-6 pb-6">
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">工单ID</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">工单摘要</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">关联反馈</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">产品线</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">处理状态</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">当前处理人</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">处理结果</th>
                <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">关闭原因</th>
                <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="px-3 py-2.5 font-extrabold text-blue-600">{{ order.id }}</td>
                <td class="px-3 py-2.5 text-gray-700 font-bold max-w-[280px] truncate">{{ order.summary || '待补充工单摘要' }}</td>
                <td class="px-3 py-2.5">
                  <span class="font-extrabold text-blue-600 cursor-pointer hover:underline">{{ order.relatedFeedback }}</span>
                </td>
                <td class="px-3 py-2.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="getProductLineClass(order.productLine)">{{ order.productLine }}</span>
                </td>
                <td class="px-3 py-2.5">
                  <span :class="getStatusClass(order.status)">{{ order.status }}</span>
                </td>
                <td class="px-3 py-2.5 font-bold">{{ order.owner }}</td>
                <td class="px-3 py-2.5 text-gray-600 font-bold max-w-[180px] truncate">{{ order.result }}</td>
                <td class="px-3 py-2.5 text-gray-400">{{ order.closeReason }}</td>
                <td class="px-3 py-2.5 text-center">
                  <button class="btn-secondary text-[11px] h-6 px-3" @click="openDetail(order)">详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ============ Detail View ============ -->
    <div v-else class="flex-1 overflow-auto p-6 bg-gray-50">
      <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg">
        <!-- Detail Header -->
        <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div>
            <h2 class="text-lg font-extrabold text-gray-900">{{ detailOrder.id }}</h2>
            <p class="text-xs text-gray-500 mt-1">
              关联反馈 <span class="font-extrabold text-blue-600">{{ detailOrder.relatedFeedback }}</span>
              / {{ detailOrder.status }} / {{ detailOrder.owner }}
            </p>
          </div>
          <button class="btn-secondary text-xs flex items-center gap-1 h-7 px-3" @click="closeDetail">
            <ArrowLeft class="w-3 h-3" /> 返回列表
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Info Grid -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100 col-span-2">
              <span class="block text-[11px] font-bold text-gray-500">AI工单摘要</span>
              <p class="mt-1 text-xs text-gray-700 font-bold leading-relaxed line-clamp-2">{{ detailOrder.aiAbstract || detailOrder.summary }}</p>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">当前处理人</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.owner }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理状态</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.status }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理去向</span>
              <strong class="block mt-1 text-sm">{{ getRoute(detailOrder) }}</strong>
            </div>
          </div>

          <!-- AI Abstract -->
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 class="text-xs font-extrabold text-blue-700 mb-2">AI自动摘要</h4>
            <p class="text-xs text-gray-700 leading-relaxed font-bold">{{ detailOrder.aiAbstract || '暂无AI摘要' }}</p>
          </div>

          <!-- Step Progress -->
          <div class="flex gap-1.5 items-center py-2">
            <span
              v-for="i in 5"
              :key="i"
              class="flex-1 flex items-center justify-center h-7 rounded-full border text-[10px] font-extrabold"
              :class="i <= detailOrder.step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400 bg-white'"
            >{{ i }}. {{ workOrderSteps[i - 1] }}</span>
          </div>

          <!-- Route Actions -->
          <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button class="btn-danger text-xs h-7 px-4" @click="doRoute('exception')">转异常</button>
            <button class="btn-secondary text-xs h-7 px-4" @click="doRoute('qa')">转Q&A</button>
            <button class="btn-success text-xs h-7 px-4" @click="doRoute('requirement')">转需求</button>
            <button class="btn-primary text-xs h-7 px-4" @click="doRoute('close')">直接关闭</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Close Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">关闭工单</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="showCloseModal = false"><X class="w-4 h-4" /></button>
        </div>
        <div class="p-5">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-extrabold text-gray-700">关闭说明 <span class="text-red-500">*</span></span>
            <textarea v-model="closeNote" rows="3" placeholder="请填写关闭原因和处理说明..." class="w-full text-xs border border-gray-300 rounded-md p-2.5 resize-y font-bold"></textarea>
          </label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="showCloseModal = false">取消</button>
          <button class="btn-primary text-xs h-8 px-4" @click="confirmClose">确认关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
