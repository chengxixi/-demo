---
name: ecn-backcast-bom
description: Use when Codex needs to reconstruct historical BOM snapshots from current BOM version sheets and ECN change records, especially Chinese Excel files with BOM versions such as V1.0/V1.1 and ECN rows containing 生效日期, BOM版本, ECN行类型, 变更标识, 子项物料编码, 用量. Produces one workbook per BOM version with overview sheets, one full BOM detail sheet per ECN, and in-detail markings for the current ECN's changed materials.
---

# ECN倒推BOM

Use this skill to turn a current exported BOM workbook plus an ECN workbook into historical BOM snapshots by BOM version and ECN effective date.

## Expected Inputs

- A BOM workbook with version sheets such as `V1.0`, `V1.1`, `V1.2`.
- An ECN workbook with rows grouped by `单据编号`, and fields such as:
  - `生效日期`
  - `BOM版本`
  - `ECN行类型`
  - `子项物料编码`
  - `子项物料名称`
  - `用量:分子`
  - `用量:分母`
  - `变更标识`
  - `变更类型`
- A target parent material code, for example `01.01.02.00269`.

## Output Contract

Create one workbook per BOM version.

Each version workbook must contain:

- One overview sheet.
- One detail sheet per ECN affecting that version.
- Each detail sheet must be the complete BOM snapshot after that ECN, not only the changed rows.

If a version has no ECN rows, still create an overview sheet and a current BOM sheet for reference.

## Version Labels

For each BOM version, sort ECNs by effective date ascending.

Use labels like:

- `V1.1(第一次变更，最后有效时间：2026/1/28)`
- `V1.1(第二次变更，最后有效时间：2026/3/23)`
- `V1.1(第五次变更，最后有效时间：当前有效)`

The final effective date rule:

- `最后有效时间 = 下一次ECN生效日期 - 1 day`
- For the last ECN, use `当前有效`.

## Overview Sheet

Include at least these columns:

- `序号`
- `版本标签`
- `对应ECN`
- `BOM版本`
- `ECN生效日期`
- `最后有效时间`
- `ECN行数`
- `BOM行数`
- `当前BOM是否已反映`
- `变更内容`

The overview is a control sheet for human review. Include a short note that the detail sheets are complete BOM snapshots and that difference markings are per-sheet/per-ECN only.

## Detail Sheet Extra Columns

Append these columns after the normal BOM fields:

- `倒推版本标签`
- `对应ECN`
- `BOM版本`
- `ECN生效日期`
- `最后有效时间`
- `本次变更标记`
- `本次变更备注`

Keep original BOM fields intact. Put explanations in the appended columns.

## Difference Marking Rules

Only mark materials changed by the ECN corresponding to the current detail sheet.

Example: on `V1.1第二次变更`, if the sheet corresponds to `ECN2601290005`, mark only materials from `ECN2601290005`.

### Additions and replacements

When ECN rows indicate a pair such as `变更前 -> 变更后` or `删除 -> 新增`:

- Do not insert the old material as a separate BOM detail row.
- Mark only the new / after material row.
- Write the old material code, name, and usage into `本次变更备注`.

Remark pattern:

`本次新增：本页对应ECN ECN2601290005 的变动物料。03.04.05.00300 三根排线 用量 1/1；由原料号 03.04.05.05100（三根排线，用量 1/1）变更/替换而来。`

### Pure deletion

If an ECN only deletes a material and there is no paired new material:

- Do not place the deleted material inside the BOM detail body.
- Add a separate explanation area far below the BOM body.
- Title it `本次仅删除物料说明（不属于本页有效BOM，不参与BOM行数）`.
- Include original material code, name, usage, and deletion note.

### Use-up-old-material changes

If `变更类型` is `用完旧料`:

- If old material remains in the BOM, mark the old material row as `用完旧料保留`.
- Mark the new material row as `本次新增` or `本次变更后`.
- Explain in remarks that the old material remains in BOM due to use-up-old-material handling.

## Color Rules

Use text marking as the source of truth. Colors are only visual aids.

