---
name: pm-gantt-critical-path
description: Read Yolanda PM Gantt plans and weekly reports from a user-provided token, project URL or project id, requested plan version such as V1 or V2, and week/month context. Extract task-level critical paths, calculate working-day durations with actual-end-date preference, export horizontal flow outputs, write project weekly-report summaries from prior weekly reports and version review remarks, simulate completion-rate changes, and monitor daily forecast completion-rate drops with Enterprise WeChat robot reminders.
---

# PM Gantt Critical Path

Use this skill when the user gives a `pm.yolanda.hk/editGantt` link, project id, token, and a plan version such as `V1` or `V2`, and wants:

- task-only critical paths
- working-day durations that exclude holidays and rest days
- actual-duration preference when actual completion exists
- horizontal flow output in Mermaid, SVG, or PNG
- completion-rate impact when a task changes or a change task is inserted
- forecast completion-rate explanation, including baseline version, current accounting task, change days, and the fixed summary sentence
- daily forecast completion-rate monitoring with Enterprise WeChat robot alerts
- weekly-report drafting in the PM weekly report module using prior weekly reports, current weekly report details, and current-week version review remarks

## Gantt Detail Model

Treat PM Gantt detail rows as a three-level structure:

- `detail_type = 1`: stage / phase row.
- `detail_type = 2`: node / milestone row.
- `detail_type = 3`: task row.

Stages and nodes provide hierarchy and reporting context, but critical-path extraction, duration calculation, completion-rate task matching, and flowchart output must operate on task rows only unless the user explicitly asks for hierarchy context.

## Workflow

1. Read [references/pm-api.md](references/pm-api.md) before calling PM APIs.
2. Accept token from the user at runtime. Never hardcode tokens in skill files.
3. Parse the project id from the PM URL when a URL is provided. If the user gives only an id, use it directly.
4. Resolve the requested plan version to the internal plan id:
   - fetch `/v1/project_initiation_plans?project_id=<project_id>`
   - read every row in `data.rows`
   - map API field `version = n` to PM label `Vn`
   - use API field `id` as the plan detail id
   - identify latest version by the highest numeric `version` in all rows
   - never claim only a subset of versions exists unless raw `data.rows` contains only that subset
5. Fetch plan detail rows for stages, nodes, and tasks, then keep only `detail_type = 3` task rows for task-level analysis.
6. Build the critical-task graph using `whether_critical_task = 1` and plan links.
7. Calculate duration for each task:
   - prefer `actual_end_date` when present
   - else use `change_end_date` when present
   - else use planned `end_date`
   - count only PM-system working days from the holiday API
8. Output all critical paths in the requested format. If the user asks for a flowchart, horizontal chart, Mermaid, SVG, PNG, or visual export, read [references/flowchart-output.md](references/flowchart-output.md) and follow its format exactly.
9. If the user asks for completion-rate, forecast completion-rate, current accounting task, baseline version, change days, or completion-rate change, read [references/completion-rate.md](references/completion-rate.md) and apply the numbered output format exactly as written there.

## Weekly Report Management

Use this workflow when the user asks to write, update, or draft a PM weekly report in the weekly report module.

1. Read [references/pm-api.md](references/pm-api.md) before calling weekly report APIs.
2. Resolve `project_id` from the provided `projectDetail` URL or user-provided id.
3. Determine the target `year`, `month`, and `week` from the user. If the user says "7月第一周", use `month = 7`, `week = 1`, and the current or explicit year.
4. Fetch the target weekly report list:
   - `GET /v1/weekly_reports?year=<yyyy>&month=<m>&week=<w>&project_id=<project_id>`
   - find the row where `project_id` matches exactly
   - use its `id` as `weekly_report_id`
5. Fetch target weekly report detail:
   - `GET /v1/weekly_reports/<weekly_report_id>?id=<weekly_report_id>&project_id=<project_id>&year=<yyyy>&month=<m>&week=<w>`
6. Fetch prior weekly reports for the same project, usually the previous one to three weeks, and use their `summaries` style as the writing reference.
7. Fetch version review records:
   - `GET /v1/project_initiation_plans/review_list?project_id=<project_id>`
   - prefer review records whose `application_date` falls in or just before the target week
   - use `processing_remark`, `complete_version`, `ecr_code`, milestone changes, and completion-rate remarks as source material
8. Draft the weekly report from:
   - target report `current_week_nodes`, `next_week_nodes`, `task_details_show`, `ecr_details_show`
   - monthly rates: `monthly_completion_rate`, `monthly_forecast_rate`, `monthly_cost_control_rate`
   - prior report `summaries`
   - version review `processing_remark`
9. Preserve the company's weekly-summary structure when prior reports show one:
   - `本周项目情况：`
   - `1、上周遗留事项的完成情况：`
   - `2、描述本周项目任务完成情况：`
   - `3、诉求：`
   - `4、项目整体情况描述：`
10. Write only the weekly report summary field unless the user explicitly asks to update nodes, tasks, ECR rows, or publish:
    - `PUT /v1/weekly_reports/<weekly_report_id>`
    - payload: `{ id, project_id, year, month, week, summaries }`
11. Never publish the weekly report unless the user explicitly asks to publish. The publish action is separate from saving.
12. After saving, re-fetch the weekly report detail and verify `data.summaries` exactly equals the intended text before telling the user it is done.

Encoding rule: when writing Chinese text from PowerShell or another shell, avoid inline command arguments that can corrupt UTF-8. Pass the text as UTF-8 bytes, a file, or base64-decoded UTF-8, and verify by comparing returned Unicode code points or exact string equality.

