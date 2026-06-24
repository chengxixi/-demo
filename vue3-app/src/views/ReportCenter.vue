<template>
  <!-- Phase 1: Page Header -->
  <div class="local-page-head">
    <div>
      <h2>报告中心</h2>
      <p>系统每月初自动创建两类月报，每日刷新，月末冻结；默认展示用户反馈月报。</p>
    </div>
  </div>

  <!-- Phase 2: Main Tabs -->
  <div class="local-feedback-tabs">
    <button
      type="button"
      class="local-feedback-tab"
      :class="{ active: mainTab === 'feedback' }"
      data-report-tab="feedback"
      @click="mainTab = 'feedback'"
    >用户反馈月报</button>
    <button
      type="button"
      class="local-feedback-tab"
      :class="{ active: mainTab === 'competitor' }"
      data-report-tab="competitor"
      @click="mainTab = 'competitor'"
    >竞品分析月报</button>
  </div>

  <!-- Phase 3: 用户反馈月报 Panel -->
  <template v-if="mainTab === 'feedback'">
    <div class="local-page-grid">
      <div class="local-module-card">
        <h3>{{ feedbackCards.feedback.title }}</h3>
        <p>{{ feedbackCards.feedback.desc }}</p>
        <div class="local-module-meta">
          <span v-for="item in feedbackCards.feedback.meta" :key="item">{{ item }}</span>
        </div>
        <button type="button" class="secondary-button" @click="openFeedbackPreview">查看当前月报</button>
      </div>
      <div class="local-module-card">
        <h3>自动生成规则</h3>
        <p>系统每月 1 日自动创建当月报告；每日上午刷新数据；月末 24:00 冻结归档。</p>
        <div class="local-module-meta">
          <span>无需手动创建</span>
          <span>自动刷新</span>
          <span>冻结后只读</span>
        </div>
      </div>
    </div>

    <div class="local-report-list">
      <div class="local-report-row" v-for="(row, idx) in feedbackCards.feedback.rows" :key="idx">
        <div>
          <b>{{ feedbackCards.feedback.title }}</b>
          <span>月度报告 / {{ row[0] }}</span>
        </div>
        <div>
          <b>{{ row[0] }}</b>
          <span>周期</span>
        </div>
        <div>
          <b>{{ row[1] }}</b>
          <span>负责人</span>
        </div>
        <div>
          <b>{{ row[2] }}</b>
          <span>状态</span>
        </div>
        <button type="button" class="secondary-button" @click="openFeedbackPreview">查看</button>
      </div>
    </div>
  </template>

  <!-- Phase 4: 竞品分析月报 Panel -->
  <template v-if="mainTab === 'competitor'">
    <div class="local-page-grid">
      <div class="local-module-card">
        <h3>{{ feedbackCards.competitor.title }}</h3>
        <p>{{ feedbackCards.competitor.desc }}</p>
        <div class="local-module-meta">
          <span v-for="item in feedbackCards.competitor.meta" :key="item">{{ item }}</span>
        </div>
        <button type="button" class="secondary-button" @click="showCompetitorModal = true">查看</button>
      </div>
      <div class="local-module-card">
        <h3>自动生成规则</h3>
        <p>系统每月 1 日自动创建当月竞品报告；每日上午刷新数据；月末 24:00 冻结归档。</p>
        <div class="local-module-meta">
          <span>无需手动创建</span>
          <span>自动刷新</span>
          <span>冻结后只读</span>
        </div>
      </div>
    </div>

    <div class="local-report-list">
      <div class="local-report-row" v-for="(row, idx) in feedbackCards.competitor.rows" :key="idx">
        <div>
          <b>{{ feedbackCards.competitor.title }}</b>
          <span>月度报告 / {{ row[0] }}</span>
        </div>
        <div>
          <b>{{ row[0] }}</b>
          <span>周期</span>
        </div>
        <div>
          <b>{{ row[1] }}</b>
          <span>负责人</span>
        </div>
        <div>
          <b>{{ row[2] }}</b>
          <span>状态</span>
        </div>
        <button type="button" class="secondary-button" @click="showCompetitorModal = true">查看</button>
      </div>
    </div>
  </template>

  <!-- 用户反馈月报预览弹窗 -->
  <div class="local-modal" v-if="showFeedbackModal" @click.self="showFeedbackModal = false">
    <div class="local-modal-inner" style="max-width: 600px;">
      <div class="local-modal-head">
        <h2>用户反馈月报</h2>
        <button type="button" class="secondary-button" @click="showFeedbackModal = false">关闭</button>
      </div>
      <div class="local-detail-grid">
        <div class="local-detail-block">
          <span>报告周期</span>
          <strong>2026-06</strong>
        </div>
        <div class="local-detail-block">
          <span>报告类型</span>
          <strong>用户反馈月报</strong>
        </div>
        <div class="local-detail-block">
          <span>状态</span>
          <strong>刷新中</strong>
        </div>
      </div>
      <div class="local-monthly-conclusion">
        <div class="local-monthly-conclusion-label">核心摘要</div>
        <p>本月反馈总量与趋势、分类占比、TOP问题、异常分析和处理去向汇总。每日数据自动刷新，月末冻结归档。</p>
      </div>
    </div>
  </div>

  <!-- 竞品分析月报全屏弹窗 -->
  <div class="local-modal" v-if="showCompetitorModal" @click.self="showCompetitorModal = false">
    <div class="local-modal-inner">
      <div class="local-modal-head">
        <h2>竞品分析月报</h2>
        <button type="button" class="secondary-button" @click="showCompetitorModal = false">关闭</button>
      </div>

      <!-- 摘要网格 -->
      <div class="local-detail-grid">
        <div class="local-detail-block">
          <span>报告周期</span>
          <strong>2026-06</strong>
        </div>
        <div class="local-detail-block">
          <span>报告类型</span>
          <strong>竞品分析月报（品牌/ODM分类）</strong>
        </div>
        <div class="local-detail-block">
          <span>生成规则</span>
          <strong>按产品线生成完整报告，品牌竞品/ODM竞品各输出一份</strong>
        </div>
        <div class="local-detail-block">
          <span>状态</span>
          <strong>每日刷新，月末冻结</strong>
        </div>
      </div>

      <!-- 下载按钮 -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px;gap:8px;">
        <button type="button" class="secondary-button">下载月报 (.docx)</button>
      </div>

      <!-- 产品线标签 -->
      <div class="local-feedback-tabs">
        <button
          v-for="line in reportLines"
          :key="line.key"
          type="button"
          class="local-feedback-tab"
          :class="{ active: productLine === line.key }"
          @click="productLine = line.key"
        >{{ line.name }}月报</button>
      </div>

      <!-- 产品线面板 -->
      <section
        v-for="line in reportLines"
        :key="line.key"
        class="local-report-line-panel"
        v-show="productLine === line.key"
      >
        <!-- 品牌/ODM 子标签 -->
        <div class="local-feedback-tabs" style="margin-bottom:16px;">
          <button
            type="button"
            class="local-feedback-tab"
            :class="{ active: currentSubType(line.key) === 'brand' }"
            @click="setSubType(line.key, 'brand')"
          >品牌竞品月报</button>
          <button
            type="button"
            class="local-feedback-tab"
            :class="{ active: currentSubType(line.key) === 'odm' }"
            @click="setSubType(line.key, 'odm')"
          >ODM竞品月报</button>
        </div>

        <!-- 品牌报告 -->
        <template v-if="currentSubType(line.key) === 'brand'">
          <div class="local-monthly-header">
            <div class="local-monthly-period">报告周期: 2026-06 | {{ line.name }} 品牌竞品月报</div>
            <div class="local-monthly-summary">{{ line.brandSummary }}</div>
          </div>
          <render-report-content :data="line.brandData" />
          <div class="local-monthly-footer">
            <span>生成时间: 2026-06-24</span>
            <span>每日刷新 | 月末冻结</span>
            <span>品牌竞品月报</span>
          </div>
        </template>

        <!-- ODM报告 -->
        <template v-if="currentSubType(line.key) === 'odm'">
          <div class="local-monthly-header">
            <div class="local-monthly-period">报告周期: 2026-06 | {{ line.name }} ODM竞品月报</div>
            <div class="local-monthly-summary">{{ line.odmSummary }}</div>
          </div>
          <render-report-content :data="line.odmData" />
          <div class="local-monthly-footer">
            <span>生成时间: 2026-06-24</span>
            <span>每日刷新 | 月末冻结</span>
            <span>ODM竞品月报</span>
          </div>
        </template>
      </section>

      <!-- 底部卡片 -->
      <div class="local-page-grid two" style="margin-top: 20px;">
        <div class="local-module-card">
          <h3>本月输出物</h3>
          <p>按产品线分别沉淀品牌竞品月报、ODM竞品月报、实物分析报告、拆机分析报告和产品体验报告。</p>
          <div class="local-module-meta">
            <span>月初创建</span>
            <span>每日刷新</span>
            <span>月末冻结</span>
          </div>
        </div>
        <div class="local-module-card">
          <h3>归档与承接</h3>
          <p>L1/L2 默认继续监控或系统自动关闭；L3/L4 由产品经理选择转异常、启动实物分析、转需求或解除监控归档。</p>
          <div class="local-module-meta">
            <span>保留证据</span>
            <span>按产品线归档</span>
            <span>结论承接需求</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, type VNode } from 'vue';

