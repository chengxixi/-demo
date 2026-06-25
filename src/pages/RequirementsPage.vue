<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, X } from 'lucide-vue-next'

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
const detailReq = ref<MockRequirement | null>(null)

const stats = computed(() => ({
  total: mockRequirements.value.length,
  p0: mockRequirements.value.filter(r => r.priority === 'P0').length,
  reviewing: mockRequirements.value.filter(r => r.status === '待评审' || r.status === '产品评审').length,
  scheduled: mockRequirements.value.filter(r => r.status === '已排期').length,
}))

const priorityClass = (p: string) => {
  if (p === 'P0') return 'level-p0'
  if (p === 'P1') return 'level-p1'
  if (p === 'P2') return 'level-p2'
  return 'level-p3'
}

const statusClass = (s: string) => {
  if (s === '已排期') return 'status-done'
  if (s === '待评审') return 'status-pending'
  return 'status-processing'
}

const filteredRequirements = computed(() => {
  let result = mockRequirements.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q))
  }
  if (filterPriority.value) result = result.filter(r => r.priority === filterPriority.value)
  if (filterStatus.value) result = result.filter(r => r.status === filterStatus.value)
  return result
})

const statusOptions = computed(() => [...new Set(mockRequirements.value.map(r => r.status))])

// Toast
const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

// Create Requirement Modal
const showCreateModal = ref(false)
const newReq = ref({
  id: '', title: '', source: '反馈清单', priority: 'P2', status: '待评审', owner: '', dept: '', date: '', desc: '',
})

function openCreateModal() {
  const now = new Date()
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  newReq.value = {
    id: `REQ-${d.replace(/-/g, '')}-${String(mockRequirements.value.length + 1).padStart(3, '0')}`,
    title: '', source: '反馈清单', priority: 'P2', status: '待评审', owner: '', dept: '', date: d, desc: '',
  }
  showCreateModal.value = true
}

function submitRequirement() {
  if (!newReq.value.title.trim()) { showToast('请填写需求标题', 'warning'); return }
  mockRequirements.value.unshift({ ...newReq.value })
  showCreateModal.value = false
  showToast(`需求 ${newReq.value.id} 已创建`, 'success')
}

