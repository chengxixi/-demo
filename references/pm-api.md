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

Response shape:

```text
data.rows[] = plan versions
```

Use every row in `data.rows`. Do not infer available versions from only the first few rows or from a filtered UI list.

Use `version` to resolve the PM version label:

- `version = 0` -> `V0`
- `version = 1` -> `V1`
- `version = 2` -> `V2`
- `version = 3` -> `V3`
- `version = 4` -> `V4`
- any integer `n` -> `Vn`

When the UI or user says a sub-version like `V4.1`, first try the exact visible plan/link context. If the API only returns integer `version` values, map it to the matching integer backend plan version, such as `version = 4`, and mention that the backend plan id is the authoritative reference.

Important fields:

- `id`: internal plan id used by `/v1/project_initiation_plans/<plan_id>`
- `version`: plan version number
- `status`
- `application_date`
- `links`: dependency lines for the plan

Version resolution rules:

1. Fetch `/v1/project_initiation_plans?project_id=<project_id>`.
2. Read all `data.rows`.
3. Sort by numeric `version` descending when identifying latest version.
4. Resolve the requested version by numeric `version`.
5. Use that row's `id` as the `plan_id` for detail APIs.
6. If expected versions are missing, re-check the raw `data.rows` before answering; do not say only three versions exist unless the raw API rows contain only three versions.

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

Get weekly report list for a project and week:

```text
GET /v1/weekly_reports?year=<yyyy>&month=<m>&week=<w>&project_id=<project_id>
```

Important fields:

- `data.rows[]`: weekly report list rows.
- `id`: weekly report id used by `/v1/weekly_reports/<id>`.
- `project_id`
- `project_name`
- `year`, `month`, `week`
- `status`: published/submitted state in the weekly report list.

Get weekly report detail:

```text
GET /v1/weekly_reports/<weekly_report_id>?id=<weekly_report_id>&project_id=<project_id>&year=<yyyy>&month=<m>&week=<w>
```

Important fields:

- `basic_detail.project_name`
- `basic_detail.stars_cnt`
- `current_week_nodes[]`: current-week activities.
- `next_week_nodes[]`: next-week activities.
- `task_details_show[]`: delay and abnormal warning details.
- `ecr_details_show[]`: ECR change details.
- `monthly_completion_rate[]`
- `monthly_forecast_rate[]`
- `monthly_cost_control_rate[]`
- `task_summary[]`
- `summaries`: project-management weekly summary text.
- `milestones[]`

Update only the weekly report summary:

```text
PUT /v1/weekly_reports/<weekly_report_id>
```

Payload shape:

```json
{
  "id": 2428,
  "project_id": 1810,
  "year": 2026,
  "month": 7,
  "week": 1,
  "summaries": "本周项目情况：..."
}
```

Publishing is separate from saving. Do not publish unless the user explicitly asks.

Other weekly report endpoints used by the frontend:

```text
POST /v1/weekly_reports
POST /v1/weekly_reports/task_create
PUT /v1/weekly_reports/task_update
PUT /v1/weekly_reports/task_destroy
PUT /v1/weekly_reports/ecr_update
POST /v1/weekly_reports/node_create
PUT /v1/weekly_reports/node_update
DELETE /v1/weekly_reports/node_destroy?id=<detail_id>
```
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
| Latest plan version | `/v1/project_initiation_plans?project_id=<project_id>` | highest numeric `version` in all `data.rows`, then `id` |
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
| Weekly report row id | `/v1/weekly_reports?year=<yyyy>&month=<m>&week=<w>&project_id=<project_id>` | `data.rows[].id` |
| Weekly report detail | `/v1/weekly_reports/<weekly_report_id>` | `current_week_nodes`, `next_week_nodes`, `task_details_show`, `ecr_details_show`, `monthly_completion_rate`, `monthly_forecast_rate`, `summaries` |
| Weekly report summary | `/v1/weekly_reports/<weekly_report_id>` | `summaries` |
| Weekly report version remarks | `/v1/project_initiation_plans/review_list?project_id=<project_id>` | `processing_remark`, `complete_version`, `ecr_code`, `application_date` |

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
