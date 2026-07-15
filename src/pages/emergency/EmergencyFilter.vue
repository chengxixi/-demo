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
  <div class="emergency-filter-grid">
    <label class="filter-field wide">
      <span>其他相关信息</span>
      <a-input
        :value="localFilters.keyword"
        placeholder="搜索编号、处理人、来源、型号、问题、影响范围"
        allow-clear
        @change="updateField('keyword', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <label class="filter-field">
      <span>异常等级</span>
      <a-select
        :value="localFilters.level"
        class="w-full"
        allow-clear
        placeholder="全部等级"
        :options="['P0', 'P1', 'P2', 'P3'].map((item) => ({ label: item, value: item }))"
        @change="updateField('level', String($event || ''))"
      />
    </label>
    <label class="filter-field">
      <span>地区</span>
      <a-select
        :value="localFilters.region"
        class="w-full"
        allow-clear
        placeholder="全部地区"
        :options="['国内', '海外'].map((item) => ({ label: item, value: item }))"
        @change="updateField('region', String($event || ''))"
      />
    </label>
    <label class="filter-field">
      <span>处理阶段</span>
      <a-select
        :value="localFilters.status"
        class="w-full"
        allow-clear
        placeholder="未归档"
        :options="['临时方案超时', '临时方案输出', '根因分析', '整改措施', '验证结果', '关闭归档'].map((item) => ({ label: item, value: item }))"
        @change="updateField('status', String($event || ''))"
      />
    </label>
    <label class="filter-field">
      <span>异常维度</span>
      <a-select
        :value="localFilters.dimension"
        class="w-full"
        allow-clear
        placeholder="全部维度"
        :options="['客户伤害', '平台合规', '产品体验', '咨询服务'].map((item) => ({ label: item, value: item }))"
        @change="updateField('dimension', String($event || ''))"
      />
    </label>
    <label class="filter-field">
      <span>超时状态</span>
      <a-select
        :value="localFilters.overdue"
        class="w-full"
        allow-clear
        placeholder="全部状态"
        :options="[
          { label: '已超时', value: 'yes' },
          { label: '未超时', value: 'no' },
        ]"
        @change="updateField('overdue', String($event || ''))"
      />
    </label>
  </div>
</template>

<style scoped>
.emergency-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  align-items: end;
}

.filter-field {
  display: grid;
  gap: 6px;
  margin: 0;
  color: #475467;
  font-size: 12px;
  font-weight: 700;
}

.filter-field.wide {
  grid-column: span 2;
}

.filter-field span {
  line-height: 1.2;
}

@media (max-width: 980px) {
  .emergency-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-field.wide {
    grid-column: span 2;
  }
}
</style>