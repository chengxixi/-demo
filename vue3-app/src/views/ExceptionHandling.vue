<template>
  <div class="page-body">
    <div class="page-header">
      <p>引用外贸电商异常级别判定标准，支持P0-P3响应时效、升级路径和归档。</p>
    </div>

    <section class="panel">
      <div class="panel-title">
        <h2>异常处理流程</h2>
      </div>
      <div class="process-bar" :style="{ '--steps': processSteps.length }">
        <div
          v-for="(step, idx) in processSteps"
          :key="step"
          :class="['process-step', { active: idx <= activeStep }]"
        >
          <span>{{ idx + 1 }}</span>
          <em>{{ step }}</em>
        </div>
      </div>
    </section>

    <section class="panel table-panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>异常ID</th>
            <th>P级</th>
            <th>判定维度</th>
            <th>触发来源</th>
            <th>响应时效</th>
            <th>升级路径</th>
            <th>状态</th>
            <th>异常问题</th>
            <th>强制/建议动作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in exceptionRows" :key="row.id">
            <td>{{ row.id }}</td>
            <td><span :class="`pill ${row.p.toLowerCase()}`">{{ row.p }}</span></td>
            <td>{{ row.dimension }}</td>
            <td>{{ row.source }}</td>
            <td>{{ row.response }}</td>
            <td>{{ row.owner }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.issue }}</td>
            <td>{{ row.action }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
const processSteps = ['异常识别', 'P级判定', '升级通知', '处置方案', '执行跟进', '验证关闭', '案例归档'];
const activeStep = 3;

const exceptionRows = [
  { id: 'EX-20260611-008', p: 'P1', dimension: '平台合规', source: '投诉/警告', response: '2小时响应 / 24小时方案', owner: '运营负责人 + 产品经理', status: '处置方案', issue: '玻璃碎裂投诉连续上升', action: '隔离相关批次，检查包装防护' },
  { id: 'EX-20260611-007', p: 'P2', dimension: '客户伤害', source: '退货原因', response: '6小时响应 / 72小时方案', owner: '团队主管 + 售后负责人', status: '执行跟进', issue: '测脂不准导致退货率升高', action: '分析传感器数据与说明书误导' },
  { id: 'EX-20260610-004', p: 'P3', dimension: '运营优化', source: 'APP反馈', response: '24小时响应 / 常规处理', owner: '客服专员', status: '案例归档', issue: '单位切换咨询高频', action: 'Q&A新增视频指引' },
];
</script>
