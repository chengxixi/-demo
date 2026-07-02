---
name: pm-gantt-critical-path
description: Read Yolanda PM Gantt plans from a user-provided token, project URL or project id, and requested plan version such as V1 or V2. Extract task-level critical paths, calculate working-day durations with actual-end-date preference, and export horizontal flow outputs. Also simulate completion-rate changes when a task is delayed, shifted, split, or when change tasks are inserted, using a user-provided completion algorithm specification.
---

# PM Gantt Critical Path

Use this skill when the user gives a `pm.yolanda.hk/editGantt` link, project id, token, and a plan version such as `V1` or `V2`, and wants:

- task-only critical paths
- working-day durations that exclude holidays and rest days
- actual-duration preference when actual completion exists
- horizontal flow output in Mermaid, SVG, or PNG
- completion-rate impact when a task changes or a change task is inserted
- forecast completion-rate explanation, including baseline version, current accounting task, change days, and the fixed summary sentence

## Workflow

1. Read [references/pm-api.md](references/pm-api.md) before calling PM APIs.
2. Accept token from the user at runtime. Never hardcode tokens in skill files.
3. Parse the project id from the PM URL when a URL is provided. If the user gives only an id, use it directly.
4. Resolve the requested plan version to the internal plan id.
5. Fetch plan detail rows and keep only `detail_type = 3` tasks.
6. Build the critical-task graph using `whether_critical_task = 1` and plan links.
7. Calculate duration for each task:
   - prefer `actual_end_date` when present
   - else use `change_end_date` when present
   - else use planned `end_date`
   - count only PM-system working days from the holiday API
8. Output all critical paths in the requested format.
9. If the user asks for completion-rate, forecast completion-rate, current accounting task, baseline version, change days, or completion-rate change, read [references/completion-rate.md](references/completion-rate.md) and apply the algorithm/output format exactly as written there.

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

## Completion-Rate Simulation

Do not invent the completion-rate formula or final explanation wording.

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

Never omit the accounting date phrase.

## Scripts

- `scripts/fetch_plan_data.mjs`
  Fetch project plans, plan details, and holiday rows from the PM APIs.
- `scripts/analyze_critical_path.mjs`
  Build task-only critical paths and compute working-day durations.
- `scripts/export_flow_svg.mjs`
  Export a horizontal SVG flow diagram from critical-path JSON.

## Validation

Before finishing work with this skill:

1. Confirm the selected project id and plan version.
2. Confirm durations use working-day rules.
3. Confirm actual-end-date preference was applied where available.
4. If completion-rate logic is used, confirm the exact algorithm source.
