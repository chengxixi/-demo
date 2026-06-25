<script setup lang="ts">
import { ref } from 'vue'
import { competitorParamFieldsMap, competitorProductTypeOptions } from '@/api/mock-data'
import type { Competitor, CompetitorFieldDef } from '@/types'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [competitor: Competitor]
}>()

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

function onLineChange() {
  initParamValues()
}

function openModal() {
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
}

function handleSave() {
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
    tags: newTags.value.length ? newTags.value : ['品牌竞品'],
    params: [...paramsList, newRemark.value].filter(Boolean).join('；'),
    monitorStatus: '正常监控',
    archived: false,
    registerFields: { ...paramValues.value },
  }
  emit('save', item)
}

// Initialize on creation
initParamValues()

const handleClose = () => emit('close')

defineExpose({ openModal })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content add-competitor-modal">
        <div class="modal-head">
          <div><span style="color:#667085;font-size:12px;">竞品信息</span><h2>增加竞品</h2><p>按竞品信息登记表填写，海外渠道必须补充 ASIN。</p></div>
          <button class="icon-button" @click="handleClose">×</button>
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
          <template v-for="(field, fi) in getParamFields()" :key="field.name">
            <div
              v-if="fi === 0 || getParamFields()[fi-1].category !== field.category"
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
          <button class="secondary-button" @click="handleClose">取消</button>
          <button class="primary-button" @click="handleSave">保存竞品</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; z-index: 999; padding-top: 5vh; overflow-y: auto; }
.modal-content { background: #fff; border-radius: 12px; width: min(800px, 95vw); max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
.add-competitor-modal { width: min(900px, 95vw); }
.modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px 12px; border-bottom: 1px solid #e4eaf3; position: sticky; top: 0; background: #fff; z-index: 1; }
.modal-head h2 { margin: 4px 0 2px; font-size: 18px; }
.modal-head p { margin: 0; color: #667085; font-size: 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid #e4eaf3; position: sticky; bottom: 0; background: #fff; }
.icon-button { background: none; border: 1px solid #d7deea; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 16px; }
.primary-button { padding: 8px 16px; background: #175cd3; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.secondary-button { padding: 8px 16px; background: #fff; color: #475467; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; cursor: pointer; }

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
.param-group-divider { grid-column: 1 / -1; padding: 6px 0 2px; margin-top: 4px; border-bottom: 1px solid #e4eaf3; color: #667085; font-size: 12px; font-weight: 800; }
</style>
