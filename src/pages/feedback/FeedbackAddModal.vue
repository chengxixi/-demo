<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileDown, X } from 'lucide-vue-next'
import { useFeedbackStore } from '@/stores'
import type { FeedbackItem } from '@/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', item: FeedbackItem): void
  (e: 'toast', msg: string, type: string): void
}>()

const store = useFeedbackStore()
const showTemplatePicker = ref(false)

interface TemplateField {
  region: string; dataSource: string; deviceType: string; brand: string; internal: string; model: string; orderNo: string; expressNo: string; feedbackDate: string; image: string; video: string; createMode: string; exception: string; processRoute: string; processState: string; feedbackUser: string; level1: string; level2: string; level3: string; raw: string; ai: string; solution: string; note: string
}
interface Template { id: string; name: string; isDefault: boolean; fields: TemplateField }

const defaultTemplateFields: TemplateField = {
  region: '海外', dataSource: '海外电商-退货反馈', deviceType: '八电极',
  brand: '云康宝', internal: 'YL-CS20A-8', model: 'CS20A',
  orderNo: 'B0CS20AUS1', expressNo: '', feedbackDate: new Date().toISOString().slice(0, 10),
  image: '', video: '', createMode: '人工录入', exception: '否',
  processRoute: '待处理', processState: '待处理', feedbackUser: '张伟',
  level1: '产品质量', level2: '硬件损坏/无法使用', level3: '无法开机/上电',
  raw: '', ai: '', solution: '待产品经理确认处理方案。', note: '',
}

function loadTemplates(): Template[] {
  try { const d = localStorage.getItem('feedback_templates'); if (d) { const p = JSON.parse(d); if (Array.isArray(p) && p.length > 0) return p } } catch {}
  return [{ id: 'tpl_default', name: '默认模板', isDefault: true, fields: { ...defaultTemplateFields } }]
}

const templates = ref<Template[]>(loadTemplates())
const defaultTemplate = computed(() => templates.value.find(t => t.isDefault) || templates.value[0])

const newFeedback = ref<any>({})

// Sync template on open
watch(() => props.visible, (v) => {
  if (v) {
    templates.value = loadTemplates()
    const now = new Date()
    const ds = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const tpl = defaultTemplate.value?.fields || defaultTemplateFields
    newFeedback.value = { id: `CS-${ds}-${String(store.items.length+1).padStart(4,'0')}`, ...tpl, feedbackDate: now.toISOString().slice(0,10), raw: '', ai: '' }
    showTemplatePicker.value = false
  }
})

function handleClose() { emit('close') }

