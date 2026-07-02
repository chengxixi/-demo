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

When the user asks "forecast completion rate / why / current accounting task", answer in this order:

1. Forecast completion rate.
2. How it was calculated.
3. Current accounting task.
4. Change-day details only if requested and nonzero.
5. End with the fixed one-sentence summary below.

Fixed final sentence template:

```text
当前核算任务 {account_task_name} 在基准版本 {basic_version_label} 里的计划结束时间是 {baseline_end_date}，当前最新 {latest_version_label} 计划结束时间/实际日期是 {latest_or_actual_date}。系统当前按截至 {as_of_date} 核算，对比基准版本往后调整了 {delay_days}个工作日，其中 {change_days}天 是变更天数。所以预测完成率 = {plan_cycle} / ({plan_cycle} + {delay_days} - {change_days}) = {plan_cycle} / {denominator} = {rate}%。
```

Rules for the template:

- `basic_version_label`: write `V0 / 立项计划` for `V0`; otherwise write the exact version such as `V12`.
- `latest_version_label`: use the latest approved plan version, such as `V2`.
- `latest_or_actual_date`: if the task is closed or delayed and has an actual date, use the actual date; otherwise use the latest plan end date.
- `as_of_date`: always include this phrase. Use the current PM/statistics accounting date available in context; if not explicit, use today's date in the user's timezone. This is important because a future latest plan end date may look like one extra day if the report is only calculated through today.
- `denominator` = `plan_cycle + delay_days - change_days`.