## Daily Forecast Monitor

Use `scripts/monitor_forecast_rate.mjs` when the user asks to monitor each project's forecast completion rate and alert when it drops.

Required runtime environment variables:

- `PM_TOKEN`: PM system token.
- `WECOM_WEBHOOK` or `WECHAT_WEBHOOK`: Enterprise WeChat robot webhook. Never store this in source files.

Optional runtime environment variables:

- `YEAR`: forecast report year. Defaults to the current year.
- `THRESHOLD_POINTS`: alert threshold in percentage points. Defaults to `5`.
- `SNAPSHOT_DIR`: local snapshot directory. Defaults to `pm-forecast-snapshots` under the current working directory.
- `SNAPSHOT_DATE`: override the snapshot date in `yyyy-mm-dd` format.
- `DRY_RUN=1`: print the Enterprise WeChat markdown without sending it.
- `SEND_EMPTY=1`: send a no-alert message when no project crosses the threshold.

Monitoring behavior:

1. Fetch `/v1/statistics/forecast_list_new?year=<yyyy>`.
2. Load the latest previous local snapshot. The PM API does not provide historical daily forecast-rate snapshots.
3. Compare by `project_id`.
4. Trigger when `yesterday rate - today rate > THRESHOLD_POINTS`.
5. Save today's snapshot after comparison.
6. Send Enterprise WeChat markdown with this shape:

```text
项目名称
昨天预测完成率：xx%
今天预测完成率：xx%
下降：x.xx 个百分点
变化原因：核算任务、基准版本、延期天数、变更天数、核算任务变化或基准版本变化
```
## Input Contract

Expect these inputs from the user:

- `token`
- `project_url` or `project_id`
- `version` such as `V0`, `V1`, `V2`
- optional `output_format`: `list`, `mermaid`, `svg`, `png`
- optional completion-change scenario:
  - target task
  - change type such as delay, date shift, insert change task, split, or dependency change
  - algorithm spec supplied by the user or stored in `references/completion-rate.md`
- optional weekly-report context:
  - target `year`, `month`, and `week`
  - prior-week range to reference
  - whether to save only, publish, or just draft text for review

## Output Rules

Only output tasks. Exclude stages and nodes.

When multiple critical paths exist, output each path separately in order:

```text
A（1天）→B（2天）→C（3天）
```

When the user wants a horizontal flow, prefer Mermaid first:

```mermaid
flowchart LR
  A["任务A（1天）"] --> B["任务B（2天）"]
```

If the user asks for an export file, use `scripts/export_flow_svg.mjs` to create SVG first. PNG can be generated from SVG if the environment supports it.

For flowchart output, always follow [references/flowchart-output.md](references/flowchart-output.md): horizontal left-to-right layout, one complete path per row or left-to-right chain, task name plus working-day duration in every node, no stages, no phase nodes, no non-critical tasks. Do not use Mermaid `subgraph` for path grouping because it can render vertically.

## Completion-Rate Simulation

Do not invent the completion-rate formula or final explanation wording.

For forecast completion-rate explanation, never answer with a free-form "解读", "项目状态良好", "关键节点", risk summary, or emoji-led section. Use the fixed numbered format in `references/completion-rate.md`:

1. 这个项目的预测完成率是多少
2. 是怎么计算出来的
3. 当前核算任务是哪个任务
4. 变更天数是哪些, only when the user asks for change-day details
5. 最终说明, ending with the fixed one-sentence summary

Always do these steps:

1. Read the current critical path result.
2. Apply the user's scenario change to the affected task graph or task duration.
3. Recompute critical path membership if the scenario changes dependency or duration enough to shift the bottleneck.
4. Apply the algorithm from `references/completion-rate.md`.
5. Show:
   - old completion rate
   - new completion rate
   - delta
   - which path changed
   - whether the bottleneck path changed

For forecast completion-rate explanation, use the standard five-part output in `references/completion-rate.md`, especially the final sentence containing:

```text
系统当前按截至 {as_of_date} 核算
```

Never omit the accounting date phrase. Do not default `{as_of_date}` to today's date. Use the accounting task's actual end date first; if missing, use the API accounting/statistics date; if still missing, use the accounting task's latest planned finish date. Keep the latest planned finish date separate from the actual date; do not replace the latest plan date with `actual_end_date`.

## Scripts

- `scripts/fetch_plan_data.mjs`
  Fetch project plans, plan details, and holiday rows from the PM APIs.
- `scripts/analyze_critical_path.mjs`
  Build task-only critical paths and compute working-day durations.
- `scripts/export_flow_svg.mjs`
  Export a horizontal SVG flow diagram from critical-path JSON. By default, export all critical paths as separate horizontal rows; use `--path_index` only when the user asks for one path.
- `scripts/monitor_forecast_rate.mjs`
  Save daily `forecast_list_new` snapshots, compare against the previous snapshot, and send Enterprise WeChat robot alerts when a project forecast completion rate drops beyond the threshold.

## Validation

Before finishing work with this skill:

1. Confirm the selected project id and plan version.
2. Confirm durations use working-day rules.
3. Confirm actual-end-date preference was applied where available.
4. If completion-rate logic is used, confirm the exact algorithm source.
5. If daily monitoring is used, confirm a previous local snapshot exists before interpreting rate drops.
6. If weekly-report logic is used, confirm the target weekly report id, save-only vs publish behavior, and exact `summaries` readback.