- Green: `本次新增` / `本次变更后`
- Orange: `用完旧料保留`
- Red: pure deletion explanation area

## Backcast Logic

Do not assume the exported BOM sheet is always the final ECN state.

For each ECN:

1. Compare the ECN material codes to the current version BOM.
2. Determine whether the current BOM appears to reflect that ECN.
3. Build each ECN snapshot by reversing reflected future ECNs and applying unreflected past/current ECNs.
4. Output the full BOM snapshot for that ECN.

When source data is inconsistent, prefer transparent output over silent correction:

- Preserve the full BOM snapshot.
- Add human-readable notes in overview or remarks.
- Avoid inserting comparison-only old materials into the effective BOM body unless the source BOM actually contains them.

## Recommended Script

Use `scripts/backcast_bom_from_ecn.py` for repeatable Excel processing when available.

Typical command:

```powershell
py -3 scripts/backcast_bom_from_ecn.py `
  --bom "D:/path/BOM.xlsx" `
  --ecn "D:/path/ECN.xlsx" `
  --parent-code "01.01.02.00269" `
  --ecn-sheet "01.01.02.00269 GE30013A1-CS(US)" `
  --versions V1.0 V1.1 V1.2 V1.3 V1.4 `
  --out-dir "D:/path/output"
```

After generation, read back at least:

- Workbook sheet names.
- Overview row counts.
- Detail extra columns.
- A sample marked row for a replacement ECN.
- A sample pure deletion note if pure deletion exists.

## Yolanda V1.0 FDA / K3 对比补充规则

以下规则用于 `01.01.01.01575 / AF31002A1-CS(UE)` 这类 ECN 倒推、K3生产用料单核对、订单BOM可视化和 FDA 审查补充资料整理。后续同类任务优先按这些规则执行。

### 1. ECN按生产日期归属

- 已有ECN是否属于某个订单，按 `ECN生效日期 <= 订单生产日期` 判断。
- 订单生产日期之前已经生效的ECN，要显示在该订单的 `ECN记录`。
- 订单生产日期之后才生效的ECN，不放到该订单里，放到后续订单或最新BOM节点。
- 原始BOM代表所有ECN变更前的BOM基准，原始BOM的ECN记录应为空。

### 2. 用完旧料 / 自然切换

适用场景：ECN已经生效，ECN行中存在“删除/新增”或“变更前/变更后”的物料切换关系，但变更类型、备注或业务逻辑属于“用完旧料”“自然切换”“旧料消耗完后删除”等，不要求生产订单立即使用变更后新料。

- 不要因为K3生产用料单仍使用旧料，就把该ECN挪到后续最新BOM；旧料仍使用是用完旧料/自然切换的正常结果。
- 订单对应BOM中需要同时展示旧料和新料，且二者必须使用相同项次。
- 旧料行放在新料行前面，标记为 `旧料用完后删除` 或 `物料切换-删除`；备注写明对应ECN、新料料号、旧料用完后自然切换。
- 新料行放在旧料行后面，标记为 `物料切换新增`；备注写明对应ECN、对应旧料料号。
- 旧料和新料属于同一ECN控制下的替代/切换关系，不计入 `K3多料`、`K3少料` 或待补充ECN。
- 在最新BOM与订单BOM差异中，前面订单节点已经体现过的用完旧料/自然切换ECN，不要再次作为未解释差异显示。
- 示例：`ECN2502190005` 将项次38 `03.04.01.39040 彩印飞机盒` 自然切换为 `03.04.01.40420 彩印飞机盒`。若订单生产日期在 `2025/2/19` 之后但K3仍领用 `03.04.01.39040`，该订单的ECN记录仍显示 `ECN2502190005`，订单对应BOM项次38同时展示39040和40420。

### 3. BOM快照和最新BOM

