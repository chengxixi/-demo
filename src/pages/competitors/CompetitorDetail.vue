<script setup lang="ts">
import type { Competitor, LevelRecord } from '@/types'

interface PhysicalAnalysis {
  status: string
  owner: string
  deadline: string
  triggerSource: string
  analysisType: string
  focusItems: string
  conclusion: string
}

const props = defineProps<{
  competitor: Competitor | null
  visible: boolean
  levelRecords: LevelRecord[]
  showArchive: boolean
  showPhysicalAnalysis: boolean
  physicalAnalysis: PhysicalAnalysis
}>()

const emit = defineEmits<{
  close: []
  archive: [c: Competitor]
  unmonitor: [c: Competitor]
  startPhysicalAnalysis: [c: Competitor]
  'update:physicalAnalysis': [analysis: PhysicalAnalysis]
}>()

const scaleDetailGroups: [string, string[]][] = [
  ['基础信息', ['竞品类型','内部竞品','品牌','产品名称','产品型号','产品类型','产品定位','上市时间','销售平台','销售区域','竞品链接','信息来源','信息采集日期','信息采集人','信息状态']],
  ['销售信息', ['官方售价','到手价','币种','价格区间']],
  ['外观结构', ['长度(mm)','宽度(mm)','厚度(mm)','产品重量(kg)','玻璃类型','玻璃厚度','底壳结构','机身材质','表面工艺','颜色','按键类型','防滑脚垫','秤面站位引导']],
  ['电极系统', ['是否支持测脂','电极类型','电极数量','脚部电极数量','手部电极数量','是否有手柄','手柄类型','手柄连接方式']],
  ['称重系统', ['起称重量','最大称重','分度值','单位切换','传感器类型','称重精度说明']],
  ['测量系统', ['APP测量指标','本机测量/显示指标','测量频率','运动员模式','孕妇模式','婴儿模式','访客模式','宠物/抱婴称重模式']],
  ['显示系统', ['屏幕类型','屏幕尺寸','屏幕位置','屏幕显示语言','用户识别显示','趋势/等级显示']],
  ['智能系统', ['APP连接','APP名称','连接方式','OTA升级','数据同步/生态接入','多用户识别','自动用户识别','历史数据趋势','家庭成员管理','数据报告形式']],
  ['电源系统', ['供电方式','电池数量','Type-C充电','续航时间','低电提示']],
  ['包装配件', ['包装形式','包装语言','说明书','电池']],
]

const massageDetailGroups: [string, string[]][] = [
  ['基础信息', ['竞品类型','内部竞品','品牌','产品名称','产品型号','产品类型','产品定位','上市时间','销售平台','销售区域','竞品链接','信息来源','信息采集日期','信息采集人','信息状态']],
  ['销售信息', ['官方售价','到手价','币种','价格区间']],
  ['外观结构', ['长度(mm)','宽度(mm)','厚度/高度(mm)','产品净重(g)','机身材质','表面工艺','颜色','握持方式','防滑设计','人体工学设计']],
  ['动力系统', ['电机类型','振幅/冲程(mm)','最大推力','最低转速(rpm)','最高转速(rpm)','噪音(dB)','档位数量','力度体验备注']],
  ['电源系统', ['电池容量(mAh)','电池类型','官方续航时间','充电接口','快充功能','低电提示']],
  ['按摩头系统', ['按摩头数量','按摩头类型','按摩头连接方式','按摩头材质']],
  ['功能系统', ['压力感应','智能档位','档位记忆','定时保护','自动模式','热敷功能','冷敷功能']],
  ['智能系统', ['通信方式','APP名称','APP核心功能']],
  ['包装配件', ['包装形式','包装语言','收纳包','充电线','说明书']],
]

const monitorSnapshotWeeks = ['W1', 'W2', 'W3', 'W4']
const monitorSnapshotItems = [
  { key: 'avgPrice', label: '近期成交均价', desc: '海外/国内主渠道近7日平均成交价' },
  { key: 'gmvBsr', label: 'GMV/BSR排名', desc: 'GMV(万)或BSR排名' },
  { key: 'salesVolume', label: '销量（运营评估）', desc: '运营评估销量' },
  { key: 'rating', label: '评分', desc: '产品评分' },
  { key: 'newFeature', label: '新功能', desc: '竞品新增功能或卖点' },
  { key: 'promoEvent', label: '促销活动', desc: '近期促销活动及力度' },
  { key: 'stockStatus', label: '库存状态', desc: '缺货/断货/正常' },
  { key: 'listingChange', label: 'Listing变动', desc: '标题/图片/A+页面变更' },
]

