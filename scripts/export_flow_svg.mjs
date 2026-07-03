#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      continue;
    }
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitLabel(text, chunkSize = 10) {
  const lines = [];
  let current = "";
  for (const char of [...text]) {
    current += char;
    if (current.length >= chunkSize) {
      lines.push(current);
      current = "";
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 2);
}

async function readJson(filePath) {
  const text = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
  return JSON.parse(text);
}

async function main() {
  const args = parseArgs(process.argv);
  const inDir = args.in_dir || process.cwd();
  const output = args.output || path.join(inDir, "critical-path.svg");
  const title = args.title || "Critical Path";

  const payload = await readJson(path.join(inDir, "critical-paths.json"));
  const paths = payload.paths || [];
  const selectedPaths = args.path_index === undefined
    ? paths
    : [paths[Number(args.path_index)]].filter(Boolean);
  if (selectedPaths.length === 0) {
    throw new Error("No critical paths found.");
  }

  const boxW = 176;
  const boxH = 76;
  const gapX = 40;
  const left = 40;
  const titleTop = 36;
  const firstRowTop = 100;
  const rowGap = 118;
  const maxRowLength = Math.max(...selectedPaths.map((item) => item.rows.length));
  const width = left * 2 + maxRowLength * (boxW + gapX) - gapX;
  const height = firstRowTop + selectedPaths.length * rowGap + 44;

  let svg = "";
  svg += `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
  svg += `<defs>\n`;
  svg += `<marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M2,2 L10,6 L2,10 Z" fill="#f97316"/></marker>\n`;
  svg += `<style><![CDATA[text{font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}.title{font-size:24px;font-weight:700;fill:#111827}.pathLabel{font-size:15px;font-weight:700;fill:#7c2d12}.nodeText{font-size:13px;font-weight:700;fill:white}.days{font-size:15px;font-weight:800;fill:white}.edge{stroke:#f97316;stroke-width:3;fill:none;marker-end:url(#arrow)}]]></style>\n`;
  svg += `</defs>\n`;
  svg += `<rect x="0" y="0" width="100%" height="100%" fill="#fff7ed"/>\n`;
  svg += `<text class="title" x="40" y="${titleTop}">${escapeXml(title)}</text>\n`;

  selectedPaths.forEach((pathRows, pathIndex) => {
    const y = firstRowTop + pathIndex * rowGap;
    svg += `<text class="pathLabel" x="${left}" y="${y - 18}">路径${pathIndex + 1}：${pathRows.total_days}天</text>\n`;
    pathRows.rows.forEach((row, index) => {
      const x = left + index * (boxW + gapX);
      if (index < pathRows.rows.length - 1) {
        const nextX = left + (index + 1) * (boxW + gapX);
        svg += `<path class="edge" d="M ${x + boxW} ${y + boxH / 2} L ${nextX - 7} ${y + boxH / 2}"/>\n`;
      }
      svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="8" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>\n`;
      svg += `<text class="nodeText" text-anchor="middle">\n`;
      splitLabel(row.name).forEach((line, lineIndex) => {
        svg += `<tspan x="${x + boxW / 2}" y="${y + 24 + lineIndex * 17}">${escapeXml(line)}</tspan>\n`;
      });
      svg += `</text>\n`;
      svg += `<text class="days" x="${x + boxW / 2}" y="${y + 64}" text-anchor="middle">${row.duration_days}天${row.used_actual ? "（实际）" : ""}</text>\n`;
    });
  });

  svg += `</svg>\n`;
  await fs.writeFile(output, svg);
  process.stdout.write(`${output}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
