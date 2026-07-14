---
name: incoming-inspection-records
description: Generate incoming inspection record Excel files from Yolanda's fixed audit-processing folder structure. Use when the user asks to create 来料检验记录, IQC/来料检验报告, 塑胶来料检验记录, or to use K3 inspection data, BOM, drawing attachments, templates, comments/批注, and rule files under folders named 1、订单 through 7、K3数据.
---

# 来料检验记录生成

Use this skill to generate incoming inspection record workbooks from the standard folder structure:

```text
体系文件处理/
1、订单/
2、订单对应BOM/
3、物料对应图纸/
4、模板/
5、规则文件/
6、输出物/
7、K3数据/
```

## Inputs

- Material code, e.g. `03.11.03.15020`.
- Material category/template type, e.g. `塑胶类`.
- A base folder containing the seven numbered folders. If not provided, infer from the current user context or ask once.
- K3 data under `7、K3数据`, usually `1、来料检验数据/*.xlsx`.
- Inspection template under `4、模板`, for plastic use `QR-QD-034 A1 塑胶来料---新模板.xlsx` unless the user specifies another template.
- Rule files under `5、规则文件`, especially:
  - `WI-QD-007 RveA2 通用塑胶橡胶件检验标准Ⅰ.doc`
  - `WI-QD-152 RevA0 表面工艺可靠性测试作业指导书.docx`
  - `抽样标准.xls`

## Core Workflow

1. Locate the base folder and verify the seven numbered subfolders exist.
2. Locate the latest or user-specified K3 inspection data file.
3. Parse K3 Excel robustly. Some K3 exports use inline strings and incorrect sheet dimensions; if `openpyxl` only sees one cell, parse `xl/worksheets/sheet1.xml` directly and forward-fill document header fields.
4. Filter K3 rows by:
   - `物料编码` equals the requested material code.
   - `单据状态` equals `已审核`.
   - `检验结果` equals `合格`; ignore nonconforming/failed K3 rows.
   - `创建日期` is used to decide old/new template versions; do not use it as a K3 eligibility filter unless the user explicitly asks for a date range. For this workflow, `2026-03-01` is the template boundary: records created after this date use the new template.
5. Group rows by `单据编号`.
   - Generate one inspection record per K3 bill.
   - If the same bill has multiple rows for the material, sum `检验数量`.
   - Use a single batch number associated with the bill. Prefer the first row's `批号`; do not concatenate all batch numbers unless the user explicitly asks.
6. Select records according to the user's request. Do not assume a default of three records; three was only used during trial runs. If the user does not specify which bills or how many records to generate, ask one concise question.
7. Copy the new template and fill it according to template comments and the rules in `references/plastic-iqc-rules.md`.
8. Save outputs under:

```text
6、输出物/<物料编码>_来料检验记录/
```

File naming pattern:

```text
<物料编码>_<K3单据编号>_塑胶来料检验记录.xlsx
```

9. Remove all template comments/批注 from generated files after applying the requested changes, unless the user explicitly wants comments preserved.
10. Read back key cells and report a concise summary.

## Plastic Template Rules

Read `references/plastic-iqc-rules.md` before generating plastic incoming inspection records. Use it for cell mapping, sample-plan defaults, dimensions, comments, and known user corrections.

## Script

A reusable generator is available at `scripts/generate_plastic_iqc.py`.

Run it when the task matches the standard plastic workflow:

```powershell
py -3 -X utf8 <skill>/scripts/generate_plastic_iqc.py --base "D:\code\体系文件处理" --material-code "03.11.03.15020" --count 3
```

After running, inspect the output workbooks with `openpyxl` to confirm key fields and comment count.

## Clarification Policy

If something is unclear, ask at most one question at a time. The user explicitly prefers no more than five clarification questions total for this workflow. Make reasonable assumptions from local files before asking.
