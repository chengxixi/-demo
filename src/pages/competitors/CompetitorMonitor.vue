<script setup lang="ts">
import { ref } from 'vue'

const alerts = [
  { level: 'L4', event: 'Withings 新增心率/血管年龄卖点', action: '建议进入换代功能机会评估', brand: 'Withings', type: '功能变化' },
  { level: 'L3', event: 'RENPHO 近7天价格下降18%', action: '跟进价格带和促销节奏', brand: 'RENPHO', type: '价格变化' },
  { level: 'L3', event: '华为八电极秤大促排名上升', action: '复盘国内高端秤卖点结构', brand: '华为', type: '排名变化' },
]

interface MarketDynamic {
  platform: string; brand: string; product: string; category: string; rank: string; price: string; rating: string; reviews: string; change: string; event: string; trigger: string; plan: string; handled: boolean; date: string
}

const dynamics: MarketDynamic[] = [
  { platform: 'Amazon US', brand: 'RENPHO', product: 'Elis 1 Smart Scale', category: '四电极体脂秤', rank: '#8', price: '$39.99', rating: '4.6', reviews: '23,400', change: '价格 -18%', event: '促销', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-18' },
  { platform: 'Amazon US', brand: 'Withings', product: 'Body Scan', category: '八电极体脂秤', rank: '#24', price: '$99.00', rating: '4.4', reviews: '8,920', change: '新增心率/血管年龄', event: '上新', trigger: 'L4', plan: '启动实物分析', handled: true, date: '2026-06-18' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤 3 Pro', category: '八电极体脂秤', rank: '类目第3', price: '¥399', rating: '4.8', reviews: '18,260', change: '618预售上升', event: '排名', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-19' },
  { platform: '京东', brand: '小米', product: '体脂秤 S400 Pro', category: '四电极体脂秤', rank: '类目第5', price: '¥179', rating: '4.7', reviews: '52,100', change: '低价型号放量', event: '价格', trigger: 'L2', plan: '', handled: false, date: '2026-06-10' },
  { platform: '独立站', brand: 'Wyze', product: 'Scale X', category: '体脂秤', rank: '自然流量上升', price: '$33.99', rating: '4.2', reviews: '4,700', change: '套餐包上线', event: '上新', trigger: 'L1', plan: '', handled: false, date: '2026-06-12' },
  { platform: '抖音', brand: '倍轻松', product: 'M5 筋膜枪', category: '筋膜枪', rank: '热销榜第7', price: '¥499', rating: '4.6', reviews: '9,840', change: '达人视频曝光增加', event: '内容', trigger: 'L3', plan: '', handled: false, date: '2026-06-21' },
]

const handleTarget = ref('')
const showHandleModal = ref(false)

function openHandleDialog(target: string) {
  handleTarget.value = target
  showHandleModal.value = true
}

function selectHandlePlan(plan: string) {
  const d = dynamics.find(d => d.brand + ' ' + d.product === handleTarget.value)
  if (d) {
    d.plan = plan
    d.handled = true
  }
  showHandleModal.value = false
}
</script>

<template>
  <div>
    <div class="alerts-row">
      <div v-for="a in alerts" :key="a.event" class="alert-card" :class="'level-' + a.level.toLowerCase()">
        <div class="alert-level" :class="'lvl-' + a.level.toLowerCase()">L{{ a.level.replace('L','') }}</div>
        <div class="alert-body">
          <strong>{{ a.event }}</strong>
          <p>{{ a.action }}</p>
          <span class="alert-meta">{{ a.brand }} / {{ a.type }}</span>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="font-size:16px;">跨平台竞品动态</h3>
        <button class="primary-button" style="font-size:12px;">生成分析任务</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>平台</th><th>品牌</th><th>产品</th><th>类别</th><th>排名</th><th>价格</th><th>评分</th><th>评论数</th><th>变化</th><th>事件</th><th>触发</th><th>最新处理方案</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in dynamics" :key="d.platform + d.product">
              <td><span class="source-chip">{{ d.platform }}</span></td>
              <td>{{ d.brand }}</td>
              <td class="model-name">{{ d.product }}</td>
              <td>{{ d.category }}</td>
              <td>{{ d.rank }}</td>
              <td>{{ d.price }}</td>
              <td>{{ d.rating }}</td>
              <td>{{ d.reviews }}</td>
              <td :class="d.change.includes('-') ? 'bad-text' : 'good-text'">{{ d.change }}</td>
              <td>{{ d.event }}</td>
              <td>
                <span class="pill" :class="d.trigger === 'L4' ? 'p1' : d.trigger === 'L3' ? 'p2' : 'p3'">{{ d.trigger }}</span>
              </td>
              <td>
                <template v-if="d.handled">{{ d.plan }}</template>
                <template v-else-if="d.trigger === 'L1' || d.trigger === 'L2'">--</template>
                <template v-else>未处理</template>
              </td>
              <td>
                <button v-if="(d.trigger === 'L3' || d.trigger === 'L4') && !d.handled" class="secondary-button" style="font-size:11px;padding:3px 10px;" @click="openHandleDialog(d.brand + ' ' + d.product)">处理</button>
                <span v-else-if="d.handled" class="status-pill">已完成</span>
                <span v-else>--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- L3/L4 处理方案弹窗 -->
    <Teleport to="body">
      <div v-if="showHandleModal" class="modal-overlay" @click.self="showHandleModal = false">
        <div class="modal-content" style="max-width:640px;">
          <div class="modal-head">
            <div><span style="color:#667085;font-size:13px;">市场监控处理</span><h2>{{ handleTarget }}</h2><p style="color:#667085;">L3/L4 触发提醒后，由产品经理选择处理方案。</p></div>
            <button class="icon-button" @click="showHandleModal = false">×</button>
          </div>
          <div class="local-page-grid" style="grid-template-columns: repeat(2, 1fr); margin: 16px 0;">
            <article class="local-module-card">
              <h3>转紧急异常处理</h3>
              <p>涉及安全、法规、合规、集中投诉或重大风险时进入紧急异常流程。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('转紧急异常处理')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>启动实物分析</h3>
              <p>线上信息不足或需验证结构、体验、包装、APP、配件时发起实物分析。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('启动实物分析')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>转入需求</h3>
              <p>形成明确产品或业务改进方向，进入需求池评审。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('转入需求')">选择</button>
            </article>
            <article class="local-module-card">
              <h3>解除监控并归档</h3>
              <p>判断无持续价值或已完成跟踪时，保留记录后停止监控。</p>
              <button class="secondary-button" style="margin-top:8px;" @click="selectHandlePlan('解除监控并归档')">选择</button>
            </article>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.alerts-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.alert-card { display: flex; gap: 12px; padding: 14px; border-radius: 8px; border: 1px solid #f0f0f0; }
.alert-level { padding: 2px 10px; border-radius: 4px; font-weight: 800; font-size: 12px; white-space: nowrap; }
.lvl-l4 { background: #fee2e2; color: #e5484d; }
.lvl-l3 { background: #fff3e0; color: #ed8936; }
.lvl-l2 { background: #eef4ff; color: #175cd3; }
.alert-body strong { font-size: 13px; display: block; }
.alert-body p { font-size: 12px; color: #475467; margin: 4px 0; }
.alert-meta { font-size: 11px; color: #999; }

.data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table th, .data-table td { border: 1px solid #e4eaf3; padding: 6px 10px; text-align: left; white-space: nowrap; }
.data-table th { background: #f8fafc; font-weight: 700; color: #475467; }

.source-chip { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; background: #eef4ff; color: #175cd3; }
.pill { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
.pill.p1 { background: #fee2e2; color: #e5484d; }
.pill.p2 { background: #fff3e0; color: #ed8936; }
.pill.p3 { background: #eef4ff; color: #175cd3; }

.primary-button { padding: 8px 16px; background: #175cd3; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
.secondary-button { padding: 8px 16px; background: #fff; color: #475467; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; cursor: pointer; }

.status-pill { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #eaf7ea; color: #2e7d32; }
.bad-text { color: #e5484d; font-weight: 600; }
.good-text { color: #2e7d32; font-weight: 600; }
.model-name { font-weight: 600; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; z-index: 999; padding-top: 5vh; overflow-y: auto; }
.modal-content { background: #fff; border-radius: 12px; width: min(800px, 95vw); max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
.modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px 12px; border-bottom: 1px solid #e4eaf3; position: sticky; top: 0; background: #fff; z-index: 1; }
.modal-head h2 { margin: 4px 0 2px; font-size: 18px; }
.modal-head p { margin: 0; color: #667085; font-size: 12px; }
.icon-button { background: none; border: 1px solid #d7deea; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 16px; }
.local-page-grid { display: grid; gap: 14px; padding: 0 20px 16px; }
.local-module-card { background: #fff; border: 1px solid #e4eaf3; border-radius: 8px; padding: 14px; }
.local-module-card h3 { font-size: 14px; margin: 0 0 6px; }
.local-module-card p { font-size: 13px; color: #475467; margin: 0; }
</style>