- 最新BOM只展示同一主版本的最新有效BOM，例如V1.0订单路径只展示V1.0最新BOM，不读取V1.1。
- “订单BOM -> 最新BOM”的差异，只显示前面订单路径没有体现过的变化。
- 如果某个物料切换已经在前面订单的已有ECN中体现过，最新BOM差异里不要重复显示。
- BOM快照必须和对应订单明细里的 `BOM基准汇总` 口径一致，不能单独生成一套不匹配的一级BOM快照。
- 快照页格式从 `项次` 开始，不展示父项字段，如 `使用组织`、`BOM版本`、`BOM简称`、`BOM分类`、`父项物料编码`、`物料名称`、`规格型号`、`数据状态`。
- 快照页必须按项次排序。历史补回/切换物料不能错误套用第一行模板，不能都显示为项次1。
- ECN已删除且不是用完旧料/自然切换保留的物料，不能在下一次有效BOM中继续作为有效物料；如展示，只能作为本次删除说明行。

### 4. 订单差异项分类

- 差异项是总表，除了已有ECN覆盖的内容外，其他差异都要体现。
- 每条差异最终要归到一种类型：`待补充ECN`、`变更履历`、`订单评审变动`。
- 不能出现“差异项里有，但没有归类说明”的情况。
- 已有ECN覆盖的差异不再放入差异项。
- `BOM对应料` 是绿色辅助对照行，用于说明一多一少关系；它参与差异对照展示，但不要额外重复生成同一BOM料号的红色 `K3少料` 或 `用量不一致` 行。

### 5. 订单评审变动

- 包材类物料变动属于订单评审变动，不走ECN。
- 包装方式、包装材料、热缩膜等如果属于订单/包装评审导致的用料差异，应归到 `订单评审变动`。
- 已归入订单评审变动的内容，也要计入差异项总览，但不进入待补充ECN。

### 6. 变更履历

- 物料用量变化属于变更履历，不属于ECN。
- 例如标贴用量变化，应该放入 `变更履历`。
- 差异明显过大、不能用备损解释的物料用量变化，也应作为变更履历处理，而不是直接忽略。

### 7. 备损 / 多备 / 共用辅料

- 用量不一致时要先考虑备损、多备、取整。
- K3应发数量大于BOM应发数量，且差异合理时，不算真实差异。
- 如果差异明显过大，不能按备损解释，则归入变更履历。
- 辅料如果属于产线已有或共用物料，例如润滑油、热熔胶等，不因K3未逐单领用或领用量差异而要求补ECN；应放入生产说明或领料说明。

### 8. 替代料判断

- 标记 `K3多料` 或 `K3少料` 前，必须先检查替代料表。
- 如果K3料号和BOM料号存在替代关系，不标记为K3多料/少料；备注为替代料，并说明 `K3使用替代料，BOM里面料号为 xxxx`。
- K3生产用料单里如果一行是标准件、一行是替代件，也要按替代料逻辑处理。
- 如果BOM料号出现在K3的 `替代件` 行，且K3同组/相邻有同名同规格或相近规格的 `标准件` 行并有应发数量，则将其作为替代料关系处理。
- 示例：`03.03.02.06760` 对应K3实际使用 `03.03.02.06761`，`03.03.02.06770` 对应K3实际使用 `03.03.02.06771`，`03.05.06.00100` 对应K3实际使用 `03.05.06.00102`。

### 9. 一多一少同名/近似用途物料

- 如果K3有一个料，BOM有另一个料，名称相同或用途接近，要放在一起展示。
- K3行用红色，BOM对应料用绿色并标记为 `BOM对应料`。
- 两行都用于差异对照，但不要再额外重复生成一条红色的 `K3少料` 或 `用量不一致`。
- 示例：K3有 `03.04.10.00290 热缩膜`，BOM对应 `03.04.10.00130 热缩膜` 时，只保留红色K3行和绿色BOM对应料行。

### 10. 自制半成品 / 二级BOM

- 一级BOM里必须保留自制半成品本体，例如 `04.01.02.00370 手柄`。
- 自制半成品行要标绿，并保留项次。
- K3对比时，自制半成品本体不用判K3少料。
- 要核对同一个生产订单里的半成品子BOM用料。
- 子物料不能混入一级BOM，要在下方单独展示为二级物料明细。
- 点击一级BOM里的自制半成品，再展开对应二级物料明细。
- 判断自制半成品的旧名称、新名称、上壳/下壳等，必须以料号和ECN/替代关系为准，不能只按名称判断。

