<script setup lang="ts">
import { computed } from 'vue'

interface Filters {
  name: string
  channelType: string
  asin: string
  line: string
  price: string
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
  <a-row :gutter="[12, 12]" align="middle">
    <a-col :xs="24" :md="6">
      <a-input
        :value="localFilters.name"
        placeholder="品牌 / 产品名称"
        allow-clear
        @change="updateField('name', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-select
        :value="localFilters.channelType"
        class="w-full"
        :options="[
          { label: '全部渠道', value: '' },
          { label: '海外', value: '海外' },
          { label: '国内', value: '国内' },
        ]"
        @change="updateField('channelType', String($event))"
      />
    </a-col>
    <a-col :xs="24" :md="5">
      <a-input
        :value="localFilters.asin"
        placeholder="ASIN / 平台编号"
        allow-clear
        @change="updateField('asin', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
    <a-col :xs="24" :md="5">
      <a-select
        :value="localFilters.line"
        class="w-full"
        :options="[
          { label: '全部产品线', value: '' },
          { label: '八电极秤', value: '八电极秤' },
          { label: '体脂秤', value: '体脂秤' },
          { label: '筋膜枪', value: '筋膜枪' },
        ]"
        @change="updateField('line', String($event))"
      />
    </a-col>
    <a-col :xs="24" :md="4">
      <a-input
        :value="localFilters.price"
        placeholder="价格"
        allow-clear
        @change="updateField('price', ($event.target as HTMLInputElement).value)"
      />
    </a-col>
  </a-row>
</template>