function openDetail(req: MockRequirement) {
  detailReq.value = detailReq.value?.id === req.id ? null : req
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">需求管理</h2>
        <p class="text-xs text-gray-400 mt-0.5">承接反馈清单/异常处理/工单池的转需求事项，进入需求池评审和规划排期。</p>
      </div>
      <button class="btn-primary flex items-center gap-1 h-8 text-xs" @click="openCreateModal">
        <Plus class="w-3.5 h-3.5" /> 新建候选需求
      </button>
    </div>

    <!-- Stats -->
    <div class="px-6 pt-4 grid grid-cols-4 gap-3 flex-shrink-0">
      <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <div class="text-2xl font-extrabold text-gray-900">{{ stats.total }}</div>
        <div class="text-[11px] font-bold text-gray-500 mt-0.5">需求总数</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <div class="text-2xl font-extrabold text-red-600">{{ stats.p0 }}</div>
        <div class="text-[11px] font-bold text-gray-500 mt-0.5">P0需求</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <div class="text-2xl font-extrabold text-orange-600">{{ stats.reviewing }}</div>
        <div class="text-[11px] font-bold text-gray-500 mt-0.5">评审中</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
        <div class="text-2xl font-extrabold text-green-600">{{ stats.scheduled }}</div>
        <div class="text-[11px] font-bold text-gray-500 mt-0.5">已排期</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-6 py-3 flex items-center gap-3 flex-shrink-0">
      <div class="relative flex-1 max-w-xs">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input v-model="searchQuery" type="search" placeholder="搜索需求ID、标题、负责人..." class="w-full pl-8 pr-3 h-8 text-xs border border-gray-300 rounded-md outline-none focus:border-blue-500 font-bold" />
      </div>
      <select v-model="filterPriority" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
        <option value="">全部优先级</option>
        <option>P0</option><option>P1</option><option>P2</option><option>P3</option>
      </select>
      <select v-model="filterStatus" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
        <option value="">全部状态</option>
        <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
      </select>
      <span class="text-[11px] text-gray-400 ml-auto">{{ filteredRequirements.length }} 条需求</span>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto px-6 pb-6">
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">需求ID</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">需求标题</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">来源</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">优先级</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">状态</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">负责人</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">部门</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">日期</th>
              <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in filteredRequirements" :key="req.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-2.5 font-extrabold text-blue-600">{{ req.id }}</td>
              <td class="px-3 py-2.5 text-gray-700 font-bold max-w-[260px] truncate">{{ req.title }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ req.source }}</td>
              <td class="px-3 py-2.5"><span :class="priorityClass(req.priority)">{{ req.priority }}</span></td>
              <td class="px-3 py-2.5"><span :class="statusClass(req.status)">{{ req.status }}</span></td>
              <td class="px-3 py-2.5 font-bold">{{ req.owner }}</td>
              <td class="px-3 py-2.5 text-gray-500 font-bold">{{ req.dept }}</td>
              <td class="px-3 py-2.5 text-gray-400">{{ req.date }}</td>
              <td class="px-3 py-2.5 text-center">
                <button class="btn-secondary text-[11px] h-6 px-3" @click="openDetail(req)">详情</button>
              </td>
            </tr>
            <tr v-if="filteredRequirements.length === 0">
              <td colspan="9" class="text-center py-16 text-sm font-bold text-gray-400">未找到匹配的需求</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div v-if="detailReq" class="fixed inset-y-0 right-0 z-40 w-[480px] bg-white shadow-2xl border-l border-gray-200 overflow-auto">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div>
          <span class="text-xs text-gray-400">需求详情</span>
          <h3 class="text-sm font-extrabold text-gray-900">{{ detailReq.id }}</h3>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="detailReq = null"><X class="w-4 h-4" /></button>
      </div>
      <div class="p-5 space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">优先级</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.priority }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">状态</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.status }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">来源</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.source }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">负责人</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.owner }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">部门</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.dept }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">创建日期</span>
            <strong class="block mt-0.5 text-sm">{{ detailReq.date }}</strong>
          </div>
        </div>
        <div>
          <h4 class="text-xs font-extrabold text-gray-700 mb-1.5">需求标题</h4>
          <p class="text-sm font-bold text-gray-900">{{ detailReq.title }}</p>
        </div>
        <div>
          <h4 class="text-xs font-extrabold text-gray-700 mb-1.5">详细描述</h4>
          <p class="text-xs text-gray-600 leading-relaxed font-bold">{{ detailReq.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">需求管理</span>
            <h3 class="text-base font-extrabold text-gray-900">新建候选需求</h3>
            <p class="text-[11px] text-gray-400">录入候选需求信息，提交后进入评审流程。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showCreateModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求ID</span><input v-model="newReq.id" readonly class="h-8 text-xs border border-gray-200 rounded-md px-2 font-bold bg-gray-50" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">来源</span>
              <select v-model="newReq.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>反馈清单</option><option>异常处理</option><option>工单池</option><option>竞品分析</option></select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">优先级</span>
              <select v-model="newReq.priority" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>P0</option><option>P1</option><option>P2</option><option>P3</option></select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">状态</span>
              <select v-model="newReq.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>待评审</option><option>产品评审</option><option>规划中</option><option>已排期</option></select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">负责人</span><input v-model="newReq.owner" placeholder="填写负责人" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">部门</span><input v-model="newReq.dept" placeholder="填写部门" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          </div>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求标题 <span class="text-red-500">*</span></span><input v-model="newReq.title" placeholder="请输入需求标题" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">详细描述</span><textarea v-model="newReq.desc" rows="4" placeholder="请输入需求详细描述" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="showCreateModal = false">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="submitRequirement">提交需求</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">{{ toast.msg }}</div>
  </div>
</template>
