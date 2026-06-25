<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, X, BarChart3, TrendingUp, AlertTriangle } from 'lucide-vue-next'
import { competitorData } from '@/api/mock-data'
import type { Competitor } from '@/types'

// Tabs
const activeTab = ref<'info' | 'market' | 'sentiment'>('info')

// Competitor list
const competitors = ref<Competitor[]>([...competitorData])
const detailComp = ref<Competitor | null>(null)
const showAddModal = ref(false)

// Filters
const filterName = ref('')
const filterChannel = ref('')
const filterLine = ref('')

const filteredCompetitors = computed(() => {
  let result = competitors.value
  if (filterName.value) result = result.filter(c => c.name.toLowerCase().includes(filterName.value.toLowerCase()))
  if (filterChannel.value === '海外') result = result.filter(c => c.price.startsWith('$'))
  if (filterChannel.value === '国内') result = result.filter(c => c.price.startsWith('¥'))
  if (filterLine.value) result = result.filter(c => c.line === filterLine.value)
  return result
})

// New competitor form
const newCompetitor = ref({
  name: '', channelType: '海外', asin: '', line: '八电极秤', price: '', channels: '', params: '', tags: ['品牌竞品'] as string[],
})

// Toast
const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

function openAddModal() {
  newCompetitor.value = { name: '', channelType: '海外', asin: '', line: '八电极秤', price: '', channels: '', params: '', tags: ['品牌竞品'] }
  showAddModal.value = true
}

function saveCompetitor() {
  if (!newCompetitor.value.name.trim()) { showToast('请填写竞品名称', 'warning'); return }
  competitors.value.unshift({
    name: newCompetitor.value.name,
    asin: newCompetitor.value.asin || '-',
    line: newCompetitor.value.line,
    price: newCompetitor.value.price || '-',
    channels: newCompetitor.value.channels || '-',
    params: newCompetitor.value.params || newCompetitor.value.tags.join(' / '),
  })
  showAddModal.value = false
  showToast(`竞品「${newCompetitor.value.name}」已保存`, 'success')
}

function toggleTag(tag: string) {
  const idx = newCompetitor.value.tags.indexOf(tag)
  if (idx >= 0) newCompetitor.value.tags.splice(idx, 1)
  else newCompetitor.value.tags.push(tag)
}

function openDetail(comp: Competitor) {
  detailComp.value = comp
}

// Market monitoring data
const marketTriggers = [
  { level: 'L4', item: 'Withings 新增心率/血管年龄卖点', action: '建议进入换代功能机会评估', brand: 'Withings', type: '功能变化' },
  { level: 'L3', item: 'RENPHO 近7天价格下降 18%', action: '跟进价格带和促销节奏', brand: 'RENPHO', type: '价格变化' },
  { level: 'L3', item: '华为八电极秤大促排名上升', action: '复盘国内高端秤卖点结构', brand: '华为', type: '排名变化' },
]