// ── 状态 ──
const mainTab = ref<'feedback' | 'competitor'>('feedback');
const productLine = ref<'eight' | 'fat' | 'massage'>('eight');
const subTypes = ref<Record<string, 'brand' | 'odm'>>({ eight: 'brand', fat: 'brand', massage: 'brand' });
const showFeedbackModal = ref(false);
const showCompetitorModal = ref(false);

function currentSubType(lineKey: string): 'brand' | 'odm' {
  return subTypes.value[lineKey] || 'brand';
}

function setSubType(lineKey: string, type: 'brand' | 'odm') {
  subTypes.value[lineKey] = type;
}

function openFeedbackPreview() {
  showFeedbackModal.value = true;
}

// ── 用户反馈月报卡片数据 ──
const feedbackCards = {
  feedback: {
    title: '用户反馈月报',
    desc: '汇总反馈量、反馈率、差评率、问题分类、处理去向、退换货与重点案例。',
    meta: ['2026-06', '每日 02:00 刷新', '月末冻结'],
    rows: [
      ['2026-06', '产品经理', '刷新中'],
      ['2026-05', '管理员', '已冻结'],
      ['2026-04', '管理员', '已归档'],
    ] as [string, string, string][],
  },
  competitor: {
    title: '竞品分析月报',
    desc: '汇总竞品新增、价格变化、渠道动向、产品参数对比和可转需求机会。',
    meta: ['2026-06', '每日 03:00 刷新', '月末冻结'],
    rows: [
      ['2026-06', '产品经理', '刷新中'],
      ['2026-05', '产品经理', '已冻结'],
      ['2026-04', '管理员', '已归档'],
    ] as [string, string, string][],
  },
};

