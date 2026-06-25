<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FeedbackItem } from '@/types'
import { siteOptions, processRouteOptions, processStateOptions, exceptionLevels } from '@/api/mock-data'

const props = defineProps<{
  item: FeedbackItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', id: string, data: Partial<FeedbackItem>): void
  (e: 'applyRoute', item: FeedbackItem, route: string): void
}>()

const editData = ref<Partial<FeedbackItem>>({})
const showReplyPanel = ref(false)
const replyContent = ref('')

const visible = computed(() => props.item !== null)

function getDataSource(item: FeedbackItem): string {
  if (item.source === '退货原因') return item.site === 'Amazon.com (US)' ? '海外电商-退货反馈' : '国内电商-退货反馈'
  if (item.source === '商品评论') return item.site === 'Amazon.com (US)' ? '海外电商-商品评论' : '国内电商-商品评论'
  return item.source
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

function handleClose() {
  showReplyPanel.value = false
  replyContent.value = ''
  emit('close')
}

function handleSave() {
  if (props.item) {
    emit('save', props.item.id, editData.value)
  }
}

function handleApplyRoute(route: string) {
  if (props.item) {
    emit('applyRoute', props.item, route)
  }
}

function handleToggleReplyPanel() {
  showReplyPanel.value = !showReplyPanel.value
}

function handleConfirmDirectClose() {
  if (props.item) {
    emit('applyRoute', props.item, '已直接回复关闭')
    handleClose()
  }
}

// Sync editData when item changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    editData.value = { ...newItem }
    showReplyPanel.value = false
    replyContent.value = ''
  }
}, { immediate: true })
</script>

<template>
  <div v-if="visible && item" class="flex-1 overflow-auto bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg">
      <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400 font-bold">反馈详情</span>
          <h2 class="text-xl font-extrabold text-gray-900 mt-0.5">{{ item.id }}</h2>
          <p class="text-xs text-gray-500 mt-1">{{ getDataSource(item) }} / {{ item.brand }} / {{ item.model }}</p>
        </div>
        <button class="btn-secondary text-xs" @click="handleClose">返回列表</button>
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

        <!-- L1/L2/L3 Classification -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">一级职能划分</span>
            <input v-model="editData.level1" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">二级问题场景分类</span>
            <input v-model="editData.level2" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">三级具体问题</span>
            <input v-model="editData.level3" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
          </div>
        </div>

        <!-- Solution -->
        <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <span class="block text-[11px] font-bold text-gray-500">问题回答/处理方案</span>
          <strong class="block mt-1 text-sm text-gray-900">{{ getSolution(item) }}</strong>
        </div>

        <!-- Return progress -->
        <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <span class="block text-[11px] font-bold text-gray-500 mb-1">退换货进度（PMS售后模块）</span>
          <div class="grid grid-cols-4 gap-2">
            <div class="p-2 bg-white border border-gray-100 rounded">
              <b class="block text-xs">售后状态</b>
              <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ item.returned !== '否' ? `${item.returned}处理中` : '未触发退换货' }}</em>
            </div>
            <div class="p-2 bg-white border border-gray-100 rounded">
              <b class="block text-xs">PMS单号</b>
              <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ getExpressNo(item) || '无' }}</em>
            </div>
            <div class="p-2 bg-white border border-gray-100 rounded">
              <b class="block text-xs">当前节点</b>
              <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ item.processState === '已处理' ? '已完成售后闭环' : 'PMS售后模块处理中' }}</em>
            </div>
            <div class="p-2 bg-white border border-gray-100 rounded">
              <b class="block text-xs">更新时间</b>
              <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ item.date }}</em>
            </div>
          </div>
        </div>

        <!-- Reply Panel (toggle) -->
        <div v-if="showReplyPanel" class="p-3 border border-blue-200 rounded-lg bg-blue-50">
          <span class="block text-[11px] font-bold text-gray-500 mb-1">直接回复内容</span>
          <textarea v-model="replyContent" rows="3" placeholder="由操作人输入给用户的直接回复内容。" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
          <button class="btn-primary text-xs mt-2" @click="handleConfirmDirectClose">确认回复并关闭</button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-wrap">
        <button class="btn-secondary text-xs" @click="handleClose">关闭</button>
        <button class="btn-primary text-xs" @click="handleSave">保存修改</button>
        <button class="btn-warning text-xs" @click="handleApplyRoute('已转工单')">转工单</button>
        <button class="btn-danger text-xs" @click="handleApplyRoute('已转异常')">转异常</button>
        <button class="btn-success text-xs" @click="handleApplyRoute('已转需求')">转需求</button>
        <button class="btn-primary text-xs" @click="handleToggleReplyPanel">直接回复并关闭</button>
      </div>
    </div>
  </div>
</template>
