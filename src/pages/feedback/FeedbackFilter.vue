<script setup lang="ts">
import { computed } from 'vue'
import {
  brandOptions,
  exceptionLevels,
  processRouteOptions,
  processStateOptions,
  productTypeOptions,
  returnOptions,
  siteOptions,
  sourceOptions,
} from '@/api/mock'

interface Filters {
  keyword: string
  source: string
  mode: string
  processState: string
  exception: string
  brand: string
  site: string
  productType: string
  model: string
  internal: string
  level1: string
  level2: string
  level3: string
  feedbackUser: string
  dateFrom: string
  dateTo: string
  returned: string
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

function resetFilters() {
  localFilters.value = Object.fromEntries(
    Object.keys(localFilters.value).map((key) => [key, '']),
  ) as unknown as Filters
}
</script>

<template>
  <a-row :gutter="[12, 12]">
    <a-col :xs="24" :md="8">
      <label class="filter-field">
        <span>关键词</span>
        <a-input
          :value="localFilters.keyword"
          placeholder="编号 / 品牌 / 型号 / 内部型号 / 反馈内容"
          allow-clear
          @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>数据来源</span>
        <a-select :value="localFilters.source" class="w-full" placeholder="数据来源" allow-clear :options="sourceOptions.map((item) => ({ label: item, value: item }))" @change="updateField('source', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>创建方式</span>
        <a-select :value="localFilters.mode" class="w-full" placeholder="创建方式" allow-clear :options="['AI自动创建', '人工录入'].map((item) => ({ label: item, value: item }))" @change="updateField('mode', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>品牌</span>
        <a-select :value="localFilters.brand" class="w-full" placeholder="品牌" allow-clear :options="brandOptions.map((item) => ({ label: item, value: item }))" @change="updateField('brand', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>平台</span>
        <a-select :value="localFilters.site" class="w-full" placeholder="平台" allow-clear :options="siteOptions.map((item) => ({ label: item, value: item }))" @change="updateField('site', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>设备类型</span>
        <a-select :value="localFilters.productType" class="w-full" placeholder="设备类型" allow-clear :options="productTypeOptions.map((item) => ({ label: item, value: item }))" @change="updateField('productType', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>销售型号</span>
        <a-input :value="localFilters.model" placeholder="销售型号" allow-clear @change="updateField('model', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>内部型号/料号</span>
        <a-input :value="localFilters.internal" placeholder="内部型号/料号" allow-clear @change="updateField('internal', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>一级职能</span>
        <a-select :value="localFilters.level1" class="w-full" placeholder="一级职能" allow-clear :options="['产品质量', '产品体验', '咨询服务'].map((item) => ({ label: item, value: item }))" @change="updateField('level1', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>二级问题</span>
        <a-input :value="localFilters.level2" placeholder="二级问题" allow-clear @change="updateField('level2', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>三级问题</span>
        <a-input :value="localFilters.level3" placeholder="三级问题" allow-clear @change="updateField('level3', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>反馈人</span>
        <a-input :value="localFilters.feedbackUser" placeholder="反馈人" allow-clear @change="updateField('feedbackUser', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>反馈开始时间</span>
        <a-input :value="localFilters.dateFrom" type="date" @change="updateField('dateFrom', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>反馈结束时间</span>
        <a-input :value="localFilters.dateTo" type="date" @change="updateField('dateTo', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>处理状态</span>
        <a-select :value="localFilters.processState" class="w-full" placeholder="处理状态" allow-clear :options="processStateOptions.map((item) => ({ label: item, value: item }))" @change="updateField('processState', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>异常等级</span>
        <a-select :value="localFilters.exception" class="w-full" placeholder="异常等级" allow-clear :options="exceptionLevels.map((item) => ({ label: item, value: item }))" @change="updateField('exception', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>退换货</span>
        <a-select :value="localFilters.returned" class="w-full" placeholder="退换货" allow-clear :options="returnOptions.map((item) => ({ label: item, value: item }))" @change="updateField('returned', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>处理去向</span>
        <a-select :value="localFilters.processRoute" class="w-full" placeholder="处理去向" allow-clear :options="processRouteOptions.map((item) => ({ label: item, value: item }))" @change="updateField('processRoute', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field action-field">
        <span>&nbsp;</span>
        <a-button block @click="resetFilters">重置筛选</a-button>
      </label>
    </a-col>
  </a-row>
</template>

<style scoped>
.filter-field {
  display: grid;
  gap: 6px;
  margin: 0;
  color: #475467;
  font-size: 12px;
  font-weight: 700;
}

.filter-field span {
  line-height: 1.2;
}
</style>