function handleClose() { emit('close') }
function handleArchive() { if (props.competitor) emit('archive', props.competitor) }
function handleUnmonitor() { if (props.competitor) emit('unmonitor', props.competitor) }
function handleStartPhysicalAnalysis() { if (props.competitor) emit('startPhysicalAnalysis', props.competitor) }
function updatePhysicalAnalysisField<K extends keyof PhysicalAnalysis>(key: K, value: PhysicalAnalysis[K]) {
  emit('update:physicalAnalysis', { ...props.physicalAnalysis, [key]: value })
}
</script>

<template>
  <div v-if="visible && competitor" class="local-competitor-detail-page">
    <div class="local-page-head">
      <div>
        <h2>竞品详情
          <span class="monitor-badge" :class="{
            'monitor-normal': competitor.monitorStatus === '正常监控',
            'monitor-stopped': competitor.monitorStatus === '已解除监控',
            'monitor-archived': competitor.monitorStatus === '已归档',
          }">{{ competitor.monitorStatus || '正常监控' }}</span>
        </h2>
        <p style="color:#475467;font-size:13px;">{{ competitor.brand }} {{ competitor.name }} / {{ competitor.model }} / {{ competitor.productType }} / {{ competitor.platform }}</p>
      </div>
      <div class="local-page-actions">
        <button class="secondary-button" @click="handleClose">返回竞品列表</button>
        <button class="secondary-button" @click="handleArchive">
          {{ competitor.archived ? '取消归档' : '归档' }}
        </button>
        <button class="monitor-toggle-button" :class="{ active: competitor.monitorStatus === '已解除监控' }" @click="handleUnmonitor">
          {{ competitor.monitorStatus === '已解除监控' ? '持续监控' : '解除监控' }}
        </button>
        <button class="primary-button" @click="handleStartPhysicalAnalysis">启动实物分析</button>
      </div>
    </div>

    <!-- 基本信息网格 -->
    <div class="local-detail-grid">
      <div class="field-item"><span>竞品类型</span><strong>{{ competitor.type }}</strong></div>
      <div class="field-item"><span>产品类型</span><strong>{{ competitor.productType }}</strong></div>
      <div class="field-item"><span>产品定位</span><strong>{{ competitor.position }}</strong></div>
      <div class="field-item"><span>上市时间</span><strong>{{ competitor.launch }}</strong></div>
      <div class="field-item"><span>销售平台</span><strong>{{ competitor.platform }}</strong></div>
      <div class="field-item"><span>销售区域</span><strong>{{ competitor.region }}</strong></div>
      <div class="field-item"><span>官方售价</span><strong>{{ competitor.officialPrice }}</strong></div>
      <div class="field-item"><span>到手价</span><strong style="color:#e5484d;">{{ competitor.dealPrice }}</strong></div>
      <div class="field-item"><span>评分</span><strong>{{ competitor.rating }}</strong></div>
      <div class="field-item"><span>评论数</span><strong>{{ competitor.reviews }}</strong></div>
      <div class="field-item"><span>规格参数</span><strong>{{ typeof competitor.specs === 'string' ? competitor.specs : '' }}</strong></div>
      <div class="field-item"><span>产品型号</span><strong>{{ competitor.model }}</strong></div>
    </div>

    <div class="local-page-grid two">
      <article class="local-module-card">
        <h3>核心卖点</h3>
        <p>{{ typeof competitor.sellingPoints === 'string' ? competitor.sellingPoints.replaceAll(' / ', '、') : (competitor.sellingPoints || []).join('、') }}</p>
      </article>
      <article class="local-module-card">
        <h3>用户痛点</h3>
        <p>{{ competitor.pain }}</p>
      </article>
    </div>

    <!-- 登记参数 -->
    <section class="panel" style="margin-top:16px;">
      <div class="panel-title">竞品信息登记表字段</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
        <template v-for="[group, fields] in (competitor.category === '筋膜枪' ? massageDetailGroups : scaleDetailGroups)" :key="group">
          <div class="param-group-divider">{{ group }}</div>
          <div v-for="fn in fields" :key="fn" class="field-item">
            <span>{{ fn }}</span>
            <strong>{{ competitor.registerFields?.[fn] || '待补充' }}</strong>
          </div>
        </template>
      </div>
    </section>

    <!-- L1-L4 监控记录 -->
    <section class="panel" style="margin-top:16px;">
      <div class="panel-title">L1-L4 监控记录</div>
      <table class="local-competition-table">
        <thead><tr><th>等级</th><th>触发来源</th><th>记录内容</th><th>最新处理方案</th><th>状态</th><th>记录时间</th></tr></thead>
        <tbody>
          <tr v-for="row in levelRecords" :key="row.date + row.level">
            <td><span class="pill" :class="row.level === 'L4' ? 'p1' : row.level === 'L3' ? 'p2' : 'p3'">{{ row.level }}</span></td>
            <td>{{ row.source }}</td>
            <td>{{ row.content }}</td>
            <td>{{ row.action }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.date }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 归档记录 -->
    <div v-if="competitor.archived || showArchive" style="margin-top:16px;">
      <section class="panel">
        <div class="panel-title">归档记录</div>
        <div class="local-detail-grid">
          <article><span>监控状态</span><strong>{{ competitor.monitorStatus || '正常监控' }}</strong></article>
          <article><span>归档时间</span><strong>2026-06-22</strong></article>
          <article><span>归档说明</span><strong>保留历史记录，后续如再次出现变化可重新启动日常监控。</strong></article>
        </div>
      </section>
    </div>

    <!-- 实物分析 -->
    <section v-if="showPhysicalAnalysis" class="panel" style="margin-top:16px;">
      <div class="panel-title">实物分析信息</div>
      <div class="local-modal-grid">
        <label><span>竞品对象</span><input :value="`${competitor.brand} ${competitor.name}`" readonly /></label>
        <label><span>分析状态</span>
          <select :value="physicalAnalysis.status" @change="updatePhysicalAnalysisField('status', ($event.target as HTMLSelectElement).value)">
            <option>待上传报告</option><option>分析中</option><option>已完成</option><option>已归档</option>
          </select>
        </label>
        <label><span>负责人</span><input :value="physicalAnalysis.owner" @input="updatePhysicalAnalysisField('owner', ($event.target as HTMLInputElement).value)" placeholder="填写产品经理或分析负责人" /></label>
        <label><span>计划完成时间</span><input type="date" :value="physicalAnalysis.deadline" @input="updatePhysicalAnalysisField('deadline', ($event.target as HTMLInputElement).value)" /></label>
        <label><span>触发来源</span>
          <select :value="physicalAnalysis.triggerSource" @change="updatePhysicalAnalysisField('triggerSource', ($event.target as HTMLSelectElement).value)">
            <option>L4 紧急提醒</option><option>L3 触发提醒</option><option>产品经理主动发起</option>
          </select>
        </label>
        <label><span>分析类型</span>
          <select :value="physicalAnalysis.analysisType" @change="updatePhysicalAnalysisField('analysisType', ($event.target as HTMLSelectElement).value)">
            <option>实物分析 + 拆机分析 + 产品体验</option>
            <option>仅产品体验</option><option>仅拆机分析</option><option>专项对标</option>
          </select>
        </label>
        <label class="wide"><span>上传拆机分析报告</span><input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx" /></label>
        <label class="wide"><span>上传产品体验报告</span><input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx" /></label>
        <label class="wide"><span>重点验证项</span><textarea rows="3" :value="physicalAnalysis.focusItems" @input="updatePhysicalAnalysisField('focusItems', ($event.target as HTMLTextAreaElement).value)" placeholder="填写需要重点验证的结构、功能、体验、包装、APP或风险点"></textarea></label>
        <label class="wide"><span>分析结论</span><textarea rows="3" :value="physicalAnalysis.conclusion" @input="updatePhysicalAnalysisField('conclusion', ($event.target as HTMLTextAreaElement).value)" placeholder="后续补充分析结论、可借鉴点、风险判断和下一步建议"></textarea></label>
      </div>
    </section>

    <!-- 监控快照 -->
    <section class="panel" style="margin-top:16px;">
      <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span>竞品监控快照 — {{ competitor.brand }} {{ competitor.name }}</span>
        <button class="secondary-button" style="font-size:12px;padding:4px 12px;">记录本周快照</button>
      </div>
      <p style="color:#666;font-size:12px;margin-bottom:12px;">定时监控该竞品核心指标，每周记录形成历史快照，支持趋势回顾。</p>
      <div style="overflow-x:auto;">
        <table class="data-table local-monitor-table">
          <thead>
            <tr>
              <th style="min-width:200px;position:sticky;left:0;background:#eef2ff;z-index:1;">监控项</th>
              <th style="min-width:100px;">登记人</th>
              <th v-for="w in monitorSnapshotWeeks" :key="w" style="min-width:80px;">{{ w }}</th>
              <th style="min-width:90px;">本周</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in monitorSnapshotItems" :key="item.key">
              <td style="position:sticky;left:0;background:#fff;font-weight:600;">{{ item.label }}<br><small style="color:#999;">{{ item.desc }}</small></td>
              <td>胡锦弘</td>
              <td v-for="w in monitorSnapshotWeeks" :key="w">--</td>
              <td>--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.local-competitor-detail-page { display: grid; gap: 16px; }
