<script setup lang="ts">
import { computed } from 'vue'
import {
  brandOptions,
  exceptionLevels,
  processRouteOptions,
  productTypeOptions,
  returnOptions,
  siteOptions,
  sourceOptions,
} from '@/api/mock'

interface Filters {
  feedbackTime: string
  source: string[]
  createMode: string[]
  region: string[]
  site: string[]
  productType: string[]
  brand: string[]
  feedbackUser: string
  returned: string[]
  level1: string[]
  level2: string[]
  level3: string[]
  exception: string[]
  processRoute: string[]
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

const feedbackTimeOptions = ['近7天', '近30天', '近90天']
const createModeOptions = ['人工录入', 'AI自动创建']
const regionOptions = ['国内', '海外']
const level1Options = ['产品质量', '产品体验', '咨询服务']
const level2Options = ['硬件问题', '数据准确性', '功能效果', 'APP问题']
const level3Options = ['无法开机', '测脂不准', '噪声偏大', '数据不同步']
const feedbackUserOptions = ['张伟', '李娜', '陈晨', '王雪', '周杰', '赵敏', '系统']

function updateField<K extends keyof Filters>(key: K, value: Filters[K]) {
  localFilters.value = {
    ...localFilters.value,
    [key]: value,
  }
}

function updateMultiField<K extends keyof Filters>(key: K, value: unknown) {
  updateField(key, (Array.isArray(value) ? value.map(String) : []) as Filters[K])
}

function resetFilters() {
  localFilters.value = {
    feedbackTime: '',
    source: [],
    createMode: [],
    region: [],
    site: [],
    productType: [],
    brand: [],
    feedbackUser: '',
    returned: [],
    level1: [],
    level2: [],
    level3: [],
    exception: [],
    processRoute: [],
  }
}
</script>

<template>
  <a-row :gutter="[12, 12]">
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>反馈时间</span>
        <a-select :value="localFilters.feedbackTime" class="w-full" placeholder="反馈时间" allow-clear :options="feedbackTimeOptions.map((item) => ({ label: item, value: item }))" @change="updateField('feedbackTime', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>数据来源</span>
        <a-select :value="localFilters.source" mode="multiple" :max-tag-count="1" class="w-full" placeholder="数据来源" allow-clear :options="sourceOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('source', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>创建类型</span>
        <a-select :value="localFilters.createMode" mode="multiple" :max-tag-count="1" class="w-full" placeholder="创建类型" allow-clear :options="createModeOptions.map((item) => ({ label: item === '人工录入' ? '人工创建' : 'AI创建', value: item }))" @change="updateMultiField('createMode', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>地区</span>
        <a-select :value="localFilters.region" mode="multiple" :max-tag-count="1" class="w-full" placeholder="地区" allow-clear :options="regionOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('region', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>平台</span>
        <a-select :value="localFilters.site" mode="multiple" :max-tag-count="1" class="w-full" placeholder="平台" allow-clear :options="siteOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('site', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>产品线</span>
        <a-select :value="localFilters.productType" mode="multiple" :max-tag-count="1" class="w-full" placeholder="产品线" allow-clear :options="productTypeOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('productType', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>品牌</span>
        <a-select :value="localFilters.brand" mode="multiple" :max-tag-count="1" class="w-full" placeholder="品牌" allow-clear :options="brandOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('brand', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>反馈人</span>
        <a-select :value="localFilters.feedbackUser" class="w-full" placeholder="反馈人" allow-clear :options="feedbackUserOptions.map((item) => ({ label: item, value: item }))" @change="updateField('feedbackUser', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>退换货</span>
        <a-select :value="localFilters.returned" mode="multiple" :max-tag-count="1" class="w-full" placeholder="退换货" allow-clear :options="returnOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('returned', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>一级分类</span>
        <a-select :value="localFilters.level1" mode="multiple" :max-tag-count="1" class="w-full" placeholder="一级分类" allow-clear :options="level1Options.map((item) => ({ label: item, value: item }))" @change="updateMultiField('level1', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>二级分类</span>
        <a-select :value="localFilters.level2" mode="multiple" :max-tag-count="1" class="w-full" placeholder="二级分类" allow-clear :options="level2Options.map((item) => ({ label: item, value: item }))" @change="updateMultiField('level2', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>三级分类</span>
        <a-select :value="localFilters.level3" mode="multiple" :max-tag-count="1" class="w-full" placeholder="三级分类" allow-clear :options="level3Options.map((item) => ({ label: item, value: item }))" @change="updateMultiField('level3', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>异常等级</span>
        <a-select :value="localFilters.exception" mode="multiple" :max-tag-count="1" class="w-full" placeholder="异常等级" allow-clear :options="exceptionLevels.map((item) => ({ label: item, value: item }))" @change="updateMultiField('exception', $event)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="4">
      <label class="filter-field">
        <span>处理去向</span>
        <a-select :value="localFilters.processRoute" mode="multiple" :max-tag-count="1" class="w-full" placeholder="处理去向" allow-clear :options="processRouteOptions.map((item) => ({ label: item, value: item }))" @change="updateMultiField('processRoute', $event)" />
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
