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
