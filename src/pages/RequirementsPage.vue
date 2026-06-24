<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, ChevronRight, X } from 'lucide-vue-next'

interface MockRequirement {
  id: string
  title: string
  source: string
  priority: string
  status: string
  owner: string
  dept: string
  date: string
  desc: string
}

const mockRequirements = ref<MockRequirement[]>([
  { id: 'REQ-20260618-001', title: '体脂秤开机故障批量修复', source: '反馈清单', priority: 'P0', status: '产品评审', owner: '李工', dept: '八电极产品线', date: '2026-06-18', desc: 'CS20A型号集中出现无法开机问题，需进行硬件设计和电池仓结构优化。' },
  { id: 'REQ-20260617-002', title: '筋膜枪降噪优化方案', source: '异常处理', priority: 'P1', status: '规划中', owner: '孙工', dept: '筋膜枪产品线', date: '2026-06-17', desc: 'MG20高档位噪音偏大，通过电机调校和结构优化降低运行噪音至50dB以下。' },
  { id: 'REQ-20260615-003', title: '测脂算法校准与测量引导优化', source: '反馈清单', priority: 'P2', status: '待评审', owner: '刘工', dept: '研发部', date: '2026-06-15', desc: 'AF-30B体脂率数据与专业设备偏差较大，需复核BIA算法并在APP中增加测量引导。' },
  { id: 'REQ-20260610-004', title: '血压计袖带尺寸适配方案', source: '工单池', priority: 'P3', status: '已排期', owner: '王工', dept: '产品部', date: '2026-06-10', desc: '增加大号袖带可选配件，优化说明书中的尺寸选择指引。' },
])

const searchQuery = ref('')
const filterPriority = ref('')
const filterStatus = ref('')

const priorityClass = (priority: string): string => {
  if (priority === 'P0') return 'level-p0'
  if (priority === 'P1') return 'level-p1'
  if (priority === 'P2') return 'level-p2'
  return 'level-p3'
}

const statusClass = (status: string): string => {
  if (status === '已排期') return 'status-done'
  if (status === '待评审') return 'status-pending'
  if (status === '规划中') return 'status-processing'
  return 'status-processing'
}

const filteredRequirements = computed(() => {
  let result = mockRequirements.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q)
    )
  }
  if (filterPriority.value) result = result.filter(r => r.priority === filterPriority.value)
  if (filterStatus.value) result = result.filter(r => r.status === filterStatus.value)
  return result
})

const statusOptions = computed(() => [...new Set(mockRequirements.value.map(r => r.status))])

// Toast & detail
const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

const detailId = ref<string | null>(null)

// ==================== Create Requirement Modal ====================
const showCreateModal = ref(false)
const newReq = ref({
  id: '',
  title: '',
  source: '反馈清单',
  priority: 'P2',
  status: '待评审',
  owner: '',
  dept: '',
  date: '',
  desc: '',
})