### 11. 自制半成品ECN

- 自制半成品ECN不要走单独路径，要跟随主产品BOM路径展示。
- 手柄只是例子，所有自制半成品都适用，例如 `04.xx` 自制件、组件、半成品等。
- 自制半成品ECN也按统一ECN格式展示。
- 自制半成品ECN同样按 `ECN生效日期 <= 订单生产日期` 归属到对应订单或最新BOM。
- 如果某订单生产日期在该自制半成品ECN之前，则该订单不应提前显示该ECN影响。
- 如果该自制半成品在一级BOM中存在，则一级BOM保留半成品本体，二级区域展示对应子物料。
- 如果自制半成品ECN导致子物料变化，要在对应订单/最新BOM节点的ECN记录中体现，并同步影响该半成品的二级BOM明细。

### 12. BOM和生产用料展示

- 订单节点需要分两个按钮：`订单对应BOM`、`订单生产用料清单`。
- BOM必须保留项次，项次放在最前面，所有BOM和生产用料清单都按项次排序。
- 原始BOM没有应发数量。
- 订单生产用料清单显示原始K3生产用料数据，不随意剔除镭雕图纸等原始行。
- `生产用料单` 页必须直接复制对应K3拆分生产用料单原表，保留原字段和原数据；生成后必须读回验证该页不是空表，且行数与源K3拆分文件一致或有明确说明。

### 13. 页面结构

- 页面流程节点不要用A/B/C/D，要直接显示真实订单号。
- 订单节点里不要重复显示订单号、日期、数量的副标题，因为下方卡片已有。
- 按钮顺序为：`差异项`、`ECN记录`、`变更履历`、`订单评审变动`。
- 去掉 `替代料说明` 和 `不计差异说明` 独立按钮。
- 二级物料明细统一放在下方，不放右侧。

### 14. FDA审查补ECN判断

- 只对“BOM基准与K3实际用料存在实质物料号差异，且目标产品现有ECN未覆盖”的项目建议补ECN。
- 已有目标产品ECN覆盖的，不重复建议补ECN。
- 其他产品的类似ECN不能直接覆盖本产品，只能作为参考。
- 产线已有/共用辅料不建议补ECN，应补生产说明或领料说明。
- 数量差异优先查生产余料、补领、共用领用记录；无法解释时再考虑补ECN。
- ECN建议生效时间应不晚于涉及订单的最早生产日期。

### 15. 交付前验证

交付前必须读回检查：

- BOM快照和订单明细口径一致。
- 每个BOM和生产用料清单都保留项次并按项次排序。
- 自制半成品本体在一级BOM中保留并标绿；子物料在二级区域展示。
- 自制半成品ECN已经按主产品路径、生产日期归属到对应订单或最新BOM。
- 替代料关系不在差异项中重复判为K3多料/少料。
- K3多备、共用辅料、虚拟料按规则说明，不误判为待补充ECN。
- 一多一少物料已经成组展示，无重复红色BOM侧差异行。
- 最新BOM差异不重复显示前面订单节点已经体现过的ECN变化。

## QR-RD-028 产品BOM输出规则（01.01.01.01575 V1.0路径沉淀）

当需要把 BOM/ECN 可视化结果转换为 `QR-RD-028 产品BOM.xlsx` 格式时，遵循以下规则：

1. 工作表结构
- 原始 BOM 使用 `原始BOM_一级BOM`、`原始BOM_二级BOM`，版本号为 `A/0`。
- 每个订单按生产日期排序，生成 `{真实订单号}_一级BOM`、`{真实订单号}_二级BOM`、`{真实订单号}_文件修订履历表`。
- 最新 BOM 也要使用和订单 BOM 一样的表内格式，不能使用空白/简化模板；一级、二级都要有完整表头、合并格式、列宽、页脚。

