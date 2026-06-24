<template>
  <div class="page-body">
    <div class="page-header">
      <p>从反馈清单生成的处理协同事项，按SLA进行分派、跟进和闭环。</p>
    </div>

    <section class="panel">
      <div class="panel-title">
        <h2>工单处理流程</h2>
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
            <th>工单ID</th>
            <th>关联反馈</th>
            <th>处理状态</th>
            <th>当前处理人</th>
            <th>责任部门</th>
            <th>SLA剩余时间</th>
            <th>处理结果</th>
            <th>关闭原因</th>
            <th>转异常</th>
            <th>转需求池</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in ticketRows" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.feedback }}</td>
            <td>{{ row.state }}</td>
            <td>{{ row.owner }}</td>
            <td>{{ row.dept }}</td>
            <td>{{ row.sla }}</td>
            <td>{{ row.result }}</td>
            <td>{{ row.close }}</td>
            <td>{{ row.exception }}</td>
            <td>{{ row.demand }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
const processSteps = ['转工单', '分派责任人', '处理中', '待确认', '已闭环'];
const activeStep = 2;

const ticketRows = [
  { id: 'TK-20260611-0342', feedback: 'FB-20260611-00122', state: '处理中', owner: '王工', dept: '产品部', sla: '18h 22m', result: '分析测量日志', close: '-', exception: '否', demand: '预留' },
  { id: 'TK-20260611-0339', feedback: 'FB-20260611-00121', state: '待确认', owner: '刘工', dept: '研发部', sla: '31h 10m', result: 'APP版本兼容排查', close: '-', exception: '否', demand: '否' },
  { id: 'TK-20260610-0318', feedback: 'FB-20260610-00117', state: '已闭环', owner: '孙工', dept: '产品部', sla: '完成', result: '补充使用指导与Listing说明', close: '已回复', exception: '否', demand: '预留' },
];
</script>
