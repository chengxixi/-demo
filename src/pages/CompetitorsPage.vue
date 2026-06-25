<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Star, Filter, Trash2, Plus, Package } from 'lucide-vue-next'
import { competitorData, competitorParamFieldsMap, competitorProductTypeOptions } from '../api/mock-data'
import type { Competitor, CompetitorFieldDef, LevelRecord } from '../types'

// ===== 主Tab =====
const activeMainTab = ref<'market' | 'sentiment' | 'products'>('products')
const tabs = ['竞品信息', '市场监控', '舆情监测']

// ===== 统计 =====
const stats = [
  { label: '监控平台', value: '5', sub: 'Amazon/天猫/京东/抖音/独立站' },
  { label: '分析对象', value: '126', sub: '+18 本周' },
  { label: '价格异动', value: '23', sub: '+7 本周' },
  { label: '上新/卖点变化', value: '14', sub: '+5 本周' },
]

// ===== 竞品信息 =====
const allCompetitors = ref<Competitor[]>(JSON.parse(JSON.stringify(competitorData)))
const productLineFilter = ref('全部')
const productLines = ['全部', '八电极秤', '体脂秤', '筋膜枪']
const filteredCompetitors = computed(() => {
  if (productLineFilter.value === '全部') return allCompetitors.value
  return allCompetitors.value.filter(c => c.category === productLineFilter.value)
})

// 筛选面板
const showFilterPanel = ref(false)
const filterName = ref('')
const filterChannelType = ref('')
const filterAsin = ref('')
const filterLine = ref('')
const filterPrice = ref('')
const filterFilteredCompetitors = computed(() => {
  return allCompetitors.value.filter(c => {
    if (productLineFilter.value !== '全部' && c.category !== productLineFilter.value) return false
    const name = (c.brand + ' ' + c.name).toLowerCase()
    if (filterName.value && !name.includes(filterName.value.toLowerCase())) return false
    if (filterChannelType.value && c.channelType !== filterChannelType.value) return false
    if (filterAsin.value && !(c.asin || '').toUpperCase().includes(filterAsin.value.toUpperCase())) return false
    if (filterLine.value && c.category !== filterLine.value) return false
    if (filterPrice.value && !String(c.dealPrice).includes(filterPrice.value)) return false
    return true
  })
})
const resetFilters = () => {
  filterName.value = ''; filterChannelType.value = ''; filterAsin.value = ''
  filterLine.value = ''; filterPrice.value = ''
}

// ===== 详情页 =====
const selectedCompetitor = ref<Competitor | null>(null)
const showDetail = ref(false)
const levelRecords = ref<LevelRecord[]>([])
const showArchive = ref(false)
const showPhysicalAnalysis = ref(false)

function getLevelRecords(): LevelRecord[] {
  const c = selectedCompetitor.value
  if (!c) return []
  return [
    { level: 'L1', source: '日常监控', content: `${c.brand} ${c.name} 页面卖点与价格无明显变化。`, action: '继续监控', status: '展示', date: '2026-06-03' },
    { level: 'L2', source: '价格/排名', content: `${c.name} 价格小幅波动，未形成明确业务影响。`, action: '继续监控', status: '展示', date: '2026-06-09' },
    { level: 'L3', source: '触发提醒', content: `${c.name} 近7天价格、排名或差评趋势变化明显。`, action: '转入需求', status: '已提醒产品经理', date: '2026-06-15' },
    { level: 'L4', source: '紧急提醒', content: `${c.name} 出现关键功能变化，需要实物分析确认。`, action: '启动实物分析', status: '处理中', date: '2026-06-18' },
  ]
}

function openDetail(c: Competitor) {
  selectedCompetitor.value = c
  levelRecords.value = getLevelRecords()
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedCompetitor.value = null
}

function toggleArchive(c: Competitor) {
  c.archived = !c.archived
  c.monitorStatus = c.archived ? '已归档' : '正常监控'
  showArchive.value = c.archived
}

function toggleMonitor(c: Competitor) {
  if (c.monitorStatus === '已解除监控') {
    c.monitorStatus = '正常监控'
  } else {
    c.monitorStatus = '已解除监控'
  }
}

// ===== 产品对比 =====
const showCompare = ref(false)
const compareSlots = ref([0, 1, -1, -1]) // indices into allCompetitors
function toggleCompare() { showCompare.value = !showCompare.value }
function getCompareProducts() {
  return compareSlots.value
    .filter(i => i >= 0 && i < allCompetitors.value.length)
    .map(i => allCompetitors.value[i])
}
const compareFields = computed(() => {
  const prods = getCompareProducts()
  if (prods.length < 2) return []
  const groups: { group: string; label: string; values: string[] }[] = []
  const rows = [
    { group: '基础档案', label: '竞品类型', key: 'type' },
    { group: '基础档案', label: '产品类型', key: 'productType' },
    { group: '基础档案', label: '型号', key: 'model' },
    { group: '基础档案', label: '定位', key: 'position' },
    { group: '价格与评价', label: '到手价', key: 'dealPrice' },
    { group: '价格与评价', label: '评分', key: 'rating' },
    { group: '价格与评价', label: '评论数', key: 'reviews' },
    { group: '痛点与风险', label: '核心卖点', key: 'sellingPoints' },
    { group: '痛点与风险', label: '用户痛点', key: 'pain' },
  ]
  for (const row of rows) {
    groups.push({
      group: row.group,
      label: row.label,
      values: prods.map(p => String((p as any)[row.key] || '')),
    })
  }
  return groups
})
function setCompareSlot(slotIdx: number, competitorIdx: number) {
  compareSlots.value[slotIdx] = competitorIdx
}

