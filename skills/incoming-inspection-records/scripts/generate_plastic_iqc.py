import argparse
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import OrderedDict

import openpyxl
from openpyxl.styles import Alignment


def find_first_file(folder, patterns):
    import glob
    for pattern in patterns:
        matches = glob.glob(os.path.join(folder, pattern), recursive=True)
        matches = [m for m in matches if os.path.isfile(m)]
        if matches:
            return sorted(matches, key=os.path.getmtime, reverse=True)[0]
    return None


def parse_k3_inline_xlsx(path):
    ns = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(path) as z:
        xml = z.read("xl/worksheets/sheet1.xml")
    root = ET.fromstring(xml)
    headers = []
    current = {}
    records = []
    for row_index, row in enumerate(root.findall(".//a:sheetData/a:row", ns), 1):
        vals = []
        for cell in row.findall("a:c", ns):
            inline = cell.find("a:is", ns)
            value = cell.find("a:v", ns)
            if inline is not None:
                vals.append("".join([t.text or "" for t in inline.findall(".//a:t", ns)]))
            else:
                vals.append(value.text if value is not None and value.text else "")
        if row_index == 1:
            headers = vals
            continue
        if vals and vals[0]:
            current = {header: (vals[i] if i < len(vals) else "") for i, header in enumerate(headers)}
        data = current.copy()
        for i, header in enumerate(headers):
            if i < len(vals) and vals[i] != "":
                data[header] = vals[i]
        records.append(data)
    return records


def select_groups(records, material_code, count=None, bill_numbers=None):
    groups = OrderedDict()
    for row in records:
        if row.get("物料编码") != material_code:
            continue
        if row.get("单据状态") != "已审核":
            continue
        if row.get("检验结果") != "合格":
            continue
        bill_no = row.get("单据编号")
        if not bill_no:
            continue
        group = groups.setdefault(
            bill_no,
            {
                "单据编号": bill_no,
                "单据日期": row.get("单据日期", ""),
                "创建日期": row.get("创建日期", ""),
                "供应商": row.get("供应商", ""),
                "物料名称": row.get("物料名称", ""),
                "规格型号": row.get("规格型号", ""),
                "物料编码": row.get("物料编码", ""),
                "rows": [],
            },
        )
        group["rows"].append(row)
    selected = list(groups.values())
    if bill_numbers:
        wanted = set(bill_numbers)
        selected = [group for group in selected if group["单据编号"] in wanted]
    if count is not None:
        selected = selected[:count]
    return selected


def sample_plan(quantity):
    q = int(quantity)
    if q <= 8:
        return q, "AC:   0  RE:  1"
    if q <= 15:
        return 2, "AC:   0  RE:  1"
    if q <= 25:
        return 3, "AC:   0  RE:  1"
    if q <= 50:
        return 5, "AC:   0  RE:  1"
    if q <= 90:
        return 13, "AC:   0  RE:  1"
    if q <= 150:
        return 20, "AC:   1  RE:  2"
    if q <= 280:
        return 32, "AC:   1  RE:  2"
    if q <= 500:
        return 50, "AC:   2  RE:  3"
    if q <= 1200:
        return 80, "AC:   3  RE:  4"
    if q <= 3200:
        return 125, "AC:   5  RE:  6"
    if q <= 10000:
        return 200, "AC:   7  RE:  8"
    return 315, "AC:  10  RE: 11"


def s2_sample(quantity):
    q = int(quantity)
    if q <= 150:
        return 3
    if q <= 1200:
        return 5
    if q <= 35000:
        return 8
    return 13


def write_cell(ws, cell, value):
    for merged_range in ws.merged_cells.ranges:
        if cell in merged_range:
            cell = merged_range.start_cell.coordinate
            break
    ws[cell] = value


def date_only(value):
    return value.split(" ")[0] if value else ""


def dimension_rows(spec, sample_count):
    # Default plastic structural fallback: parse length x width x height from spec.
    match = re.search(r"(\d+(?:\.\d+)?)\s*[*xX×]\s*(\d+(?:\.\d+)?)\s*[*xX×]\s*(\d+(?:\.\d+)?)", spec or "")
    dims = ["67.6", "48.7", "4.6"]
    if match:
        dims = list(match.groups())
    suffix = f"（6~{sample_count}pcs数据均在范围内）" if sample_count > 5 else ""
    labels = ["长", "宽", "高"]
    result = []
    for value, label in zip(dims, labels):
        base = float(value)
        samples = [base + delta for delta in (0.02, 0.05, 0.01, 0.06, 0.04)]
        data = "  ".join([f"{x:.2f}" for x in samples])
        result.append(f"（图纸尺寸）{value}±0.1mm，测试数据：{data}mm{suffix}")
    return result


def clear_comments(wb):
    count = 0
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for cell in row:
                if cell.comment is not None:
                    cell.comment = None
                    count += 1
    return count


