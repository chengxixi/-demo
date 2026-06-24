<template>
  <div :class="drawerOpen ? 'split-page with-drawer' : 'split-page'">
    <section class="content-main">
      <!-- 页头 -->
      <div class="page-header">
        <p>原始反馈数据池与AI分类结果总览，独立于工单处理流程</p>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" placeholder="搜索反馈ID、ASIN、型号、原文关键词" />
        </div>
        <button class="primary-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
          新增反馈
        </button>
        <button class="secondary-button">批量导入</button>
        <button class="secondary-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          同步
        </button>
        <div class="sync-summary">
          <span>同步时间：10分钟前</span>
          <strong>新增 18 条</strong>
        </div>
      </div>

      <!-- 汇总 + 批量操作 -->
      <div class="feedback-summary-row">
        <div class="feedback-overview-grid">
          <article v-for="card in summaryCards" :key="card[0]">
            <span>{{ card[0] }}</span>
            <strong>{{ card[1] }}</strong>
          </article>
        </div>
        <section class="batch-action-bar">
          <div class="batch-action-card">
            <div>
              <span>批量处理</span>
              <strong>{{ selectedIds.length }} 条已选</strong>
            </div>
            <div class="batch-action-buttons">
              <button
                v-for="action in batchFeedbackActions"
                :key="action.kind"
                :class="action.className"
                :disabled="!selectedIds.length"
                @click="batchAction = action"
              >{{ action.label }}</button>
            </div>
          </div>
        </section>
      </div>

      <!-- 反馈表格 -->
      <div class="table-scroll">
        <table class="data-table feedback-table">
          <thead>
            <tr>
              <th class="select-column">
                <label class="select-all-cell">
                  <input type="checkbox" :checked="allFilteredSelected" @change="toggleAllFiltered" />
                  <span>全选</span>
                </label>
              </th>
              <th v-for="col in columns" :key="col.key">
                <div :class="['th-filter', columnFilters[col.key] ? 'is-filtered' : '']">
                  <button
                    class="filter-trigger"
                    @click="openFilter = openFilter === col.key ? null : col.key"
                  >
                    <span class="filter-caret"></span>
                    <span class="filter-label">{{ columnFilters[col.key] || col.label }}</span>
                  </button>
                  <div v-if="openFilter === col.key" class="filter-menu">
                    <button :class="{ active: !columnFilters[col.key] }" @click="updateColumnFilter(col.key, '')">全部</button>
                    <button
                      v-for="opt in getColOptions(col)"
                      :key="opt"
                      :class="{ active: columnFilters[col.key] === opt }"
                      @click="updateColumnFilter(col.key, opt)"
                    >{{ opt }}</button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.id"
              :class="{ selected: selectedItem?.id === row.id }"
              @click="pick(row)"
            >
              <td class="select-column">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  @click.stop
                  @change="toggleRow(row.id)"
                />
              </td>
              <td v-for="col in columns" :key="col.key" :class="col.className || ''">
                <template v-if="col.key === 'id'">
                  <div class="feedback-id-cell">
                    <span v-if="row.isNewSync" class="sync-dot"></span>
                    <span v-else class="sync-dot-placeholder"></span>
                    <button class="link-button feedback-id-button">{{ row.id }}</button>
                  </div>
                </template>
                <template v-else-if="col.key === 'source'">
                  <span class="source-chip">{{ row.source }}</span>
                </template>
                <template v-else-if="col.key === 'site'">
                  {{ row.site.replace('Amazon.com ', '') }}
                </template>
                <template v-else-if="col.key === 'level1'">
                  <select
                    :class="'quick-select category'"
                    :value="row.level1"
                    :title="row.level1"
                    @click.stop
                    @change="updateLevel1(row, ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in level1Options" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'level2'">
                  <select
                    :class="'quick-select category'"
                    :value="row.level2"
                    :title="row.level2"
                    @click.stop
                    @change="updateLevel2(row, ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in getLevel2Options(row.level1)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'level3'">
                  <select
                    :class="'quick-select category'"
                    :value="row.level3"
                    :title="row.level3"
                    @click.stop
                    @change="updateRowField(row.id, 'level3', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in getLevel3Options(row.level1, row.level2)" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'sentiment'">
                  <select
                    :class="['quick-select', 'sentiment-' + (row.sentiment === '负面' ? 'bad' : row.sentiment === '正面' ? 'good' : 'neutral')]"
                    :value="row.sentiment"
                    :title="row.sentiment"
                    @click.stop
                    @change="updateRowField(row.id, 'sentiment', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in sentimentQuickOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'returned'">
                  <select
                    class="quick-select compact"
                    :value="row.returned"
                    :title="row.returned"
                    @click.stop
                    @change="updateRowField(row.id, 'returned', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in returnedQuickOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'exception'">
                  <select
                    :class="['quick-select', 'exception-' + row.exception.slice(0, 2).toLowerCase()]"
                    :value="row.exception"
                    :title="row.exception"
                    @click.stop
                    @change="updateRowField(row.id, 'exception', ($event.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in exceptionQuickOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </template>
                <template v-else-if="col.key === 'status'">
                  <span v-if="row.status" class="readonly-status">{{ row.status }}</span>
                  <span v-else class="empty-status">-</span>
                </template>
                <template v-else>
                  {{ col.value(row) }}
                </template>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td class="empty-cell" :colspan="columns.length + 1">当前筛选条件下没有反馈记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 详情抽屉 -->
    <aside v-if="drawerOpen && selectedItem" class="drawer">
      <div class="drawer-head">
        <div>
          <h2>反馈详情</h2>
          <p>反馈ID：{{ selectedItem.id }}</p>
        </div>
        <button class="icon-button" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- 处理进度条 -->
      <div class="process-bar" :style="{ '--steps': processSteps.length }">
        <div
          v-for="(step, idx) in processSteps"
          :key="step"
          :class="idx <= 2 ? 'process-step active' : 'process-step'"
        >
          <span>{{ idx + 1 }}</span>
          <em>{{ step }}</em>
        </div>
      </div>

      <!-- 页签 -->
      <div class="drawer-tabs">
        <button class="active">详情</button>
        <button>处理记录 2</button>
        <button>关联信息</button>
        <button>附件证据 2</button>
      </div>

      <!-- 详情区块 -->
      <section class="detail-block">
        <h3>原始反馈（英文）</h3>
        <p>{{ selectedItem.raw }}</p>
      </section>
      <section class="detail-block">
        <h3>AI翻译（中文）</h3>
        <p>用了两个月突然开不了机，充电也没反应，非常失望。</p>
      </section>
      <section class="detail-block">
        <h3>AI摘要</h3>
        <p>{{ selectedItem.ai }}</p>
      </section>

      <div class="field-grid">
        <div class="field"><span>一级分类</span><strong>{{ selectedItem.level1 }}</strong></div>
        <div class="field"><span>二级分类</span><strong>{{ selectedItem.level2 }}</strong></div>
        <div class="field"><span>三级分类</span><strong>{{ selectedItem.level3 }}</strong></div>
        <div class="field"><span>情绪识别</span><strong>{{ selectedItem.sentiment }}</strong></div>
        <div class="field"><span>是否退货</span><strong>{{ selectedItem.returned }}</strong></div>
        <div class="field"><span>异常等级建议</span><strong>{{ selectedItem.exception }}</strong></div>
        <div class="field"><span>来源渠道</span><strong>{{ selectedItem.source }}</strong></div>
        <div class="field"><span>品牌</span><strong>{{ selectedItem.brand }}</strong></div>
        <div class="field"><span>站点</span><strong>{{ selectedItem.site }}</strong></div>
      </div>

      <section class="detail-block">
        <h3>产品信息</h3>
        <p>{{ selectedItem.type }} / {{ selectedItem.model }} / {{ selectedItem.internal }}<br/>{{ selectedItem.asin }}</p>
      </section>

      <section class="detail-block">
        <h3>证据与链接</h3>
        <p>亚马逊链接： https://www.amazon.com/dp/{{ selectedItem.asin }}<br/>订单号：{{ selectedItem.order }}</p>
      </section>

      <!-- 路由动作按钮 -->
      <div class="drawer-actions">
        <button
          v-for="action in feedbackRouteActions"
          :key="action.label"
          :class="'route-action ' + action.className"
          @click="routeAction(action)"
        >
          <strong>{{ action.label }}</strong>
          <span>{{ action.target }}</span>
        </button>
      </div>
    </aside>

    <!-- 批量操作弹窗 -->
    <div v-if="batchAction" class="modal-backdrop">
      <form class="route-modal" @submit.prevent="applyBatchAction">
        <div class="route-modal-head">
          <div>
            <span>批量处理去向</span>
            <h2>{{ batchAction.label }}</h2>
            <p>已选择 {{ selectedIds.length }} 条反馈：{{ batchSummary }}{{ extraCount > 0 ? ' 等 ' + selectedIds.length + ' 条' : '' }}</p>
          </div>
          <button type="button" class="icon-button" @click="batchAction = null">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 工单字段 -->
        <div v-if="batchAction.kind === 'ticket'" class="route-form-grid">
          <label>
            <span>接收人</span>
            <select>
              <option>质量工程师-陈工</option>
              <option>售后主管-李工</option>
              <option>产品经理-王工</option>
              <option>研发负责人-周工</option>
            </select>
          </label>
          <label>
            <span>完成时间</span>
            <input type="date" value="2026-06-18" />
          </label>
          <label class="route-form-wide">
            <span>需要完成的事情</span>
            <textarea>核实所选反馈对应产品批次、复现问题并输出处理措施。</textarea>
          </label>
        </div>

        <!-- 异常字段 -->
        <div v-if="batchAction.kind === 'exception'" class="route-form-grid">
          <label>
            <span>异常等级</span>
            <select>
              <option>P1</option>
              <option selected>P2</option>
              <option>P3</option>
            </select>
          </label>
          <label>
            <span>责任部门</span>
            <select>
              <option>质量部</option>
              <option>研发部</option>
              <option>供应链</option>
              <option>客服售后</option>
            </select>
          </label>
          <label>
            <span>要求完成时间</span>
            <input type="date" value="2026-06-16" />
          </label>
          <label class="route-form-wide">
            <span>异常描述</span>
            <textarea>所选反馈存在集中异常风险，需进入异常处理流程确认影响范围、根因和临时处置措施。</textarea>
          </label>
        </div>

        <!-- 需求字段 -->
        <div v-if="batchAction.kind === 'candidate'" class="route-form-grid">
          <label>
            <span>处理方式</span>
            <select v-model="mergeMode">
              <option>新建候选需求</option>
              <option>合并到现有候选需求</option>
            </select>
          </label>
          <label v-if="mergeMode === '合并到现有候选需求'">
            <span>现有候选需求</span>
            <select>
              <option>REQ-CAND-002 测脂准确性优化</option>
              <option>REQ-CAND-005 APP连接稳定性优化</option>
              <option>REQ-CAND-008 包装防护升级</option>
            </select>
          </label>
          <label v-else>
            <span>候选需求标题</span>
            <input value="基于批量反馈生成的候选需求" />
          </label>
          <label class="route-form-wide">
            <span>需求说明</span>
            <textarea>归并所选反馈的共性问题，补充频次、影响范围和证据后进入五维评分。</textarea>
          </label>
        </div>

        <!-- Q&A字段 -->
        <div v-if="batchAction.kind === 'qa'" class="route-form-grid">
          <label>
            <span>案例标题</span>
            <input value="用户反馈处理标准问答" />
          </label>
          <label>
            <span>适用产品</span>
            <select>
              <option>体脂秤</option>
              <option>人体秤</option>
              <option>八电极秤</option>
              <option>筋膜枪</option>
            </select>
          </label>
          <label class="route-form-wide">
            <span>标准回复/案例说明</span>
            <textarea>根据所选反馈整理可复用的客服回复、排查步骤和用户解释口径。</textarea>
          </label>
        </div>

        <div class="route-modal-actions">
          <button type="button" class="secondary-button" @click="batchAction = null">取消</button>
          <button type="submit" :class="batchAction.className">保存并{{ batchAction.label }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// ============== Data (exact copy from original React App.jsx) ==============

interface FeedbackRow {
  id: string;
  isNewSync?: boolean;
  source: string;
  site: string;
  brand: string;
  type: string;
  model: string;
  internal: string;
  asin: string;
  order: string;
  raw: string;
  ai: string;
  level1: string;
  level2: string;
  level3: string;
  sentiment: string;
  returned: string;
  exception: string;
  status: string;
  owner: string;
  date: string;
}

interface Column {
  key: string;
  label: string;
  value: (row: FeedbackRow) => string;
  className?: string;
}

const feedbackRows = ref<FeedbackRow[]>([
  {
    id: 'FB-20260611-00123', isNewSync: true, source: '商品评论', site: 'Amazon.com (US)', brand: '云康宝',
    type: '体脂秤', model: 'CS20A', internal: 'YL-CS20A-8', asin: 'B0C5ZJ8K7L', order: '114-2278956-1234567',
    raw: "This scale stopped working after two months. It won't turn on even when charging.",
    ai: '用户使用两个月后无法开机，充电也无反应，疑似电池或主板故障。',
    level1: '产品质量', level2: '硬件问题', level3: '无法开机', sentiment: '负面', returned: '否',
    exception: 'P2 建议', status: '', owner: '李工', date: '2026-06-11 09:21',
  },
  {
    id: 'FB-20260611-00122', source: '退货原因', site: 'Amazon.com (US)', brand: '云康宝',
    type: '体脂秤', model: 'CS20A', internal: 'YL-CS20A-8', asin: 'B0C5ZJ8K7L', order: '113-2257821-7823451',
    raw: 'Returned: inaccurate readings. Body fat is very different each time.',
    ai: '体脂测量不稳定，多次测量结果差异明显。',
    level1: '产品体验', level2: '数据准确性', level3: '测脂不准', sentiment: '负面', returned: '是',
    exception: 'P2 建议', status: '', owner: '王工', date: '2026-06-11 08:56',
  },
  {
    id: 'FB-20260611-00121', source: 'APP反馈', site: 'Amazon.com (US)', brand: 'AF',
    type: '体脂秤', model: 'CS10', internal: 'YL-CS10-4', asin: 'B09V2X3LQ1', order: '-',
    raw: 'App crashes when syncing data.',
    ai: 'APP同步身体数据时闪退，可能与系统版本或蓝牙同步有关。',
    level1: '产品体验', level2: 'APP问题', level3: '数据不同步', sentiment: '负面', returned: '否',
    exception: 'P3 建议', status: '', owner: '刘工', date: '2026-06-10 18:34',
  },
  {
    id: 'FB-20260610-00118', source: '站内信', site: 'Amazon.com (US)', brand: 'GE',
    type: '体脂秤', model: 'CS20A', internal: 'YL-CS20A-8', asin: 'B0C5ZJ8K7L', order: '111-7845123-9883212',
    raw: 'Where is my order? It says delivered but I did not receive it.',
    ai: '物流签收争议，非产品质量问题，建议转客服处理。',
    level1: '物流运营', level2: '发货咨询', level3: '虚假签收', sentiment: '中性', returned: '否',
    exception: '无', status: '', owner: '赵工', date: '2026-06-10 15:12',
  },
  {
    id: 'FB-20260610-00117', source: '商品评论', site: 'Amazon.com (US)', brand: 'LF',
    type: '筋膜枪', model: 'MG20', internal: 'YL-MG20', asin: 'B0D1ABCDEF', order: '112-6871132-7712300',
    raw: 'Not powerful enough. Even the highest speed feels weak.',
    ai: '按摩力度不足，高档位仍不满足用户预期，疑似参数虚标或体验差异。',
    level1: '产品体验', level2: '功能效果', level3: '力度不足', sentiment: '负面', returned: '否',
    exception: 'P3 建议', status: '', owner: '孙工', date: '2026-06-10 11:08',
  },
  {
    id: 'FB-20260609-00112', source: '投诉/警告', site: 'Amazon.com (US)', brand: '云康宝',
    type: '体脂秤', model: 'CS30B', internal: 'YL-CS30B-8', asin: 'B0C8P0Q2MN', order: '110-3217789-6654301',
    raw: 'Multiple customers report cracked glass after delivery.',
    ai: '多位用户反馈玻璃面板破裂，涉及物流破损或包装防护不足，需要异常跟进。',
    level1: '物流运营', level2: '物流破损', level3: '玻璃碎裂', sentiment: '负面', returned: '是',
    exception: 'P1 建议', status: '', owner: '张工', date: '2026-06-09 17:30',
  },
]);

const categoryQuickOptions = [
  { label: '产品质量 / 硬件问题 / 无法开机', level1: '产品质量', level2: '硬件问题', level3: '无法开机' },
  { label: '产品体验 / 数据准确性 / 测脂不准', level1: '产品体验', level2: '数据准确性', level3: '测脂不准' },
  { label: '产品体验 / APP问题 / 数据不同步', level1: '产品体验', level2: 'APP问题', level3: '数据不同步' },
  { label: '物流运营 / 发货咨询 / 虚假签收', level1: '物流运营', level2: '发货咨询', level3: '虚假签收' },
  { label: '物流运营 / 物流破损 / 玻璃碎裂', level1: '物流运营', level2: '物流破损', level3: '玻璃碎裂' },
  { label: '产品体验 / 功能效果 / 力度不足', level1: '产品体验', level2: '功能效果', level3: '力度不足' },
];

const sentimentQuickOptions = ['负面', '中性', '正面'];
const returnedQuickOptions = ['是', '否'];
const exceptionQuickOptions = ['无', 'P1 建议', 'P2 建议', 'P3 建议'];

const batchFeedbackActions = [
  { label: '转工单', status: '已转工单', className: 'primary-button', kind: 'ticket' },
  { label: '转异常', status: '转异常', className: 'warning-button', kind: 'exception' },
  { label: '转需求', status: '已转需求线索', className: 'success-button', kind: 'candidate' },
  { label: '转Q&A', status: '已转Q&A', className: 'secondary-button', kind: 'qa' },
];

const feedbackRouteActions = [
  { label: '转工单', target: '进入工单池', status: '已转工单', page: 'tickets', className: 'primary-button' },
  { label: '转异常', target: '进入异常处理', status: '转异常', page: 'exceptions', className: 'warning-button' },
  { label: '转需求', target: '进入候选线索', status: '已转需求线索', page: 'requirements', className: 'success-button', kind: 'candidate' },
  { label: '转Q&A', target: '进入Q&A/案例库', status: '已转Q&A', page: 'knowledge', className: 'secondary-button' },
];

// ============== Utility ==============
function uniqueValues(values: string[]): string[] {
  return [...new Set(values)].filter(Boolean);
}

// ============== Columns ==============
const columns: Column[] = [
  { key: 'id', label: '反馈ID', value: (row) => row.id, className: 'id-cell' },
  { key: 'source', label: '来源渠道', value: (row) => row.source },
  { key: 'brand', label: '品牌', value: (row) => row.brand },
  { key: 'site', label: '站点', value: (row) => row.site },
  { key: 'type', label: '产品类型', value: (row) => row.type },
  { key: 'model', label: '销售型号', value: (row) => row.model },
  { key: 'internal', label: '内部型号', value: (row) => row.internal },
  { key: 'asin', label: 'ASIN/SKU', value: (row) => row.asin },
  { key: 'raw', label: '原始反馈摘要', value: (row) => row.raw, className: 'truncate' },
  { key: 'ai', label: 'AI摘要', value: (row) => row.ai, className: 'truncate' },
  { key: 'level1', label: '一级分类', value: (row) => row.level1, className: 'quick-cell category-level-cell' },
  { key: 'level2', label: '二级分类', value: (row) => row.level2, className: 'quick-cell category-level-cell' },
  { key: 'level3', label: '三级分类', value: (row) => row.level3, className: 'quick-cell category-level-cell' },
  { key: 'sentiment', label: '情绪', value: (row) => row.sentiment, className: 'quick-cell' },
  { key: 'returned', label: '是否退货', value: (row) => row.returned, className: 'quick-cell compact' },
  { key: 'exception', label: '异常等级建议', value: (row) => row.exception, className: 'quick-cell' },
  { key: 'status', label: '处理去向', value: (row) => row.status || '', className: 'readonly-status-cell' },
  { key: 'date', label: '反馈时间', value: (row) => row.date },
];

// ============== State ==============
const router = useRouter();
const emit = defineEmits<{ go: [page: string] }>();

const searchQuery = ref('');
const selectedItem = ref<FeedbackRow | null>(null);
const drawerOpen = ref(false);
const selectedIds = ref<string[]>([]);
const batchAction = ref<typeof batchFeedbackActions[0] | null>(null);
const mergeMode = ref('新建候选需求');
const columnFilters = ref<Record<string, string>>({});
const openFilter = ref<string | null>(null);

const processSteps = ['已采集', 'AI处理', '分类确认', '转工单', '处理中', '待确认', '已闭环'];

const summaryCards = [
  ['反馈总数', '3,842'],
  ['反馈率', '2.35%'],
  ['差评率(1-2星)', '1.18%'],
  ['退货率', '4.62%'],
  ['反馈闭环率', '87.45%'],
];

// ============== Computed ==============
const level1Options = computed(() => uniqueValues(categoryQuickOptions.map((o) => o.level1)));

function getLevel2Options(level1: string): string[] {
  return uniqueValues(categoryQuickOptions.filter((o) => o.level1 === level1).map((o) => o.level2));
}

function getLevel3Options(level1: string, level2: string): string[] {
  return uniqueValues(categoryQuickOptions.filter((o) => o.level1 === level1 && o.level2 === level2).map((o) => o.level3));
}

const filteredRows = computed(() => {
  let result = feedbackRows.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.raw.toLowerCase().includes(q) ||
      r.ai.toLowerCase().includes(q) ||
      r.asin.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q),
    );
  }
  result = result.filter((row) =>
    columns.every((col) => {
      const fv = columnFilters.value[col.key];
      return !fv || col.value(row) === fv;
    }),
  );
  return result;
});

