<script setup lang="ts">
import { computed } from 'vue'
import {
  brandOptions,
  exceptionLevels,
  modelOptions,
  processRouteOptions,
  processStateOptions,
  productTypeOptions,
  siteOptions,
  sourceOptions,
} from '@/api/mock'

interface Filters {
  keyword: string
  source: string
  processState: string
  exception: string
  brand: string
  site: string
  productType: string
  model: string
  feedbackUser: string
  processRoute: string
}

const props = defineProps<{
  filters: Filters
}>()

const emit = defineEmits<{
  (event: 'update:filters', value: Filters): void
}>()

const localFilters = computed({
  get: () => props.filters,
  set: (value: Filters) => emit('update:filters', value),
})

function updateField<K extends keyof Filters>(key: K, value: Filters[K]) {
  localFilters.value = {
    ...localFilters.value,
    [key]: value,
  }
}
</script>

<template>
  <a-row :gutter="[12, 12]">
    <a-col :xs="24" :md="8">
      <a-input
        :value="localFilters.keyword"
        placeholder="编号 / 品牌 / 型号 / 内部型号 / 反馈内容"
        allow-clear
        @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.source"
        class="w-full"
        placeholder="数据来源"
        allow-clear
        :options="sourceOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('source', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.brand"
        class="w-full"
        placeholder="品牌"
        allow-clear
        :options="brandOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('brand', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.site"
        class="w-full"
        placeholder="站点"
        allow-clear
        :options="siteOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('site', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.productType"
        class="w-full"
        placeholder="设备类型"
        allow-clear
        :options="productTypeOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('productType', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.model"
        class="w-full"
        placeholder="销售型号"
        allow-clear
        :options="modelOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('model', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.processState"
        class="w-full"
        placeholder="状态"
        allow-clear
        :options="processStateOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('processState', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.processRoute"
        class="w-full"
        placeholder="处理去向"
        allow-clear
        :options="processRouteOptions.map((item) => ({ label: item, value: item }))"
        @change="updateField('processRoute', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.exception"
        class="w-full"
        placeholder="异常级别"
        allow-clear
        :options="exceptionLevels.map((item) => ({ label: item, value: item }))"
        @change="updateField('exception', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-input
        :value="localFilters.feedbackUser"
        placeholder="反馈人"
        allow-clear
        @change="updateField('feedbackUser', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
  </a-row>
</template>