// ===== 登记参数分组（详情页展示用） =====
const scaleDetailGroups: [string, string[]][] = [
  ['基础信息', ['竞品类型','内部竞品','品牌','产品名称','产品型号','产品类型','产品定位','上市时间','销售平台','销售区域','竞品链接','信息来源','信息采集日期','信息采集人','信息状态']],
  ['销售信息', ['官方售价','到手价','币种','价格区间']],
  ['外观结构', ['长度(mm)','宽度(mm)','厚度(mm)','产品重量(kg)','玻璃类型','玻璃厚度','底壳结构','机身材质','表面工艺','颜色','按键类型','防滑脚垫','秤面站位引导']],
  ['电极系统', ['是否支持测脂','电极类型','电极数量','脚部电极数量','手部电极数量','是否有手柄','手柄类型','手柄连接方式']],
  ['称重系统', ['起称重量','最大称重','分度值','单位切换','传感器类型','称重精度说明']],
  ['测量系统', ['APP测量指标','本机测量/显示指标','测量频率','运动员模式','孕妇模式','婴儿模式','访客模式','宠物/抱婴称重模式']],
  ['显示系统', ['屏幕类型','屏幕尺寸','屏幕位置','屏幕显示语言','用户识别显示','趋势/等级显示']],
  ['智能系统', ['APP连接','APP名称','连接方式','OTA升级','数据同步/生态接入','多用户识别','自动用户识别','历史数据趋势','家庭成员管理','数据报告形式']],
  ['电源系统', ['供电方式','电池数量','Type-C充电','续航时间','低电提示']],
  ['包装配件', ['包装形式','包装语言','说明书','电池']],
]
const massageDetailGroups: [string, string[]][] = [
  ['基础信息', ['竞品类型','内部竞品','品牌','产品名称','产品型号','产品类型','产品定位','上市时间','销售平台','销售区域','竞品链接','信息来源','信息采集日期','信息采集人','信息状态']],
  ['销售信息', ['官方售价','到手价','币种','价格区间']],
  ['外观结构', ['长度(mm)','宽度(mm)','厚度/高度(mm)','产品净重(g)','机身材质','表面工艺','颜色','握持方式','防滑设计','人体工学设计']],
  ['动力系统', ['电机类型','振幅/冲程(mm)','最大推力','最低转速(rpm)','最高转速(rpm)','噪音(dB)','档位数量','力度体验备注']],
  ['电源系统', ['电池容量(mAh)','电池类型','官方续航时间','充电接口','快充功能','低电提示']],
  ['按摩头系统', ['按摩头数量','按摩头类型','按摩头连接方式','按摩头材质']],
  ['功能系统', ['压力感应','智能档位','档位记忆','定时保护','自动模式','热敷功能','冷敷功能']],
  ['智能系统', ['通信方式','APP名称','APP核心功能']],
  ['包装配件', ['包装形式','包装语言','收纳包','充电线','说明书']],
]

// ===== 增加竞品 Modal =====
const showAddModal = ref(false)
const newName = ref('')
const newChannelType = ref('海外')
const newAsin = ref('')
const newLine = ref('八电极秤')
const newPrice = ref('')
const newChannels = ref('')
const newTags = ref<string[]>(['品牌竞品'])
const newRemark = ref('')
const formError = ref('')
const fieldPlan = ref('完整信息登记')

function getParamFields(): CompetitorFieldDef[] {
  return competitorParamFieldsMap[newLine.value] || []
}

function isFieldVisible(field: CompetitorFieldDef): boolean {
  const plan = fieldPlan.value
  if (plan === '完整信息登记') return true
  if (plan === '快速登记（仅必填）') return field.required
  if (plan === '基础信息+销售') return field.category === '基础信息' || field.category === '销售信息'
  return true
}

const paramValues = ref<Record<string, string>>({})
function initParamValues() {
  const vals: Record<string, string> = {}
  for (const f of getParamFields()) {
    vals[f.name] = ''
  }
  vals['信息采集日期'] = new Date().toISOString().slice(0, 10)
  paramValues.value = vals
}

function toggleTag(tag: string) {
  if (newTags.value.includes(tag)) {
    if (newTags.value.length > 1) newTags.value = newTags.value.filter(t => t !== tag)
  } else {
    newTags.value.push(tag)
  }
}

function openAddModal() {
  formError.value = ''
  newName.value = ''
  newChannelType.value = '海外'
  newAsin.value = ''
  newLine.value = '八电极秤'
  newPrice.value = ''
  newChannels.value = ''
  newTags.value = ['品牌竞品']
  newRemark.value = ''
  fieldPlan.value = '完整信息登记'
  initParamValues()
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  formError.value = ''
}

function onLineChange() {
  initParamValues()
}

function saveCompetitor() {
  formError.value = ''
  if (newChannelType.value === '海外' && !newAsin.value.trim()) {
    formError.value = '海外竞品渠道必须填写 ASIN。'
    return
  }
  if (!newName.value.trim()) {
    formError.value = '请填写竞品名称。'
    return
  }
  const missingRequired: string[] = []
  for (const f of getParamFields()) {
    if (f.required && !paramValues.value[f.name]?.trim()) {
      missingRequired.push(f.name)
    }
  }
  if (missingRequired.length) {
    fieldPlan.value = '完整信息登记'
    setTimeout(() => {
      formError.value = `请补充必填字段：${missingRequired.join('、')}。`
    }, 50)
    return
  }

  const tags = newTags.value.length ? newTags.value : ['品牌竞品']
  const paramsList = getParamFields().map(f => `${f.name}: ${paramValues.value[f.name] || '待补充'}`)
  const item: Competitor = {
    id: `cp-${Date.now()}`,
    category: newLine.value,
    type: paramValues.value['竞品类型'] || '直接竞争产品',
    brand: paramValues.value['品牌'] || '新竞品',
    name: newName.value.trim(),
    model: paramValues.value['产品型号'] || '待补充',
    productType: paramValues.value['产品类型'] || newLine.value,
    position: paramValues.value['产品定位'] || '待定',
    launch: paramValues.value['上市时间'] || '待补充',
    platform: paramValues.value['销售平台'] || newChannels.value || '待补充',
    region: paramValues.value['销售区域'] || '待补充',
    officialPrice: paramValues.value['官方售价'] || newPrice.value || '待补充',
    dealPrice: paramValues.value['到手价'] || newPrice.value || '待补充',
    rating: '--',
    reviews: '0',
    sellingPoints: newRemark.value ? [newRemark.value] : [],
    specs: {},
    pain: '',
    channelType: newChannelType.value,
    asin: newAsin.value.trim() || '国内渠道未填写',
    price: parseFloat(newPrice.value) || undefined,
    channels: newChannels.value,
    tags,
    params: [...paramsList, newRemark.value].filter(Boolean).join('；'),
    monitorStatus: '正常监控',
    archived: false,
    registerFields: { ...paramValues.value },
  }
  allCompetitors.value.unshift(item)
  closeAddModal()
}

// 实物分析
const physicalAnalysis = ref({
  status: '待上传报告',
  owner: '',
  deadline: '',
  triggerSource: 'L4 紧急提醒',
  analysisType: '实物分析 + 拆机分析 + 产品体验',
  focusItems: '',
  conclusion: '',
})