// ── 品牌竞品月报数据 ──
const brandEight = {
  marketDynamics: [
    [1, '新增竞品数量', '3款'],
    [2, '新增直接竞争产品', '1款'],
    [3, '新增间接竞争产品', '1款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '1款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, 'Withings推出新款八电极产品', '高', 'GE', '启动实物分析'],
    [2, '华为618促销带动八电极品类声量', '中', 'GE', '持续监控价格'],
    [3, 'Etekcity新增心率功能', '中', 'AF/GE', '评估功能导入'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '八电极市场价格下探', '评估降本方案'],
    [2, '彩屏产品增加', '加快TFT版本规划'],
    [3, 'APP功能升级趋势明显', '纳入2026规划'],
  ] as [number, string, string][],
  conclusion: '八电极秤品牌竞品本月核心动态：Withings 持续强化高端健康管理卖点，华为通过618促销拉升八电极市场关注度。建议重点跟进手柄电极、测量指标和APP报告字段的差异化定位。',
  newProducts: [
    ['直接竞品', 'Withings', 'Body Scan v2', '八电极体脂秤', '$299-$349', '心率监测、血管年龄评估', '2026-05'],
    ['直接竞品', '华为', 'HEM-B02', '八电极体脂秤', '¥599-¥699', '八电极分段测量、健康管理报告', '2026-04'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['Withings', 'Body Scan v2', '$329', '$299-$349', '-5%~+6%'],
    ['华为', 'HEM-B02', '¥699', '¥599-¥699', '0~-14%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['Withings', 'Body Scan v2', 'TOP12', 'TOP9', '↑3'],
    ['华为', 'HEM-B02', 'TOP5', 'TOP3', '↑2'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['Withings', 'Body Scan v2', '新增神经健康评分(Nerve Health Score)功能', '关注'],
    ['华为', 'HEM-B02', 'APP新增AI健康解读报告，强化健康管理表达', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, 'APP连接不稳定', '25%', '↑', '蓝牙断连、Wi-Fi配对失败'],
      [2, '测量数据不一致', '18%', '↓', '连续测量偏差>2%'],
      [3, '显示异常', '12%', '→', 'LED/LCD显示不全'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '大屏显示', '高频', ''],
      [2, '客户邮件', 'WiFi同步', '新需求', ''],
      [3, '使用体验', '更多身体指标', '低频', ''],
      [4, '客户邮件', 'Apple Health同步', '中频', ''],
      [5, '客户邮件', '心率监测', '中频', ''],
      [6, '客户邮件', 'ECG功能', '新需求', '纳入新产品规划'],
    ] as [number, string, string, string, string][],
  },
  teardown: [
    ['Withings', 'Body Scan v2', '新型电极结构', '可评估导入'],
  ] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'Renpho价格下降15%，威胁入门市场', opportunity: '低端市场空间尚在，可考虑性价比产品线', action: '持续监控价格变化，评估降本空间' },
    GE: { risk: 'Withings新功能领先，品牌定位受挑战', opportunity: '发力彩屏+智能生态差异化', action: '加快TFT版本规划，强化APP健康管理功能' },
    LF: { risk: '暂无重大变动', opportunity: '中端市场仍有空间', action: '保持现有策略，观察动态' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.持续监控 Withings 新品上市后的市场反馈和用户评价\n2.关注华为618后价格是否回升，判断促销力度\n3.八电极市场价格下探趋势评估，更新降本方案\n4.APP功能升级路线图更新，评估TFT版本可行性',
};

const odmEight = {
  marketDynamics: [
    [1, '新增竞品数量', '2款'],
    [2, '新增直接竞争产品', '0款'],
    [3, '新增间接竞争产品', '2款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '0款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, '京东ODM A12加入八电极卖点', '中', 'GE', '关注价格下探'],
    [2, 'WiFi/BT双模方案成本下降', '低', 'AF/GE', '纳入供应链评估'],
    [3, 'ODM X8 Pro 618大幅降价(-31%)', '中', 'AF', '监控价格变化'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '八电极功能下沉至入门价位', '关注传感器精度和算法短板'],
    [2, '手柄电极方案逐步成熟', '评估方案导入可行性'],
    [3, 'WiFi/BT双模成本下降', '更新BOM成本模型'],
  ] as [number, string, string][],
  conclusion: '八电极秤ODM本月核心动态：低价型号开始加入八电极卖点，手柄电极方案逐步成熟。Wi-Fi/BT双模方案成本下降，为产品升级提供空间。建议关注供应链价格变化，为降本方案储备供应商。',
  newProducts: [
    ['间接竞品', '京东ODM', 'A12', '八电极体脂秤', '¥89-¥129', '八电极分段测量、蓝牙连接', '2026-05'],
    ['间接竞品', 'ODM', 'X8 Pro', '八电极体脂秤', '¥120-¥160', '手柄电极+Wi-Fi/BT双模', '2026-04'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['京东ODM', 'A12', '¥129', '¥89-¥99', '-23%~-31%'],
    ['ODM', 'X8 Pro', '¥160', '¥120-¥150', '-6%~-25%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['京东ODM', 'A12', 'TOP25', 'TOP18', '↑7'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['京东ODM', 'A12', '页面新增八电极卖点描述和对比图', '关注'],
    ['ODM', 'X8 Pro', 'Wi-Fi模组升级至ESP32-C3，支持BLE 5.0', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, '测量准确性差', '9%', '↑', '与品牌秤对比偏差>5%'],
      [2, 'APP功能简陋', '7%', '↓', '缺少趋势分析和报告导出'],
      [3, '手柄线易损坏', '4%', '→', '连接线材质偏硬'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '测量准确性', '高频', ''],
      [2, '客户邮件', 'APP功能增强', '中频', ''],
    ] as [number, string, string, string, string][],
  },
  teardown: [] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'ODM八电极价格下探', opportunity: '八电极供应链成熟', action: '评估ODM方案导入' },
    GE: { risk: '暂无明显影响', opportunity: 'ODM竞品功能不足', action: '保持技术领先' },
    LF: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.八电极ODM价格下探趋势跟踪\n2.WiFi/BT双模方案成本更新\n3.手柄电极方案供应商评估',
};

const brandFat = {
  marketDynamics: [
    [1, '新增竞品数量', '2款'],
    [2, '新增直接竞争产品', '1款'],
    [3, '新增间接竞争产品', '1款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '0款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, 'RENPHO价格大幅下降(-17%~-33%)', '高', 'AF', '关注入门市场趋势'],
    [2, 'Wyze套装策略提升客单价', '低', 'GE', '监控中'],
    [3, 'ODM入门秤量价齐升', '中', 'AF/GE', '关注供应链'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '入门价格带持续下探', '评估入门产品线的成本优化方案'],
    [2, 'APP连接稳定性是核心痛点', '优化蓝牙连接方案'],
    [3, '多用户场景需求增长', '优化家庭模式用户体验'],
  ] as [number, string, string][],
  conclusion: '体脂秤品牌竞品本月核心动态：RENPHO 通过价格战抢占入门市场，Wyze 以套装策略提升客单价。建议关注入门价格带的APP连接稳定性问题，这是评论区最集中的痛点。',
  newProducts: [
    ['直接竞品', 'RENPHO', 'Elis 1', '体脂秤', '$19.99-$29.99', '支持无限用户、婴儿/宠物称重模式', '2026-06'],
    ['间接竞品', 'Wyze', 'Scale X 套装', '体脂秤', '$39.99(套装)', '秤+体脂测量+Wyze App生态', '2026-05'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['RENPHO', 'Elis 1', '$29.99', '$19.99-$24.99', '-17%~-33%'],
    ['Wyze', 'Scale X', '$33.99', '$33.99', '0%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['RENPHO', 'Elis 1', 'TOP8', 'TOP4', '↑4'],
    ['Wyze', 'Scale X', 'TOP15', 'TOP11', '↑4'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['RENPHO', 'Elis 1', '页面新增婴儿/宠物称重模式卖点', '关注'],
    ['Wyze', 'Scale X', '套装包上线，捆绑Wyze Cam v3销售', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, 'APP连接频繁断连', '18%', '↑', '蓝牙连接不稳定是入门秤最大痛点'],
      [2, '体脂数据偏差大', '10%', '↓', '与DEXA对比偏差超过5%'],
      [3, '电池耗电过快', '6%', '→', '用户反馈2周需换电池'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '蓝牙连接稳定性', '高频', ''],
      [2, '客户邮件', '多用户管理', '新需求', ''],
      [3, '使用体验', '数据趋势图表', '中频', ''],
    ] as [number, string, string, string, string][],
  },
  teardown: [
    ['RENPHO', 'Elis 1', '4点式ITO玻璃+应变片方案', '成本控制方案可参考'],
  ] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'RENPHO降价直接冲击入门市场', opportunity: '差异化多功能方向', action: '加速APP功能升级' },
    GE: { risk: 'Wyze套装策略分流中端用户', opportunity: '强化健康管理定位', action: '优化多用户切换体验' },
    LF: { risk: '暂无重大变动', opportunity: '中端市场仍有空间', action: '保持现有策略' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.持续监控 RENPHO 降价后市场反馈和份额变化\n2.Wyze套装策略效果评估\n3.入门体脂秤APP连接稳定性优化方案\n4.多用户场景功能需求梳理',
};

const odmFat = {
  marketDynamics: [
    [1, '新增竞品数量', '1款'],
    [2, '新增直接竞争产品', '0款'],
    [3, '新增间接竞争产品', '1款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '0款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, 'ODM Basic S400放量促销(-34%)', '高', 'AF', '关注价格底线'],
    [2, '入门级传感器精度问题突出', '中', 'GE', '关注供应链'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '入门价格持续下行', '评估最低价格带策略'],
    [2, '传感器精度是竞争短板', '筛选优质传感器供应商'],
  ] as [number, string, string][],
  conclusion: '体脂秤ODM本月核心动态：入门型号通过价格战放量，基础测脂功能成为促销入口。供应链成本持续下降，建议关注传感器和蓝牙模组的替代方案以降低BOM成本。',
  newProducts: [
    ['间接竞品', 'ODM', 'Basic S400', '体脂秤', '¥39-¥59', '基础13项身体指标、蓝牙连接', '2026-04'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['ODM', 'Basic S400', '¥59', '¥39-¥49', '-17%~-34%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['ODM', 'Basic S400', 'TOP35', 'TOP22', '↑13'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['ODM', 'Basic S400', '新增蓝牙5.0支持', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, '数据同步延迟', '12%', '↑', '测量后需等待10秒以上同步'],
      [2, 'APP兼容性问题', '6%', '→', '部分安卓机型配对失败'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '连接速度', '高频', ''],
      [2, '客户邮件', 'APP兼容性', '中频', ''],
    ] as [number, string, string, string, string][],
  },
  teardown: [] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'ODM入门价格形成价格锚点', opportunity: '性价比产品线机会', action: '评估入门产品策略' },
    GE: { risk: '暂无明显影响', opportunity: '传感器精度构成壁垒', action: '保持传感器技术领先' },
    LF: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.入门体脂秤价格底线跟踪\n2.ODM传感器供应商筛选\n3.入门级连接稳定性优化',
};

const brandMassage = {
  marketDynamics: [
    [1, '新增竞品数量', '2款'],
    [2, '新增直接竞争产品', '1款'],
    [3, '新增间接竞争产品', '1款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '0款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, '倍轻松618促销力度大(-25%)', '中', 'GE', '关注价格走势'],
    [2, '热敷功能成为筋膜枪新卖点', '中', 'AF/GE', '评估功能导入'],
    [3, '低噪音技术持续升级', '低', 'GE', '关注技术趋势'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '热敷/冷敷功能关注度上升', '评估热敷模块引入方案和成本'],
    [2, '低噪音(<45dB)是核心竞争力', '优化电机减噪方案'],
    [3, '续航问题投诉集中', '评估电池容量升级方案'],
  ] as [number, string, string][],
  conclusion: '筋膜枪品牌竞品本月核心动态：倍轻松通过抖音达人营销提升曝光，Hypervolt 坚守高端定位。ODM端热敷/冷敷功能成为新卖点。建议跟进低噪音技术和热敷功能的产品化落地。',
  newProducts: [
    ['直接竞品', '倍轻松', 'M5', '筋膜枪', '¥299-¥399', '低噪音(<45dB)、6档推力', '2026-05'],
    ['间接竞品', 'Hypervolt', 'Go 2', '筋膜枪', '$129-$149', '轻量设计(0.68kg)、静音技术', '2026-03'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['倍轻松', 'M5', '¥399', '¥299-¥369', '-7%~-25%'],
    ['Hypervolt', 'Go 2', '$149', '$129-$149', '0~-13%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['倍轻松', 'M5', 'TOP8', 'TOP4', '↑4'],
    ['Hypervolt', 'Go 2', 'TOP6', 'TOP6', '-'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['倍轻松', 'M5', '新增热敷按摩头配件', '重点关注'],
    ['Hypervolt', 'Go 2', 'QuietGlide静音技术升级', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, '续航时间不足', '15%', '↑', '标称6小时实际约2-3小时'],
      [2, '噪音偏大', '11%', '→', '低档>50dB，与宣传不符'],
      [3, '按摩头材质偏硬', '7%', '↓', '硅胶材质偏硬'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '热敷功能', '高频', ''],
      [2, '客户邮件', '更长续航', '高频', ''],
      [3, '使用体验', '低噪音', '中频', ''],
      [4, '客户邮件', '冷热敷双模', '新需求', '纳入新产品规划'],
    ] as [number, string, string, string, string][],
  },
  teardown: [
    ['倍轻松', 'M5', '无刷电机+浮动结构减噪', '减噪方案可参考'],
    ['Mini Pro(ODM)', 'Mini Pro', 'PTC加热片+温控电路', '热敷模块成本可控'],
  ] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'ODM热敷产品快速跟进', opportunity: '热敷功能差异化窗口', action: '加快热敷功能产品化' },
    GE: { risk: '倍轻松品牌声量快速上升', opportunity: '低噪音+长续航定位', action: '优化电机和电池方案' },
    LF: { risk: '暂无重大变动', opportunity: 'ODM产品关注', action: '持续监控' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.倍轻松618后价格是否回升，判断长期定价策略\n2.热敷/冷敷功能产品化评估和时间线\n3.低噪音电机方案技术调研\n4.电池容量升级可行性分析',
};

const odmMassage = {
  marketDynamics: [
    [1, '新增竞品数量', '2款'],
    [2, '新增直接竞争产品', '1款'],
    [3, '新增间接竞争产品', '1款'],
    [4, '新增标杆竞品产品', '0款'],
    [5, '新增观察竞品产品', '0款'],
  ] as [number, string, string][],
  coreFindings: [
    [1, 'Mini Pro热敷功能成为差异化卖点', '中', 'AF/GE', '评估热敷模块导入'],
    [2, '冷热敷模块成本从¥15降至¥9', '低', 'AF', '纳入成本评估'],
    [3, 'ODM筋膜枪价格竞争加剧', '中', 'AF', '关注定价策略'],
  ] as [number, string, string, string, string][],
  decisions: [
    [1, '冷热敷模块成本下降', '评估引入方案和时间节点'],
    [2, 'Mini型号价格下探', '考虑推出入门级产品线'],
    [3, '推力参数实测与宣传差距', '规范产品参数标注'],
  ] as [number, string, string][],
  conclusion: '筋膜枪ODM本月核心动态：热敷/冷敷功能成为差异化卖点，Mini型号通过价格和便携性抢占市场。建议评估热敷模块引入方案，关注推力档位和按摩头配置的标准化。',
  newProducts: [
    ['直接竞品', 'Mini Pro', 'Mini Pro', '筋膜枪', '¥99-¥149', '热敷功能、4档推力、6个按摩头', '2026-05'],
    ['间接竞品', 'ODM', 'Hot Mini', '筋膜枪', '¥130-¥170', '冷热敷双模、5档调节', '2026-04'],
  ] as [string, string, string, string, string, string, string][],
  priceChanges: [
    ['Mini Pro', 'Mini Pro', '¥149', '¥99-¥129', '-13%~-34%'],
    ['ODM', 'Hot Mini', '¥170', '¥130-¥160', '-6%~-24%'],
  ] as [string, string, string, string, string][],
  rankChanges: [
    ['Mini Pro', 'Mini Pro', '新上市', 'TOP12', '新入榜'],
  ] as [string, string, string, string, string][],
  featureChanges: [
    ['Mini Pro', 'Mini Pro', '热敷功能成为主力卖点', '重点关注'],
    ['ODM', 'Hot Mini', '冷热敷模块成本下降(¥15→¥9)', '关注'],
  ] as [string, string, string, string][],
  userFeedback: {
    topIssues: [
      [1, '热敷温度不够高', '8%', '↑', '实际38-40℃，宣传42℃'],
      [2, '按摩力度偏小', '6%', '→', '最大推力约10kg'],
      [3, '充电接口松动', '5%', '↓', 'Type-C口使用一个月后松动'],
    ] as [number, string, string, string, string][],
    trends: [
      [1, '竞品评论', '热敷效果', '高频', ''],
      [2, '客户邮件', '更大推力', '中频', ''],
      [3, '使用体验', '冷热敷双模', '新需求', '纳入产品规划'],
    ] as [number, string, string, string, string][],
  },
  teardown: [
    ['Mini Pro', 'Mini Pro', 'PTC加热片+温控电路，BOM约¥38', '热敷模块可引入，电机需优化'],
  ] as [string, string, string, string][],
  brandImpacts: {
    AF: { risk: 'ODM热敷产品抢先上市', opportunity: '热敷功能差异化窗口', action: '加快热敷功能产品化' },
    GE: { risk: '暂无明显影响', opportunity: '高端定位仍有空间', action: '保持技术领先' },
    LF: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
    YKB: { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' },
  },
  nextFocus: '1.热敷模块供应商评估和成本确认\n2.Mini Pro价格走势跟踪\n3.冷热敷双模功能可行性分析',
};

// ── 产品线 ──
interface ReportLine {
  key: 'eight' | 'fat' | 'massage';
  name: string;
  brandSummary: string;
  odmSummary: string;
  brandData: any;
  odmData: any;
}

const reportLines: ReportLine[] = [
  {
    key: 'eight',
    name: '八电极秤',
    brandSummary: '八电极秤品牌竞品月度分析：高端市场 Withings 持续强化健康管理平台定位，华为通过618拉升八电极品类声量。建议重点跟进手柄电极、测量指标和APP报告字段的差异化。',
    odmSummary: '八电极秤ODM竞品月度分析：入门价位八电极功能开始普及，手柄电极方案成熟度提升，Wi-Fi/BT模组成本下降为产品升级提供窗口。',
    brandData: brandEight,
    odmData: odmEight,
  },
  {
    key: 'fat',
    name: '体脂秤',
    brandSummary: '体脂秤品牌竞品月度分析：价格战仍是入门市场主旋律，RENPHO 降价幅度近20%。连接稳定性和测量一致性是用户最关注的两个痛点。',
    odmSummary: '体脂秤ODM竞品月度分析：入门型号以极低价格放量，基础测脂功能成为流量入口。BOM成本持续下降但传感器精度仍是短板。',
    brandData: brandFat,
    odmData: odmFat,
  },
  {
    key: 'massage',
    name: '筋膜枪',
    brandSummary: '筋膜枪品牌竞品月度分析：倍轻松通过达人营销快速起量，Hypervolt守高端线。低噪音和热敷功能成为竞争焦点。',
    odmSummary: '筋膜枪ODM竞品月度分析：热敷/冷敷功能成为差异化方向，Mini型号价格优势明显。建议评估热敷模块引入方案。',
    brandData: brandMassage,
    odmData: odmMassage,
  },
];

// ── 辅助渲染函数 ──
function renderTable(headers: string[], rows: string[][]): VNode {
  if (!rows || rows.length === 0) {
    return h('p', { style: 'color:#999;text-align:center;padding:12px;' }, '本月暂无数据');
  }
  return h('table', { class: 'local-monthly-table' }, [
    h('thead', [
      h('tr', headers.map(hdr => h('th', hdr))),
    ]),
    h('tbody', rows.map(row =>
      h('tr', row.map(cell => h('td', String(cell)))),
    )),
  ]);
}

function renderSection(title: string, icon: string, children: () => VNode[]): VNode {
  return h('div', { class: 'local-monthly-section' }, [
    h('div', { class: 'local-monthly-section-title' }, `${icon} ${title}`),
    ...children(),
  ]);
}

function renderSubTitle(title: string): VNode {
  return h('div', { class: 'local-monthly-subtitle' }, title);
}

function renderBrandImpacts(impacts: Record<string, { risk: string; opportunity: string; action: string }>): VNode[] {
  const brandNames = ['AF', 'GE', 'LF', 'YKB'];
  return brandNames.map(name => {
    const info = impacts[name] || { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' };
    return h('div', { class: 'local-brand-card' }, [
      h('strong', name),
      h('div', { class: 'local-brand-grid' }, [
        h('div', [
          h('span', { style: 'color:#d92d20;' }, '⚠ 风险'),
          h('p', info.risk),
        ]),
        h('div', [
          h('span', { style: 'color:#16a34a;' }, '✨ 机会'),
          h('p', info.opportunity),
        ]),
        h('div', [
          h('span', { style: 'color:#4338ca;' }, '📌 建议动作'),
          h('p', info.action),
        ]),
      ]),
    ]);
  });
}
</script>

<!-- RenderReportContent 递归组件 -->
<script lang="ts">
import { defineComponent, h, type PropType } from 'vue';

interface ReportData {
  marketDynamics: [number, string, string][];
  coreFindings: [number, string, string, string, string][];
  decisions: [number, string, string][];
  conclusion: string;
  newProducts: [string, string, string, string, string, string, string][];
  priceChanges: [string, string, string, string, string][];
  rankChanges: [string, string, string, string, string][];
  featureChanges: [string, string, string, string][];
  userFeedback: {
    topIssues: [number, string, string, string, string][];
    trends: [number, string, string, string, string][];
  };
  teardown: [string, string, string, string][];
  brandImpacts: Record<string, { risk: string; opportunity: string; action: string }>;
  nextFocus: string;
}

function renderTable(headers: string[], rows: string[][]): ReturnType<typeof h> {
  if (!rows || rows.length === 0) {
    return h('p', { style: 'color:#999;text-align:center;padding:12px;' }, '本月暂无数据');
  }
  return h('table', { class: 'local-monthly-table' }, [
    h('thead', [
      h('tr', headers.map(hdr => h('th', hdr))),
    ]),
    h('tbody', rows.map(row =>
      h('tr', row.map(cell => h('td', String(cell)))),
    )),
  ]);
}

function renderSection(title: string, icon: string, content: () => ReturnType<typeof h>[]): ReturnType<typeof h> {
  return h('div', { class: 'local-monthly-section' }, [
    h('div', { class: 'local-monthly-section-title' }, `${icon} ${title}`),
    ...content(),
  ]);
}

function renderSubTitle(title: string): ReturnType<typeof h> {
  return h('div', { class: 'local-monthly-subtitle' }, title);
}

function renderBrandImpacts(impacts: Record<string, { risk: string; opportunity: string; action: string }>): ReturnType<typeof h>[] {
  const brandNames = ['AF', 'GE', 'LF', 'YKB'];
  return brandNames.map(name => {
    const info = impacts[name] || { risk: '暂无重大变动', opportunity: '暂无', action: '持续监控' };
    return h('div', { class: 'local-brand-card' }, [
      h('strong', name),
      h('div', { class: 'local-brand-grid' }, [
        h('div', [
          h('span', { style: 'color:#d92d20;' }, '⚠ 风险'),
          h('p', info.risk),
        ]),
        h('div', [
          h('span', { style: 'color:#16a34a;' }, '✨ 机会'),
          h('p', info.opportunity),
        ]),
        h('div', [
          h('span', { style: 'color:#4338ca;' }, '📌 建议动作'),
          h('p', info.action),
        ]),
      ]),
    ]);
  });
}

export const RenderReportContent = defineComponent({
  name: 'RenderReportContent',
  props: {
    data: { type: Object as PropType<ReportData>, required: true },
  },
  setup(props) {
    const sections = () => {
      const data = props.data;

      // 一、本月重点结论
      const conclusionParts = () => [
        renderSubTitle('1、本月市场动态'),
        renderTable(['序号', '类别', '数量'], data.marketDynamics.map(r => r.map(String))),
        renderSubTitle('2、本月核心发现（触发提醒的条件，允许手动增加）'),
        renderTable(['序号', '发现事项', '风险等级', '影响品牌', '建议动作'], data.coreFindings.map(r => r.map(String))),
        renderSubTitle('3、需决策事项'),
        renderTable(['序号', '事项', '建议'], data.decisions.map(r => r.map(String))),
        h('div', { class: 'local-monthly-conclusion' }, [
          h('div', { class: 'local-monthly-conclusion-label' }, '本月结论概述'),
          h('p', data.conclusion),
        ]),
      ];

      // 二、本月竞品动态
      const dynamicParts = () => [
        renderSubTitle('1、新品上市（根据ASIN上市时间系统自动判断）'),
        renderTable(['竞品类型', '品牌', '型号', '类型', '价格', '核心卖点', '上市时间'], data.newProducts.map(r => r.map(String))),
        renderSubTitle('2、价格变化'),
        renderTable(['品牌', '型号', '上月价格', '本月价格', '变化幅度'], data.priceChanges.map(r => r.map(String))),
        renderSubTitle('3、排名变化'),
        renderTable(['品牌', '型号', '上月排名', '本月排名', '变化'], data.rankChanges.map(r => r.map(String))),
        renderSubTitle('4、功能变化'),
        renderTable(['品牌', '型号', '新增功能', '对我方影响'], data.featureChanges.map(r => r.map(String))),
      ];

      // 三、用户反馈分析
      const fb = data.userFeedback;
      const fbParts = () => [
        renderSubTitle('差评TOP问题'),
        renderTable(['排名', '问题', '占比', '变化趋势', '结论'], fb.topIssues.map(r => r.map(String))),
        renderSubTitle('用户需求趋势'),
        renderTable(['序号', '需求来源', '需求', '频率', '结论'], fb.trends.map(r => r.map(String))),
      ];

      // 四、竞品拆机分析
      const tdRows = data.teardown || [];
      const tdContent = () => [
        tdRows.length > 0
          ? renderTable(['品牌', '型号', '关键发现', '可借鉴点'], tdRows.map(r => r.map(String)))
          : h('p', { style: 'color:#999;text-align:center;padding:12px;' }, '本月暂无拆机分析'),
      ];

      // 五、品牌影响评估
      const biParts = () => renderBrandImpacts(data.brandImpacts || {});

      // 六、下月重点关注
      const nfContent = () => [
        h('div', { class: 'local-monthly-trend' }, [
          h('p', { style: 'line-height:2;', innerHTML: (data.nextFocus || '').replace(/\n/g, '<br>') }),
        ]),
      ];

      return [
        renderSection('一、本月重点结论', '📋', conclusionParts),
        renderSection('二、本月竞品动态', '📰', dynamicParts),
        renderSection('三、用户反馈分析', '💬', fbParts),
        renderSection('四、竞品拆机分析（如有）', '🔬', tdContent),
        renderSection('五、品牌影响评估', '🏷', biParts),
        renderSection('六、下月重点关注', '🎯', nfContent),
      ];
    };

    return () => h('div', sections());
  },
});

export default {};
</script>
