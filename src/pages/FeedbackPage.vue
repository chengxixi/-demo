<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, Plus, ChevronDown } from 'lucide-vue-next'
import { useFeedbackStore } from '@/stores'
import { siteOptions, sourceOptions, processRouteOptions, processStateOptions, exceptionLevels, returnOptions, feedbackTabOptions } from '@/api/mock-data'
import type { FeedbackItem } from '@/types'

const store = useFeedbackStore()
const detailItem = ref<FeedbackItem | null>(null)

// Detail editing
const editMode = ref(false)
const editData = ref<Partial<FeedbackItem>>({})

const tabCounts = computed(() => ({
  all: store.items.length,
  pending: store.items.filter(i => i.processState === '待处理').length,
  review: store.items.filter(i => i.processState === '待人工复核').length,
  done: store.items.filter(i => i.processState === '已处理').length,
  mine: store.items.filter(i => i.feedbackUser === '张伟').length,
}))

function getDataSource(item: FeedbackItem): string {
  if (item.source === '退货原因') return item.site === 'Amazon.com (US)' ? '海外电商-退货反馈' : '国内电商-退货反馈'
  if (item.source === '商品评论') return item.site === 'Amazon.com (US)' ? '海外电商-商品评论' : '国内电商-商品评论'
  return item.source
}

function getDeviceType(item: FeedbackItem): string {
  return item.productType === '体脂秤' ? '八电极' : item.productType
}

function getSolution(item: FeedbackItem): string {
  if (item.processRoute === '待处理') return '待产品经理确认处理方案'
  if (item.processRoute === '已转工单') return '已转工单跟进质量排查'
  if (item.processRoute === '已转需求') return '已转需求池评审'
  if (item.processRoute === '已转异常') return '已转异常处理流程'
  if (item.processRoute === '已转Q&A') return '已沉淀至Q&A案例库'
  return '已直接回复并关闭'
}

function getExpressNo(item: FeedbackItem): string {
  if (['退货', '换货', '退货+换货'].includes(item.returned)) return `RT-${item.id.replace(/[^0-9]/g, '').slice(-8)}`
  return ''
}

function getRegion(item: FeedbackItem): string {
  return item.site === 'Amazon.com (US)' ? '海外' : '国内'
}

function openDetail(item: FeedbackItem) {
  detailItem.value = item
  editData.value = { ...item }
  editMode.value = false
}

function closeDetail() {
  detailItem.value = null
}

function saveDetail() {
  if (detailItem.value) {
    store.updateItem(detailItem.value.id, editData.value)
    closeDetail()
  }
}

function applyRoute(item: FeedbackItem, route: string) {
  store.updateItem(item.id, {
    processRoute: route,
    processState: route === '待处理' ? '待处理' : '已处理',
    handler: route === '已转工单' ? '系统' : item.handler,
  })
  if (detailItem.value?.id === item.id) closeDetail()
}

