<script setup lang="ts">
import { computed } from 'vue'

export interface EmergencyFilters {
  keyword: string
  level: string
  region: string
  status: string
  dimension: string
  overdue: string
}

const props = defineProps<{
  filters: EmergencyFilters
}>()

const emit = defineEmits<{
  (event: 'update:filters', value: EmergencyFilters): void
}>()

const localFilters = computed({
  get: () => props.filters,
  set: (value: EmergencyFilters) => emit('update:filters', value),
})

function updateField<K extends keyof EmergencyFilters>(key: K, value: EmergencyFilters[K]) {
  localFilters.value = {
    ...localFilters.value,
    [key]: value,
  }
}
</script>

<template>
  <a-row :gutter="[12, 12]" align="middle">
    <a-col :xs="24" :lg="7">
      <a-input
        :value="localFilters.keyword"
        placeholder="搜索编号、型号、问题、影响范围、负责人"
        allow-clear
        @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
    <a-col :xs="12" :sm="8" :lg="3">
      <a-select
        :value="localFilters.level"
        class="w-full"
        allow-clear
        placeholder="P级"
        :options="['P0', 'P1', 'P2', 'P3'].map((item) => ({ label: item, value: item }))"
        @change="updateField('level', String($event || ''))"
      />
    </a-col>
    <a-col :xs="12" :sm="8" :lg="3">
      <a-select
        :value="localFilters.region"
        class="w-full"
        allow-clear
        placeholder="地区"
        :options="['国内', '海外'].map((item) => ({ label: item, value: item }))"
        @change="updateField('region', String($event || ''))"
      />
    </a-col>
    <a-col :xs="12" :sm="8" :lg="4">
      <a-select
        :value="localFilters.status"
        class="w-full"
        allow-clear
        placeholder="状态"
        :options="['临时方案超时', '临时方案输出', '根因分析', '整改措施', '验证结果', '关闭归档'].map((item) => ({ label: item, value: item }))"
        @change="updateField('status', String($event || ''))"
      />
    </a-col>
    <a-col :xs="12" :sm="8" :lg="4">
      <a-select
        :value="localFilters.dimension"
        class="w-full"
        allow-clear
        placeholder="异常维度"
        :options="['客户伤害', '平台合规', '产品体验', '咨询服务'].map((item) => ({ label: item, value: item }))"
        @change="updateField('dimension', String($event || ''))"
      />
    </a-col>
    <a-col :xs="12" :sm="8" :lg="3">
      <a-select
        :value="localFilters.overdue"
        class="w-full"
        allow-clear
        placeholder="时限"
        :options="[
          { label: '已超时', value: 'yes' },
          { label: '未超时', value: 'no' },
        ]"
        @change="updateField('overdue', String($event || ''))"
      />
    </a-col>
  </a-row>
</template>