function startPhysicalAnalysis(c: Competitor) {
  selectedCompetitor.value = c
  showPhysicalAnalysis.value = true
  physicalAnalysis.value = {
    status: '待上传报告',
    owner: '',
    deadline: '',
    triggerSource: 'L4 紧急提醒',
    analysisType: '实物分析 + 拆机分析 + 产品体验',
    focusItems: '',
    conclusion: '',
  }
}

// 收藏/对比选择
const compareChecked = ref<Set<string>>(new Set())
function toggleCompareCheck(id: string) {
  if (compareChecked.value.has(id)) {
    compareChecked.value.delete(id)
  } else {
    if (compareChecked.value.size >= 4) return
    compareChecked.value.add(id)
  }
}
function startCompare() {
  const checked = Array.from(compareChecked.value)
  if (checked.length < 2) return
  compareSlots.value = [-1, -1, -1, -1]
  checked.forEach((id, i) => {
    const idx = allCompetitors.value.findIndex(c => c.id === id)
    if (idx >= 0) compareSlots.value[i] = idx
  })
  showCompare.value = true
}

// ===== 市场监控数据 =====
const alerts = [
  { level: 'L4', event: 'Withings 新增心率/血管年龄卖点', action: '建议进入换代功能机会评估', brand: 'Withings', type: '功能变化' },
  { level: 'L3', event: 'RENPHO 近7天价格下降18%', action: '跟进价格带和促销节奏', brand: 'RENPHO', type: '价格变化' },
  { level: 'L3', event: '华为八电极秤大促排名上升', action: '复盘国内高端秤卖点结构', brand: '华为', type: '排名变化' },
]

