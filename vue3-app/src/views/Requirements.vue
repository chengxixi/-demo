<template>
  <div class="page-body">
    <div class="tabs-row">
      <button
        :class="['tab', { active: activeTab === 'pool' }]"
        @click="activeTab = 'pool'"
      >产品需求池</button>
      <button
        :class="['tab', { active: activeTab === 'candidates' }]"
        @click="activeTab = 'candidates'"
      >候选线索</button>
      <div class="tab-spacer"></div>
    </div>

    <!-- 产品需求池 -->
    <template v-if="activeTab === 'pool'">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding-top:14px;">
        <div
          v-for="req in requirementRows"
          :key="req.id"
          class="panel"
          style="cursor:pointer"
          @click="selectedRequirement = req"
        >
          <div class="panel-title">
            <h2>{{ req.title }}</h2>
            <span :class="`pill ${req.level.toLowerCase()}`">{{ req.level }}</span>
          </div>
          <p style="color:#667085;font-size:13px;margin:8px 0;">{{ req.description }}</p>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0;">
            <div v-for="(dim, di) in scoreDimensions" :key="dim.label">
              <span style="color:#667085;font-size:11px;">{{ dim.label }}</span>
              <div style="display:flex;align-items:center;gap:4px;margin-top:4px;">
                <div style="flex:1;height:6px;overflow:hidden;border-radius:999px;background:#eef2f7;">
                  <div
                    :style="{ width: (req.scores[di] / 5) * 100 + '%', height: '100%', borderRadius: 'inherit', background: scoreColors[di] }"
                  ></div>
                </div>
                <span style="font-size:11px;font-weight:700;color:#344054;">{{ req.scores[di] }}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;font-size:12px;color:#667085;">
            <span>{{ req.status }}</span>
            <span>·</span>
            <span>{{ req.owner }}</span>
            <span>·</span>
            <span>{{ req.due }}</span>
            <span>·</span>
            <span>{{ req.path }}</span>
          </div>
        </div>
      </div>

      <!-- Requirement Detail Modal -->
      <Teleport to="body">
        <div v-if="selectedRequirement" class="modal-backdrop" @click.self="selectedRequirement = null">
          <div class="route-modal requirement-promote-modal">
            <div class="route-modal-head">
              <div>
                <span>{{ selectedRequirement.level }} / {{ selectedRequirement.path }}</span>
                <h2>{{ selectedRequirement.title }}</h2>
                <p>{{ selectedRequirement.id }}｜来源：{{ selectedRequirement.source }}</p>
              </div>
              <button class="icon-button" @click="selectedRequirement = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style="display:grid;gap:14px;">
              <section class="detail-block">
                <h3>需求说明</h3>
                <p>{{ selectedRequirement.description }}</p>
              </section>
              <section class="detail-block">
                <h3>痛点</h3>
                <p>{{ selectedRequirement.painPoint }}</p>
              </section>
              <section class="detail-block">
                <h3>预期价值</h3>
                <p>{{ selectedRequirement.expectedValue }}</p>
              </section>
              <section class="detail-block">
                <h3>风险</h3>
                <p>{{ selectedRequirement.risk }}</p>
              </section>
              <section class="detail-block">
                <h3>下一步动作</h3>
                <p>{{ selectedRequirement.nextAction }}</p>
              </section>
              <section class="detail-block">
                <h3>关联反馈</h3>
                <p>{{ selectedRequirement.relatedFeedback }}</p>
              </section>
            </div>
            <div class="route-modal-actions">
              <button class="secondary-button" @click="selectedRequirement = null">关闭</button>
              <button class="primary-button">审批通过</button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>

    <!-- 候选线索 -->
    <template v-if="activeTab === 'candidates'">
      <section class="panel table-panel" style="margin-top:14px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>线索ID</th>
              <th>来源反馈</th>
              <th>分类</th>
              <th>线索标题</th>
              <th>证据摘要</th>
              <th>适用产品</th>
              <th>状态</th>
              <th>下一步动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in candidateLeads" :key="lead.id">
              <td>{{ lead.id }}</td>
              <td>{{ lead.sourceFeedback }}</td>
              <td>{{ lead.category }}</td>
              <td>{{ lead.title }}</td>
              <td>{{ lead.evidence }}</td>
              <td>{{ lead.product }}</td>
              <td>{{ lead.status }}</td>
              <td>{{ lead.nextAction }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<'pool' | 'candidates'>('pool');
const selectedRequirement = ref<(typeof requirementRows)[0] | null>(null);

const scoreDimensions = [
  { label: '用户影响' },
  { label: '商业价值' },
  { label: '紧急度' },
  { label: '可行性' },
  { label: '战略契合' },
];
const scoreColors = ['#1f73e8', '#22a06b', '#ff8a00', '#7c5cff', '#06b6d4'];

const requirementRows = [
  {
    id: 'REQ-20260611-001', candidate: 'REQ-CAND-001',
    title: '提升体脂秤体成分测量稳定性',
    source: '退货原因/商品评论',
    evidence: '关联反馈 86 条，退货率 +0.45pp',
    product: '体脂秤 CS20A/CS30B',
    scores: [5, 4, 3, 3, 4],
    level: 'L1', path: '紧急修复', status: '待审批', owner: '产品经理', due: '2026-06-14',
    description: '针对体脂秤只显示体重、体成分数据输出不稳定的问题，评估阻抗测量链路、用户提示和异常检测机制，形成短期修复方案。',
    painPoint: '用户完成称重后无法稳定获得体脂率、肌肉量等核心指标，影响产品可信度并推高退货和差评风险。',
    expectedValue: '降低同类退货和差评，提升体成分测量稳定性与新用户首次使用成功率。',
    risk: '需确认是否涉及硬件批次、算法参数、App连接流程或使用指导多因素叠加。',
    nextAction: '产品经理牵头研发、质量和售后复核样本，48小时内输出修复路径和验证计划。',
    relatedFeedback: 'FB-20260611-00122、FB-20260611-00123、EX-20260611-007',
  },
  {
    id: 'REQ-20260611-002', candidate: 'REQ-CAND-002',
    title: '评估筋膜枪低噪音优化需求',
    source: '竞品分析/差评聚类',
    evidence: '竞品低噪音卖点进入TOP20',
    product: '筋膜枪 MG20',
    scores: [3, 3, 4, 5, 2],
    level: 'L3', path: '功能升级', status: '评分确认', owner: '品牌PM', due: '2026-06-20',
    description: '结合竞品低噪音卖点和用户噪音投诉，评估电机、结构、控制策略和页面卖点表达的优化空间。',
    painPoint: '用户认为高档位噪音偏高，影响按摩放松场景体验，并被竞品低噪音卖点放大。',
    expectedValue: '提升筋膜枪体验评分，增强对标竞品时的卖点竞争力。',
    risk: '结构降噪可能影响力度、成本和量产验证周期，需要先完成可行性评估。',
    nextAction: '品牌PM收集竞品证据，研发评估电机和结构优化空间，输出L3版本规划建议。',
    relatedFeedback: 'REQ-CAND-002、竞品RENPHO/Eufy监控项',
  },
  {
    id: 'REQ-20260610-006', candidate: 'REQ-CAND-006',
    title: '补充APP连接异常引导和错误提示',
    source: 'APP反馈/客服沟通',
    evidence: '近7天同类反馈 23 条',
    product: '体脂秤 CS10/CS20A',
    scores: [4, 3, 5, 2, 3],
    level: 'L2', path: '体验优化', status: '已入池', owner: 'APP产品', due: '2026-06-18',
    description: '补充App蓝牙连接、数据同步失败和异常提示的引导文案，减少用户因不会操作导致的误判反馈。',
    painPoint: '用户不知道连接失败原因，重复尝试后形成差评或客服咨询。',
    expectedValue: '降低客服咨询量，提高连接成功率和问题自助解决率。',
    risk: '需兼容不同App版本和手机系统，避免提示文案与实际错误码不一致。',
    nextAction: 'APP产品补充错误码映射，研发确认可展示状态，客服同步话术。',
    relatedFeedback: 'FB-20260611-00121、TK-20260611-0339',
  },
  {
    id: 'REQ-20260609-004', candidate: 'OBS-20260609-011',
    title: '八电极秤心率相关机会观察',
    source: '竞争分析',
    evidence: 'Withings新品卖点变化，样本待补充',
    product: '八电极秤',
    scores: [3, 2, 2, 4, 1],
    level: 'L4', path: '换代开发观察', status: '观察池', owner: '产品规划', due: '2026-06-28',
    description: '跟踪竞品八电极秤新增心率、血管年龄等卖点后的市场反馈，评估是否进入下一代产品规划。',
    painPoint: '高端竞品在健康指标丰富度上形成认知差异，可能影响我方升级款定位。',
    expectedValue: '为中长期产品路线提供证据，避免过早立项造成资源浪费。',
    risk: '当前样本不足，不能仅凭竞品动作判断真实用户价值。',
    nextAction: '进入观察池，连续四周跟踪关键词、评论、价格和转化变化。',
    relatedFeedback: 'OBS-20260609-011、Withings竞争分析项',
  },
];

const candidateLeads = [
  {
    id: 'REQ-CAND-001',
    sourceFeedback: 'FB-20260611-00122 / FB-20260611-00123',
    category: '产品体验 / 数据准确性',
    title: '体脂秤体成分测量稳定性线索',
    evidence: '同类退货和商品评论集中反馈测脂不准、无法稳定输出体成分。',
    product: '体脂秤 CS20A/CS30B',
    status: '待补充',
    nextAction: '合并同类反馈，补充退货率和差评样本后转产品需求。',
  },
  {
    id: 'REQ-CAND-006',
    sourceFeedback: 'FB-20260611-00121',
    category: '产品体验 / APP问题',
    title: 'APP连接和同步异常引导线索',
    evidence: 'APP反馈和客服沟通近7天出现同步失败、闪退和错误提示不清。',
    product: '体脂秤 CS10/CS20A',
    status: '待评分',
    nextAction: '补充错误码和App版本范围，进入五维评分。',
  },
];
</script>
