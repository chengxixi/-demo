<template>
  <div class="page-body">
    <!-- 筛选栏 -->
    <section class="filter-bar">
      <label class="select-control">
        <span>时间周期</span>
        <select v-model="filters.period">
          <option v-for="opt in periodOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
      <label class="select-control">
        <span>品牌</span>
        <select v-model="filters.brand">
          <option v-for="opt in brandOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
      <label class="select-control">
        <span>站点</span>
        <select v-model="filters.site">
          <option v-for="opt in siteOptions" :key="opt" :value="opt">{{ optMap[opt] || opt }}</option>
        </select>
      </label>
      <label class="select-control">
        <span>产品类型</span>
        <select v-model="filters.productType">
          <option v-for="opt in productTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
      <label class="select-control">
        <span>产品型号</span>
        <select v-model="filters.model">
          <option v-for="opt in modelOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
      <label class="select-control">
        <span>反馈来源</span>
        <select v-model="filters.source">
          <option v-for="opt in sourceOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
    </section>

    <!-- 页签切换 -->
    <div class="tabs-row">
      <button :class="['tab', { active: tab === 'business' }]" @click="tab = 'business'">反馈仪表盘</button>
      <button :class="['tab', { active: tab === 'quality' }]" @click="tab = 'quality'">问题仪表盘</button>
      <div class="tab-spacer"></div>
      <span class="compare-label">对比维度：</span>
      <button :class="['segmented', { active: comparison === '环比' }]" @click="comparison = '环比'">环比</button>
      <button :class="['segmented', { active: comparison === '同比' }]" @click="comparison = '同比'">同比</button>
      <button class="plain-icon-button">
        <!-- Filter icon -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        图表说明
      </button>
    </div>

    <!-- 反馈仪表盘 -->
    <template v-if="tab === 'business'">
      <div class="dashboard-grid">
        <!-- 指标卡 -->
        <div class="metric-grid">
          <article v-for="item in metricCards" :key="item.label" class="metric-card">
            <div class="metric-label">
              <span>{{ item.label }}</span>
              <!-- CircleHelp icon -->
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <strong>{{ item.value }}</strong>
            <div :class="['trend', item.trendType.includes('good') ? 'good' : 'bad']">
              <!-- TrendingUp or TrendingDown -->
              <svg v-if="item.trendType.startsWith('up')" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
              {{ item.trend }}
            </div>
            <div class="metric-foot">
              <span>{{ item.note1 }}</span>
              <b>{{ item.note2 }}</b>
            </div>
          </article>
        </div>

        <!-- 关键指标趋势图 -->
        <section class="panel full-width">
          <div class="panel-title">
            <h2>关键指标趋势（{{ periodLabel }}）</h2>
            <!-- CircleHelp icon -->
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span></span>
          </div>
          <div class="line-chart">
            <div class="legend-row">
              <span v-for="line in chartLines" :key="line.label"><i :style="{ background: line.color }"></i>{{ line.label }}</span>
              <select><option>按天</option><option>按周</option></select>
            </div>
            <svg class="trend-svg" viewBox="0 0 900 220" role="img" aria-label="关键指标趋势图">
              <defs>
                <linearGradient id="closeRateArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#22a06b" stop-opacity="0.16" />
                  <stop offset="100%" stop-color="#22a06b" stop-opacity="0.02" />
                </linearGradient>
              </defs>
              <!-- Y-axis grid and labels -->
              <g v-for="tick in [0, 25, 50, 75, 100]" :key="'y-'+tick">
                <line :x1="padding.left" :x2="900 - padding.right" :y1="yScale(tick)" :y2="yScale(tick)" class="trend-grid" />
                <text :x="padding.left - 10" :y="yScale(tick) + 4" class="trend-y-label" text-anchor="end">{{ tick }}%</text>
              </g>
              <!-- X-axis labels at every other point -->
              <g v-for="(label, idx) in xLabels" :key="'x-'+label">
                <line :x1="xScale(idx * 2)" :x2="xScale(idx * 2)" :y1="padding.top" :y2="220 - padding.bottom" class="trend-v-grid" />
                <text :x="xScale(idx * 2)" :y="220 - 6" class="trend-x-label" text-anchor="middle">{{ label }}</text>
              </g>
              <!-- Area fill for first line -->
              <path :d="makeArea(chartLines[0].values)" fill="url(#closeRateArea)" />
              <!-- Lines and data points -->
              <g v-for="line in chartLines" :key="line.label">
                <path :d="makePath(line.values)" fill="none" :stroke="line.color" :stroke-width="line.width" stroke-linecap="round" stroke-linejoin="round" />
                <circle
                  v-for="(value, idx) in line.values"
                  v-show="idx % 2 === 0"
                  :key="line.label + '-dot-' + idx"
                  :cx="xScale(idx)"
                  :cy="yScale(value)"
                  :r="line.width + 1"
                  fill="#fff"
                  :stroke="line.color"
                  stroke-width="2"
                />
              </g>
              <!-- Callout -->
              <g class="trend-callout">
                <line :x1="xScale(12)" :x2="xScale(12)" :y1="padding.top" :y2="220 - padding.bottom" />
                <rect :x="xScale(12) - 116" y="16" width="108" height="56" rx="6" />
                <text :x="xScale(12) - 104" y="38">闭环率 91.0%</text>
                <text :x="xScale(12) - 104" y="58">响应达成 88.0%</text>
              </g>
            </svg>
          </div>
        </section>

        <!-- 产品型号表现 TOP10 -->
        <section class="panel table-panel wide">
          <div class="panel-title">
            <h2>产品型号表现 TOP10</h2>
            <!-- CircleHelp icon -->
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span></span>
          </div>
          <table class="data-table compact model-rank-table">
            <thead>
              <tr><th>排名</th><th>产品型号</th><th>销量</th><th>反馈量</th><th>退货率</th><th>差评率</th><th>评分</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in modelTableRows" :key="row[0]">
                <td>{{ idx + 1 }}</td>
                <td class="model-name">{{ row[0] }}</td>
                <td>{{ formatNumber(row[1] * multiplier) }}</td>
                <td>{{ formatNumber(row[2] * multiplier) }}</td>
                <td :class="idx === 1 || idx === 4 ? 'bad-text' : 'good-text'">{{ row[3] }}</td>
                <td :class="idx === 1 || idx === 4 ? 'bad-text' : 'good-text'">{{ row[6] }}</td>
                <td class="good-text">{{ row[5] }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 退货率 vs 反馈率（按产品类型） -->
        <section class="panel">
          <div class="panel-title">
            <h2>退货率 vs 反馈率（按产品类型）</h2>
          </div>
          <div class="bar-chart">
            <div v-for="[label, returns, feedback] in barRows" :key="label" class="bar-group">
              <div class="bars">
                <span class="blue" :style="{ height: (returns * 8) + 'px' }"><b>{{ returns }}%</b></span>
                <span class="orange" :style="{ height: (feedback * 6) + 'px' }"><b>{{ feedback }}%</b></span>
              </div>
              <em>{{ label }}</em>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- 问题仪表盘 -->
    <template v-if="tab === 'quality'">
      <div class="quality-grid">
        <!-- 一级反馈分类 - Donut -->
        <section class="panel category-panel">
          <div class="panel-title">
            <h2>一级反馈分类（{{ periodLabel }}）</h2>
          </div>
          <div class="donut-layout">
            <div class="donut" :style="{ background: `conic-gradient(${donutGradient(levelOneDonut)})` }">
              <div>
                <span>一级分类</span>
                <strong>100%</strong>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="item in levelOneDonut" :key="item.name">
                <i :style="{ background: item.color }"></i>
                <span>{{ item.name }}</span>
                <small
                  :class="['legend-change', item[changeKey] > 0 ? 'increase' : item[changeKey] < 0 ? 'decrease' : 'stable']"
                  :title="`${comparison}${formatPointChange(item[changeKey])}`"
                >{{ formatPointChange(item[changeKey]) }}</small>
                <b>{{ item.value }}%</b>
                <em>({{ item.count }})</em>
              </div>
            </div>
          </div>
        </section>

        <!-- 二级反馈分类 - Donut -->
        <section class="panel category-panel">
          <div class="panel-title">
            <h2>二级反馈分类（{{ periodLabel }}）</h2>
          </div>
          <div class="donut-layout">
            <div class="donut" :style="{ background: `conic-gradient(${donutGradient(levelTwoDonut)})` }">
              <div>
                <span>二级分类</span>
                <strong>100%</strong>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="item in levelTwoDonut" :key="item.name">
                <i :style="{ background: item.color }"></i>
                <span>{{ item.name }}</span>
                <small
                  :class="['legend-change', item[changeKey] > 0 ? 'increase' : item[changeKey] < 0 ? 'decrease' : 'stable']"
                  :title="`${comparison}${formatPointChange(item[changeKey])}`"
                >{{ formatPointChange(item[changeKey]) }}</small>
                <b>{{ item.value }}%</b>
                <em>({{ item.count }})</em>
              </div>
            </div>
          </div>
        </section>

        <!-- 三级反馈分类 - Donut -->
        <section class="panel category-panel">
          <div class="panel-title">
            <h2>三级反馈分类（{{ periodLabel }}）</h2>
          </div>
          <div class="donut-layout">
            <div class="donut" :style="{ background: `conic-gradient(${donutGradient(qualityDonut)})` }">
              <div>
                <span>问题数</span>
                <strong>{{ formatNumber(82 * multiplier) }}</strong>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="item in qualityDonut" :key="item.name">
                <i :style="{ background: item.color }"></i>
                <span>{{ item.name }}</span>
                <small
                  :class="['legend-change', item[changeKey] > 0 ? 'increase' : item[changeKey] < 0 ? 'decrease' : 'stable']"
                  :title="`${comparison}${formatPointChange(item[changeKey])}`"
                >{{ formatPointChange(item[changeKey]) }}</small>
                <b>{{ item.value }}%</b>
                <em>({{ item.count }})</em>
              </div>
            </div>
          </div>
        </section>

        <!-- 前5大三级反馈比例对比 -->
        <section class="panel wide">
          <div class="panel-title">
            <h2>前5大三级反馈比例对比</h2>
          </div>
          <div class="compare-bars">
            <div class="compare-legend">
              <span v-for="[label, color] in stackedSeries" :key="label"><i :style="{ background: color }"></i>{{ label }}</span>
            </div>
            <div class="compare-chart">
              <div v-for="[label, current, previous, lastYear] in stackedRows" :key="label" class="compare-group">
                <div class="compare-bar-set">
                  <span :style="{ height: (current * 5) + 'px', background: stackedSeries[0][1] }"><b>{{ current }}%</b></span>
                  <span :style="{ height: (previous * 5) + 'px', background: stackedSeries[1][1] }"><b>{{ previous }}%</b></span>
                  <span :style="{ height: (lastYear * 5) + 'px', background: stackedSeries[2][1] }"><b>{{ lastYear }}%</b></span>
                </div>
                <em>{{ label }}</em>
              </div>
            </div>
          </div>
        </section>

        <!-- 紧急异常动态 -->
        <section class="panel">
          <div class="panel-title">
            <h2>紧急异常动态（近24小时）</h2>
            <span></span>
            <button @click="$emit('go', 'exceptions')">查看更多</button>
          </div>
          <div class="timeline">
            <div v-for="(row, index) in exceptionRows" :key="row.id" class="timeline-row">
              <span :class="['pill', row.p.toLowerCase()]">{{ row.p }}</span>
              <div><strong>{{ row.issue }}</strong><em>{{ row.source }} / {{ row.status }}</em></div>
              <span :class="['status-tag', `status-${index}`]">{{ statusTags[index] }}</span>
              <time>{{ times[index] }}</time>
            </div>
          </div>
        </section>

        <!-- TOP质量问题 -->
        <section class="panel table-panel wide">
          <div class="panel-title">
            <h2>TOP质量问题（按占比）</h2>
          </div>
          <table class="data-table compact">
            <thead><tr><th>三级问题</th><th>涉及型号</th><th>反馈占比</th><th>趋势</th><th>主要型号</th><th>负责人</th><th>异常SLA</th></tr></thead>
            <tbody>
              <tr v-for="row in qualityTableRows" :key="row[0]">
                <td v-for="(cell, cIdx) in row" :key="cIdx" :class="String(cell).includes('+') ? 'bad-text' : String(cell).includes('-') ? 'good-text' : ''">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 质量改善动作看板 -->
        <section class="panel">
          <div class="panel-title">
            <h2>质量改善动作看板</h2>
            <span></span>
            <button @click="$emit('go', 'tickets')">查看任务</button>
          </div>
          <div class="quality-actions">
            <div class="quality-action-summary">
              <article><span>改善任务</span><strong>12</strong></article>
              <article><span>本周关闭</span><strong>5</strong></article>
              <article><span>逾期风险</span><strong class="bad-text">3</strong></article>
            </div>
            <div v-for="[name, scope, state, progress, color] in qualityActions" :key="name" class="quality-action-row">
              <div>
                <strong>{{ name }}</strong>
                <span>{{ scope }} / {{ state }}</span>
              </div>
              <b>{{ progress }}%</b>
              <em><i :style="{ width: progress + '%', background: color }"></i></em>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// -------- Reactive State --------
const tab = ref<'business' | 'quality'>('business');
const comparison = ref<'环比' | '同比'>('环比');

const filters = ref({
  period: '近30天',
  site: 'Amazon.com (US)',
  brand: '全部品牌',
  productType: '体脂秤',
  model: '全部',
  source: '全部',
});

// -------- Filter Options --------
const periodOptions = ['近7天', '近30天', '近90天', '自定义'];
const siteOptions = ['全部站点', 'Amazon.com (US)', '天猫', '京东', '抖音'];
const optMap: Record<string, string> = {
  'Amazon.com (US)': '亚马逊（US）',
};
const brandOptions = ['全部品牌', '云康宝', 'AF', 'GE', 'LF'];
const productTypeOptions = ['全部产品类型', '体脂秤', '人体秤', '八电极秤', '筋膜枪', '按摩产品'];
const modelOptions = ['全部', 'CS20A', 'CS30B', 'BF511', 'MG20', 'MS30'];
const sourceOptions = ['全部', '商品评论', '退货原因', '站内信', '客服沟通', 'APP反馈', '社媒', 'Vine', '天使用户', '投诉/警告'];

// -------- Helper Functions --------
function getPeriodLabel(period: string): string {
  return period.replace(/\s*\(.+\)/, '');
}

function getMultiplier(): number {
  let multiplier = 1;
  if (filters.value.period.includes('7天')) multiplier *= 0.38;
  if (filters.value.period.includes('今日')) multiplier *= 0.08;
  if (filters.value.period.includes('90天')) multiplier *= 2.65;
  if (filters.value.site !== '全部站点' && filters.value.site !== 'Amazon.com (US)') multiplier *= 0.74;
  if (filters.value.brand !== '全部品牌') multiplier *= 0.58;
  if (filters.value.productType === '筋膜枪') multiplier *= 0.62;
  if (filters.value.productType === '八电极秤') multiplier *= 0.48;
  if (filters.value.model !== '全部') multiplier *= 0.43;
  if (filters.value.source !== '全部') multiplier *= 0.31;
  return multiplier;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('zh-CN');
}

function formatPointChange(value: number): string {
  if (value > 0) return `↑${value}%`;
  if (value < 0) return `↓${Math.abs(value)}%`;
  return '0%';
}

const periodLabel = computed(() => getPeriodLabel(filters.value.period));
const multiplier = computed(() => getMultiplier());

// -------- Metric Cards Data --------
const metricCards = computed(() => {
  const m = multiplier.value;
  return [
    { label: '退货率', value: '4.38%', trend: '-0.72%', trendType: 'down-good', note1: '退货量', note2: formatNumber(1256 * m) },
    { label: '反馈率', value: '12.67%', trend: '-1.34%', trendType: 'down-good', note1: '反馈量', note2: formatNumber(3637 * m) },
    { label: '闭环率', value: '87.45%', trend: '+3.21%', trendType: 'up-good', note1: '已闭环', note2: formatNumber(3178 * m) },
    { label: '响应达成率', value: '92.16%', trend: '+4.57%', trendType: 'up-good', note1: '达成', note2: formatNumber(3349 * m) },
    { label: '异常占比', value: '6.72%', trend: '+0.89%', trendType: 'up-bad', note1: '异常工单', note2: formatNumber(244 * m) },
    { label: '差评率', value: '3.25%', trend: '-0.31%', trendType: 'down-good', note1: '差评数量', note2: formatNumber(935 * m) },
  ];
});

// -------- Line Chart Data --------
interface ChartLine {
  label: string;
  color: string;
  values: number[];
  width: number;
}

const chartLines: ChartLine[] = [
  { label: '闭环率', color: '#22a06b', values: [82, 84, 83, 85, 86, 86, 87, 88, 87, 89, 88, 90, 91], width: 3 },
  { label: '响应达成率', color: '#6d5dfc', values: [78, 79, 81, 80, 82, 83, 82, 84, 85, 84, 86, 87, 88], width: 3 },
  { label: '反馈率', color: '#ff8a00', values: [13.8, 14.1, 13.5, 14.8, 14.0, 13.6, 13.2, 12.9, 13.4, 12.8, 12.4, 12.1, 11.9], width: 2 },
  { label: '退货率', color: '#1f73e8', values: [4.9, 5.1, 4.8, 5.0, 4.7, 4.6, 4.8, 4.5, 4.6, 4.4, 4.5, 4.3, 4.2], width: 2 },
];

const xLabels = ['03/13', '03/27', '04/10', '04/24', '05/08', '05/22', '06/05'];

const padding = { top: 18, right: 10, bottom: 26, left: 34 };

function yScale(value: number): number {
  return padding.top + (1 - value / 100) * (220 - padding.top - padding.bottom);
}

function xScale(index: number): number {
  return padding.left + (index / 12) * (900 - padding.left - padding.right);
}

function makePath(values: number[]): string {
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ');
}

function makeArea(values: number[]): string {
  return `${makePath(values)} L ${xScale(values.length - 1)} ${220 - padding.bottom} L ${xScale(0)} ${220 - padding.bottom} Z`;
}

// -------- Model Table Data --------
const modelTableRows = [
  ['YB-S100 八电极体脂秤', 6528, 856, '4.12%', '13.1%', '4.5分', '3.12%'],
  ['YB-201 人体成分秤', 4932, 642, '4.78%', '13.0%', '4.4分', '3.38%'],
  ['YB-301 体脂秤 Pro', 3765, 487, '4.25%', '12.9%', '4.6分', '3.01%'],
  ['YB-M3 筋膜枪 M3 Pro', 2983, 421, '3.95%', '14.1%', '4.3分', '3.21%'],
  ['YB-F1 智能体脂秤 F1', 2357, 309, '4.88%', '13.1%', '4.2分', '3.45%'],
];

// -------- Bar Comparison Data --------
const barRows: Array<[string, number, number]> = [
  ['体脂秤', 4.38, 12.67],
  ['人体秤', 4.91, 13.24],
  ['八电极秤', 4.12, 13.01],
  ['筋膜枪', 3.28, 14.85],
  ['按摩产品', 4.75, 11.92],
];

// -------- Donut Chart Data --------
interface DonutItem {
  name: string;
  value: number;
  count: number;
  color: string;
  mom: number;
  yoy: number;
}

const qualityIssues = [
  { name: '测脂不准', value: 28, color: '#1f73e8', mom: 5, yoy: 7 },
  { name: 'APP连接问题', value: 19, color: '#22a06b', mom: 3, yoy: 5 },
  { name: '功能需求/改进建议', value: 16, color: '#ffb020', mom: -2, yoy: 3 },
  { name: '包装/配件问题', value: 9, color: '#8b5cf6', mom: -2, yoy: 1 },
  { name: '说明书/标识问题', value: 6, color: '#06b6d4', mom: 1, yoy: -1 },
  { name: '其他问题', value: 4, color: '#94a3b8', mom: 0, yoy: -2 },
];

const levelOneCategories = [
  { name: '产品质量', value: 36, color: '#1f73e8', mom: 4, yoy: 6 },
  { name: '产品体验', value: 28, color: '#22a06b', mom: -3, yoy: -2 },
  { name: '物流运营', value: 14, color: '#ffb020', mom: -2, yoy: 1 },
  { name: '平台合规', value: 9, color: '#8b5cf6', mom: 2, yoy: 3 },
  { name: '咨询服务', value: 8, color: '#06b6d4', mom: 1, yoy: -1 },
  { name: '其他', value: 5, color: '#94a3b8', mom: -2, yoy: -7 },
];

const levelTwoCategories = [
  { name: '硬件问题', value: 24, color: '#1f73e8', mom: 3, yoy: 5 },
  { name: '数据准确性', value: 20, color: '#22a06b', mom: 4, yoy: 6 },
  { name: 'APP问题', value: 16, color: '#ffb020', mom: -1, yoy: 2 },
  { name: '包装配件', value: 13, color: '#8b5cf6', mom: -3, yoy: -1 },
  { name: '功能效果', value: 11, color: '#06b6d4', mom: 2, yoy: 3 },
  { name: '其他', value: 16, color: '#94a3b8', mom: -5, yoy: -15 },
];

const changeKey = computed(() => (comparison.value === '同比' ? 'yoy' : 'mom'));

const levelOneDonut = computed(() =>
  levelOneCategories.map((item) => ({ ...item, count: item.value } as DonutItem))
);
const levelTwoDonut = computed(() =>
  levelTwoCategories.map((item) => ({ ...item, count: item.value } as DonutItem))
);
const qualityDonut = computed(() =>
  qualityIssues.map((item) => ({ ...item, count: item.value } as DonutItem))
);

function donutGradient(items: DonutItem[]): string {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  return items
    .map((item) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');
}

// -------- Stacked Bars Data --------
const stackedRows: Array<[string, number, number, number]> = [
  ['测脂不准', 28, 23, 21],
  ['APP连接问题', 19, 16, 14],
  ['功能需求/改进建议', 16, 18, 13],
  ['包装/配件问题', 9, 11, 8],
  ['说明书/标识问题', 6, 5, 7],
];

const stackedSeries: Array<[string, string]> = [
  ['本期', '#1f73e8'],
  ['上期', '#ff8a00'],
  ['去年同期', '#22a06b'],
];

// -------- Timeline Data --------
const exceptionRows = [
  { id: 'EX-20260611-008', p: 'P1', dimension: '平台合规', source: '投诉/警告', response: '2小时响应 / 24小时方案', owner: '运营负责人 + 产品经理', status: '处置方案', issue: '玻璃碎裂投诉连续上升', action: '隔离相关批次，检查包装防护' },
  { id: 'EX-20260611-007', p: 'P2', dimension: '客户伤害', source: '退货原因', response: '6小时响应 / 72小时方案', owner: '团队主管 + 售后负责人', status: '执行跟进', issue: '测脂不准导致退货率升高', action: '分析传感器数据与说明书误导' },
  { id: 'EX-20260610-004', p: 'P3', dimension: '运营优化', source: 'APP反馈', response: '24小时响应 / 常规处理', owner: '客服专员', status: '案例归档', issue: '单位切换咨询高频', action: 'Q&A新增视频指引' },
];

const statusTags = ['新增', '已响应', '处理中'];
const times = ['10:15', '09:42', '08:30'];

// -------- Quality Table Data --------
const qualityTableRows: Array<[string, number, string, string, string, string, string]> = [
  ['测脂不准', 8, '23.6%', '+5.2pp', 'CS20A, CS30B', '李工', '72%'],
  ['APP连接问题', 6, '18.9%', '+3.1pp', 'CS20A, CS10M', '王工', '86%'],
  ['无法开机', 5, '12.7%', '-2.7pp', 'CS30B, BF511', '张工', '88%'],
  ['充电问题', 4, '9.4%', '-1.3pp', 'CS20A, CS10M', '赵工', '80%'],
  ['蓝牙断连/不稳定', 5, '8.8%', '-1.6pp', 'CS20A, CS30B', '刘工', '92%'],
];

// -------- Quality Action Panel Data --------
const qualityActions: Array<[string, string, string, number, string]> = [
  ['测脂不准专项', 'CS20A/CS30B', '进行中', 72, '#1f73e8'],
  ['APP连接稳定性', 'CS10/CS20A', '验证中', 86, '#22a06b'],
  ['包装防护整改', 'CS30B', '待验证', 64, '#ff8a00'],
];

// -------- Emits --------
defineEmits<{
  go: [page: string];
}>();
</script>
