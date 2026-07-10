# Completion Rate Algorithm

Use this reference whenever the user asks for project completion rate, forecast completion rate, current accounting task, baseline version, change-day details, or why a forecast rate was calculated.

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
