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
  const pathIndex = Number(args.path_index || 0);
  const output = args.output || path.join(inDir, "critical-path.svg");
  const title = args.title || "Critical Path";

  const payload = await readJson(path.join(inDir, "critical-paths.json"));
  const selected = payload.paths?.[pathIndex];
  if (!selected) {
    throw new Error("Path index not found.");
  }

  const boxW = 176;
  const boxH = 76;
  const gapX = 40;
  const left = 40;
  const top = 120;
  const width = left * 2 + selected.rows.length * (boxW + gapX) - gapX;
  const height = 260;

  let svg = "";
  svg += `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
  svg += `<defs>\n`;
  svg += `<marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M2,2 L10,6 L2,10 Z" fill="#f97316"/></marker>\n`;
  svg += `<style><![CDATA[text{font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif}.title{font-size:24px;font-weight:700;fill:#111827}.nodeText{font-size:13px;font-weight:700;fill:white}.days{font-size:15px;font-weight:800;fill:white}.edge{stroke:#f97316;stroke-width:3;fill:none;marker-end:url(#arrow)}]]></style>\n`;
  svg += `</defs>\n`;
  svg += `<rect x="0" y="0" width="100%" height="100%" fill="#fff7ed"/>\n`;
  svg += `<text class="title" x="40" y="36">${escapeXml(title)}</text>\n`;

  selected.rows.forEach((row, index) => {
    const x = left + index * (boxW + gapX);
    const y = top;
    if (index < selected.rows.length - 1) {
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

  svg += `</svg>\n`;
  await fs.writeFile(output, svg);
  process.stdout.write(`${output}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