.local-page-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.local-page-head h2 { margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
.local-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.local-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.field-item { background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e4eaf3; }
.field-item span { display: block; color: #667085; font-size: 11px; font-weight: 600; }
.field-item strong { display: block; color: #101828; font-size: 13px; margin-top: 2px; }
.local-page-grid.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.local-module-card { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.local-module-card h3 { font-size: 14px; margin: 0 0 6px; }
.local-module-card p { font-size: 13px; color: #475467; margin: 0; }

.monitor-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.monitor-normal { background: #eaf7ea; color: #2e7d32; border: 1px solid #a5d6a7; }
.monitor-stopped { background: #fefbe8; color: #94650c; border: 1px solid #f7d24a; }
.monitor-archived { background: #f2f4f7; color: #475467; border: 1px solid #d7deea; }

.panel { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.panel-title { font-size: 14px; font-weight: 700; color: #101828; margin-bottom: 10px; }
.param-group-divider { grid-column: 1 / -1; padding: 6px 0 2px; margin-top: 4px; border-bottom: 1px solid #e4eaf3; color: #667085; font-size: 12px; font-weight: 800; }

.local-competition-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.local-competition-table th, .local-competition-table td { border: 1px solid #e4eaf3; padding: 8px 10px; text-align: left; }
.local-competition-table th { background: #f8fafc; font-weight: 700; color: #475467; }

.pill { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
.pill.p1 { background: #fee2e2; color: #e5484d; }
.pill.p2 { background: #fff3e0; color: #ed8936; }
.pill.p3 { background: #eef4ff; color: #175cd3; }

.monitor-toggle-button { padding: 6px 14px; border-radius: 6px; border: 1px solid #d7deea; background: #fff; font-size: 13px; cursor: pointer; }
.monitor-toggle-button.active { background: #fee2e2; color: #e5484d; border-color: #e5484d; }

.primary-button { padding: 8px 16px; background: #175cd3; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.secondary-button { padding: 8px 16px; background: #fff; color: #475467; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; cursor: pointer; }

.local-modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.local-modal-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #475467; }
.local-modal-grid label.wide { grid-column: 1 / -1; }
.local-modal-grid input,
.local-modal-grid select,
.local-modal-grid textarea { padding: 8px 10px; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; }
.local-modal-grid textarea { resize: vertical; min-height: 60px; }
.local-modal-grid label > span { color: #667085; }

.data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table th, .data-table td { border: 1px solid #e4eaf3; padding: 6px 10px; text-align: left; white-space: nowrap; }
.data-table th { background: #f8fafc; font-weight: 700; color: #475467; }
.local-monitor-table th { padding: 6px 10px; background: #eef2ff; border: 1px solid #d7deea; font-size: 12px; }
.local-monitor-table td { padding: 6px 10px; border: 1px solid #e4eaf3; font-size: 12px; }
</style>