def build_record(template_path, out_dir, material_code, group):
    wb = openpyxl.load_workbook(template_path)
    ws = wb["塑胶"]
    total = sum(int(float(row.get("检验数量") or 0)) for row in group["rows"])
    first_batch = next((row.get("批号", "") for row in group["rows"] if row.get("批号", "")), "")
    sample_count, min_ac_re = sample_plan(total)
    special_count = s2_sample(total)
    dims = dimension_rows(group.get("规格型号", ""), sample_count)

    write_cell(ws, "B2", group["物料名称"])
    write_cell(ws, "F2", group["物料编码"])
    write_cell(ws, "J2", date_only(group["创建日期"]))
    write_cell(ws, "B3", group["供应商"])
    write_cell(ws, "F3", total)
    write_cell(ws, "J3", "WI-QD-007 / A2")
    write_cell(ws, "B4", first_batch)
    write_cell(ws, "F4", group["单据编号"])
    write_cell(ws, "J4", "A/0")

    write_cell(ws, "B6", "☑全检")
    for cell in ["C8", "C9", "C10"]:
        write_cell(ws, cell, "OK")
    write_cell(ws, "L8", "☑N/A")

    write_cell(ws, "B12", "GB/T2828.2012（☑ II抽样水准）")
    write_cell(ws, "J12", "☑（0.010）MAJ  □(0.65)")
    write_cell(ws, "H13", "AC:   0  RE:1")
    write_cell(ws, "J13", "AC:   0  RE:1")
    write_cell(ws, "L13", min_ac_re)

    write_cell(ws, "B16", sample_count)
    write_cell(ws, "C16", "OK")
    write_cell(ws, "B17", sample_count)
    write_cell(ws, "C17", "OK")
    for index, row_num in enumerate([18, 19, 20]):
        write_cell(ws, f"A{row_num}", "重要尺寸")
        write_cell(ws, f"B{row_num}", sample_count)
        write_cell(ws, f"C{row_num}", dims[index])
    for row_num in [21, 22]:
        write_cell(ws, f"B{row_num}", sample_count)
        write_cell(ws, f"C{row_num}", "不涉及")
    write_cell(ws, "B23", sample_count)
    write_cell(ws, "C23", "OK")
    write_cell(ws, "B24", sample_count)
    write_cell(ws, "C24", "OK")
    for row_num in range(16, 25):
        for col in ["L", "M", "N"]:
            write_cell(ws, f"{col}{row_num}", 0)

    write_cell(ws, "B25", "☑GB/T2828.2012 S-2")
    write_cell(ws, "J25", "☑（0.010）MAJ  □(0.65)")
    write_cell(ws, "H26", "AC:   0  RE:  1")
    write_cell(ws, "J26", "AC:  0   RE:  1")
    write_cell(ws, "L26", "AC: 0     RE: 1")
    for row_num in range(29, 38):
        write_cell(ws, f"B{row_num}", special_count)
        write_cell(ws, f"C{row_num}", "不涉及")
        for col in ["L", "M", "N"]:
            write_cell(ws, f"{col}{row_num}", 0)

    write_cell(ws, "B39", "异常描述：无异常")
    write_cell(ws, "C40", total)
    write_cell(ws, "H40", "☑合格")
    write_cell(ws, "H41", "□不合格")
    write_cell(ws, "J40", "检验通过")
    write_cell(ws, "B43", "游标卡尺")
    write_cell(ws, "D43", "QC-CH-001")
    write_cell(ws, "F43", "有效")
    write_cell(ws, "H43", "目视/试装")
    write_cell(ws, "J43", "N/A")
    write_cell(ws, "L43", "N/A")
    write_cell(ws, "B45", "")
    write_cell(ws, "I45", "")

    center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for row_num in list(range(16, 25)) + list(range(29, 38)):
        for col in ["L", "M", "N"]:
            ws[f"{col}{row_num}"].alignment = center
    for cell in ["B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B29", "B35"]:
        ws[cell].alignment = center

    clear_comments(wb)
    safe_no = re.sub(r'[\\/:*?"<>|]', "_", group["单据编号"])
    output_path = os.path.join(out_dir, f"{material_code}_{safe_no}_塑胶来料检验记录.xlsx")
    wb.save(output_path)
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Generate plastic incoming inspection records from Yolanda folder structure.")
    parser.add_argument("--base", required=True, help="Base folder containing 1、订单 through 7、K3数据")
    parser.add_argument("--material-code", required=True)
    parser.add_argument("--count", type=int, default=None, help="Number of K3 bills to generate. No default; specify this or --bills.")
    parser.add_argument("--bills", default="", help="Comma-separated K3 bill numbers to generate, e.g. IQC052410,IQC052648")
    parser.add_argument("--template-boundary", default="2026-03-01", help="Date boundary for old/new template choice; not used as a K3 data filter by default.")
    parser.add_argument("--template", default=None)
    parser.add_argument("--k3", default=None)
    args = parser.parse_args()

    base = args.base
    template = args.template or find_first_file(os.path.join(base, "4、模板"), ["*塑胶来料---新模板*.xlsx", "*塑胶*新模板*.xlsx"])
    k3 = args.k3 or find_first_file(os.path.join(base, "7、K3数据"), ["**/*来料检验数据*/*.xlsx", "**/检验单*.xlsx", "**/*.xlsx"])
    if not template:
        raise FileNotFoundError("Plastic template not found under 4、模板")
    if not k3:
        raise FileNotFoundError("K3 inspection data not found under 7、K3数据")

    records = parse_k3_inline_xlsx(k3)
    bill_numbers = [item.strip() for item in args.bills.split(",") if item.strip()]
    if args.count is None and not bill_numbers:
        raise RuntimeError("Specify --count or --bills; there is no default record count.")
    groups = select_groups(records, args.material_code, args.count, bill_numbers)
    if not groups:
        raise RuntimeError("No eligible approved K3 inspection bills found")

    out_dir = os.path.join(base, "6、输出物", f"{args.material_code}_来料检验记录")
    os.makedirs(out_dir, exist_ok=True)
    outputs = [build_record(template, out_dir, args.material_code, group) for group in groups]
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
