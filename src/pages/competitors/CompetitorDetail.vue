<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Competitor } from '@/types'
import { defaultLevelRecords } from '@/api/mock'

const props = defineProps<{
  open: boolean
  competitor: Competitor | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const analysisStatus = ref('待启动')
const owner = ref('李工')

const specRows = computed(() => {
  const specs = props.competitor?.specs

  if (!specs) {
    return []
  }

  if (typeof specs === 'string') {
    return specs.split('/').map((item, index) => ({
      key: `spec-${index}`,
      name: `参数 ${index + 1}`,
      value: item.trim(),
    }))
  }

  return Object.entries(specs).map(([name, value]) => ({
    key: name,
    name,
    value,
  }))
})

const sellingPointRows = computed(() => {
  const points = props.competitor?.sellingPoints

  if (!points) {
    return []
  }

  const list = Array.isArray(points) ? points : points.split('/')

  return list.map((point, index) => ({
    key: `point-${index}`,
    point: point.trim(),
  }))
})

function closeModal() {
  emit('update:open', false)
}
</script>

<template>
  <a-modal
    :open="props.open"
    :title="props.competitor ? `${props.competitor.brand} ${props.competitor.name}` : '竞品详情'"
    width="980px"
    @cancel="closeModal"
  >
    <template v-if="props.competitor">
      <a-descriptions bordered size="small" :column="3">
        <a-descriptions-item label="产品线">{{ props.competitor.category }}</a-descriptions-item>
        <a-descriptions-item label="竞品类型">{{ props.competitor.type }}</a-descriptions-item>
        <a-descriptions-item label="渠道">{{ props.competitor.channelType || '-' }}</a-descriptions-item>
        <a-descriptions-item label="ASIN/链接">{{ props.competitor.asin || '-' }}</a-descriptions-item>
        <a-descriptions-item label="型号">{{ props.competitor.model }}</a-descriptions-item>
        <a-descriptions-item label="到手价">{{ props.competitor.dealPrice }}</a-descriptions-item>
        <a-descriptions-item label="评分">{{ props.competitor.rating }}</a-descriptions-item>
        <a-descriptions-item label="评论数">{{ props.competitor.reviews }}</a-descriptions-item>
        <a-descriptions-item label="监控状态">{{ props.competitor.monitorStatus }}</a-descriptions-item>
      </a-descriptions>

      <a-row :gutter="16" class="mt-4">
        <a-col :xs="24" :md="12">
          <a-typography-title :level="5">核心卖点</a-typography-title>
          <vxe-table :data="sellingPointRows" size="mini" border>
            <vxe-column field="point" title="卖点" />
          </vxe-table>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-typography-title :level="5">参数</a-typography-title>
          <vxe-table :data="specRows" size="mini" border>
            <vxe-column field="name" title="参数" width="160" />
            <vxe-column field="value" title="值" />
          </vxe-table>
        </a-col>
      </a-row>

      <a-row :gutter="16" class="mt-4">
        <a-col :xs="24" :md="8">
          <a-form layout="vertical">
            <a-form-item label="实物分析状态">
              <a-select
                v-model:value="analysisStatus"
                :options="[
                  { label: '待启动', value: '待启动' },
                  { label: '分析中', value: '分析中' },
                  { label: '已完成', value: '已完成' },
                ]"
              />
            </a-form-item>
            <a-form-item label="负责人">
              <a-input v-model:value="owner" />
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :xs="24" :md="16">
          <a-typography-title :level="5">L1-L4 监控记录</a-typography-title>
          <vxe-table :data="defaultLevelRecords" size="mini" border>
            <vxe-column field="level" title="等级" width="80" />
            <vxe-column field="source" title="来源" width="120" />
            <vxe-column field="content" title="内容" />
            <vxe-column field="action" title="动作" width="120" />
            <vxe-column field="status" title="状态" width="140" />
            <vxe-column field="date" title="日期" width="120" />
          </vxe-table>
        </a-col>
      </a-row>
    </template>
    <template #footer>
      <a-button type="primary" @click="closeModal">关闭</a-button>
    </template>
  </a-modal>
</template>