2. 版本规则
- 第一个订单版本为 `V1.0`。
- 订单之间如果存在 ECN 或待补充 ECN，则版本递增为 `V1.1`、`V1.2` 等；没有则沿用上一订单版本。
- 最新 BOM 如果相对最后订单存在 ECN 或待补充 ECN，则版本继续递增；否则沿用最后订单版本。
- 页脚 `表单编号：QR-RD-028 版次:` 必须按当前表的版本写入，例如 `A/0`、`V1.0`、`V1.4`。

3. 最新 BOM 来源和项次
- 最新一级 BOM 必须直接读取当前导出的 BOM 拆分文件，例如 `2、现有BOM/物料清单拆分/01.01.01.01575-物料清单.xlsx`。
- 最新一级 BOM 的项次、料号顺序、同项次多行顺序必须与导出文件逐行一致，不得用汇总表精简版重新排序。
- 最新二级 BOM 必须读取对应半成品当前 BOM 拆分文件，例如 `04.01.02.00370-物料清单.xlsx`。
- 二级 BOM 不可省略；自制半成品本体保留在一级 BOM，子物料放二级 BOM。

4. BOM 表备注和颜色标记
- 常规 BOM 行备注列默认为空，不写过程说明。
- 涉及 ECN 的物料行标红，并在备注写 `ECN编号 + ECN内容`。
- 已确定需要补 ECN 但无 ECN 覆盖的物料行标红，并备注 `待补充ECN` 及物料信息。
- 涉及文件修订履历的物料行标蓝，并备注 `修订文件`。
- 涉及订单评审的物料行标蓝，并备注 `订单评审`。
- 最新 BOM 也必须执行同样的标记规则，不能只标订单 BOM。
- 半成品 ECN 要同步标记到二级 BOM 子物料；如果 ECN 文本中体现卷盘、上壳、下壳、导线等子项，应在二级 BOM 对应子物料行标红并备注 ECN。

5. 文件修订履历表
- 文件修订履历不仅包含“修订文件/用量变化”，也要包含订单评审内容。
- ECN 内容不写入文件修订履历表；ECN 只在 BOM 行备注和 ECN 明细中体现。
- 修订原因要用业务化表述，例如：`结合产线实际生产情况，物料用量发生变化，按订单对应BOM进行修订。`
- 订单评审原因要用：`结合订单评审要求，按订单实际需求修订订单对应BOM。`
- 受影响文件识别清单列按用户要求可为空。

6. 生成后检查
- 批注数量应为 0，除非用户明确要求保留批注。
- 检查所有 BOM 页数据区不能有“有序号但料号为空”的错位行。
- 检查最新一级 BOM 与导出 BOM 文件的 `项次 + 子项物料编码` 逐行一致。
- 检查最新二级 BOM 与对应半成品导出 BOM 文件逐行一致。
- 检查最新 BOM 页表内格式与订单 BOM 页一致。

## 2026-07-27 V1.0 order BOM / QR-RD-028 rules

Use these rules for 01.01.01.01575 / AF31002A1-CS(UE) V1.0 path outputs and for similar BOM backcast + K3 production material + QR-RD-028 workbooks.

### Source and version scope
- Process only the requested main BOM path, for example V1.0; do not read or show V1.1 unless the user explicitly asks.
- Original BOM is the baseline before all ECNs. Its version is A/0, ECN record is empty, and it has no issued quantity.
- Order BOM versions start at V1.0. Increase to V1.1, V1.2, etc. only when an ECN or pending ECN exists between order nodes; otherwise keep the previous order version.
- Latest BOM uses the current latest BOM in the same main path. If an ECN or pending ECN exists after the last order, increase the version; otherwise keep the last order version.

### ECN attribution and difference classification
- Attribute ECNs by production date: show an ECN in an order only when ECN effective date <= order production date.
- Differences already covered by an applicable ECN must be classified as existing ECN, not pending ECN.
- Order-review materials are determined by the material-name rules workbook where 订单评审 = 是. If those materials differ, classify them into 订单评审, not ECN.
- Other material-code changes belong to ECN / pending ECN unless already covered.
- Same material code with usage-only change belongs to 修订履历, not ECN.
- Common no-print labels: material name 标贴 with spec containing 无印刷 is a common material. Its usage change must not enter 文件修订履历; production may issue by actual need.
- Heat-shrink film 03.04.10.00290 is not a material switch with 03.04.10.00130. If production material uses 00290 and BOM lacks it, treat it as BOM missing actual production material and create pending ECN wording like: 生产用料清单存在03.04.10.00290热缩膜，BOM缺少该物料，需补充ECN。
- In pending ECN explanations, only write “K3 uses X / BOM uses Y” for real material switch or one-more-one-less paired comparison. For pure missing-material cases, do not force a corresponding BOM material.

