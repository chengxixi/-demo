<script setup lang="ts">
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { processRouteOptions, processStateOptions } from '@/api/mock-data'

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

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'toast', msg: string, type: string): void }>()

const templates = ref<Template[]>(loadTemplates())
const editingTemplateIdx = ref(0)
const renamingIdx = ref(-1)
const renameInput = ref('')
const currentEditing = computed(() => templates.value[editingTemplateIdx.value])

function persistTemplates() { localStorage.setItem('feedback_templates', JSON.stringify(templates.value)) }
function addNewTemplate() { const n = templates.value.length+1; templates.value.push({ id:`tpl_${Date.now()}`, name:`模板 ${n}`, isDefault: templates.value.length===0, fields:{...defaultTemplateFields} }); editingTemplateIdx.value = templates.value.length-1; persistTemplates(); emit('toast', `已新建「模板 ${n}」`, 'success') }
function deleteCurrentTemplate() { if(templates.value.length<=1){emit('toast','至少保留一个模板','warning');return} const r=templates.value[editingTemplateIdx.value]; templates.value.splice(editingTemplateIdx.value,1); if(r.isDefault&&templates.value.length>0)templates.value[0].isDefault=true; if(editingTemplateIdx.value>=templates.value.length)editingTemplateIdx.value=templates.value.length-1; persistTemplates(); emit('toast',`「${r.name}」已删除`,'success') }
function setAsDefault(idx: number) { templates.value.forEach((t,i)=>{t.isDefault=i===idx}); persistTemplates(); emit('toast',`已将「${templates.value[idx].name}」设为默认导入模板`, 'success') }
function duplicateTemplate(idx: number) { const s=templates.value[idx]; templates.value.push({...JSON.parse(JSON.stringify(s)),id:`tpl_${Date.now()}`,name:`${s.name} 副本`,isDefault:false}); editingTemplateIdx.value=templates.value.length-1; persistTemplates(); emit('toast',`已复制「${s.name}」`, 'success') }
function startRename(idx: number) { renamingIdx.value=idx; renameInput.value=templates.value[idx].name }
function confirmRename() { if(renamingIdx.value>=0&&renameInput.value.trim()){templates.value[renamingIdx.value].name=renameInput.value.trim();persistTemplates()} renamingIdx.value=-1; renameInput.value='' }
function cancelRename() { renamingIdx.value=-1; renameInput.value='' }
function saveTemplate() { persistTemplates(); emit('toast', '模板已保存', 'success') }
function handleClose() { emit('close') }
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-6" style="height:85vh;max-height:800px;">
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
        <div><span class="text-xs text-gray-400">我的模板设置</span><h3 class="text-base font-extrabold text-gray-900">我的模板设置</h3><p class="text-[11px] text-gray-400">支持创建多个模板，自定义命名，设置默认导入模板用于新增反馈时自动预填。</p></div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleClose"><X class="w-5 h-5" /></button>
      </div>
      <div class="flex h-full" style="height:calc(100% - 110px);">
        <div class="w-56 border-r border-gray-200 flex flex-col flex-shrink-0 bg-gray-50">
          <div class="p-2 flex items-center justify-between border-b border-gray-200"><span class="text-[11px] font-extrabold text-gray-500">模板列表（{{ templates.length }}）</span><button class="w-6 h-6 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 text-sm font-extrabold" title="新建模板" @click="addNewTemplate">+</button></div>
          <div class="flex-1 overflow-y-auto">
            <div v-for="(tpl, idx) in templates" :key="tpl.id" class="px-3 py-2 cursor-pointer border-b border-gray-100 transition-colors" :class="editingTemplateIdx===idx?'bg-blue-50 border-l-2 border-l-blue-500':'hover:bg-gray-100 border-l-2 border-l-transparent'" @click="editingTemplateIdx=idx">
              <div class="flex items-center gap-1.5">
                <template v-if="renamingIdx===idx"><input v-model="renameInput" class="flex-1 h-6 text-xs border border-blue-300 rounded px-1.5 font-bold outline-none" @keyup.enter="confirmRename()" @keyup.escape="cancelRename()" @blur="confirmRename()" @click.stop /></template>
                <template v-else><span class="text-xs font-extrabold text-gray-800 flex-1 truncate">{{ tpl.name }}</span><span v-if="tpl.isDefault" class="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-extrabold">默认</span></template>
              </div>
              <div v-if="renamingIdx!==idx" class="flex items-center gap-1 mt-1" @click.stop>
                <button class="text-[10px] text-gray-400 hover:text-blue-600 px-1" title="重命名" @click="startRename(idx)">重命名</button>
                <button v-if="!tpl.isDefault" class="text-[10px] text-gray-400 hover:text-green-600 px-1" title="设为默认" @click="setAsDefault(idx)">默认</button>
                <button class="text-[10px] text-gray-400 hover:text-purple-600 px-1" title="复制模板" @click="duplicateTemplate(idx)">复制</button>
                <button class="text-[10px] text-gray-400 hover:text-red-600 px-1" title="删除模板" @click="deleteCurrentTemplate();$event.stopPropagation()">删除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 flex flex-col min-w-0" v-if="currentEditing">
          <div class="px-5 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0"><span class="text-xs font-extrabold text-gray-700">编辑：{{ currentEditing.name }}</span><span v-if="currentEditing.isDefault" class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-extrabold">默认导入模板</span><button v-else class="text-[10px] text-blue-600 hover:underline ml-auto" @click="setAsDefault(editingTemplateIdx)">设为默认</button></div>
          <div class="flex-1 overflow-y-auto p-5">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">地区</span><select v-model="currentEditing.fields.region" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>海外</option><option>国内</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">数据来源</span><select v-model="currentEditing.fields.dataSource" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>海外电商-退货反馈</option><option>海外电商-商品评论</option><option>国内电商-退货反馈</option><option>国内电商-商品评论</option><option>站内信</option><option>客服沟通</option><option>APP反馈</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">设备类型</span><input v-model="currentEditing.fields.deviceType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">品牌</span><input v-model="currentEditing.fields.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">内部型号/料号</span><input v-model="currentEditing.fields.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">销售型号</span><input v-model="currentEditing.fields.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">订单号</span><input v-model="currentEditing.fields.orderNo" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">快递单号（退换货）</span><input v-model="currentEditing.fields.expressNo" placeholder="退换货时填写" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">问题反馈时间</span><input type="date" v-model="currentEditing.fields.feedbackDate" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">图片补充</span><input v-model="currentEditing.fields.image" placeholder="图片链接或附件说明" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">视频补充</span><input v-model="currentEditing.fields.video" placeholder="视频链接或附件说明" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">创建方式</span><select v-model="currentEditing.fields.createMode" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>人工录入</option><option>AI自动创建</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">异常级别</span><select v-model="currentEditing.fields.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>否</option><option>待确认</option><option>P0</option><option>P1</option><option>P2</option><option>P3</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">处理去向</span><select v-model="currentEditing.fields.processRoute" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">状态</span><select v-model="currentEditing.fields.processState" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option></select></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">反馈人</span><input v-model="currentEditing.fields.feedbackUser" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">一级职能划分</span><input v-model="currentEditing.fields.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span><input v-model="currentEditing.fields.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">三级具体问题</span><input v-model="currentEditing.fields.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            </div>
            <div class="mt-3 space-y-3">
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）</span><textarea v-model="currentEditing.fields.raw" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span><textarea v-model="currentEditing.fields.ai" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">问题回答/处理方案</span><textarea v-model="currentEditing.fields.solution" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
              <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">备注</span><textarea v-model="currentEditing.fields.note" rows="2" placeholder="可保存固定话术、默认标签、备注字段" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 px-5 py-2.5 bg-gray-50 rounded-b-xl border-t border-gray-200 flex-shrink-0">
        <button class="btn-primary text-xs h-8 px-4" @click="saveTemplate">保存全部模板</button>
        <button class="btn-secondary text-xs h-8 px-4" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>
