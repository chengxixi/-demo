<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const sentimentCards = [
  { label: '任务数', value: '12' },
  { label: '成功', value: '11' },
  { label: '失败', value: '1' },
  { label: '商品', value: '38' },
  { label: '新增评论', value: '1,240' },
  { label: '平均星级', value: '4.3' },
]

const starDistribution = [5, 4.2, 3.5, 2.1, 1.3]

const positiveOpinions = [
  { source: 'Amazon', brand: 'RENPHO', sentiment: '正面', tag: '性价比', text: 'Great value for the price, accurate measurements and easy app setup.' },
  { source: '天猫', brand: '华为', sentiment: '正面', tag: '生态体验', text: '华为全家桶用户，体重体脂数据自动同步，非常方便。' },
]

const negativeOpinions = [
  { source: 'Amazon', brand: 'Withings', sentiment: '负面', tag: '价格', text: 'Way too expensive for what it does. App is slow and measurements are inconsistent.' },
  { source: '京东', brand: '小米', sentiment: '负面', tag: '连接', text: '蓝牙经常断开，需要重新配对，体验很差。' },
]

const unmetNeeds = [
  { need: '离线本机测量显示', desc: '用户期望不打开手机App也能在秤上直接查看体脂数据。' },
  { need: '充电式供电', desc: '海外用户偏好USB充电而非频繁更换AAA电池。' },
]
</script>

<template>
  <div>
    <div class="stats-grid">
      <div v-for="s in sentimentCards" :key="s.label" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value-sm">{{ s.value }}</div>
      </div>
    </div>

    <div class="local-page-grid two" style="margin-top:20px;">
      <section class="panel">
        <div class="panel-title">星级分布（k）</div>
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
          <template v-for="(val, i) in starDistribution" :key="i">
            <div style="display:flex;align-items:center;gap:4px;">
              <Star style="width:14px;height:14px;color:#f59e0b;" />
              <span style="font-size:12px;font-weight:600;">{{ 5-i }}星</span>
            </div>
            <div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
              <div :style="{ width: (val / 5 * 100) + '%', height: '100%', background: i === 0 ? '#22c55e' : i === 1 ? '#84cc16' : i === 2 ? '#eab308' : i === 3 ? '#f97316' : '#ef4444', borderRadius: '4px' }"></div>
            </div>
            <span style="font-size:12px;font-weight:700;min-width:30px;">{{ val }}k</span>
          </template>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">正向观点 Top</div>
        <div v-for="o in positiveOpinions" :key="o.text" class="opinion-item">
          <div style="display:flex;gap:6px;margin-bottom:4px;">
            <span class="chip small green">{{ o.tag }}</span>
            <span style="font-size:11px;color:#999;">{{ o.source }} / {{ o.brand }}</span>
          </div>
          <p class="opinion-text">{{ o.text }}</p>
        </div>
      </section>
    </div>

    <div class="local-page-grid two" style="margin-top:16px;">
      <section class="panel">
        <div class="panel-title">负向观点 Top</div>
        <div v-for="o in negativeOpinions" :key="o.text" class="opinion-item">
          <div style="display:flex;gap:6px;margin-bottom:4px;">
            <span class="chip small red">{{ o.tag }}</span>
            <span style="font-size:11px;color:#999;">{{ o.source }} / {{ o.brand }}</span>
          </div>
          <p class="opinion-text">{{ o.text }}</p>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">未满足需求</div>
        <div v-for="n in unmetNeeds" :key="n.need" class="need-item">
          <strong class="need-title">{{ n.need }}</strong>
          <p class="need-desc">{{ n.desc }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.stat-card { background: #fff; border: 1px solid #d7deea; border-radius: 8px; padding: 16px; }
.stat-label { font-size: 12px; color: #667085; font-weight: 600; }
.stat-value-sm { font-size: 22px; font-weight: 800; color: #101828; margin: 4px 0; }
.local-page-grid.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.panel { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.panel-title { font-size: 14px; font-weight: 700; color: #101828; margin-bottom: 10px; }
.chip.small { padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
.chip.green { background: #eaf7ea; color: #2e7d32; }
.chip.red { background: #fee2e2; color: #e5484d; }
.opinion-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.opinion-text { font-size: 12px; color: #475467; margin: 0; }
.need-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.need-title { font-size: 13px; }
.need-desc { font-size: 12px; color: #475467; margin-top: 4px; }
</style>
