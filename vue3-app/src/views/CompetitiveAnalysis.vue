<template>
  <div class="page-body">
    <!-- 竞争监控概览 -->
    <section class="panel" style="margin-top:14px;">
      <div class="panel-title"><h2>竞争监控概览</h2></div>
      <table class="data-table compact">
        <thead>
          <tr>
            <th>ASIN</th><th>品牌</th><th>价格</th><th>BSR</th><th>评分</th><th>评论数</th><th>动态</th><th>触发级别</th><th>负责人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in competitorRows" :key="row.asin">
            <td>{{ row.asin }}</td>
            <td>{{ row.brand }}</td>
            <td>{{ row.price }}</td>
            <td>{{ row.bsr }}</td>
            <td>{{ row.rating }}</td>
            <td>{{ row.reviews }}</td>
            <td>{{ row.change }}</td>
            <td><span :class="`pill ${row.trigger.slice(0, 2).toLowerCase()}`">{{ row.trigger }}</span></td>
            <td>{{ row.owner }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 市场监控 -->
    <section class="panel table-panel" style="margin-top:14px;">
      <div class="panel-title"><h2>市场监控明细</h2></div>
      <table class="data-table">
        <thead>
          <tr>
            <th>平台</th><th>品牌</th><th>产品</th><th>品类</th><th>排名</th><th>价格</th><th>评分</th><th>评论</th><th>变化</th><th>事件</th><th>触发</th><th>动作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in competitorMarketRows" :key="row.brand + row.product">
            <td>{{ row.platform }}</td>
            <td>{{ row.brand }}</td>
            <td>{{ row.product }}</td>
            <td>{{ row.category }}</td>
            <td>{{ row.rank }}</td>
            <td>{{ row.price }}</td>
            <td>{{ row.rating }}</td>
            <td>{{ row.reviews }}</td>
            <td>{{ row.change }}</td>
            <td>{{ row.event }}</td>
            <td><span :class="`pill ${row.trigger.toLowerCase()}`">{{ row.trigger }}</span></td>
            <td style="font-size:12px;">{{ row.action }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 舆情分析 -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;padding-top:14px;">
      <!-- 采集状态 -->
      <section class="panel">
        <div class="panel-title"><h2>舆情采集</h2></div>
        <div class="quality-action-summary" style="margin-bottom:12px;">
          <article><span>采集任务</span><strong>{{ competitorSentiment.collection.tasks }}</strong></article>
          <article><span>成功</span><strong>{{ competitorSentiment.collection.success }}</strong></article>
          <article><span>失败</span><strong>{{ competitorSentiment.collection.failed }}</strong></article>
        </div>
        <div style="display:grid;gap:6px;font-size:12px;color:#667085;">
          <div><strong style="color:#344054;">产品数</strong> {{ competitorSentiment.collection.products }} · <strong style="color:#344054;">评论数</strong> {{ competitorSentiment.collection.comments }} · <strong style="color:#344054;">综合评分</strong> {{ competitorSentiment.collection.rating }}</div>
          <div><strong style="color:#344054;">下次运行</strong> {{ competitorSentiment.collection.nextRun }}</div>
        </div>
        <div style="margin-top:12px;display:grid;gap:6px;">
          <div v-for="cond in competitorSentiment.conditions" :key="cond[0]" style="display:flex;gap:8px;font-size:12px;">
            <strong style="color:#344054;">{{ cond[0] }}</strong>: <span style="color:#667085;">{{ cond[1] }}</span>
          </div>
        </div>
      </section>

      <!-- 评分分布 -->
      <section class="panel">
        <div class="panel-title"><h2>评分分布</h2></div>
        <div style="display:grid;gap:8px;margin-top:8px;">
          <div v-for="star in competitorSentiment.stars" :key="star[0]" style="display:flex;align-items:center;gap:8px;">
            <span style="width:32px;font-size:12px;color:#667085;">{{ star[0] }}</span>
            <div style="flex:1;height:8px;overflow:hidden;border-radius:999px;background:#eef2f7;">
              <div :style="{width:(star[1]/28)*100+'%',height:'100%',borderRadius:'inherit',background:star[2]}"></div>
            </div>
            <span style="width:20px;text-align:right;font-size:12px;font-weight:700;color:#344054;">{{ star[1] }}</span>
          </div>
        </div>
      </section>

      <!-- 舆情摘要 -->
      <section class="panel">
        <div class="panel-title"><h2>舆情摘要</h2></div>
        <div style="margin-bottom:10px;">
          <strong style="font-size:13px;color:#22a06b;">正面 {{ competitorSentiment.positive.length }}项</strong>
          <div v-for="item in competitorSentiment.positive" :key="item[0]" style="margin-top:6px;font-size:12px;">
            <span style="color:#344054;font-weight:700;">{{ item[0] }}</span>
            <span style="color:#667085;">{{ item[1] }}</span>
            <div style="color:#98a2b3;font-size:11px;">"{{ item[2] }}"</div>
          </div>
        </div>
        <div>
          <strong style="font-size:13px;color:#e5484d;">负面 {{ competitorSentiment.negative.length }}项</strong>
          <div v-for="item in competitorSentiment.negative" :key="item[0]" style="margin-top:6px;font-size:12px;">
            <span style="color:#344054;font-weight:700;">{{ item[0] }}</span>
            <span style="color:#667085;">{{ item[1] }}</span>
            <div style="color:#98a2b3;font-size:11px;">"{{ item[2] }}"</div>
          </div>
        </div>
      </section>
    </div>

    <!-- 竞品产品详情 -->
    <section class="panel full-width" style="margin-top:14px;">
      <div class="panel-title"><h2>竞品产品信息</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div
          v-for="product in competitorProducts.slice(0, 4)"
          :key="product.id"
          class="panel"
          style="cursor:pointer"
          @click="selectedProduct = product"
        >
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div>
              <strong style="font-size:14px;color:#101828;">{{ product.brand }} {{ product.name }}</strong>
              <div style="font-size:11px;color:#667085;">{{ product.model }} · {{ product.position }}</div>
            </div>
            <span :class="product.type === '标杆产品' ? 'pill info' : product.type === '直接竞争产品' ? 'pill p3' : 'pill p2'">{{ product.type }}</span>
          </div>
          <div style="display:grid;gap:4px;font-size:12px;color:#667085;">
            <div><strong style="color:#344054;">官方价格</strong> {{ product.officialPrice }} / <strong style="color:#344054;">成交价</strong> {{ product.dealPrice }}</div>
            <div><strong style="color:#344054;">评分</strong> {{ product.rating }} · <strong style="color:#344054;">评论</strong> {{ product.reviews }}</div>
            <div><strong style="color:#344054;">卖点</strong> {{ product.sellingPoints.join('、') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 产品详情弹层 -->
    <Teleport to="body">
      <div v-if="selectedProduct" class="modal-backdrop" @click.self="selectedProduct = null">
        <div class="route-modal" style="width:min(760px,100%);max-height:calc(100vh - 48px);">
          <div class="route-modal-head">
            <div>
              <span>{{ selectedProduct.category }}</span>
              <h2>{{ selectedProduct.brand }} {{ selectedProduct.name }}</h2>
              <p>{{ selectedProduct.model }} · {{ selectedProduct.platform }} · {{ selectedProduct.region }}</p>
            </div>
            <button class="icon-button" @click="selectedProduct = null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <template v-for="section in getSpecSections(selectedProduct)" :key="section.title">
            <section class="detail-block">
              <h3>{{ section.title }}</h3>
              <div class="field-grid">
                <div v-for="row in section.rows" :key="row[0]" class="field">
                  <span>{{ row[0] }}</span>
                  <strong>{{ row[1] }}</strong>
                </div>
              </div>
            </section>
          </template>
          <div class="detail-block">
            <h3>痛点</h3>
            <p>{{ selectedProduct.pain }}</p>
          </div>
          <div class="route-modal-actions">
            <button class="secondary-button" @click="selectedProduct = null">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const selectedProduct = ref<(typeof competitorProducts)[0] | null>(null);

const competitorRows = [
  { asin: 'B0CP-RENPHO', brand: 'RENPHO', price: '$39.99', bsr: '#8', rating: '4.6', reviews: '23,400', change: '价格 -18%', trigger: 'L3 分析级', owner: '品牌PM' },
  { asin: 'B0CP-EUFY', brand: 'Eufy', price: '$59.99', bsr: '#15', rating: '4.5', reviews: '12,850', change: '新品进入TOP20', trigger: 'L3 分析级', owner: '运营' },
  { asin: 'B0CP-WITH', brand: 'Withings', price: '$99.00', bsr: '#24', rating: '4.4', reviews: '8,920', change: '功能升级：心率', trigger: 'L4 紧急级', owner: '品牌PM' },
];

const competitorMarketRows = [
  { platform: 'Amazon US', brand: 'RENPHO', product: 'Elis 1 Smart Scale', category: '四电极体脂秤', rank: '#8', price: '$39.99', rating: '4.6', reviews: '23,400', change: '价格 -18%', event: '促销', trigger: 'L3', action: '复盘价格带和广告位' },
  { platform: 'Amazon US', brand: 'Withings', product: 'Body Scan', category: '八电极体脂秤', rank: '#24', price: '$99.00', rating: '4.4', reviews: '8,920', change: '新增心率/血管年龄', event: '上新', trigger: 'L4', action: '转换代功能机会评估' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤 3 Pro', category: '八电极体脂秤', rank: '类目第3', price: '¥399', rating: '4.8', reviews: '18,260', change: '618预售上升', event: '排名', trigger: 'L3', action: '跟进大促卖点和价格' },
  { platform: '京东', brand: '小米', product: '体脂秤 S400 Pro', category: '四电极体脂秤', rank: '类目第5', price: '¥179', rating: '4.7', reviews: '52,100', change: '低价型号放量', event: '价格', trigger: 'L2', action: '观察入门价格带' },
  { platform: '抖音', brand: '倍轻松', product: 'M5 筋膜枪', category: '筋膜枪', rank: '热销榜第7', price: '¥499', rating: '4.6', reviews: '9,840', change: '达人视频曝光增加', event: '内容', trigger: 'L3', action: '跟踪短视频卖点表达' },
  { platform: '独立站', brand: 'Wyze', product: 'Scale X', category: '体脂秤', rank: '自然流量上升', price: '$33.99', rating: '4.2', reviews: '4,700', change: '套餐包上线', event: '上新', trigger: 'L2', action: '观察套装转化策略' },
];

const competitorSentiment = {
  collection: { tasks: 5, success: 5, failed: 0, products: 45, comments: 28, rating: 3.5, nextRun: '每周一 09:00' },
  conditions: [
    ['品牌', 'Withings / RENPHO / 华为'],
    ['产品', '体脂秤、八电极秤、筋膜枪'],
    ['来源', 'Amazon评论、天猫评价、京东问答、主流媒体、社媒'],
    ['关键词', '准确性、App、隐私、离线、续航、质量'],
  ],
  stars: [
    ['5星', 14, '#22a06b'],
    ['4星', 2, '#1f73e8'],
    ['3星', 3, '#f2b705'],
    ['2星', 3, '#ff8a00'],
    ['1星', 6, '#e5484d'],
  ] as [string, number, string][],
  positive: [
    ['总体满意度', '13次', '我太喜欢这玩意儿了'],
    ['应用功能', '6次', '通过应用持续提供反馈，并监测健康与体重趋势'],
    ['身体成分追踪', '5次', '一款有助于追踪进度的好产品'],
    ['价格划算', '5次', '绝对是物超所值的购买选择'],
  ],
  negative: [
    ['计算不准确', '5次', '体重自然上升后体脂率也随之升高，让我质疑准确性'],
    ['设备故障', '4次', '不起作用'],
    ['应用功能', '3次', '应用必须保持开启才能记录测量数据'],
    ['应用可用性', '3次', '数据被压缩到一个页面内，字体极小'],
  ],
  unmet: [
    ['更高的测量精度', '3次', '用户质疑整体测量结果可信度'],
    ['更优的质量', '3次', '使用6个月后部件损坏'],
    ['更出色的应用界面', '2次', '需要更清晰的历史和趋势展示'],
    ['更好的长期追踪', '2次', '需要三个月以上详细历史数据'],
  ],
};

const competitorProducts = [
  {
    id: 'cp-withings-body-scan', category: '八电极秤', type: '标杆产品', brand: 'Withings', name: 'Body Scan', model: 'WBS08',
    productType: '八电极体脂秤', position: '旗舰', launch: '2023-10', platform: 'Amazon / 独立站', region: '美国 / 欧洲',
    officialPrice: '$399.95', dealPrice: '$349.95', rating: '4.4', reviews: '8,920',
    sellingPoints: ['分段身体成分', '心率/血管年龄', '高端健康管理'],
    specs: { electrodes: '8电极', app: 'Withings App', connectivity: 'Wi-Fi/Bluetooth', battery: '12个月' },
    pain: '价格高、部分用户质疑体脂和水分读数波动。',
  },
  {
    id: 'cp-renpho-elis', category: '体脂秤', type: '直接竞争产品', brand: 'RENPHO', name: 'Elis 1 Smart Scale', model: 'ES-CS20M',
    productType: '四电极体脂秤', position: '大众级', launch: '2024-03', platform: 'Amazon / Walmart', region: '美国',
    officialPrice: '$49.99', dealPrice: '$39.99', rating: '4.6', reviews: '23,400',
    sellingPoints: ['低价高评价', 'App趋势', '家庭多人'],
    specs: { electrodes: '4电极', app: 'RENPHO Health', connectivity: 'Bluetooth', battery: 'AAA电池' },
    pain: '低价促销频繁，压缩入门价格带。',
  },
  {
    id: 'cp-huawei-pro', category: '八电极秤', type: '直接竞争产品', brand: '华为', name: '智能体脂秤 3 Pro', model: 'HAG-B19',
    productType: '八电极体脂秤', position: '中高端', launch: '2024-06', platform: '天猫 / 京东 / 抖音', region: '中国',
    officialPrice: '¥499', dealPrice: '¥399', rating: '4.8', reviews: '18,260',
    sellingPoints: ['华为生态', '八电极分段测量', '大促流量强'],
    specs: { electrodes: '8电极', app: '华为运动健康', connectivity: 'Wi-Fi/Bluetooth', battery: '充电锂电' },
    pain: '生态绑定强，对非华为用户吸引力待观察。',
  },
  {
    id: 'cp-xiaomi-s400', category: '体脂秤', type: '间接竞争产品', brand: '小米', name: '体脂秤 S400 Pro', model: 'MJTZC02YM',
    productType: '四电极体脂秤', position: '入门级', launch: '2025-03', platform: '京东 / 天猫', region: '中国',
    officialPrice: '¥199', dealPrice: '¥179', rating: '4.7', reviews: '52,100',
    sellingPoints: ['价格低', '米家生态', '销量高'],
    specs: { electrodes: '4电极', app: '米家', connectivity: 'Bluetooth', battery: 'AAA电池' },
    pain: '功能深度有限，但价格带压力明显。',
  },
];

function getSpecSections(product: typeof competitorProducts[0]) {
  const isMassageGun = product.category === '筋膜枪';
  if (isMassageGun) {
    return [
      { title: '硬件规格', rows: [['电机类型', '无刷电机'], ['最大堵转力', '18kg'], ['噪音水平', '低噪'], ['档位设置', '5档力度调节'], ['按摩头数量', '5个按摩头'], ['整机重量', '约 650g']] },
      { title: '功能能力', rows: [['适用场景', '运动恢复、肩颈放松、办公室久坐'], ['核心卖点', product.sellingPoints.join('、')], ['安全保护', '过压保护、过热保护、10分钟自动停机'], ['续航能力', '约 6-8 小时']] },
      { title: '销售与交付', rows: [['销售平台', product.platform], ['销售区域', product.region], ['包装清单', '主机、按摩头、充电线、收纳包、说明书'], ['质保政策', '12个月有限质保'], ['证据来源', '平台页面、达人内容、用户评论聚合']] },
    ];
  }
  return [
    { title: '硬件规格', rows: [['电极数量', product.specs.electrodes || '待补充'], ['称重范围', product.category === '八电极秤' ? '5-180kg' : '5-150kg'], ['分度值', '0.05kg'], ['外观尺寸', product.category === '八电极秤' ? '325 x 325 x 25mm' : '280 x 280 x 24mm'], ['面板材质', '钢化玻璃 + ITO导电膜'], ['显示方式', 'LED隐藏屏 / App详情页']] },
    { title: '测量与算法', rows: [['测量指标', product.category === '八电极秤' ? '体重、BMI、体脂率、肌肉量、水分、内脏脂肪、分段身体成分' : '体重、BMI、体脂率、水分、肌肉量、骨量、基础代谢'], ['频段能力', product.category === '八电极秤' ? '多频BIA' : '单频BIA'], ['用户识别', '自动识别家庭成员'], ['适用人群', '成人健康管理；孕妇、植入医疗设备用户需谨慎'], ['核心卖点', product.sellingPoints.join('、')]] },
    { title: '连接与数据', rows: [['App名称', product.specs.app || '待补充'], ['连接方式', product.specs.connectivity || '待补充'], ['供电方式', product.specs.battery || '待补充'], ['数据同步', 'App趋势、历史记录、多人档案'], ['生态兼容', product.brand === '华为' ? '华为运动健康生态' : product.brand === '小米' ? '米家生态' : 'Apple Health / Google Fit 视平台而定']] },
    { title: '包装售后与证据', rows: [['包装清单', '秤体、电池/充电线、说明书、快速指南'], ['认证信息', product.region.includes('中国') ? 'CCC / CQC 待核验' : 'FCC / CE / RoHS 待核验'], ['质保政策', '12个月有限质保'], ['证据来源', `${product.platform} 商品页、评论、媒体测评、竞品信息登记表`], ['待补充项', '尺寸、重量、精度声明、认证编号、包装尺寸、毛重']] },
  ];
}
</script>
