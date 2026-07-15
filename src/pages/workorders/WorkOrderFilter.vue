<script setup lang="ts">
import { computed } from 'vue'

interface Filters {
  keyword: string
  productLine: string
  status: string
  owner: string
}

const props = defineProps<{
  filters: Filters
  productLines: string[]
  statuses: string[]
  owners: string[]
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
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>关键词</span>
        <a-input
          :value="localFilters.keyword"
          placeholder="工单编号 / 摘要 / 关联反馈"
          allow-clear
          @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>产品线</span>
        <a-select
          :value="localFilters.productLine"
          class="w-full"
          allow-clear
          placeholder="产品线"
          :options="props.productLines.map((item) => ({ label: item, value: item }))"
          @change="updateField('productLine', String($event || ''))"
        />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>状态</span>
        <a-select
          :value="localFilters.status"
          class="w-full"
          allow-clear
          placeholder="状态"
          :options="props.statuses.map((item) => ({ label: item, value: item }))"
          @change="updateField('status', String($event || ''))"
        />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>当前处理人</span>
        <a-select
          :value="localFilters.owner"
          class="w-full"
          allow-clear
          placeholder="当前处理人"
          :options="props.owners.map((item) => ({ label: item, value: item }))"
          @change="updateField('owner', String($event || ''))"
        />
      </label>
    </a-col>
  </a-row>
</template>

<style scoped>
.filter-field {
  display: grid;
  gap: 6px;
  margin: 0;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

.filter-field span {
  line-height: 1.2;
}
</style>