const allFilteredSelected = computed(() =>
  filteredRows.value.length > 0 && filteredRows.value.every((r) => selectedIds.value.includes(r.id)),
);

const batchSummary = computed(() => {
  const selected = feedbackRows.value.filter((r) => selectedIds.value.includes(r.id));
  const summary = selected.slice(0, 3).map((r) => r.id).join('、');
  return summary;
});

const extraCount = computed(() => Math.max(0, selectedIds.value.length - 3));

// ============== Methods ==============
function pick(row: FeedbackRow) {
  selectedItem.value = row;
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function updateRowField(id: string, field: string, value: string) {
  const row = feedbackRows.value.find((r) => r.id === id);
  if (row) (row as Record<string, string>)[field] = value;
}

function updateLevel1(row: FeedbackRow, value: string) {
  const next = categoryQuickOptions.find((o) => o.level1 === value);
  if (!next) return;
  row.level1 = next.level1;
  row.level2 = next.level2;
  row.level3 = next.level3;
}

function updateLevel2(row: FeedbackRow, value: string) {
  const next = categoryQuickOptions.find((o) => o.level1 === row.level1 && o.level2 === value);
  if (!next) return;
  row.level2 = next.level2;
  row.level3 = next.level3;
}

function toggleRow(rowId: string) {
  if (selectedIds.value.includes(rowId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== rowId);
  } else {
    selectedIds.value = [...selectedIds.value, rowId];
  }
}

function toggleAllFiltered() {
  const filteredIds = filteredRows.value.map((r) => r.id);
  if (filteredRows.value.every((r) => selectedIds.value.includes(r.id))) {
    selectedIds.value = selectedIds.value.filter((id) => !filteredIds.includes(id));
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...filteredIds])];
  }
}

function updateColumnFilter(key: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [key]: value };
  openFilter.value = null;
}

function getColOptions(col: Column): string[] {
  return [...new Set(feedbackRows.value.map((r) => col.value(r)))].filter(Boolean);
}

function routeAction(action: typeof feedbackRouteActions[0]) {
  if (!selectedItem.value) return;
  updateRowField(selectedItem.value.id, 'status', action.status);
  if (action.kind === 'candidate') emit('go', 'requirements');
  drawerOpen.value = false;
  router.push('/' + action.page);
}

function applyBatchAction() {
  if (!batchAction.value) return;
  const selectedRows = feedbackRows.value.filter((r) => selectedIds.value.includes(r.id));
  selectedRows.forEach((row) => {
    updateRowField(row.id, 'status', batchAction.value!.status);
  });
  selectedIds.value = [];
  batchAction.value = null;
  drawerOpen.value = false;
}
</script>
