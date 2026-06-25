<template>
  <div class="px-6 py-3 flex items-center gap-3 flex-shrink-0">
    <select
      :value="productLine"
      class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white"
      @change="handleProductLineChange(($event.target as HTMLSelectElement).value)"
    >
      <option value="">全部产品线</option>
      <option v-for="pl in productLineOptions" :key="pl" :value="pl">{{ pl }}</option>
    </select>
    <select
      :value="status"
      class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white"
      @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
    >
      <option value="">全部状态</option>
      <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
    </select>
    <select
      :value="owner"
      class="h-8 text-xs border border-gray-300 rounded-md px-2.5 font-bold bg-white"
      @change="handleOwnerChange(($event.target as HTMLSelectElement).value)"
    >
      <option value="">全部处理人</option>
      <option v-for="o in ownerOptions" :key="o" :value="o">{{ o }}</option>
    </select>
    <span class="text-[11px] text-gray-400 ml-auto">{{ filteredCount }} 条工单</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  productLine: string
  status: string
  owner: string
  productLineOptions: string[]
  statusOptions: string[]
  ownerOptions: string[]
  filteredCount: number
}>()

const emit = defineEmits<{
  'update:productLine': [value: string]
  'update:status': [value: string]
  'update:owner': [value: string]
}>()

function handleProductLineChange(value: string) {
  emit('update:productLine', value)
}

function handleStatusChange(value: string) {
  emit('update:status', value)
}

function handleOwnerChange(value: string) {
  emit('update:owner', value)
}
</script>
