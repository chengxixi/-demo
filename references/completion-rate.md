# Completion Rate Algorithm

Use this reference whenever the user asks for project completion rate, forecast completion rate, current accounting task, baseline version, change-day details, or why a forecast rate was calculated.

Every completion-rate explanation must use the required shape below and end with a one-sentence summary. This applies to current forecast completion rate, actual completion rate, forecast completion rate - old, final forecast completion rate, and completion-rate simulations. Do not stop after formulas or field lists. If the user does not specify a version, default to the latest approved version and name that PM version in the explanation.

## Completion Rate API Scope

Actual completion rate, forecast completion rate - old, and final forecast completion rate are the same business metric for published/approved versions. Fetch the official value from:

```text
GET /v1/statistics/forecast_list?year=YYYY
```

Find the row by `project_id` and use backend field `rate` as the official actual/final completion rate only when the requested version is already published/approved. Explain it with `basic_cycle`, `actual_cycle`, and `change_days`: actual completion rate = `basic_cycle / (actual_cycle - change_days)`.

Current forecast completion rate is a different metric for the current accounting task. Fetch it from:

```text
GET /v1/statistics/forecast_list_new?year=YYYY
```

Use `forecast_list_new` for current accounting task forecast explanations, not as the official actual/final completion-rate source unless the user explicitly asks for current forecast.

## Unpublished Draft And Minor Versions

Before answering a requested version such as `V4.1`, resolve the exact plan row from `/v1/project_initiation_plans?project_id=<project_id>` recursively through `children[]` and check its `status`.

If the exact requested version is a saved/review minor version that is not published/approved:

1. Do not use the project row from `forecast_list`, `forecast_list_new`, or `terminal_team_pc_list` as that version's actual/final result. Those reports only reflect published/approved versions and may still be showing the previous version, such as `V4.0`.
2. Fetch `/v1/project_initiation_plans/review_list?project_id=<project_id>` and match the exact `id` or `complete_version`.
3. Keep the three rate families separate when parsing review remarks:
   - `项目完成率（当前）` = current/accounting-node rate, not actual completion rate.
   - `项目完成率（预测最终-新）` = current forecast method, not actual completion rate.
   - `项目完成率（预测最终-旧）` = actual/final completion-rate method.
4. When the user asks for `实际完成率`, use `项目完成率（预测最终-旧）` if the review remark provides it. If recalculating, use: `actual completion rate = basic_cycle / (actual_cycle - change_days)`.
5. For unpublished-version actual completion rate, derive `actual_cycle` from the requested version's whole-project critical path: find the final critical-path task and count PM workdays from the project start through that task's planned finish date.
6. For actual completion-rate `change_days`, include every critical-path change task in the requested version:
   - `detail_type = 3`
   - `whether_critical_task = 1`
   - `task_type = 7`
   - include both closed and open change tasks; do not filter by `actual_end_date`
   - exclude abnormal tasks such as `task_type = 6`
7. For each included change task, calculate `included days = plan workdays + signed critical-path lag days`. Plan workdays use PM calendar from `begin_date` through `end_date`. Lag days come only from explicit `FS +/-N` settings in `pre_task` / dependency links with adjacent critical-path neighbors, checked in both directions:
   - predecessor positive lag increases included days, for example a change task with `pre_task = 20-1 FS +7` adds 7 days.
   - predecessor negative lag reduces included days.
   - successor positive lag increases included days when the following critical-path task references the change task.
   - successor negative lag reduces included days when the following critical-path task references the change task, for example successor `pre_task = 18-4 FS -1` subtracts 1 day from change task `18-4`.
   - count each lag relationship only once, especially when two change tasks are connected.
   - do not infer lag from date overlap; use explicit FS lag settings only.
8. If the review remark's `预测最终-旧` percentage disagrees with a recalculation from current task rows, report both and state the exact task-derived `change_days`, because unpublished review remarks can lag behind the current draft plan detail.

Example: if `V4.1` is unpublished, include all critical-path `task_type = 7` change rows, then apply explicit adjacent lag. If the raw change rows total 18 days but the following critical-path task references `变更任务-确认供应商报价` as `18-4 FS -1`, subtract 1 day and use 17 as `change_days`. Do not use critical-path abnormal rows to make 16 days.

