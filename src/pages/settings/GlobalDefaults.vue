<script setup lang="ts">
import { siteOptions, brandOptions, productTypeOptions, modelOptions, sourceOptions } from '@/api/mock-data'

const props = defineProps<{
  globalDefaults: {
    period: string
    site: string
    brand: string
    productType: string
    model: string
    source: string
  }
  saved: boolean
}>()

const emit = defineEmits<{
  'update:globalDefaults': [value: typeof props.globalDefaults]
  save: []
}>()

function handlePeriodChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, period: val })
}

function handleSiteChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, site: val })
}

function handleBrandChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, brand: val })
}

function handleProductTypeChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, productType: val })
}

function handleModelChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, model: val })
}

function handleSourceChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:globalDefaults', { ...props.globalDefaults, source: val })
}

function handleSave() {
  emit('save')
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg">
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-sm font-extrabold text-gray-900">全局筛选默认值</h3>
    </div>
    <div class="p-4">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认时间段
          <select :value="globalDefaults.period" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handlePeriodChange">
            <option value="最近7天">最近7天</option>
            <option value="最近30天">最近30天</option>
            <option value="本月">本月</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认站点
          <select :value="globalDefaults.site" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handleSiteChange">
            <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认品牌
          <select :value="globalDefaults.brand" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handleBrandChange">
            <option v-for="b in brandOptions" :key="b" :value="b">{{ b }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认产品类型
          <select :value="globalDefaults.productType" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handleProductTypeChange">
            <option v-for="p in productTypeOptions" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认型号
          <select :value="globalDefaults.model" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handleModelChange">
            <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-xs font-bold text-gray-600">
          默认数据来源
          <select :value="globalDefaults.source" class="h-8 text-xs border border-gray-200 rounded px-2" @change="handleSourceChange">
            <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-primary text-xs" @click="handleSave">保存配置</button>
        <span v-if="saved" class="text-xs text-green-600 font-bold">已保存</span>
      </div>
    </div>
  </div>
</template>
