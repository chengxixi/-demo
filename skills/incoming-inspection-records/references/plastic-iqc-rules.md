# Plastic IQC Record Rules

Use these rules with `QR-QD-034 A1 塑胶来料---新模板.xlsx`.

## K3 filtering and template selection

- Material code must match the requested material code.
- `单据状态` must be `已审核`.
- `检验结果` must be `合格`; ignore nonconforming/failed K3 rows.
- `创建日期` is not a default K3 eligibility filter. Use it to choose old/new templates; `2026-03-01` is the boundary for using the new template unless the user says otherwise.
- Group by `单据编号`; generate one output workbook per bill.
- If one bill has multiple material rows, sum `检验数量` for `送检数量`.
- Batch number must be unique and associated with the bill. Use the first batch number for that K3 bill unless the user says otherwise.

## Output directory and file name

- Folder: `6、输出物/<物料编码>_来料检验记录/`
- File: `<物料编码>_<单据编号>_塑胶来料检验记录.xlsx`

## Template cell mapping

- `B2`: material name only, e.g. `电池盖`; do not include spec.
- `F2`: material code.
- `J2`: K3 `创建日期`, date part only.
- `B3`: supplier.
- `F3`: total inspection quantity for the grouped K3 bill.
- `J3`: fixed `WI-QD-007 / A2`.
- `B4`: unique K3 batch number for the bill.
- `F4`: K3 bill number.
- `J4`: fixed `A/0`.
- `B6`: `☑全检`.
- `C8:C10`: default `OK`.
- `L8`: `☑N/A`.
- `B12`: `GB/T2828.2012（☑ II抽样水准）`.
- `J12`: `☑（0.010）MAJ  □(0.65)`.
- `H13`: `AC:   0  RE:1`.
- `J13`: `AC:   0  RE:1`.
- `L13`: AQL 1.5 AC/RE based on the total quantity.
- `B16:B24`: general inspection sample quantity, same value for applicable rows.
- `C16`: `OK`.
- `C17`: `OK`.
- Important dimensions must be one row per dimension:
  - `A18/C18`: length.
  - `A19/C19`: width.
  - `A20/C20`: height.
  - Do not put multiple important dimensions into a single cell.
  - If no starred dimensions are identified from drawing, use length/width/height from BOM/spec/drawing.
- `C21:C22`: `不涉及` when unused.
- `C23`: `OK`.
- `C24`: `OK`.
- `L16:N24`: numeric defect counts, all `0`, center aligned.
- `B25`: `☑GB/T2828.2012 S-2`.
- `J25`: `☑（0.010）MAJ  □(0.65)`.
- `H26`: `AC:   0  RE:  1`.
- `J26`: `AC:  0   RE:  1`.
- `L26`: `AC: 0     RE: 1`.
- Special tests (`A29:A37`): use `不涉及` unless rule file or drawing requires the test.
- `B29:B37`: S-2 sample quantity where applicable.
- `L29:N37`: numeric defect counts, all `0`, center aligned.
- `B39`: `异常描述：无异常`.
- `C40`: total accepted/qualified quantity, usually same as total K3 inspection quantity.
- `H40`: `☑合格`.
- `H41`: `□不合格`.
- `J40`: `检验通过`; do not write K3 bill lists or demand order lists here.
- `B43`: `游标卡尺`.
- `D43`: default `QC-CH-001` unless the user supplies a tool list.
- `F43`: `有效`.
- `H43`: `目视/试装`.
- `J43/L43`: `N/A`.
- `B45/I45`: blank unless the user supplies inspector/reviewer names.

## Sample plan defaults

Use GB/T2828.1 normal inspection level II, AQL 1.5 for general inspection. Common mappings:

- 501-1200: sample 80, AC 3 / RE 4.
- 1201-3200: sample 125, AC 5 / RE 6.
- 3201-10000: sample 200, AC 7 / RE 8.

For S-2 special tests, use sample 8 for quantities up to 35000 unless a more precise table is available.

## Comments

- Template comments are instructions, not final output.
- After applying comments/批注, remove all comments from generated output files unless the user asks to keep them for review.
- If the user re-comments one output file, treat it as the canonical correction and apply the same correction to sibling files.


## Bundling source rule files

It is acceptable to include source rule files in this skill when the user approves it and the target GitHub repository is private or otherwise appropriate for internal documents. Put originals under `references/rule-files/` and keep this Markdown summary as the fast-loading rule index.

Recommended source files:

- `WI-QD-007 RveA2 通用塑胶橡胶件检验标准Ⅰ.doc`
- `WI-QD-152 RevA0 表面工艺可靠性测试作业指导书.docx`
- `抽样标准.xls`