## Required Explanation Shapes

For current forecast completion-rate explanations, keep the previously approved numbered shape and do not replace it with a short table or loose paragraph:

1. State the forecast completion rate.
2. Show the calculation fields: plan cycle, delay days, change days.
3. Show the formula: forecast completion rate = plan cycle / (plan cycle + delay days - change days).
4. State the current accounting task.
5. End with one Chinese sentence starting with "最终说是：". The sentence must summarize the accounting task, baseline version, baseline planned finish date, latest approved version planned finish date, accounting/as-of date, delay days, change days, and the same formula.

For actual completion-rate explanations, use the user's required one-sentence shape. It must start with "该项目实际完成率为 {rate}%" and include all of these fields in one sentence:

- baseline cycle version, for example V0
- basic_cycle
- actual version label used for the query, for example V6
- actual_cycle
- the last task on the whole-project critical path, including its planned finish date in the baseline version and in the actual version used for the query
- whole-project critical-path delay days, calculated as actual_cycle - basic_cycle
- whole-project critical-path change days from the old forecast row
- formula: actual completion rate = basic_cycle / (actual_cycle - change_days) = rate

Chinese meaning required for actual completion-rate summary:

```text
该项目实际完成率为 {rate}%，基准版本 {basic_version} 的基准周期为 {basic_cycle} 个工作日，{actual_version} 版本实际周期为 {actual_cycle} 个工作日，关键路径上最后一个任务是 {last_critical_task}（基准版本 {basic_version} 里计划结束为 {baseline_last_task_end_date}，{actual_version} 版本计划结束日期为 {actual_last_task_end_date}）。整个项目关键路径延期 {critical_path_delay_days} 天，其中变更有 {change_days} 天，因此实际完成率 = {basic_cycle} / ({actual_cycle} - {change_days}) = {rate}%。
```
## PM Forecast Fields

Prefer the PM backend result from:

```text
GET /v1/statistics/forecast_list_new?year=YYYY
```

Find the row by `project_id`. Important fields:

- `rate`: forecast project completion rate.
- `init_rate`: initiation-project completion rate.
- `basic_version`: current baseline version, such as `V0` or `V12`. `V0` means initiation plan.
- `initiation_cycle`: plan cycle used by the forecast calculation.
- `account_task_name`: current accounting task.
- `change_days`: approved change days.
- `delay_days`: working-day adjustment after comparing the accounting task against the baseline.
- `begin_date` / `end_date`: backend accounting window for the current accounting task result.

Do not assume the baseline is always the initiation plan. Always use `basic_version`.

## Core Algorithm

The team's approved algorithm:

```text
Project completion rate = plan cycle / (actual cycle - change days)
```

For the forecast-list-new fields, explain it as:

```text
forecast rate = plan cycle / (plan cycle + delay days - change days)
```

Where:

- `plan cycle` = `initiation_cycle` from the forecast row.
- `delay days` = `delay_days` from the forecast row.
- `change days` = `change_days` from the forecast row.
- Cap the displayed result at 100% when the backend returns 100.

Example:

```text
109 / (109 + 4 - 0) = 109 / 113 = 96.46%
```

## Accounting Task And Baseline Task

When explaining a project:

1. Read `account_task_name` from `forecast_list_new`.
2. Fetch the latest plan version and the baseline version indicated by `basic_version`.
3. Locate the accounting task in the latest plan task rows (`detail_type = 3`), preferring critical tasks when duplicate names exist.
4. Locate the matching baseline task in the baseline plan. If the current accounting task does not exist in the baseline version, walk backward through predecessor tasks until a task exists in the baseline; use that task as the baseline task.
5. Report both serial number and date when useful.


## Accounting Date Rule

Use this business rule when explaining forecast completion rate, simulating a draft version such as `V4.1`, or recalculating delay days for a saved but unpublished plan:

