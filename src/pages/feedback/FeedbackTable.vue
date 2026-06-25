<script setup lang="ts">
import type { FeedbackItem, MergeGroup } from '@/types'
import { siteOptions, sourceOptions, processRouteOptions, processStateOptions, exceptionLevels, returnOptions } from '@/api/mock-data'

const props = defineProps<{
  filteredGroups: MergeGroup[]
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  (e: 'toggleSelect', id: string): void
  (e: 'toggleSelectAll'): void
  (e: 'openDetail', item: FeedbackItem): void
  (e: 'unmergeItem', item: FeedbackItem): void
  (e: 'manualReview', item: FeedbackItem): void
  (e: 'toggleGroupExpand', group: MergeGroup): void
}>()

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

function getRegion(item: FeedbackItem): string {
  return item.site === 'Amazon.com (US)' ? '海外' : '国内'
}

const allSelected = computed(() => {
  const items = props.filteredGroups.flatMap(g => g.members.map(m => m.data))
  return items.length > 0 && items.every(i => props.selectedIds.has(i.id))
})

const someSelected = computed(() => {
  const items = props.filteredGroups.flatMap(g => g.members.map(m => m.data))
  return items.length > 0 && items.some(i => props.selectedIds.has(i.id)) && !allSelected.value
})

function handleToggleSelectAll() {
  emit('toggleSelectAll')
}
</script>

<template>
  <div class="overflow-auto">
    <table class="feedback-table">
      <thead>
        <tr>
          <th class="w-12">
            <input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected" @change="handleToggleSelectAll()" />
          </th>
          <th>编号</th>
          <th>地区</th>
          <th>数据来源</th>
          <th>设备类型</th>
          <th>品牌</th>
          <th>内部型号/料号</th>
          <th>销售型号</th>
          <th>订单号</th>
          <th>是否退换货</th>
          <th>用户反馈</th>
          <th>AI翻译</th>
          <th>反馈时间</th>
          <th>问题回答/处理方案</th>
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
        <template v-for="group in filteredGroups" :key="group.lead.data.id">
          <!-- Merge parent row -->
          <tr v-if="group.members.length > 1" class="merge-parent cursor-pointer" @click="emit('toggleGroupExpand', group)">
            <td><input type="checkbox" :checked="selectedIds.has(group.lead.data.id)" @change="emit('toggleSelect', group.lead.data.id)" @click.stop /></td>
            <td colspan="22">
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
                <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click.stop="emit('openDetail', group.lead.data)">详情</button>
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
              <td><input type="checkbox" :checked="selectedIds.has(member.data.id)" @change="emit('toggleSelect', member.data.id)" /></td>
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
              <td>{{ member.data.returned || '-' }}</td>
              <td class="max-w-[200px] truncate text-xs">{{ member.data.raw }}</td>
              <td class="max-w-[200px] truncate text-xs">{{ member.data.ai }}</td>
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
                  <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click="emit('openDetail', member.data)">详情</button>
                  <button v-if="group.members.length > 1 && !['P0', 'P1'].includes(member.data.exception)" class="px-2 py-0.5 text-[11px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50" @click="emit('unmergeItem', member.data)">移出合并</button>
                  <button v-if="member.data.processState === '待人工复核'" class="px-2 py-0.5 text-[11px] font-bold text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100" @click.stop="emit('manualReview', member.data)">人工复核</button>
                </div>
              </td>
            </tr>
          </template>
        </template>
        <tr v-if="filteredGroups.length === 0">
          <td colspan="24" class="text-center py-10 text-gray-400 text-sm font-bold">当前筛选条件下没有反馈记录</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
