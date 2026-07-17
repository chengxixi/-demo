<script setup lang="ts">
import { computed } from 'vue'

interface Filters {
  id: string
  summary: string
  feedbackId: string
  productLine: string
  status: string
  inflowTime: string
  owner: string
  dept: string
  route: string
}

const props = defineProps<{
  filters: Filters
  productLines: string[]
  statuses: string[]
  owners: string[]
  departments: string[]
  routes: string[]
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
        <span>工单编号</span>
        <a-input :value="localFilters.id" placeholder="工单编号" allow-clear @change="updateField('id', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>摘要</span>
        <a-input :value="localFilters.summary" placeholder="摘要" allow-clear @change="updateField('summary', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>反馈单编号</span>
        <a-input :value="localFilters.feedbackId" placeholder="反馈单编号" allow-clear @change="updateField('feedbackId', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>产品线</span>
        <a-select :value="localFilters.productLine" class="w-full" allow-clear placeholder="产品线" :options="props.productLines.map((item) => ({ label: item, value: item }))" @change="updateField('productLine', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>状态</span>
        <a-select :value="localFilters.status" class="w-full" allow-clear placeholder="状态" :options="props.statuses.map((item) => ({ label: item, value: item }))" @change="updateField('status', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>流入时间</span>
        <a-input :value="localFilters.inflowTime" placeholder="流入时间" allow-clear @change="updateField('inflowTime', ($event.target as HTMLInputElement).value)" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>当前处理人</span>
        <a-select :value="localFilters.owner" class="w-full" allow-clear placeholder="当前处理人" :options="props.owners.map((item) => ({ label: item, value: item }))" @change="updateField('owner', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>部门</span>
        <a-select :value="localFilters.dept" class="w-full" allow-clear placeholder="部门" :options="props.departments.map((item) => ({ label: item, value: item }))" @change="updateField('dept', String($event || ''))" />
      </label>
    </a-col>
    <a-col :xs="24" :md="6">
      <label class="filter-field">
        <span>处理去向</span>
        <a-select :value="localFilters.route" class="w-full" allow-clear placeholder="处理去向" :options="props.routes.map((item) => ({ label: item, value: item }))" @change="updateField('route', String($event || ''))" />
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