function handleImportTemplate(tpl: any) {
  Object.keys(tpl.fields).forEach(k => { if (k in newFeedback.value) newFeedback.value[k] = tpl.fields[k] })
  emit('toast', `已导入模板「${tpl.name}」`, 'success')
  showTemplatePicker.value = false
}
function handleSubmit() {
  if (!newFeedback.value.raw.trim()) { emit('toast', '请填写用户反馈内容', 'warning'); return }
  const nf = newFeedback.value
  const item: FeedbackItem = {
    id: nf.id, site: nf.region==='海外'?'Amazon.com (US)':'京东',
    source: nf.dataSource.includes('退货')?'退货原因':nf.dataSource.includes('评论')?'商品评论':nf.dataSource,
    brand: nf.brand, productType: nf.deviceType==='八电极'?'体脂秤':nf.deviceType,
    model: nf.model, internal: nf.internal, asin: nf.orderNo,
    raw: nf.raw, ai: nf.ai, date: nf.feedbackDate,
    processRoute: '待处理', processState: '待处理',
    level1: nf.level1, level2: nf.level2, level3: nf.level3, exception: nf.exception,
    createMode: '人工录入', returned: '否', feedbackUser: '张伟', handler: '', mergeGroup: '', sentiment: '中性',
  }
  emit('submit', item)
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400">新增反馈</span>
          <h3 class="text-base font-extrabold text-gray-900">新增反馈</h3>
          <p class="text-[11px] text-gray-400">编号规则：产品线简码-创建时间年月日-流水号。CS：八电极/体脂秤，CM：筋膜枪。</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <button class="text-xs font-extrabold text-red-500 hover:text-red-600 border border-red-300 hover:border-red-400 rounded-md px-3 h-7 flex items-center gap-1 transition-colors" @click="showTemplatePicker = !showTemplatePicker">
              <FileDown class="w-3.5 h-3.5" /> 导入我的模板
            </button>
            <div v-if="showTemplatePicker" class="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-60 max-h-64 overflow-y-auto">
              <div class="p-2 border-b border-gray-100"><span class="text-[10px] font-extrabold text-gray-400">选择模板导入</span></div>
              <div v-for="tpl in templates" :key="tpl.id" class="px-3 py-2.5 cursor-pointer hover:bg-blue-50 border-b border-gray-50 flex items-center justify-between transition-colors" @click="handleImportTemplate(tpl)">
                <div><div class="text-xs font-extrabold text-gray-800">{{ tpl.name }}</div><div class="text-[10px] text-gray-400 mt-0.5">{{ tpl.fields.brand }} / {{ tpl.fields.model }} / {{ tpl.fields.region }}</div></div>
                <span v-if="tpl.isDefault" class="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-extrabold flex-shrink-0">默认</span>
              </div>
              <div v-if="templates.length === 0" class="px-3 py-4 text-center text-[11px] text-gray-400">暂无模板，请先在「我的模板设置」中创建</div>
            </div>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="handleClose"><X class="w-5 h-5" /></button>
        </div>
      </div>

      <div class="p-5 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">编号</span><input v-model="newFeedback.id" readonly class="h-8 text-xs border border-gray-200 rounded-md px-2 font-bold bg-gray-50" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">地区</span><select v-model="newFeedback.region" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option value="海外">海外</option><option value="国内">国内</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">数据来源</span><select v-model="newFeedback.dataSource" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>海外电商-退货反馈</option><option>海外电商-商品评论</option><option>国内电商-退货反馈</option><option>国内电商-商品评论</option><option>站内信</option><option>客服沟通</option><option>APP反馈</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">设备类型</span><input v-model="newFeedback.deviceType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">品牌</span><input v-model="newFeedback.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">内部型号/料号</span><input v-model="newFeedback.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">销售型号</span><input v-model="newFeedback.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">订单号</span><input v-model="newFeedback.orderNo" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">快递单号（退换货）</span><input v-model="newFeedback.expressNo" placeholder="退换货时填写" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">问题反馈时间</span><input type="date" v-model="newFeedback.feedbackDate" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>
        <div class="mt-3 space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）<span class="text-red-500">*</span></span><textarea v-model="newFeedback.raw" rows="3" placeholder="请输入用户原始反馈内容" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span><textarea v-model="newFeedback.ai" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
        </div>
        <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">图片补充</span><input type="file" accept="image/*" multiple class="h-8 text-xs border border-gray-300 rounded-md px-2 py-1.5" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">视频补充</span><input type="file" accept="video/*" multiple class="h-8 text-xs border border-gray-300 rounded-md px-2 py-1.5" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">异常级别</span><select v-model="newFeedback.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>P2</option><option>P1</option><option>P3</option><option>P0</option><option>待确认</option><option>否</option></select></label>
        </div>
        <div class="mt-3"><label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">问题回答/处理方案</span><textarea v-model="newFeedback.solution" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label></div>
        <div class="mt-3 grid grid-cols-3 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">一级职能划分</span><select v-model="newFeedback.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>产品质量</option><option>产品体验</option><option>咨询服务</option></select></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span><input v-model="newFeedback.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">三级具体问题</span><input v-model="newFeedback.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-secondary text-xs h-8 px-4" @click="handleClose">取消</button>
        <button class="btn-primary text-xs h-8 px-5" @click="handleSubmit">创建反馈</button>
      </div>
    </div>
  </div>
</template>