const marketDynamics = [
  { platform: 'Amazon', brand: 'Withings', product: 'Body Scan', category: '八电极秤', rank: '#1', price: '$349.95', rating: '4.5', reviews: '2.3k', change: '新增血管年龄', event: '新卖点', trigger: 'L4', action: '待处理' },
  { platform: 'Amazon', brand: 'RENPHO', product: 'Elis 1', category: '体脂秤', rank: '#5→#12', price: '$39.99→$32.99', rating: '4.3', reviews: '8.9k', change: '-18%', event: '降价促销', trigger: 'L3', action: '已处理' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤3 Pro', category: '八电极秤', rank: '#3→#1', price: '¥399', rating: '4.8', reviews: '5.2万', change: '+176%', event: '大促冲量', trigger: 'L3', action: '已完成' },
]

// Sentiment data
const starDistribution = [
  { star: 5, count: 14, color: '#22a06b' },
  { star: 4, count: 2, color: '#85b835' },
  { star: 3, count: 3, color: '#ffb020' },
  { star: 2, count: 3, color: '#ff8a00' },
  { star: 1, count: 6, color: '#e34935' },
]
const maxStar = Math.max(...starDistribution.map(s => s.count))

const opinions = [
  { sentiment: '正向', items: ['总体满意度', '应用功能', '身体成分追踪'], color: 'text-green-700 bg-green-50' },
  { sentiment: '负向', items: ['计算不准确', '设备故障', '应用可用性'], color: 'text-red-700 bg-red-50' },
  { sentiment: '未满足需求', items: ['更高的测量精度', '更优的质量', '更好的长期追踪'], color: 'text-orange-700 bg-orange-50' },
]

const typicalReviews = [
  { source: 'Amazon评论', brand: 'Withings', sentiment: '负向', content: '测量结果与健身房设备相差较大，不确定哪个准确。', keywords: '测脂不准 / 精度' },
  { source: '媒体测评', brand: 'RENPHO', sentiment: '正向', content: '性价比非常高，App功能齐全，家庭使用足够了。', keywords: '性价比 / App体验' },
  { source: '京东问答', brand: '华为', sentiment: '中性', content: '连接华为运动健康很方便，但只有蓝牙没有WiFi。', keywords: '生态联动 / 连接方式' },
]
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">竞品分析</h2>
        <p class="text-xs text-gray-400 mt-0.5">整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。</p>
      </div>
      <button v-if="activeTab === 'info'" class="btn-primary flex items-center gap-1 h-8 text-xs" @click="openAddModal">
        <Plus class="w-3.5 h-3.5" /> 增加竞品
      </button>
    </div>

    <!-- Stats -->
    <div class="px-6 pt-4 grid grid-cols-4 gap-3 flex-shrink-0">
      <div class="bg-white border border-gray-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-blue-500" />
          <span class="text-xs font-bold text-gray-500">本月新增竞品</span>
        </div>
        <div class="text-2xl font-extrabold text-gray-900 mt-1">12</div>
        <div class="text-[10px] text-gray-400 mt-0.5">直接竞争 7 / 间接竞争 5</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-orange-500" />
          <span class="text-xs font-bold text-gray-500">触发提醒</span>
        </div>
        <div class="text-2xl font-extrabold text-gray-900 mt-1">6</div>
        <div class="text-[10px] text-gray-400 mt-0.5">价格 / 排名 / 差评 / 功能变化</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <Search class="w-4 h-4 text-purple-500" />
          <span class="text-xs font-bold text-gray-500">实物/拆机分析</span>
        </div>
        <div class="text-2xl font-extrabold text-gray-900 mt-1">3</div>
        <div class="text-[10px] text-gray-400 mt-0.5">2 份体验报告 / 1 份拆机报告</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-green-500" />
          <span class="text-xs font-bold text-gray-500">转需求/异常</span>
        </div>
        <div class="text-2xl font-extrabold text-gray-900 mt-1">4</div>
        <div class="text-[10px] text-gray-400 mt-0.5">需求 3 / 紧急异常 1</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="px-6 pt-4 flex items-center gap-0 border-b border-gray-200 flex-shrink-0">
      <button
        v-for="tab in [{ key: 'info', label: '竞品信息' }, { key: 'market', label: '市场监控' }, { key: 'sentiment', label: '舆情监测' }]"
        :key="tab.key"
        class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors -mb-px"
        :class="activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = tab.key as any"
      >{{ tab.label }}</button>
    </div>

    <!-- ==================== Tab 1: 竞品信息 ==================== -->
    <div v-if="activeTab === 'info'" class="flex-1 overflow-auto">
      <!-- Filters -->
      <div class="px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <div class="relative flex-1 max-w-[200px]">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input v-model="filterName" placeholder="竞品名称" class="w-full pl-8 pr-3 h-8 text-xs border border-gray-300 rounded-md outline-none focus:border-blue-500 font-bold" />
        </div>
        <select v-model="filterChannel" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
          <option value="">全部渠道</option><option>海外</option><option>国内</option>
        </select>
        <select v-model="filterLine" class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white">
          <option value="">全部产品线</option><option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option>
        </select>
        <button class="btn-secondary text-[11px] h-7 px-3 ml-auto" @click="filterName='';filterChannel='';filterLine=''">重置</button>
        <button class="btn-secondary text-[11px] h-7 px-3 flex items-center gap-1"><BarChart3 class="w-3 h-3" /> 产品对比</button>
        <button class="btn-secondary text-[11px] h-7 px-3">导出</button>
      </div>

      <!-- Card Grid -->
      <div class="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="comp in filteredCompetitors"
          :key="comp.name"
          class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2.5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
          @click="openDetail(comp)"
        >
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700">品牌竞品</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-50 text-green-700">正常监控</span>
          </div>
          <h3 class="text-base font-extrabold text-gray-900 leading-tight">{{ comp.name }}</h3>
          <p class="text-xs text-gray-500">ASIN: {{ comp.asin }}</p>
          <div class="flex items-center gap-2 text-xs font-bold">
            <span class="text-gray-600">{{ comp.line }}</span>
            <span class="text-gray-400">/ {{ comp.price.startsWith('¥') ? '国内' : '海外' }}</span>
          </div>
          <strong class="text-lg font-extrabold text-gray-900">{{ comp.price }}</strong>
          <span class="text-xs text-gray-600 font-bold">{{ comp.channels }}</span>
          <div class="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100">
            <span v-for="(p, i) in comp.params.split(' / ')" :key="i" class="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[10px] font-extrabold">{{ p }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== Tab 2: 市场监控 ==================== -->
    <div v-if="activeTab === 'market'" class="flex-1 overflow-auto p-6 space-y-5">
      <!-- Market Triggers -->
      <div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">市场触发提醒</h3>
        <div class="space-y-2">
          <div v-for="(item, i) in marketTriggers" :key="i" class="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold flex-shrink-0" :class="item.level === 'L4' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">{{ item.level }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-extrabold text-gray-900">{{ item.item }}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ item.action }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-[10px] font-bold text-gray-400">{{ item.brand }}</span>
              <span class="block text-[10px] text-gray-400">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Market Dynamics Table -->
      <div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">市场动态</h3>
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">平台</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">品牌</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">产品</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">类别</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">排名</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">价格</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">评分</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">变化</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">触发</th>
                <th class="text-left px-2.5 py-2 font-extrabold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in marketDynamics" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-2.5 py-2 font-bold">{{ item.platform }}</td>
                <td class="px-2.5 py-2 font-bold">{{ item.brand }}</td>
                <td class="px-2.5 py-2 font-bold">{{ item.product }}</td>
                <td class="px-2.5 py-2">{{ item.category }}</td>
                <td class="px-2.5 py-2 font-bold">{{ item.rank }}</td>
                <td class="px-2.5 py-2 font-bold">{{ item.price }}</td>
                <td class="px-2.5 py-2">{{ item.rating }}</td>
                <td class="px-2.5 py-2 font-extrabold" :class="item.change.startsWith('-') ? 'text-green-600' : item.change.startsWith('+') ? 'text-red-500' : 'text-gray-600'">{{ item.change }}</td>
                <td class="px-2.5 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold" :class="item.trigger === 'L4' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">{{ item.trigger }}</span></td>
                <td class="px-2.5 py-2"><span class="text-[10px] font-bold" :class="item.action === '待处理' ? 'text-orange-600' : 'text-green-600'">{{ item.action }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== Tab 3: 舆情监测 ==================== -->
    <div v-if="activeTab === 'sentiment'" class="flex-1 overflow-auto p-6 space-y-5">
      <!-- AI Collection Stats -->
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">本周AI舆情采集</h3>
        <div class="grid grid-cols-6 gap-3">
          <div class="text-center p-2.5 bg-gray-50 rounded-lg" v-for="stat in [
            {label:'采集任务',value:5},{label:'成功',value:5},{label:'失败',value:0},{label:'商品数',value:45},{label:'新增评论',value:28},{label:'平均星级',value:'3.5'}
          ]" :key="stat.label">
            <div class="text-lg font-extrabold text-gray-900">{{ stat.value }}</div>
            <div class="text-[10px] text-gray-500 mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Star Distribution -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <h3 class="text-sm font-extrabold text-gray-900 mb-3">星级分布</h3>
          <div class="space-y-2">
            <div v-for="s in starDistribution" :key="s.star" class="flex items-center gap-2">
              <span class="text-xs font-bold w-12">{{ s.star }}星</span>
              <div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="{ width: (s.count / maxStar * 100) + '%', backgroundColor: s.color }"></div>
              </div>
              <span class="text-xs font-extrabold w-6 text-right">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Opinions -->
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <h3 class="text-sm font-extrabold text-gray-900 mb-3">观点汇总</h3>
          <div class="space-y-2">
            <div v-for="op in opinions" :key="op.sentiment" class="p-2.5 rounded-lg" :class="op.color">
              <div class="text-[11px] font-extrabold mb-1">{{ op.sentiment }}</div>
              <div class="flex flex-wrap gap-1">
                <span v-for="item in op.items" :key="item" class="px-2 py-0.5 rounded bg-white/50 text-[10px] font-bold">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typical Reviews -->
      <div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-3">典型评论与媒体线索</h3>
        <div class="space-y-2">
          <div v-for="(r, i) in typicalReviews" :key="i" class="bg-white border border-gray-200 rounded-lg p-3.5">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[10px] font-bold text-gray-500">{{ r.source }}</span>
              <span class="text-[10px] font-bold text-gray-400">|</span>
              <span class="text-[10px] font-bold text-gray-500">{{ r.brand }}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold ml-auto" :class="r.sentiment === '负向' ? 'bg-red-50 text-red-600' : r.sentiment === '正向' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'">{{ r.sentiment }}</span>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed font-bold">{{ r.content }}</p>
            <div class="flex gap-1.5 mt-1.5">
              <span v-for="kw in r.keywords.split(' / ')" :key="kw" class="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-600">{{ kw }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== Detail Drawer ==================== -->
    <div v-if="detailComp" class="fixed inset-y-0 right-0 z-40 w-[500px] bg-white shadow-2xl border-l border-gray-200 overflow-auto">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div>
          <span class="text-xs text-gray-400">竞品详情</span>
          <h3 class="text-sm font-extrabold text-gray-900">{{ detailComp.name }}</h3>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="detailComp = null"><X class="w-4 h-4" /></button>
      </div>
      <div class="p-5 space-y-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700">品牌竞品</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-50 text-green-700">正常监控</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">产品线</span>
            <strong class="block mt-0.5 text-sm">{{ detailComp.line }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">ASIN</span>
            <strong class="block mt-0.5 text-sm">{{ detailComp.asin }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">到手价</span>
            <strong class="block mt-0.5 text-sm">{{ detailComp.price }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">销售渠道</span>
            <strong class="block mt-0.5 text-sm">{{ detailComp.channels }}</strong>
          </div>
        </div>
        <div>
          <h4 class="text-xs font-extrabold text-gray-700 mb-1.5">核心卖点</h4>
          <div class="flex flex-wrap gap-1">
            <span v-for="(p, i) in detailComp.params.split(' / ')" :key="i" class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-extrabold">{{ p }}</span>
          </div>
        </div>
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button class="btn-secondary text-[11px] h-7 px-3">归档</button>
          <button class="btn-secondary text-[11px] h-7 px-3">解除监控</button>
          <button class="btn-secondary text-[11px] h-7 px-3">启动实物分析</button>
        </div>
      </div>
    </div>

    <!-- ==================== Add Modal ==================== -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">竞品信息</span>
            <h3 class="text-base font-extrabold text-gray-900">增加竞品</h3>
            <p class="text-[11px] text-gray-400">按竞品信息登记表填写，海外渠道必须补充 ASIN。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showAddModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 max-h-[65vh] overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">竞品名称</span><input v-model="newCompetitor.name" placeholder="例如 Withings Body Scan" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">渠道类型</span>
              <select v-model="newCompetitor.channelType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>海外</option><option>国内</option></select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">ASIN</span><input v-model="newCompetitor.asin" :placeholder="newCompetitor.channelType === '海外' ? '海外渠道必填' : '可不填'" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">产品线</span>
              <select v-model="newCompetitor.line" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option></select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">价格</span><input v-model="newCompetitor.price" placeholder="$39.99 / ¥399" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">渠道</span><input v-model="newCompetitor.channels" placeholder="Amazon / 天猫 / 京东" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          </div>
          <div class="mt-3">
            <span class="block text-[11px] font-bold text-gray-600 mb-1">竞品标签</span>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 text-xs font-bold text-gray-700"><input type="checkbox" :checked="newCompetitor.tags.includes('品牌竞品')" @change="toggleTag('品牌竞品')" /> 品牌竞品</label>
              <label class="flex items-center gap-1.5 text-xs font-bold text-gray-700"><input type="checkbox" :checked="newCompetitor.tags.includes('ODM竞品')" @change="toggleTag('ODM竞品')" /> ODM竞品</label>
            </div>
          </div>
          <label class="flex flex-col gap-1 mt-3"><span class="text-[11px] font-bold text-gray-600">备注</span>
            <textarea v-model="newCompetitor.params" rows="3" placeholder="补充核心卖点、功能差异等" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
          </label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="showAddModal = false">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="saveCompetitor">保存竞品</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">{{ toast.msg }}</div>
  </div>
</template>