function createRequirement() {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  newReq.value = {
    id: `REQ-${dateStr.replace(/-/g, '')}-${String(mockRequirements.value.length + 1).padStart(3, '0')}`,
    title: '',
    source: '反馈清单',
    priority: 'P2',
    status: '待评审',
    owner: '',
    dept: '',
    date: dateStr,
    desc: '',
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function submitRequirement() {
  if (!newReq.value.title.trim()) {
    showToast('请填写需求标题', 'warning')
    return
  }
  mockRequirements.value.unshift({ ...newReq.value })
  showCreateModal.value = false
  showToast(`需求 ${newReq.value.id} 已创建`)
}

function viewDetail(req: MockRequirement) {
  detailId.value = detailId.value === req.id ? null : req.id
}
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">需求管理</h2>
        <p class="text-sm text-gray-500 mt-1">承接候选需求导入清单，完成五维评分、L1-L4分级、审批路径和下游开发衔接。</p>
      </div>
      <button class="btn-primary" @click="createRequirement">
        <Plus class="w-4 h-4 mr-1" />
        新建候选需求
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-lg mb-5 px-4 py-3">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索需求ID、标题、描述、负责人..."
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
          />
        </div>
        <select
          v-model="filterPriority"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        >
          <option value="">全部优先级</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select
          v-model="filterStatus"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        >
          <option value="">全部状态</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <!-- Card List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="req in filteredRequirements"
        :key="req.id"
        class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
      >
        <!-- Top Row -->
        <div class="flex items-center gap-2 flex-wrap mb-3">
          <span class="text-xs font-extrabold text-gray-500">{{ req.id }}</span>
          <span :class="priorityClass(req.priority)">{{ req.priority }}</span>
          <span :class="statusClass(req.status)">{{ req.status }}</span>
          <span class="ml-auto text-xs font-bold text-gray-400">{{ req.date }}</span>
        </div>

        <!-- Title -->
        <h3 class="text-base font-extrabold text-gray-900 mb-2">{{ req.title }}</h3>

        <!-- Description -->
        <p class="text-sm text-gray-600 leading-relaxed mb-4">{{ req.desc }}</p>

        <!-- Bottom Meta -->
        <div class="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-gray-400 font-bold">来源:</span>
            <span class="font-bold text-gray-700">{{ req.source }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-gray-400 font-bold">负责人:</span>
            <span class="font-bold text-gray-700">{{ req.owner }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-gray-400 font-bold">部门:</span>
            <span class="font-bold text-gray-700">{{ req.dept }}</span>
          </div>
          <button class="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center" @click.stop="viewDetail(req)">
            查看详情
            <ChevronRight class="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <!-- Expanded Detail -->
        <div v-if="detailId === req.id" class="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
          <p><span class="font-bold text-gray-400">需求ID：</span>{{ req.id }}</p>
          <p><span class="font-bold text-gray-400">优先级：</span>{{ req.priority }}</p>
          <p><span class="font-bold text-gray-400">当前状态：</span>{{ req.status }}</p>
          <p><span class="font-bold text-gray-400">来源：</span>{{ req.source }}</p>
          <p><span class="font-bold text-gray-400">创建日期：</span>{{ req.date }}</p>
          <p><span class="font-bold text-gray-400">详细描述：</span>{{ req.desc }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRequirements.length === 0" class="col-span-full bg-white border border-gray-200 rounded-lg py-16 text-center">
        <Search class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-sm font-bold text-gray-400">未找到匹配的需求</p>
      </div>
    </div>

    <!-- ==================== Create Requirement Modal ==================== -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">需求管理</span>
            <h3 class="text-base font-extrabold text-gray-900">新建候选需求</h3>
            <p class="text-[11px] text-gray-400">录入候选需求信息，提交后进入评审流程。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeCreateModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">需求ID</span>
              <input v-model="newReq.id" readonly class="h-8 text-xs border border-gray-200 rounded-md px-2 font-bold bg-gray-50" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">来源</span>
              <select v-model="newReq.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>反馈清单</option>
                <option>异常处理</option>
                <option>工单池</option>
                <option>竞品分析</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">优先级</span>
              <select v-model="newReq.priority" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>P0</option>
                <option>P1</option>
                <option>P2</option>
                <option>P3</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">状态</span>
              <select v-model="newReq.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>待评审</option>
                <option>产品评审</option>
                <option>规划中</option>
                <option>已排期</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">负责人</span>
              <input v-model="newReq.owner" placeholder="填写负责人" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">部门</span>
              <input v-model="newReq.dept" placeholder="填写部门" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
          </div>

          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">需求标题 <span class="text-red-500">*</span></span>
            <input v-model="newReq.title" placeholder="请输入需求标题" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">详细描述</span>
            <textarea v-model="newReq.desc" rows="4" placeholder="请输入需求详细描述" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
          </label>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeCreateModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="submitRequirement">提交需求</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">
      {{ toast.msg }}
    </div>
  </div>
</template>
