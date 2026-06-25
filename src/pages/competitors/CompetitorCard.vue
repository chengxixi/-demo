<script setup lang="ts">
import type { Competitor } from '@/types'

defineProps<{
  competitor: Competitor
}>()

defineEmits<{
  click: [c: Competitor]
}>()
</script>

<template>
  <article class="product-card" @click="$emit('click', competitor)">
    <div class="product-card-head">
      <span class="source-chip">{{ competitor.type }}</span>
      <span class="monitor-badge" :class="{
        'monitor-normal': competitor.monitorStatus === '正常监控',
        'monitor-stopped': competitor.monitorStatus === '已解除监控',
        'monitor-archived': competitor.monitorStatus === '已归档',
      }">{{ competitor.monitorStatus || '正常监控' }}</span>
    </div>
    <strong>{{ competitor.brand }} {{ competitor.name }}</strong>
    <em>{{ competitor.productType }} / {{ competitor.position }}</em>
    <div class="product-price-row"><b>{{ competitor.dealPrice }}</b><span>{{ competitor.platform }}</span></div>
    <p>{{ typeof competitor.sellingPoints === 'string' ? competitor.sellingPoints : competitor.sellingPoints.join(' / ') }}</p>
  </article>
</template>

<style scoped>
.product-card { background: #fff; border: 1px solid #d7deea; border-radius: 8px; padding: 18px; cursor: pointer; transition: box-shadow 0.15s; display: grid; gap: 8px; align-content: start; }
.product-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card-head { display: flex; justify-content: space-between; align-items: flex-start; }
.product-card strong { font-size: 17px; color: #101828; }
.product-card em { font-size: 12px; color: #667085; font-style: normal; }
.product-price-row { display: flex; justify-content: space-between; align-items: baseline; }
.product-price-row b { font-size: 18px; color: #e5484d; }
.product-price-row span { font-size: 12px; color: #475467; }
.product-card p { font-size: 12px; color: #475467; line-height: 1.4; }

.monitor-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.monitor-normal { background: #eaf7ea; color: #2e7d32; border: 1px solid #a5d6a7; }
.monitor-stopped { background: #fefbe8; color: #94650c; border: 1px solid #f7d24a; }
.monitor-archived { background: #f2f4f7; color: #475467; border: 1px solid #d7deea; }
.source-chip { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; background: #eef4ff; color: #175cd3; }
</style>
