---
name: incoming-inspection-records
description: Generate incoming inspection record Excel files from a local fixed audit-processing folder structure. Use when the user asks to create 来料检验记录, IQC/来料检验报告, or to use local K3 inspection data, BOM, drawing attachments, templates, comments/批注, and locally stored rule files under folders named 1、订单 through 7、K3数据.
---

# 来料检验记录生成

Use this skill to generate incoming inspection record workbooks from a local folder structure:

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

## Required local inputs

- Material code, e.g. `03.11.03.15020`.
- Material category/template type, e.g. `塑胶类`.
- Base folder containing the seven numbered folders.
- K3 data under `7、K3数据`.
- Inspection template under `4、模板`.
- Rule files under `5、规则文件`. Keep source rule files local; do not publish internal rule documents with this skill.

## Workflow

1. Verify the seven numbered folders exist.
2. Locate the K3 inspection data file and the matching template.
3. Parse K3 Excel robustly. Some K3 exports use inline strings and incorrect sheet dimensions; if `openpyxl` sees only one visible cell, parse `xl/worksheets/sheet1.xml` directly and forward-fill document header fields.
4. Filter K3 rows by:
   - `物料编码` equals the requested material code.
   - `单据状态` equals `已审核`.
   - `检验结果` equals `合格`; ignore nonconforming/failed K3 rows.
5. Use `创建日期` only to determine old/new template versions. Do not use it as a K3 eligibility filter unless the user explicitly gives a date range.
6. Group rows by `单据编号`; generate one inspection record per selected K3 bill.
7. If one bill has multiple rows for the material, sum `检验数量`.
8. Use one batch number associated with the bill. Prefer the first K3 row's `批号` unless the user says otherwise.
9. Select records according to the user request. Do not assume a default count.
10. Apply local template comments/批注 and local rule files from `5、规则文件`.
11. Save outputs under:

```text
6、输出物/<物料编码>_来料检验记录/
```

File naming pattern:

```text
<物料编码>_<K3单据编号>_<类别>来料检验记录.xlsx
```

12. Remove template comments/批注 from generated files after applying them, unless the user asks to keep comments.
13. Read back key cells and report a concise summary.

## Script

A reusable generator is available at `scripts/generate_plastic_iqc.py` for local plastic incoming inspection records.

Example:

```powershell
py -3 -X utf8 <skill>/scripts/generate_plastic_iqc.py --base "D:\code\体系文件处理" --material-code "03.11.03.15020" --count 3
```

Use `--bills` to generate specific K3 bills:

```powershell
py -3 -X utf8 <skill>/scripts/generate_plastic_iqc.py --base "D:\code\体系文件处理" --material-code "03.11.03.15020" --bills "IQC052410,IQC052648"
```

## Clarification Policy

If something is unclear, ask at most one question at a time. Make reasonable assumptions from local files before asking.
