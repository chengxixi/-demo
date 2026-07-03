# PM API Notes

Base API:

```text
https://pm-api.yolanda.hk/
```

Required request headers:

```text
Token: <user provided token>
Origin: https://pm.yolanda.hk
Referer: https://pm.yolanda.hk/
```

## Common Endpoints

Get project plan versions by project id:

```text
GET /v1/project_initiation_plans?project_id=<project_id>
```

Use this to resolve:

- `version = 0` -> `V0`
- `version = 1` -> `V1`
- `version = 2` -> `V2`

Important fields:

- `id`: internal plan id
- `version`: plan version number
- `status`
- `links`: dependency lines for the plan

Get approved version review records by project id:

```text
GET /v1/project_initiation_plans/review_list?project_id=<project_id>
```

Important fields:

- `id`: internal plan id for the reviewed version
- `version`: reviewed plan version number
- `review_status`: approval status
- `change_type`: version change type
- `complete_version`: completed/approved version marker
- `processing_remark`: review text that can include current and forecast completion-rate changes
Get plan detail rows:

```text
GET /v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3
```

Important task-row fields:

- `serial_number`
- `detail_type`
- `name`
- `begin_date`
- `end_date`
- `change_end_date`
- `actual_end_date`
- `whether_critical_task`
- `order`
- `pre_task`

Get holiday and workday rows:

```text
GET /v1/holidays?begin_date=<yyyy-mm-dd>&end_date=<yyyy-mm-dd>
```

Important date-row fields:

- `date`
- `daytype`

Interpretation used by this skill:

- `daytype = 0`: normal working day
- `daytype = 3`: adjusted working day
- other values: not counted as working day

Get latest forecast completion-rate rows:

```text
GET /v1/statistics/forecast_list_new?year=<yyyy>
```

Use this as the preferred source when explaining forecast completion rate.

Important fields:

- `project_id`
- `project_name`
- `rate`: forecast completion rate
- `init_rate`: initiation-plan forecast completion rate
- `basic_version`: current baseline version, such as `V0` or `V1`
- `initiation_cycle`: plan cycle used by the forecast formula
- `account_task_name`: current accounting task
- `change_days`: change days
- `delay_days`: delay days
- `begin_date`
- `end_date`

Get legacy forecast rows:

```text
GET /v1/statistics/forecast_list?year=<yyyy>
```

Use this only as a fallback or cross-check when `forecast_list_new` is missing fields.

Important fields:

- `basic_cycle`
- `actual_cycle`
- `change_days`
- `rate`
- `init_rate`
- `basic_version`
- `begin_date`
- `end_date`
- `actual_end_date`

Get actual/current completion-rate report rows:

```text
GET /v1/statistics/terminal_team_pc_list?year=<yyyy>&month=<m>
```

Use this when the user asks for the current report completion rate, actual completion rate, or current accounting-node report.

Important fields:

- `rate`
- `sta_rate`
- `init_rate`
- `basic_version`
- `account_node_name`
- `basic_node_name`
- `basic_begin_date`
- `basic_end_date`
- `actual_cycle`
- `actual_end_date`
- `change_delay_days`
- `cal_flag`

Get milestone comparison rows:

```text
GET /v1/project_initiation_plans/<plan_id>/milestones_list
```

Important fields:

- `name`
- `init`
- `before`
- `last`
- `whether_critical`

## Field Source Matrix

Use this table when deciding which API field supports each user-facing answer.

| Output field | Preferred API | Source field |
| --- | --- | --- |
| Project plan versions | `/v1/project_initiation_plans?project_id=<project_id>` | `id`, `version`, `status` |
| Latest plan version | `/v1/project_initiation_plans?project_id=<project_id>` | latest/highest approved `version`, then `id` |
| Plan dependency lines | `/v1/project_initiation_plans?project_id=<project_id>` | `links` |
| Task serial number | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `serial_number` |
| Task name | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `name` |
| Task type filter | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `detail_type = 3` |
| Critical-task marker | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `whether_critical_task = 1` |
| Task planned dates | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `begin_date`, `end_date`, `change_end_date` |
| Task actual date | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `actual_end_date` |
| Task predecessor text | `/v1/project_initiation_plans/<plan_id>?detail_type[]=1&detail_type[]=2&detail_type[]=3` | `pre_task` |
| Workday calendar | `/v1/holidays?begin_date=<yyyy-mm-dd>&end_date=<yyyy-mm-dd>` | `date`, `daytype` |
| Baseline version | `/v1/statistics/forecast_list_new?year=<yyyy>` | `basic_version` |
| Forecast completion rate | `/v1/statistics/forecast_list_new?year=<yyyy>` | `rate` |
| Initiation forecast completion rate | `/v1/statistics/forecast_list_new?year=<yyyy>` | `init_rate` |
| Plan cycle for forecast formula | `/v1/statistics/forecast_list_new?year=<yyyy>` | `initiation_cycle` |
| Current accounting task | `/v1/statistics/forecast_list_new?year=<yyyy>` | `account_task_name` |
| Delay days | `/v1/statistics/forecast_list_new?year=<yyyy>` | `delay_days` |
| Change days | `/v1/statistics/forecast_list_new?year=<yyyy>` | `change_days` |
| Version completion-rate audit text | `/v1/project_initiation_plans/review_list?project_id=<project_id>` | `processing_remark` |
| Actual/current completion-rate report | `/v1/statistics/terminal_team_pc_list?year=<yyyy>&month=<m>` | `rate`, `account_node_name`, `actual_cycle`, `actual_end_date` |
| Milestone comparison | `/v1/project_initiation_plans/<plan_id>/milestones_list` | `name`, `init`, `before`, `last`, `whether_critical` |

No confirmed single endpoint has been found for detailed change-day task attribution. When the user asks which tasks make up `change_days`, derive the list from the accounting version's critical-path task rows, change/delay flags, predecessor and successor relationships, and lag/lead days, then reconcile the derived total with `forecast_list_new.change_days`.
## Critical-Path Rules

Use only task rows:

```text
detail_type = 3
```

Use PM system's red-task marker:

```text
whether_critical_task = 1
```

Build the graph from plan `links` where both source and target are critical tasks.

## Duration Rules

For each task, choose end date in this order:

1. `actual_end_date`
2. `change_end_date`
3. `end_date`

Start date uses `begin_date` unless the user later defines a different rule.

Duration equals the count of working dates from start to chosen end, inclusive.
