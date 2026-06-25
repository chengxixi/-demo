<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { processRouteOptions, exceptionLevels } from '@/api/mock-data'
import type { FeedbackItem } from '@/types'

const props = defineProps<{ visible: boolean; item: FeedbackItem | null; data: Partial<FeedbackItem> }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', id: string, data: Partial<FeedbackItem>): void
}>()

function getDataSource(item: FeedbackItem): string {
  if (item.source === '退货原因') return item.site === 'Amazon.com (US)' ? '海外电商-退货反馈' : '国内电商-退货反馈'
  if (item.source === '商品评论') return item.site === 'Amazon.com (US)' ? '海外电商-商品评论' : '国内电商-商品评论'
  return item.source
}

function handleClose() { emit('close') }
function handleSave() {
  if (props.item && props.data) {
    const route = props.data.processRoute || props.item.processRoute
    emit('save', props.item.id, { ...props.data, createMode: '人工录入', processState: route==='待处理'?'待处理':'已处理', handler: props.data.handler||'陈晨' } as Partial<FeedbackItem>)
  }
}
</script>

<template>
  <div v-if="visible && item" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div><span class="text-xs text-gray-400">人工复核</span><h3 class="text-base font-extrabold text-gray-900">{{ item.id }}</h3><p class="text-[11px] text-gray-400">人工修改 AI 录入内容、翻译、分类和异常级别。</p></div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleClose"><X class="w-5 h-5" /></button>
      </div>
      <div class="p-5 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">数据来源</span><select v-model="data.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>{{ getDataSource(item) }}</option><option>海外电商-退货反馈</option><option>海外电商-商品评论</option><option>客服沟通</option><option>APP反馈</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">品牌</span><input v-model="data.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">内部型号/料号</span><input v-model="data.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">销售型号</span><input v-model="data.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">异常级别</span><select v-model="data.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option v-for="lvl in exceptionLevels" :key="lvl" :value="lvl">{{ lvl }}</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">处理去向</span><select v-model="data.processRoute" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">处理人</span><input v-model="data.handler" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">一级职能划分</span><select v-model="data.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>产品质量</option><option>产品体验</option><option>咨询服务</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span><input v-model="data.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">三级具体问题</span><input v-model="data.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>
        <div class="mt-3 space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）</span><textarea v-model="data.raw" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span><textarea v-model="data.ai" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-secondary text-xs h-8 px-4" @click="handleClose">取消</button>
        <button class="btn-primary text-xs h-8 px-5" @click="handleSave">保存复核</button>
      </div>
    </div>
  </div>
</template>
