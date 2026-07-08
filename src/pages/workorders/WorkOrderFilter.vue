<script setup lang="ts">
import { computed } from 'vue'

interface Filters {
  keyword: string
  status: string
  owner: string
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
    <a-col :xs="24" :md="10">
      <a-input
        :value="localFilters.keyword"
        placeholder="工单编号 / 摘要 / 产品线"
        allow-clear
        @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
    <a-col :xs="24" :md="7">
      <a-select
        :value="localFilters.status"
        class="w-full"
        allow-clear
        placeholder="状态"
        :options="['处理中', '待确认', '已闭环'].map((item) => ({ label: item, value: item }))"
        @change="updateField('status', String($event || ''))"
      />
    </a-col>
    <a-col :xs="24" :md="7">
      <a-input
        :value="localFilters.owner"
        placeholder="负责人"
        allow-clear
        @change="updateField('owner', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
  </a-row>
</template>