interface MarketDynamic {
  platform: string; brand: string; product: string; category: string; rank: string; price: string; rating: string; reviews: string; change: string; event: string; trigger: string; plan: string; handled: boolean; date: string
}
const dynamics: MarketDynamic[] = [
  { platform: 'Amazon US', brand: 'RENPHO', product: 'Elis 1 Smart Scale', category: '四电极体脂秤', rank: '#8', price: '$39.99', rating: '4.6', reviews: '23,400', change: '价格 -18%', event: '促销', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-18' },
  { platform: 'Amazon US', brand: 'Withings', product: 'Body Scan', category: '八电极体脂秤', rank: '#24', price: '$99.00', rating: '4.4', reviews: '8,920', change: '新增心率/血管年龄', event: '上新', trigger: 'L4', plan: '启动实物分析', handled: true, date: '2026-06-18' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤 3 Pro', category: '八电极体脂秤', rank: '类目第3', price: '¥399', rating: '4.8', reviews: '18,260', change: '618预售上升', event: '排名', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-19' },
  { platform: '京东', brand: '小米', product: '体脂秤 S400 Pro', category: '四电极体脂秤', rank: '类目第5', price: '¥179', rating: '4.7', reviews: '52,100', change: '低价型号放量', event: '价格', trigger: 'L2', plan: '', handled: false, date: '2026-06-10' },
  { platform: '独立站', brand: 'Wyze', product: 'Scale X', category: '体脂秤', rank: '自然流量上升', price: '$33.99', rating: '4.2', reviews: '4,700', change: '套餐包上线', event: '上新', trigger: 'L1', plan: '', handled: false, date: '2026-06-12' },
  { platform: '抖音', brand: '倍轻松', product: 'M5 筋膜枪', category: '筋膜枪', rank: '热销榜第7', price: '¥499', rating: '4.6', reviews: '9,840', change: '达人视频曝光增加', event: '内容', trigger: 'L3', plan: '', handled: false, date: '2026-06-21' },
]

const handleTarget = ref('')
const showHandleModal = ref(false)
function openHandleDialog(target: string) {
  handleTarget.value = target
  showHandleModal.value = true
}
function selectHandlePlan(plan: string) {
  const d = dynamics.find(d => d.brand + ' ' + d.product === handleTarget.value)
  if (d) {
    d.plan = plan
    d.handled = true
  }
  showHandleModal.value = false
}

// 舆情数据
const sentimentCards = [
  { label: '任务数', value: '12' },
  { label: '成功', value: '11' },
  { label: '失败', value: '1' },
  { label: '商品', value: '38' },
  { label: '新增评论', value: '1,240' },
  { label: '平均星级', value: '4.3' },
]
const starDistribution = [5, 4.2, 3.5, 2.1, 1.3]
const positiveOpinions = [
  { source: 'Amazon', brand: 'RENPHO', sentiment: '正面', tag: '性价比', text: 'Great value for the price, accurate measurements and easy app setup.' },
  { source: '天猫', brand: '华为', sentiment: '正面', tag: '生态体验', text: '华为全家桶用户，体重体脂数据自动同步，非常方便。' },
]
const negativeOpinions = [
  { source: 'Amazon', brand: 'Withings', sentiment: '负面', tag: '价格', text: 'Way too expensive for what it does. App is slow and measurements are inconsistent.' },
  { source: '京东', brand: '小米', sentiment: '负面', tag: '连接', text: '蓝牙经常断开，需要重新配对，体验很差。' },
]
const unmetNeeds = [
  { need: '离线本机测量显示', desc: '用户期望不打开手机App也能在秤上直接查看体脂数据。' },
  { need: '充电式供电', desc: '海外用户偏好USB充电而非频繁更换AAA电池。' },
]

// 监控快照模拟数据
const monitorSnapshotWeeks = ['W1', 'W2', 'W3', 'W4']
const monitorSnapshotItems = [
  { key: 'avgPrice', label: '近期成交均价', desc: '海外/国内主渠道近7日平均成交价' },
  { key: 'gmvBsr', label: 'GMV/BSR排名', desc: 'GMV(万)或BSR排名' },
  { key: 'salesVolume', label: '销量（运营评估）', desc: '运营评估销量' },
  { key: 'rating', label: '评分', desc: '产品评分' },
  { key: 'newFeature', label: '新功能', desc: '竞品新增功能或卖点' },
  { key: 'promoEvent', label: '促销活动', desc: '近期促销活动及力度' },
  { key: 'stockStatus', label: '库存状态', desc: '缺货/断货/正常' },
  { key: 'listingChange', label: 'Listing变动', desc: '标题/图片/A+页面变更' },
]
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <span class="page-header-sub">竞品分析</span>
        <h1>竞品分析</h1>
        <p>整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-sub">{{ s.sub }}</div>
      </div>
    </div>

    <!-- 主Tab -->
    <div class="tabs-row compact-tabs">
      <button v-for="t in tabs" :key="t" :class="{ active: activeMainTab === (t === '竞品信息' ? 'products' : t === '市场监控' ? 'market' : 'sentiment') }"
        @click="activeMainTab = t === '竞品信息' ? 'products' : t === '市场监控' ? 'market' : 'sentiment'">
        {{ t }}
      </button>
    </div>

    <div class="page-body" v-if="showDetail">
      <!-- ==================== 竞品详情页 ==================== -->
      <section class="local-competitor-detail-page">
        <div class="local-page-head">
          <div>
            <h2>竞品详情
              <span class="monitor-badge" :class="{
                'monitor-normal': selectedCompetitor?.monitorStatus === '正常监控',
                'monitor-stopped': selectedCompetitor?.monitorStatus === '已解除监控',
                'monitor-archived': selectedCompetitor?.monitorStatus === '已归档',
              }">{{ selectedCompetitor?.monitorStatus || '正常监控' }}</span>
            </h2>
            <p style="color:#475467;font-size:13px;">{{ selectedCompetitor?.brand }} {{ selectedCompetitor?.name }} / {{ selectedCompetitor?.model }} / {{ selectedCompetitor?.productType }} / {{ selectedCompetitor?.platform }}</p>
          </div>
          <div class="local-page-actions">
            <button class="secondary-button" @click="closeDetail">返回竞品列表</button>
            <button class="secondary-button" @click="toggleArchive(selectedCompetitor!)">
              {{ selectedCompetitor?.archived ? '取消归档' : '归档' }}
            </button>
            <button class="monitor-toggle-button" :class="{ active: selectedCompetitor?.monitorStatus === '已解除监控' }" @click="toggleMonitor(selectedCompetitor!)">
              {{ selectedCompetitor?.monitorStatus === '已解除监控' ? '持续监控' : '解除监控' }}
            </button>
            <button class="primary-button" @click="startPhysicalAnalysis(selectedCompetitor!)">启动实物分析</button>
          </div>
        </div>

        <!-- 基本信息网格 -->
        <div class="local-detail-grid">
          <div class="field-item"><span>竞品类型</span><strong>{{ selectedCompetitor?.type }}</strong></div>
          <div class="field-item"><span>产品类型</span><strong>{{ selectedCompetitor?.productType }}</strong></div>
          <div class="field-item"><span>产品定位</span><strong>{{ selectedCompetitor?.position }}</strong></div>
          <div class="field-item"><span>上市时间</span><strong>{{ selectedCompetitor?.launch }}</strong></div>
          <div class="field-item"><span>销售平台</span><strong>{{ selectedCompetitor?.platform }}</strong></div>
          <div class="field-item"><span>销售区域</span><strong>{{ selectedCompetitor?.region }}</strong></div>
          <div class="field-item"><span>官方售价</span><strong>{{ selectedCompetitor?.officialPrice }}</strong></div>
          <div class="field-item"><span>到手价</span><strong style="color:#e5484d;">{{ selectedCompetitor?.dealPrice }}</strong></div>
          <div class="field-item"><span>评分</span><strong>{{ selectedCompetitor?.rating }}</strong></div>
          <div class="field-item"><span>评论数</span><strong>{{ selectedCompetitor?.reviews }}</strong></div>
          <div class="field-item"><span>规格参数</span><strong>{{ typeof selectedCompetitor?.specs === 'string' ? selectedCompetitor?.specs : '' }}</strong></div>
          <div class="field-item"><span>产品型号</span><strong>{{ selectedCompetitor?.model }}</strong></div>
        </div>

        <div class="local-page-grid two">
          <article class="local-module-card">
            <h3>核心卖点</h3>
            <p>{{ typeof selectedCompetitor?.sellingPoints === 'string' ? selectedCompetitor?.sellingPoints.replaceAll(' / ', '、') : (selectedCompetitor?.sellingPoints || []).join('、') }}</p>
          </article>
          <article class="local-module-card">
            <h3>用户痛点</h3>
            <p>{{ selectedCompetitor?.pain }}</p>
          </article>
        </div>

        <!-- 登记参数 -->
        <section class="panel" style="margin-top:16px;">
          <div class="panel-title">竞品信息登记表字段</div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
            <template v-for="[group, fields] in (selectedCompetitor?.category === '筋膜枪' ? massageDetailGroups : scaleDetailGroups)" :key="group">
              <div class="param-group-divider">{{ group }}</div>
              <div v-for="fn in fields" :key="fn" class="field-item">
                <span>{{ fn }}</span>
                <strong>{{ selectedCompetitor?.registerFields?.[fn] || '待补充' }}</strong>
              </div>
            </template>
          </div>
        </section>

        <!-- L1-L4 监控记录 -->
        <section class="panel" style="margin-top:16px;">
          <div class="panel-title">L1-L4 监控记录</div>
          <table class="local-competition-table">
            <thead><tr><th>等级</th><th>触发来源</th><th>记录内容</th><th>最新处理方案</th><th>状态</th><th>记录时间</th></tr></thead>
            <tbody>
              <tr v-for="row in levelRecords" :key="row.date + row.level">
                <td><span class="pill" :class="row.level === 'L4' ? 'p1' : row.level === 'L3' ? 'p2' : 'p3'">{{ row.level }}</span></td>
                <td>{{ row.source }}</td>
                <td>{{ row.content }}</td>
                <td>{{ row.action }}</td>
                <td>{{ row.status }}</td>
                <td>{{ row.date }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 归档记录 -->
        <div v-if="selectedCompetitor?.archived || showArchive" style="margin-top:16px;">
          <section class="panel">
            <div class="panel-title">归档记录</div>
            <div class="local-detail-grid">
              <article><span>监控状态</span><strong>{{ selectedCompetitor?.monitorStatus || '正常监控' }}</strong></article>
              <article><span>归档时间</span><strong>2026-06-22</strong></article>
              <article><span>归档说明</span><strong>保留历史记录，后续如再次出现变化可重新启动日常监控。</strong></article>
            </div>
          </section>
        </div>

        <!-- 实物分析 -->
        <section v-if="showPhysicalAnalysis" class="panel" style="margin-top:16px;">
          <div class="panel-title">实物分析信息</div>
          <div class="local-modal-grid">
            <label><span>竞品对象</span><input :value="`${selectedCompetitor?.brand} ${selectedCompetitor?.name}`" readonly /></label>
            <label><span>分析状态</span>
              <select v-model="physicalAnalysis.status">
                <option>待上传报告</option><option>分析中</option><option>已完成</option><option>已归档</option>
              </select>
            </label>
            <label><span>负责人</span><input v-model="physicalAnalysis.owner" placeholder="填写产品经理或分析负责人" /></label>
            <label><span>计划完成时间</span><input type="date" v-model="physicalAnalysis.deadline" /></label>
            <label><span>触发来源</span>
              <select v-model="physicalAnalysis.triggerSource">
                <option>L4 紧急提醒</option><option>L3 触发提醒</option><option>产品经理主动发起</option>
              </select>
            </label>
            <label><span>分析类型</span>
              <select v-model="physicalAnalysis.analysisType">
                <option>实物分析 + 拆机分析 + 产品体验</option>
                <option>仅产品体验</option><option>仅拆机分析</option><option>专项对标</option>
              </select>
            </label>
            <label class="wide"><span>上传拆机分析报告</span><input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx" /></label>
            <label class="wide"><span>上传产品体验报告</span><input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx" /></label>
            <label class="wide"><span>重点验证项</span><textarea rows="3" v-model="physicalAnalysis.focusItems" placeholder="填写需要重点验证的结构、功能、体验、包装、APP或风险点"></textarea></label>
            <label class="wide"><span>分析结论</span><textarea rows="3" v-model="physicalAnalysis.conclusion" placeholder="后续补充分析结论、可借鉴点、风险判断和下一步建议"></textarea></label>
          </div>
        </section>

        <!-- 监控快照 -->
        <section class="panel" style="margin-top:16px;">
          <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;">
            <span>竞品监控快照 — {{ selectedCompetitor?.brand }} {{ selectedCompetitor?.name }}</span>
            <button class="secondary-button" style="font-size:12px;padding:4px 12px;">记录本周快照</button>
          </div>
          <p style="color:#666;font-size:12px;margin-bottom:12px;">定时监控该竞品核心指标，每周记录形成历史快照，支持趋势回顾。</p>
          <div style="overflow-x:auto;">
            <table class="data-table local-monitor-table">
              <thead>
                <tr>
                  <th style="min-width:200px;position:sticky;left:0;background:#eef2ff;z-index:1;">监控项</th>
                  <th style="min-width:100px;">登记人</th>
                  <th v-for="w in monitorSnapshotWeeks" :key="w" style="min-width:80px;">{{ w }}</th>
                  <th style="min-width:90px;">本周</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in monitorSnapshotItems" :key="item.key">
                  <td style="position:sticky;left:0;background:#fff;font-weight:600;">{{ item.label }}<br><small style="color:#999;">{{ item.desc }}</small></td>
                  <td>胡锦弘</td>
                  <td v-for="w in monitorSnapshotWeeks" :key="w">--</td>
                  <td>--</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>

    <div class="page-body" v-else>
      <!-- ==================== 市场监控 ==================== -->
      <div v-if="activeMainTab === 'market'">
        <div class="alerts-row">
          <div v-for="a in alerts" :key="a.event" class="alert-card" :class="'level-' + a.level.toLowerCase()">
            <div class="alert-level" :class="'lvl-' + a.level.toLowerCase()">L{{ a.level.replace('L','') }}</div>
            <div class="alert-body">
              <strong>{{ a.event }}</strong>
              <p>{{ a.action }}</p>
              <span class="alert-meta">{{ a.brand }} / {{ a.type }}</span>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="font-size:16px;">跨平台竞品动态</h3>
            <button class="primary-button" style="font-size:12px;">生成分析任务</button>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>平台</th><th>品牌</th><th>产品</th><th>类别</th><th>排名</th><th>价格</th><th>评分</th><th>评论数</th><th>变化</th><th>事件</th><th>触发</th><th>最新处理方案</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in dynamics" :key="d.platform + d.product">
                  <td><span class="source-chip">{{ d.platform }}</span></td>
                  <td>{{ d.brand }}</td>
                  <td class="model-name">{{ d.product }}</td>
                  <td>{{ d.category }}</td>
                  <td>{{ d.rank }}</td>
                  <td>{{ d.price }}</td>
                  <td>{{ d.rating }}</td>
                  <td>{{ d.reviews }}</td>
                  <td :class="d.change.includes('-') ? 'bad-text' : 'good-text'">{{ d.change }}</td>
                  <td>{{ d.event }}</td>
                  <td>
                    <span class="pill" :class="d.trigger === 'L4' ? 'p1' : d.trigger === 'L3' ? 'p2' : 'p3'">{{ d.trigger }}</span>
                  </td>
                  <td>
                    <template v-if="d.handled">{{ d.plan }}</template>
                    <template v-else-if="d.trigger === 'L1' || d.trigger === 'L2'">--</template>
                    <template v-else>未处理</template>
                  </td>
                  <td>
                    <button v-if="(d.trigger === 'L3' || d.trigger === 'L4') && !d.handled" class="secondary-button" style="font-size:11px;padding:3px 10px;" @click="openHandleDialog(d.brand + ' ' + d.product)">处理</button>
                    <span v-else-if="d.handled" class="status-pill">已完成</span>
                    <span v-else>--</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================== 舆情监测 ==================== -->
      <div v-if="activeMainTab === 'sentiment'">
        <div class="stats-grid" style="grid-template-columns:repeat(6,1fr);">
          <div v-for="s in sentimentCards" :key="s.label" class="stat-card">
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-value" style="font-size:22px;">{{ s.value }}</div>
          </div>
        </div>

        <div class="local-page-grid two" style="margin-top:20px;">
          <section class="panel">
            <div class="panel-title">星级分布（k）</div>
            <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
              <template v-for="(val, i) in starDistribution" :key="i">
                <div style="display:flex;align-items:center;gap:4px;">
                  <Star style="width:14px;height:14px;color:#f59e0b;" />
                  <span style="font-size:12px;font-weight:600;">{{ 5-i }}星</span>
                </div>
                <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
                  <div :style="{ width: (val / 5 * 100) + '%', height: '100%', background: i === 0 ? '#22c55e' : i === 1 ? '#84cc16' : i === 2 ? '#eab308' : i === 3 ? '#f97316' : '#ef4444', borderRadius: '4px' }"></div>
                </div>
                <span style="font-size:12px;font-weight:700;min-width:30px;">{{ val }}k</span>
              </template>
            </div>
          </section>

          <section class="panel">
            <div class="panel-title">正向观点 Top</div>
            <div v-for="o in positiveOpinions" :key="o.text" class="opinion-card" style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <div style="display:flex;gap:6px;margin-bottom:4px;">
                <span class="chip small green">{{ o.tag }}</span>
                <span style="font-size:11px;color:#999;">{{ o.source }} / {{ o.brand }}</span>
              </div>
              <p style="font-size:12px;color:#475467;">{{ o.text }}</p>
            </div>
          </section>
        </div>

        <div class="local-page-grid two" style="margin-top:16px;">
          <section class="panel">
            <div class="panel-title">负向观点 Top</div>
            <div v-for="o in negativeOpinions" :key="o.text" class="opinion-card" style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <div style="display:flex;gap:6px;margin-bottom:4px;">
                <span class="chip small red">{{ o.tag }}</span>
                <span style="font-size:11px;color:#999;">{{ o.source }} / {{ o.brand }}</span>
              </div>
              <p style="font-size:12px;color:#475467;">{{ o.text }}</p>
            </div>
          </section>

          <section class="panel">
            <div class="panel-title">未满足需求</div>
            <div v-for="n in unmetNeeds" :key="n.need" style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
              <strong style="font-size:13px;">{{ n.need }}</strong>
              <p style="font-size:12px;color:#475467;margin-top:4px;">{{ n.desc }}</p>
            </div>
          </section>
        </div>
      </div>

      <!-- ==================== 竞品信息 ==================== -->
      <div v-if="activeMainTab === 'products'">
        <!-- 按钮行 -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
          <button class="primary-button" @click="openAddModal">增加竞品</button>
        </div>

        <!-- 筛选面板 -->
        <div class="local-fixed-filter-panel">
          <label>竞品名称<input type="text" placeholder="品牌/产品名称" v-model="filterName" /></label>
          <label>渠道类型
            <select v-model="filterChannelType">
              <option value="">全部</option><option>海外</option><option>国内</option>
            </select>
          </label>
          <label>ASIN<input type="text" placeholder="海外渠道必填" v-model="filterAsin" /></label>
          <label>产品线
            <select v-model="filterLine">
              <option value="">全部</option><option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option>
            </select>
          </label>
          <label>价格<input type="text" placeholder="输入价格" v-model="filterPrice" /></label>
          <label class="local-filter-actions"><button class="secondary-button" @click="resetFilters">重置</button></label>
          <label class="local-filter-actions" style="margin-left:auto;display:flex;gap:8px;">
            <button class="secondary-button" @click="startCompare">产品对比</button>
            <button class="secondary-button">导出</button>
          </label>
        </div>

        <!-- 产品卡片网格 -->
        <div class="product-card-grid">
          <article v-for="c in filterFilteredCompetitors" :key="c.id" class="product-card" @click="openDetail(c)">
            <div class="product-card-head">
              <span class="source-chip">{{ c.type }}</span>
              <span class="monitor-badge" :class="{
                'monitor-normal': c.monitorStatus === '正常监控',
                'monitor-stopped': c.monitorStatus === '已解除监控',
                'monitor-archived': c.monitorStatus === '已归档',
              }">{{ c.monitorStatus || '正常监控' }}</span>
            </div>
            <strong>{{ c.brand }} {{ c.name }}</strong>
            <em>{{ c.productType }} / {{ c.position }}</em>
            <div class="product-price-row"><b>{{ c.dealPrice }}</b><span>{{ c.platform }}</span></div>
            <p>{{ typeof c.sellingPoints === 'string' ? c.sellingPoints : c.sellingPoints.join(' / ') }}</p>
          </article>
        </div>

        <!-- 增加竞品按钮也放在底部备用 -->
        <div v-if="filterFilteredCompetitors.length === 0" style="text-align:center;padding:40px;color:#999;">
          <Package style="width:48px;height:48px;margin:0 auto 12px;color:#ccc;" />
          <p>暂无竞品数据</p>
          <button class="primary-button" style="margin-top:12px;" @click="openAddModal">增加竞品</button>
        </div>
      </div>
    </div>

    <!-- ==================== 产品对比抽屉 ==================== -->
    <Teleport to="body">
      <div v-if="showCompare" class="modal-overlay" @click.self="showCompare = false">
        <div class="modal-content compare-modal">
          <div class="modal-head">
            <div><h2>产品对比</h2><p>已选 {{ getCompareProducts().length }}/4 个产品</p></div>
            <button class="icon-button" @click="showCompare = false">×</button>
          </div>
          <div class="compare-picker">
            <label v-for="(slot, i) in compareSlots" :key="i" class="compare-slot" :class="{ active: slot >= 0 }">
              <span>对比产品 {{ i + 1 }}</span>
              <select :value="slot" @change="setCompareSlot(i, Number(($event.target as HTMLSelectElement).value))">
                <option :value="-1">请选择产品</option>
                <option v-for="(c, ci) in allCompetitors" :key="c.id" :value="ci">{{ c.brand }} {{ c.name }}</option>
              </select>
              <em v-if="slot >= 0">{{ allCompetitors[slot]?.productType }} / {{ allCompetitors[slot]?.dealPrice }}</em>
              <em v-else>未选择</em>
            </label>
          </div>
          <div v-if="getCompareProducts().length >= 2" class="compare-table-wrap">
            <table class="data-table compact">
              <thead>
                <tr>
                  <th>字段</th>
                  <th v-for="p in getCompareProducts()" :key="p.id">{{ p.brand }} {{ p.name }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, ri) in compareFields" :key="ri">
                  <tr v-if="ri === 0 || compareFields[ri-1].group !== row.group" class="compare-group-row">
                    <td :colspan="getCompareProducts().length + 1">{{ row.group }}</td>
                  </tr>
                  <tr>
                    <td>{{ row.label }}</td>
                    <td v-for="(val, vi) in row.values" :key="vi">{{ val }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div v-else style="text-align:center;padding:40px;color:#999;">请至少选择 2 个产品进行对比</div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 增加竞品 Modal ==================== -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content add-competitor-modal">
          <div class="modal-head">
            <div><span style="color:#667085;font-size:12px;">竞品信息</span><h2>增加竞品</h2><p>按竞品信息登记表填写，海外渠道必须补充 ASIN。</p></div>
            <button class="icon-button" @click="closeAddModal">×</button>
          </div>
          <div class="local-modal-grid">
            <label>竞品名称<input v-model="newName" placeholder="例如 Withings Body Scan" /></label>
            <label>渠道类型<select v-model="newChannelType"><option>海外</option><option>国内</option></select></label>
            <label>ASIN<input v-model="newAsin" :placeholder="newChannelType === '海外' ? '海外渠道必填 ASIN' : '国内渠道可不填写'" /></label>
            <label>产品线<select v-model="newLine" @change="onLineChange"><option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option></select></label>
            <label>价格<input v-model="newPrice" placeholder="$39.99 / ¥399" /></label>
            <label class="wide">渠道<input v-model="newChannels" placeholder="Amazon / 天猫 / 京东 / 抖音" /></label>
            <div class="wide">
              <span style="display:block;margin-bottom:6px;color:#475467;font-size:12px;font-weight:800;">竞品标签</span>
              <div class="local-check-row">
                <label><input type="checkbox" value="品牌竞品" :checked="newTags.includes('品牌竞品')" @change="toggleTag('品牌竞品')" /> 品牌竞品</label>
                <label><input type="checkbox" value="ODM竞品" :checked="newTags.includes('ODM竞品')" @change="toggleTag('ODM竞品')" /> ODM竞品</label>
              </div>
            </div>
            <div class="local-form-error" v-if="formError">{{ formError }}</div>
            <div class="wide" style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;">
              <span style="color:#475467;font-size:12px;font-weight:800;">竞品信息登记表字段 <span style="color:#e5484d;">* 必填</span></span>
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;">字段处理方案
                <select v-model="fieldPlan">
                  <option>完整信息登记</option>
                  <option>快速登记（仅必填）</option>
                  <option>基础信息+销售</option>
                </select>
              </label>
            </div>
            <!-- 参数字段按类别分组 -->
            <template v-for="(field, fi) in getParamFields()" :key="field.name">
              <div v-if="fi === 0 || getParamFields()[fi-1].category !== field.category"
                class="param-group-divider wide"
                v-show="getParamFields().some((f, i) => i >= fi && f.category === field.category && isFieldVisible(f))">
                <span>{{ field.category }}</span>
              </div>
              <label v-show="isFieldVisible(field)" :class="{ wide: (field.type === 'url' && field.name.includes('链接')) }">
                <span v-if="field.required" class="required-star">*</span>{{ field.name }}
                <select v-if="field.type === 'select'" v-model="paramValues[field.name]">
                  <option v-for="opt in field.options" :key="opt">{{ opt }}</option>
                </select>
                <select v-else-if="field.type === 'lineSelect'" v-model="paramValues[field.name]">
                  <option v-for="opt in competitorProductTypeOptions[newLine]" :key="opt">{{ opt }}</option>
                </select>
                <input v-else :type="field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'"
                  v-model="paramValues[field.name]"
                  :placeholder="field.placeholder || `填写${field.name}`" />
              </label>
            </template>
            <label class="wide">备注<textarea v-model="newRemark" placeholder="补充核心卖点、功能差异、价格策略等备注信息"></textarea></label>
          </div>
          <div class="modal-actions">
            <button class="secondary-button" @click="closeAddModal">取消</button>
            <button class="primary-button" @click="saveCompetitor">保存竞品</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== L3/L4 处理方案弹窗 ==================== -->
    <Teleport to="body">
      <div v-if="showHandleModal" class="modal-overlay" @click.self="showHandleModal = false">
        <div class="modal-content" style="max-width:640px;">
          <div class="modal-head">
            <div><span style="color:#667085;font-size:13px;">市场监控处理</span><h2>{{ handleTarget }}</h2><p style="color:#667085;">L3/L4 触发提醒后，由产品经理选择处理方案。</p></div>
            <button class="icon-button" @click="showHandleModal = false">×</button>
          </div>
          <div class="local-page-grid" style="grid-template-columns: repeat(2, 1fr); margin: 16px 0;">
            <article class="local-module-card">
              <h3>转紧急异常处理</h3>
              <p>涉及安全、法规、合规、集中投诉或重大风险时进入紧急异常流程。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('转紧急异常处理')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>启动实物分析</h3>
              <p>线上信息不足或需验证结构、体验、包装、APP、配件时发起实物分析。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('启动实物分析')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>转入需求</h3>
              <p>形成明确产品或业务改进方向，进入需求池评审。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('转入需求')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>解除监控并归档</h3>
              <p>判断无持续价值或已完成跟踪时，保留记录后停止监控。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('解除监控并归档')">选择</button>
            </article>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header-left h1 { margin: 0; font-size: 24px; }
.page-header-left p { margin: 4px 0 0; color: #667085; font-size: 13px; }
.page-header-sub { display: inline-block; padding: 2px 8px; background: #eef4ff; color: #175cd3; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { background: #fff; border: 1px solid #d7deea; border-radius: 8px; padding: 16px; }
.stat-label { font-size: 12px; color: #667085; font-weight: 600; }
.stat-value { font-size: 28px; font-weight: 800; color: #101828; margin: 4px 0; }
.stat-sub { font-size: 11px; color: #475467; }
.tabs-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.tabs-row button { padding: 6px 16px; border: 1px solid #d7deea; border-radius: 6px; background: #fff; font-size: 13px; cursor: pointer; }
.tabs-row button.active { background: #175cd3; color: #fff; border-color: #175cd3; }
.page-body { min-height: 400px; }

/* 告警卡片 */
.alerts-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.alert-card { display: flex; gap: 12px; padding: 14px; border-radius: 8px; border: 1px solid #f0f0f0; }
.alert-level { padding: 2px 10px; border-radius: 4px; font-weight: 800; font-size: 12px; white-space: nowrap; }
.lvl-l4 { background: #fee2e2; color: #e5484d; }
.lvl-l3 { background: #fff3e0; color: #ed8936; }
.lvl-l2 { background: #eef4ff; color: #175cd3; }
.alert-body strong { font-size: 13px; display: block; }
.alert-body p { font-size: 12px; color: #475467; margin: 4px 0; }
.alert-meta { font-size: 11px; color: #999; }

/* 竞品卡片 */
.product-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 14px 0 16px; }
.product-card { background: #fff; border: 1px solid #d7deea; border-radius: 8px; padding: 18px; cursor: pointer; transition: box-shadow 0.15s; display: grid; gap: 8px; align-content: start; }
.product-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card-head { display: flex; justify-content: space-between; align-items: flex-start; }
.product-card strong { font-size: 17px; color: #101828; }
.product-card em { font-size: 12px; color: #667085; font-style: normal; }
.product-price-row { display: flex; justify-content: space-between; align-items: baseline; }
.product-price-row b { font-size: 18px; color: #e5484d; }
.product-price-row span { font-size: 12px; color: #475467; }
.product-card p { font-size: 12px; color: #475467; line-height: 1.4; }

/* 监控徽章 */
.monitor-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.monitor-normal { background: #eaf7ea; color: #2e7d32; border: 1px solid #a5d6a7; }
.monitor-stopped { background: #fefbe8; color: #94650c; border: 1px solid #f7d24a; }
.monitor-archived { background: #f2f4f7; color: #475467; border: 1px solid #d7deea; }

.source-chip { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; background: #eef4ff; color: #175cd3; }

/* 筛选面板 */
.local-fixed-filter-panel { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; background: #f8fafc; padding: 12px; border: 1px solid #d7deea; border-radius: 8px; margin-bottom: 12px; }
.local-fixed-filter-panel label { font-size: 12px; color: #475467; font-weight: 600; display: flex; flex-direction: column; gap: 4px; }
.local-fixed-filter-panel input,
.local-fixed-filter-panel select { padding: 6px 10px; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; min-width: 120px; }
.local-filter-actions { align-self: flex-end; }

/* 详情页 */
.local-competitor-detail-page { display: grid; gap: 16px; }
.local-page-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.local-page-head h2 { margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
.local-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.local-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.field-item { background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e4eaf3; }
.field-item span { display: block; color: #667085; font-size: 11px; font-weight: 600; }
.field-item strong { display: block; color: #101828; font-size: 13px; margin-top: 2px; }
.local-page-grid.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.local-module-card { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.local-module-card h3 { font-size: 14px; margin: 0 0 6px; }
.local-module-card p { font-size: 13px; color: #475467; margin: 0; }

.param-group-divider { grid-column: 1 / -1; padding: 6px 0 2px; margin-top: 4px; border-bottom: 1px solid #e4eaf3; color: #667085; font-size: 12px; font-weight: 800; }

.local-competition-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.local-competition-table th, .local-competition-table td { border: 1px solid #e4eaf3; padding: 8px 10px; text-align: left; }
.local-competition-table th { background: #f8fafc; font-weight: 700; color: #475467; }

.pill { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
.pill.p1 { background: #fee2e2; color: #e5484d; }
.pill.p2 { background: #fff3e0; color: #ed8936; }
.pill.p3 { background: #eef4ff; color: #175cd3; }

.monitor-toggle-button { padding: 6px 14px; border-radius: 6px; border: 1px solid #d7deea; background: #fff; font-size: 13px; cursor: pointer; }
.monitor-toggle-button.active { background: #fee2e2; color: #e5484d; border-color: #e5484d; }

.chip.small { padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
.chip.green { background: #eaf7ea; color: #2e7d32; }
.chip.red { background: #fee2e2; color: #e5484d; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; z-index: 999; padding-top: 5vh; overflow-y: auto; }
.modal-content { background: #fff; border-radius: 12px; width: min(800px, 95vw); max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
.compare-modal { width: min(700px, 95vw); }
.add-competitor-modal { width: min(900px, 95vw); }
.modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px 12px; border-bottom: 1px solid #e4eaf3; position: sticky; top: 0; background: #fff; z-index: 1; }
.modal-head h2 { margin: 4px 0 2px; font-size: 18px; }
.modal-head p { margin: 0; color: #667085; font-size: 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #e4eaf3; position: sticky; bottom: 0; background: #fff; }
.icon-button { background: none; border: 1px solid #d7deea; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 16px; }

.local-modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 16px 20px; }
.local-modal-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #475467; }
.local-modal-grid label.wide { grid-column: 1 / -1; }
.local-modal-grid input,
.local-modal-grid select,
.local-modal-grid textarea { padding: 8px 10px; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; }
.local-modal-grid textarea { resize: vertical; min-height: 60px; }
.local-modal-grid label > span { color: #667085; }
.required-star { color: #e5484d; font-weight: 700; }
.local-check-row { display: flex; gap: 16px; }
.local-check-row label { flex-direction: row !important; align-items: center; gap: 4px; font-weight: 500 !important; }
.local-form-error { grid-column: 1 / -1; background: #fee2e2; color: #e5484d; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }

/* 对比 */
.compare-picker { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 20px; }
.compare-slot { display: flex; flex-direction: column; gap: 4px; padding: 10px; border: 1px solid #d7deea; border-radius: 8px; font-size: 12px; }
.compare-slot.active { border-color: #175cd3; background: #eef4ff; }
.compare-slot span { font-weight: 700; color: #667085; font-size: 11px; }
.compare-slot select { padding: 4px; border: 1px solid #d7deea; border-radius: 4px; font-size: 12px; }
.compare-slot em { color: #667085; font-size: 11px; }
.compare-table-wrap { padding: 0 20px 16px; overflow-x: auto; }
.compare-table-wrap table { width: 100%; }
.compare-group-row td { background: #f8fafc; font-weight: 700; color: #475467; font-size: 12px; padding: 6px 10px; }

/* 按钮 */
.primary-button { padding: 8px 16px; background: #175cd3; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.secondary-button { padding: 8px 16px; background: #fff; color: #475467; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; cursor: pointer; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table th, .data-table td { border: 1px solid #e4eaf3; padding: 6px 10px; text-align: left; white-space: nowrap; }
.data-table th { background: #f8fafc; font-weight: 700; color: #475467; }
.data-table.compact th, .data-table.compact td { padding: 4px 8px; }

.opinion-card p { margin: 0; }
.panel { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.panel-title { font-size: 14px; font-weight: 700; color: #101828; margin-bottom: 10px; }

.local-monitor-table th { padding: 6px 10px; background: #eef2ff; border: 1px solid #d7deea; font-size: 12px; }
.local-monitor-table td { padding: 6px 10px; border: 1px solid #e4eaf3; font-size: 12px; }

.status-pill { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #eaf7ea; color: #2e7d32; }
.bad-text { color: #e5484d; font-weight: 600; }
.good-text { color: #2e7d32; font-weight: 600; }
.model-name { font-weight: 600; }
</style>
