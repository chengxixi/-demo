<template>
  <div class="bg-white border border-gray-200 rounded-lg mb-5 px-4 py-3">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <select
        :value="filters.level"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('level', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">级别</option>
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>
      <select
        :value="filters.region"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('region', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">区域</option>
        <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
      </select>
      <select
        :value="filters.site"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('site', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">站点</option>
        <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
        <option value="Amazon">Amazon</option>
        <option value="京东">京东</option>
      </select>
      <select
        :value="filters.productLine"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('productLine', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">产品线</option>
        <option v-for="p in productLineOptions" :key="p" :value="p">{{ p }}</option>
      </select>
      <input
        :value="filters.creator"
        type="text"
        placeholder="创建人"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        @input="handleFilterChange('creator', ($event.target as HTMLInputElement).value)"
      />
      <select
        :value="filters.dimension"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('dimension', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">维度</option>
        <option v-for="d in dimensionOptions" :key="d" :value="d">{{ d }}</option>
      </select>
      <select
        :value="filters.source"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        @change="handleFilterChange('source', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">来源</option>
        <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
      </select>
      <input
        :value="filters.deadline"
        type="text"
        placeholder="截止时间"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        @input="handleFilterChange('deadline', ($event.target as HTMLInputElement).value)"
      />
      <div class="relative lg:col-span-2">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          :value="filters.search"
          type="search"
          placeholder="搜索异常ID、问题、内部型号、负责人..."
          class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
          @input="handleFilterChange('search', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="mt-3 flex justify-end">
      <button class="btn-secondary text-xs" @click="handleResetFilters">重置筛选</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  filters: {
    level: string
    region: string
    site: string
    productLine: string
    creator: string
    dimension: string
    source: string
    deadline: string
    search: string
  }
  regionOptions: string[]
  siteOptions: string[]
  productLineOptions: string[]
  dimensionOptions: string[]
  sourceOptions: string[]
}>()

const emit = defineEmits<{
  'update:filters': [key: string, value: string]
  'reset-filters': []
}>()

function handleFilterChange(key: string, value: string) {
  emit('update:filters', key, value)
}

function handleResetFilters() {
  emit('reset-filters')
}
</script>