### Production material and order corresponding BOM
- Production material sheets must preserve raw K3 rows and fields. Do not deduplicate, merge substitute rows, or remove rows on the production-material tab.
- Order corresponding BOM = backcast BOM + production material list + difference corrections.
- From YLDP2025010203 and later in this product path, if production material contains two heat-shrink rows, order corresponding BOM must contain both heat-shrink materials.
- Latest BOM should also include 03.04.10.00290 when it is a required actual-production material, and the latest BOM ECN record must contain the corresponding pending ECN.
- Keep self-made semi-finished parent materials in level-1 BOM, keep their item number, and place child materials in the separate level-2 BOM detail. Do not remove level-2 details.

### QR-RD-028 workbook structure
- Generate sheets: 原始BOM_一级BOM, 原始BOM_二级BOM, 原始BOM_文件修订履历表, 原始BOM_订单评审.
- For each real order, generate {订单号}_一级BOM, {订单号}_二级BOM, {订单号}_文件修订履历表, {订单号}_订单评审 in chronological order.
- Generate 最新BOM-一级BOM, 最新BOM-二级BOM, 最新BOM_文件修订履历表, 最新BOM_订单评审, and 最新BOM_ECN记录.
- Latest level-1 and level-2 BOM sheets must use the same internal format as order BOM sheets, not a simplified blank format.
- Latest level-1 BOM item order and codes should follow the exported current BOM; any added missing actual-production material should be inserted near the related item without disrupting the source order.
- BOM sheets should not keep process markers, ECN/order-review/revision colors, or notes unless the user explicitly asks for marked BOMs.
- File revision sheets should not display order-review content. Order review has its own sheet.

### Order review sheets
- Use the provided order-review Excel template, not Word output. Generate every order review sheet inside the same workbook.
- Sales model should come from 产品型号, for example CS10E; file number format is CS10E-DMR-028.
- Review material list comes from the material rules workbook where 订单评审 = 是.
- Submission date = date embedded in order number + 2 working days.
- If an order review sheet has no change, mark all review items as ☑合格 / ☐不合格 and remarks as 无变动.
- If the order review file list includes any 订单评审变动 or the order has review rows, do not auto-check 合格 and do not write 无变动 in the review-item rows; leave the decision/remarks blank for human review.
- For order-review material changes, wording must say 订单评审变动，之前料号为XXX, not ECN变动.
- Clear all workbook comments after applying user comments.

### Latest BOM ECN record
- 最新BOM_ECN记录 must include all product ECNs, pending ECNs, and self-made semi-finished ECNs relevant to the V1.0 path.
- Order-review ECNs or changes already classified to 订单评审 should not appear in 最新BOM_ECN记录.
- Self-made semi-finished ECNs must be expanded to concrete child-material changes in 最新BOM_ECN记录. Do not show only the semi-finished parent and “按路径体现”.
- For handle 04.01.02.00370, read 手柄ECN变更记录.xlsx when available and expand combined ECN numbers such as ECN2510110014/0015 and ECN2510150011/0012 into each concrete ECN id. Show changed child materials such as 卷盘 03.04.05.03630 -> 03.04.05.04970 and 手柄/上壳/下壳 03.11.03.xxxxx rows.

### Validation before delivery
- Re-run generation scripts, then syntax-check changed scripts.
- Read back the final workbook and verify: comments count is 0; expected sheet count includes 最新BOM_ECN记录; 03.04.10.00290 appears where required; order-review changed sheets do not show 无变动 defaults; no-print label usage changes are absent from 文件修订履历; handle ECN rows are expanded to child materials.