function unmergeItem(item: FeedbackItem) {
  store.updateItem(item.id, { mergeGroup: '' })
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">反馈清单</h2>
        <p class="text-xs text-gray-400 mt-0.5">原始反馈数据池与AI分类结果总览，独立于工单处理流程</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-primary"><Plus class="w-3.5 h-3.5 mr-1" /> 新增反馈</button>
        <button class="btn-secondary text-xs">我的模板设置</button>
        <button class="btn-secondary text-xs">批量导入</button>
        <div class="relative group">
          <button class="btn-secondary text-xs flex items-center gap-1">批量操作 <ChevronDown class="w-3 h-3" /></button>
          <div class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 hidden group-hover:block min-w-[120px]">
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">转工单</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">转异常</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">转需求</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">转Q&A</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">直接关闭</button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto" :class="{ 'hidden': detailItem }">
      <!-- Filter & Tabs -->
      <div class="px-6 pt-3 bg-white border-b border-gray-200">
        <!-- Search -->
        <div class="relative mb-2">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="store.searchQuery"
            type="search"
            placeholder="搜索反馈ID、ASIN、型号、原文关键词"
            class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
          />
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 -mb-px">
          <button
            v-for="tab in feedbackTabOptions"
            :key="tab.key"
            class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors"
            :class="store.activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'"
            @click="store.activeTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="tab.key === 'all'" class="ml-1 text-gray-400">({{ tabCounts.all }})</span>
            <span v-else-if="tab.key === 'pending'" class="ml-1 text-gray-400">({{ tabCounts.pending }})</span>
            <span v-else-if="tab.key === 'review'" class="ml-1 text-gray-400">({{ tabCounts.review }})</span>
            <span v-else-if="tab.key === 'done'" class="ml-1 text-gray-400">({{ tabCounts.done }})</span>
          </button>
          <button
            class="ml-auto px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
            :class="{ 'text-blue-600 border-blue-300 bg-blue-50': store.filterVisible }"
            @click="store.filterVisible = !store.filterVisible"
          >
            <Filter class="w-3 h-3 inline mr-1" />
            {{ store.filterVisible ? '收起筛选' : '筛选' }}
          </button>
        </div>

        <!-- Filter Panel -->
        <div v-if="store.filterVisible" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 py-3 border-t border-gray-100">
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            数据来源
            <select v-model="store.filters.source" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            创建方式
            <select v-model="store.filters.mode" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option value="AI自动创建">AI自动创建</option>
              <option value="人工录入">人工录入</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            品牌
            <input v-model="store.filters.brand" placeholder="输入品牌" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            站点
            <select v-model="store.filters.site" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            设备类型
            <input v-model="store.filters.productType" placeholder="输入设备类型" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            销售型号
            <input v-model="store.filters.model" placeholder="输入销售型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            内部型号/料号
            <input v-model="store.filters.internal" placeholder="输入内部型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈人
            <input v-model="store.filters.feedbackUser" placeholder="输入反馈人" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈开始时间
            <input type="date" v-model="store.filters.dateFrom" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈结束时间
            <input type="date" v-model="store.filters.dateTo" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            状态
            <select v-model="store.filters.processState" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            异常等级
            <select v-model="store.filters.exception" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in exceptionLevels" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            处理去向
            <select v-model="store.filters.processRoute" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in processRouteOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            退换货
            <select v-model="store.filters.returned" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in returnOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <div class="flex items-end">
            <button class="btn-secondary text-xs h-7" @click="store.resetFilters()">重置筛选</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-auto">
        <table class="feedback-table">
          <thead>
            <tr>
              <th class="w-12"><input type="checkbox" /></th>
              <th>编号</th>
              <th>地区</th>
              <th>数据来源</th>
              <th>设备类型</th>
              <th>品牌</th>
              <th>内部型号/料号</th>
              <th>销售型号</th>
              <th>订单号</th>
              <th>快递单号</th>
              <th>用户反馈</th>
              <th>AI翻译</th>
              <th>图片补充</th>
              <th>视频补充</th>
              <th>反馈时间</th>
              <th>处理方案</th>
              <th>一级职能</th>
              <th>二级问题</th>
              <th>三级问题</th>
              <th>异常级别</th>
              <th>创建方式</th>
              <th>处理去向</th>
              <th>状态</th>
              <th>反馈人</th>
              <th>处理人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in store.filteredGroups" :key="group.lead.data.id">
              <!-- Merge parent row -->
              <tr v-if="group.members.length > 1" class="merge-parent cursor-pointer" @click="group.expanded = !group.expanded">
                <td><input type="checkbox" /></td>
                <td colspan="25">
                  <div class="flex items-center gap-2">
                    <button class="w-5 h-5 flex items-center justify-center border border-blue-200 rounded bg-white text-blue-600 text-xs font-extrabold">
                      {{ group.expanded ? '−' : '+' }}
                    </button>
                    <div>
                      <span class="font-extrabold text-sm text-gray-900">{{ group.lead.data.model }} {{ group.lead.data.level3 }}合并反馈</span>
                      <span class="ml-2 text-xs text-gray-500">
                        {{ group.lead.data.internal }} / {{ group.members.length }}条明细
                      </span>
                    </div>
                    <span class="ml-auto text-xs text-gray-400">{{ getDataSource(group.lead.data) }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click.stop="openDetail(group.lead.data)">详情</button>
                  </div>
                </td>
              </tr>
              <!-- Children -->
              <template v-if="group.expanded || group.members.length === 1">
                <tr
                  v-for="(member, idx) in group.members"
                  :key="member.data.id"
                  :class="group.members.length > 1 ? 'merge-child' : ''"
                >
                  <td><input type="checkbox" /></td>
                  <td>
                    <template v-if="group.members.length > 1">
                      <div class="flex items-center gap-1 pl-5">
                        <span class="text-gray-400 font-extrabold">└</span>
                        <span>
                          <span class="font-extrabold text-gray-900 text-xs">{{ member.data.id }}</span>
                          <span class="block text-[11px] text-gray-400">第 {{ idx + 1 }} 条明细</span>
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="font-extrabold text-gray-900 text-xs">{{ member.data.id }}</span>
                    </template>
                  </td>
                  <td>{{ getRegion(member.data) }}</td>
                  <td><span class="text-xs font-bold text-gray-600">{{ getDataSource(member.data) }}</span></td>
                  <td>{{ getDeviceType(member.data) }}</td>
                  <td>{{ member.data.brand }}</td>
                  <td>{{ member.data.internal }}</td>
                  <td>{{ member.data.model }}</td>
                  <td>{{ member.data.asin !== '-' ? member.data.asin : 'ORD-' + member.data.id.replace('FB-', '') }}</td>
                  <td>{{ getExpressNo(member.data) }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.raw }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.ai }}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{{ member.data.date }}</td>
                  <td class="max-w-[180px] truncate text-xs">{{ getSolution(member.data) }}</td>
                  <td>{{ member.data.level1 }}</td>
                  <td>{{ member.data.level2 }}</td>
                  <td>{{ member.data.level3 }}</td>
                  <td>{{ member.data.exception }}</td>
                  <td>
                    <span :class="member.data.createMode === 'AI自动创建' ? 'badge-ai' : 'badge-manual'">
                      {{ member.data.createMode }}
                    </span>
                  </td>
                  <td>{{ member.data.processRoute }}</td>
                  <td>{{ member.data.processState }}</td>
                  <td>{{ member.data.feedbackUser }}</td>
                  <td>{{ member.data.handler }}</td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click="openDetail(member.data)">详情</button>
                      <button v-if="group.members.length > 1 && !['P0', 'P1'].includes(member.data.exception)" class="px-2 py-0.5 text-[11px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50" @click="unmergeItem(member.data)">移出合并</button>
                      <button v-if="member.data.processState === '待人工复核'" class="px-2 py-0.5 text-[11px] font-bold text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100">人工复核</button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="store.filteredGroups.length === 0">
              <td colspan="26" class="text-center py-10 text-gray-400 text-sm font-bold">当前筛选条件下没有反馈记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div v-if="detailItem" class="flex-1 overflow-auto bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg">
        <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400 font-bold">反馈详情</span>
            <h2 class="text-xl font-extrabold text-gray-900 mt-0.5">{{ detailItem.id }}</h2>
            <p class="text-xs text-gray-500 mt-1">{{ getDataSource(detailItem) }} / {{ detailItem.brand }} / {{ detailItem.model }}</p>
          </div>
          <button class="btn-secondary text-xs" @click="closeDetail">返回列表</button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Editable fields -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">地区</span>
              <select v-model="editData.site" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">设备类型</span>
              <select v-model="editData.productType" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option value="体脂秤">体脂秤</option>
                <option value="筋膜枪">筋膜枪</option>
                <option value="血压计">血压计</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">异常级别</span>
              <select v-model="editData.exception" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="lvl in exceptionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理去向</span>
              <select v-model="editData.processRoute" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">状态</span>
              <select v-model="editData.processState" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理人</span>
              <input v-model="editData.handler" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
            </div>
          </div>

          <!-- Text areas -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">用户反馈（客户对话/退货反馈）</span>
            <textarea v-model="editData.raw" rows="3" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">用户评价翻译（AI自动翻译）</span>
            <textarea v-model="editData.ai" rows="3" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
          </div>

          <!-- Solution -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">问题回答/处理方案</span>
            <strong class="block mt-1 text-sm text-gray-900">{{ getSolution(detailItem) }}</strong>
          </div>

          <!-- Return progress -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">退换货进度（PMS售后模块）</span>
            <div class="grid grid-cols-4 gap-2">
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">售后状态</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.returned !== '否' ? `${detailItem.returned}处理中` : '未触发退换货' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">PMS单号</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ getExpressNo(detailItem) || '无' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">当前节点</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.processState === '已处理' ? '已完成售后闭环' : 'PMS售后模块处理中' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">更新时间</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.date }}</em>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button class="btn-secondary text-xs" @click="closeDetail">关闭</button>
          <button class="btn-primary text-xs" @click="saveDetail">保存修改</button>
          <button class="btn-warning text-xs" @click="applyRoute(detailItem, '已转工单')">转工单</button>
          <button class="btn-danger text-xs" @click="applyRoute(detailItem, '已转异常')">转异常</button>
          <button class="btn-success text-xs" @click="applyRoute(detailItem, '已转需求')">转需求</button>
        </div>
      </div>
    </div>
  </div>
</template>