1. If the accounting task has `actual_end_date`, use that actual date as `as_of_date`.
2. If the accounting task has no `actual_end_date`, use today's actual date as `as_of_date`.
3. Do not use `forecast_list_new.end_date` as the current accounting date. In the forecast API it can be the baseline/accounting-window date, not the current actual date.
4. For an unpublished draft version, locate the accounting task in that draft plan id, then apply the same rule above. If the task is unfinished, calculate delay days from the baseline task's planned end date to today's date using PM working-day calendar rules.
5. When explaining the official backend forecast row, report the backend `delay_days` as the official value, but make clear that any draft-version or custom-date calculation is a simulation/recalculation.

Delay-day recalculation rule:

```text
delay_days = working days after baseline_end_date through as_of_date
```

Example: if the baseline task ends on `2026-06-11` and the accounting task is unfinished on `2026-07-10`, count PM working days from `2026-06-12` through `2026-07-10`.

## Change Days Detail

If the user asks which tasks make up `change_days`, list them only when there are change days.

Scope:

- Use the accounting version's critical path.
- Include completed or delayed change tasks.
- Include related predecessor/successor lag days when they contribute to change days.

Output format:

```text
任务名称 - 对应天数
任务名称 - 对应天数 - 延隔时间：X天
```

If `change_days = 0`, say there are no change-day details and do not fabricate a list.

## Standard Explanation Output

When the user asks "forecast completion rate / why / current accounting task", the answer MUST use the fixed numbered format below. Do not replace it with a free-form interpretation, status summary, risk summary, "项目状态良好", "解读", "关键节点", or emoji-led sections.

Required output format:

```text
1、这个项目的预测完成率是多少
{rate}%

2、是怎么计算出来的
计划周期 = {plan_cycle} 个工作日
延期天数 = {delay_days} 个工作日
变更天数 = {change_days} 天
预测完成率 = {plan_cycle} / ({plan_cycle} + {delay_days} - {change_days}) = {plan_cycle} / {denominator} = {rate}%

3、当前核算任务是哪个任务
{account_task_name}

4、变更天数是哪些
{Only include this section when the user asks for change-day details. If change_days = 0, write: 无变更天数明细。 If nonzero, list: 任务名称 - 对应天数 - 延隔时间（如有）}

5、最终说明
{fixed final sentence}
```

If the user did not ask for change-day details, omit item 4 and keep item 5 as the final item. Do not add extra "解读", "项目状态", "风险", or "关键节点" sections after the final sentence.

Fixed final sentence template:

```text
当前核算任务 {account_task_name} 在基准版本 {basic_version_label} 里的计划结束时间是 {baseline_end_date}，当前最新 {latest_version_label} 计划结束时间是 {latest_plan_end_date}{actual_date_clause}。系统当前按截至 {as_of_date} 核算，对比基准版本往后调整了 {delay_days}个工作日，其中 {change_days}天 是变更天数。所以预测完成率 = {plan_cycle} / ({plan_cycle} + {delay_days} - {change_days}) = {plan_cycle} / {denominator} = {rate}%。
```

Rules for the template:

- `basic_version_label`: write `V0 / 立项计划` for `V0`; otherwise write the exact version such as `V12`.
- `latest_version_label`: use the latest approved plan version, such as `V2`.
- `latest_plan_end_date`: always use the current accounting task's latest version planned finish date, not the actual date.
- `actual_date_clause`: if the current accounting task has `actual_end_date`, write `，实际日期是 {actual_end_date}`; otherwise write nothing.
- `as_of_date`: always include this phrase. Choose it using the business rule in `Accounting Date Rule`: if the current accounting task has `actual_end_date`, use that actual date; if it has no actual date, use today's actual date. Do not use `forecast_list_new.end_date` as the current accounting date unless the user explicitly asks to quote the backend row unchanged.
- `denominator` = `plan_cycle + delay_days - change_days`.
Actual/final one-sentence summary template:

```text
Use the actual completion-rate shape in Required Explanation Shapes. It must include baseline version, basic_cycle, actual version label, actual_cycle, last whole-project critical-path task, baseline_last_task_end_date, actual_last_task_end_date, critical_path_delay_days = actual_cycle - basic_cycle, change_days, and the formula basic_cycle / (actual_cycle - change_days) = rate. If the user did not specify an actual version, use and name the latest approved version.
```

